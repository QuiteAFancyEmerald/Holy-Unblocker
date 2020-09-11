var https = require('https');
var http = require('http');
var fetch = require('node-fetch');
var express = require('express');
var fs = require('fs');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');

var config = JSON.parse(fs.readFileSync('config.json', 'utf-8')),
  httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
  }),
  httpAgent = new http.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
  }),
  ssl = { key: fs.readFileSync('ssl/default.key', 'utf8'), cert: fs.readFileSync('ssl/default.crt', 'utf8') },
  server,
  port = process.env.PORT || config.port,
  ready = (() => {
    var a = 'http://', b = config.listenip;
    if (config.ssl) a = 'https://';
    if (b == '0.0.0.0' || b == '127.0.0.1') b = 'localhost';
    console.log('AlloyProxy is now running at', a + b + ':' + port);
  });

http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

if (config.ssl) server = https.createServer(ssl, app).listen(port, config.listenip, ready);
else server = http.createServer(app).listen(port, config.listenip, ready);

app.use(cookieParser());
app.use(session({
secret: 'alloy',
saveUninitialized: true,
resave: true
}));

app.use((req, res, next)=>{
	// nice bodyparser alternative that wont cough up errors
	
	req.setEncoding('utf8');
	req.raw_body = ''
	req.body = new Object()
	
	req.on('data', chunk=>{ req.raw_body += chunk });
	
	req.on('end', ()=>{
		req.str_body = req.raw_body.toString('utf8');
		
		try{
			var result = new Object();
			
			req.str_body.split('&').forEach((pair)=>{
				pair = pair.split('=');
				req.body[pair[0]] = decodeURIComponent(pair[1] || '');
			});
		}catch(err){
			req.body = {}
		}
		
		return next();
	});
});

function base64Encode(data) {
  return new Buffer.from(data).toString('base64')
}

// How to use: base64Decode('string') will return any input base64 decoded
function base64Decode(data) {
  return new Buffer.from(data, 'base64').toString('ascii')
}

// How to use: rewritingURL('https://example.org/assets/main.js') will rewrite any external URL. Output: aHR0cHM6Ly9leGFtcGxlLm9yZw==/assets/main.js
function rewriteURL(dataURL, option) {
  var websiteURL
  var websitePath
  if (option == 'decode') {
     websiteURL = base64Decode(dataURL.split('/').splice(0, 1).join('/'))
     websitePath = '/' + dataURL.split('/').splice(1).join('/')
  } else {
   websiteURL = base64Encode(dataURL.split('/').splice(0, 3).join('/'))
   websitePath = '/' + dataURL.split('/').splice(3).join('/')
  }
  if (websitePath == '/') {
      return `${websiteURL}`
  } else return `${websiteURL}${websitePath}`
}

// To be used with res.send() to send error. Example: res.send(error('404', 'No valid directory or file was found!'))
function error(statusCode, info) {
  if (statusCode && info) {
  return fs.readFileSync('alloy/assets/error.html', 'utf8').toString().replace('%ERROR%', `Error ${statusCode}: ${info}`)
  }
  if (info && !statusCode) {
    return fs.readFileSync('alloy/assets/error.html', 'utf8').toString().replace('%ERROR%', `Error: ${info}`)
  }
  if (statusCode && !info) {
    return fs.readFileSync('alloy/assets/error.html', 'utf8').toString().replace('%ERROR%', `Error ${statusCode}`)
  }
  return fs.readFileSync('public/assets/error.html', 'utf8').toString().replace('%ERROR%', `An error has occurred!`)
}

app.post('/createSession', async (req, res) => {
   if (req.body.url.startsWith('//')) {
     req.body.url = 'http:' + req.body.url;
   } else if (req.body.url.startsWith('https://') || req.body.url.startsWith('http://')) {
     req.body.url = req.body.url;
   } else {
     req.body.url = 'http://' + req.body.url;
   }
   if (req.body.rv) {
     req.session.rvURL = String(req.body.url).split('/').splice(0, 3).join('/')
     return res.redirect('/fetch/rv/' + String(req.body.url).split('/').splice(3).join('/'))
   } else {
     return res.redirect('/fetch/' + rewriteURL(String(req.body.url)))
   }
})

var prefix = '/fetch';

app.use(prefix, async (req, res, next) => {
  var location = rewriteURL(req.url.slice(1), 'decode');
  if (req.url.startsWith('/rv') && !req.session.rvURL) {
    res.send(error('400', 'No valid session URL for reverse proxy mode was found!'))
  }
  if (req.url.startsWith('/rv') && req.session.rvURL) {
    location = req.session.rvURL + req.url.slice(3)
  }
  location = {
    href: location,
    hostname : location.split('/').splice(2).splice(0, 1).join('/'),
    origin : location.split('/').splice(0, 3).join('/'),
    origin_encoded : base64Encode(location.split('/').splice(0, 3).join('/')),
    path : '/' + location.split('/').splice(3).join('/'),
    protocol : location.split('\:').splice(0, 1).join(''), 
  }
  var httpAgent = new http.Agent({
    keepAlive: true
  });
  var httpsAgent = new https.Agent({
    keepAlive: true
  });
   
   var fetchHeaders = req.headers
   fetchHeaders['referer'] = location.href
   fetchHeaders['origin'] = location.origin
   fetchHeaders['host'] = location.hostname
   if (fetchHeaders['cookie']) {
     delete fetchHeaders['cookie']
   }
   var options = {
    method: req.method,
    headers: fetchHeaders,
    redirect: 'manual',
    agent: function(_parsedURL) {
      if (_parsedURL.protocol == 'http:') {
        return httpAgent;
      } else {
        return httpsAgent;
      }
    }
  };
  
  if (req.method == 'POST') {
    // Have to do try catch for this POST data parser until we create our own one that won't have a syntax error sometimes.
    try {
	  // str_body is a string containing the requests body
      options['body'] = req.str_body;
    }catch(err){
      return;
    }
  }
  if (req.url.startsWith('/rv')) {
    location.origin_encoded = 'rv'
  }
  if (!req.url.startsWith(`/${location.origin_encoded}/`)) {
    try{
      return res.redirect(307,`/fetch/${location.origin_encoded}/`) 
    }catch(err){
      return;
    }
    }
  if (location.href == 'https://discord.com' || location.href == 'https://discord.com/new') {
    return res.redirect(307, `/fetch/${location.origin_encoded}/login`)
  }
  if (location.origin == 'https://www.reddit.com') {
    if (req.url.startsWith('/rv') && req.session.rvURL) {
      req.session.rvURL = 'https://old.reddit.com'
      return res.redirect(307, '/fetch/rv' + location.path)
    }
    return res.redirect(307, '/fetch/' + base64Encode('https://old.reddit.com') + location.path)
  }
  const response = await fetch(location.href, options).catch(err => res.send(error('404', `"${location.href}" was not found!`)));
  if(typeof response.buffer != 'function')return;
  var resbody = await response.buffer();
  var contentType = 'text/plain'

  response.headers.forEach((e, i, a) => {
    if (i == 'content-type') contentType = e;
  });
  if (contentType == null || typeof contentType == 'undefined') ct = 'text/html';
  var serverHeaders = Object.fromEntries(
    Object.entries(JSON.parse(JSON.stringify(response.headers.raw())))
      .map(([key, val]) => [key, val[0]])
  );
  if (serverHeaders['location']) {
    if (req.url.startsWith('/rv') && req.session.rvURL) {
         req.session.rvURL = String(serverHeaders['location']).split('/').splice(0, 3).join('/')
         return res.redirect(307, '/fetch/rv/' + String(serverHeaders['location']).split('/').splice(3).join('/'))
    } else return res.redirect(307, '/fetch/' + rewriteURL(String(serverHeaders['location'])))
  }
  delete serverHeaders['content-encoding']
  delete serverHeaders['x-frame-options']
  delete serverHeaders['strict-transport-security']
  delete serverHeaders['content-security-policy']
  delete serverHeaders['location']
  res.status(response.status)
  res.set(serverHeaders)
  res.contentType(contentType)
  if (response.redirected == true) {
    if (req.url.startsWith('/rv') && req.session.rvURL) {
        req.session.rvURL = response.url.split('/').splice(0, 3).join('/')
        return res.redirect(307, '/fetch/rv/' + response.url.split('/').splice(3).join('/'))
    } else return res.redirect(307, '/fetch/' + rewriteURL(response.url))
  }
  if (contentType.startsWith('text/html')) {
    req.session.fetchURL = location.origin_encoded
    resbody = resbody.toString()
    .replace(/integrity="(.*?)"/gi, '')
    .replace(/nonce="(.*?)"/gi, '')
    .replace(/(href|src|poster|data|action)="\/\/(.*?)"/gi, `$1` + `="http://` + `$2` + `"`)
    .replace(/(href|src|poster|data|action)='\/\/(.*?)'/gi, `$1` + `='http://` + `$2` + `'`)
    .replace(/(href|src|poster|data|action)="\/(.*?)"/gi, `$1` + `="/fetch/${location.origin_encoded}/` + `$2` + `"`)
    .replace(/(href|src|poster|data|action)='\/(.*?)'/gi, `$1` + `='/fetch/${location.origin_encoded}/` + `$2` + `'`)
    .replace(/'(https:\/\/|http:\/\/)(.*?)'/gi, function(str) {
      str = str.split(`'`).slice(1).slice(0, -1).join(``);
      return `'/fetch/${rewriteURL(str)}'`
    })
    .replace(/"(https:\/\/|http:\/\/)(.*?)"/gi, function(str) {
      str = str.split(`"`).slice(1).slice(0, -1).join(``);
      return `"/fetch/${rewriteURL(str)}"`
    })
    .replace(/(window|document).location.href/gi, `"${location.href}"`)
    .replace(/(window|document).location.hostname/gi, `"${location.hostname}"`)
    .replace(/(window|document).location.pathname/gi, `"${location.path}"`)
    .replace(/location.href/gi, `"${location.href}"`)
    .replace(/location.hostname/gi, `"${location.hostname}"`)
    .replace(/location.pathname/gi, `"${location.path}"`)
    .replace(/<html(.*?)>/gi, '<html'  + '$1'  + '><script id="alloyData" data-alloyURL="' + location.origin_encoded + '"' + ' src="/alloy/assets/inject.js"></script>')

        } else if (contentType.startsWith('text/css')) {
          resbody = resbody.toString()      
          .replace(/url\("\/\/(.*?)"\)/gi, `url("http://` + `$1` + `")`)
          .replace(/url\('\/\/(.*?)'\)/gi, `url('http://` + `$1` + `')`)
          .replace(/url\(\/\/(.*?)\)/gi, `url(http://` + `$1` + `)`)
          .replace(/url\("\/(.*?)"\)/gi, `url("/fetch/${location.origin_encoded}/` + `$1` + `")`)
          .replace(/url\('\/(.*?)'\)/gi, `url('/fetch/${location.origin_encoded}/` + `$1` + `')`)
          .replace(/url\(\/(.*?)\)/gi, `url(/fetch/${location.origin_encoded}/` + `$1` + `)`)
          .replace(/"(https:\/\/|http:\/\/)(.*?)"/gi, function(str) {
            str = str.split(`"`).slice(1).slice(0, -1).join(``);
            return `"/fetch/${rewriteURL(str)}"`
          })
          .replace(/'(https:\/\/|http:\/\/)(.*?)'/gi, function(str) {
            str = str.split(`'`).slice(1).slice(0, -1).join(``);
            return `'/fetch/${rewriteURL(str)}'`
          })
          .replace(/\((https:\/\/|http:\/\/)(.*?)\)/gi, function(str) {
            str = str.split(`(`).slice(1).join(``).split(')').slice(0, -1).join('');
            return `(/fetch/${rewriteURL(str)})`
          })

        } else if (contentType.startsWith('text/javascript') || contentType.startsWith('application/javascript')) {
          resbody = resbody.toString()
           .replace(/xhttp.open\("GET",(.*?)"http(.*?)"(.*?),(.*?)true\);/gi, ' xhttp.open("GET",' + '$1' + '"/alloy/url/http' + '$2' + '"' + '$3' + ',' + '$4' + 'true')
           .replace(/xhttp.open\("POST",(.*?)"http(.*?)"(.*?),(.*?)true\);/gi, ' xhttp.open("POST",' + '$1' + '"/alloy/url/http' + '$2' + '"' + '$3' + ',' + '$4' + 'true')
           .replace(/xhttp.open\("OPTIONS",(.*?)"http(.*?)"(.*?),(.*?)true\);/gi, ' xhttp.open("OPTIONS",' + '$1' + '"/alloy/url/http' + '$2' + '"' + '$3' + ',' + '$4' + 'true')

           .replace(/xhr.open\("GET",(.*?)"http(.*?)"(.*?),(.*?)true\);/gi, ' xhr.open("GET",' + '$1' + '"/alloy/url/http' + '$2' + '"' + '$3' + ',' + '$4' + 'true')
           .replace(/xhr.open\("POST",(.*?)"http(.*?)"(.*?),(.*?)true\);/gi, ' xhr.open("POST",' + '$1' + '"/alloy/url/http' + '$2' + '"' + '$3' + ',' + '$4' + 'true')
           .replace(/xhr.open\("OPTIONS",(.*?)"http(.*?)"(.*?),(.*?)true\);/gi, ' xhr.open("OPTIONS",' + '$1' + '"/alloy/url/http' + '$2' + '"' + '$3' + ',' + '$4' + 'true')
           .replace(/ajax\("http:\/\/(.*?)"\)/gi, 'ajax("/alloy/url/http://' + '$1' + '")')
           .replace(/ajax\("https:\/\/(.*?)"\)/gi, 'ajax("/alloy/url/https://' + '$1' + '")')
        }
  res.send(resbody)
})

app.use('/alloy/url/',function (req, res, next) {
  const mainurl = req.url.split('/').slice(1).join('/')
  const host = mainurl.split('/').slice(0, 3).join('/')
  const buff = new Buffer(host);
  const host64 = buff.toString('base64');
  const path = mainurl.split('/').slice(3).join('/')
  const fullURL = host64 +  '/' + path
  res.redirect(307, '/fetch/' +  fullURL)
})


app.use('/alloy/',function (req, res, next) {

if (req.query.url) {
var clientInput = base64Decode(req.query.url)
var fetchURL;
if (clientInput.startsWith('//')) {
    fetchURL = rewriteURL('http:' + clientInput)
} else if (clientInput.startsWith('http://') || clientInput.startsWith('https://')) {
   fetchURL = rewriteURL(clientInput)
} else {
   fetchURL = rewriteURL('http://' + clientInput)
}
  return res.redirect(307, '/fetch/' + fetchURL)
} 
res.sendFile(__dirname + '/alloy' + req.url,  function (err) {
  if (err) {
    if (req.session.fetchURL) {
      return res.redirect(307, '/fetch/' + req.session.fetchURL + req.url)
    } else return res.redirect(307, '/')
  }
})

})


app.use(express.static('public'))

app.use(function (req, res ,next) {
  if (req.session.fetchURL) {
    return res.redirect(307, '/fetch/' + req.session.fetchURL + req.url)
  } else return res.send(error('404', 'No valid directory or file was found!'))
})