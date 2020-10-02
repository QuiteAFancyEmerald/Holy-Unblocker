  const express = require('express'),
  app = express(),
  http = require('http'),
  https = require('https'),
  fs = require('fs'),
  querystring = require('querystring'),
  session = require('express-session'),
  sanitizer = require('sanitizer'),
  fetch = require('node-fetch');

  const config = JSON.parse(fs.readFileSync('./config.json', {encoding:'utf8'})); 
  if (!config.prefix.startsWith('/')) {
      config.prefix = `/${config.prefix}`;
  }

  if (!config.prefix.endsWith('/')) {
     config.prefix = `${config.prefix}/`;
  }

  let server;
  let server_protocol;
  const server_options = {
    key: fs.readFileSync('./ssl/default.key'),
    cert: fs.readFileSync('./ssl/default.crt')
  }
  if (config.ssl == true) { server = https.createServer(server_options, app); server_protocol = 'https://';}
  else { server = http.createServer(app); server_protocol = 'http://';};


  console.log(`Alloy Proxy now running on ${server_protocol}0.0.0.0:${config.port}! Proxy prefix is "${config.prefix}"!`);
  server.listen(process.env.PORT || config.port);

  btoa = (str) => {
    str = new Buffer.from(str).toString('base64');
    return str;
  };

  atob = (str) => {
    str = new Buffer.from(str, 'base64').toString('utf-8');
    return str;
  };

  rewrite_url = (dataURL, option) => {
    var websiteURL;
    var websitePath;
    if (option == 'decode') {
       websiteURL = atob(dataURL.split('/').splice(0, 1).join('/'));
      websitePath = '/' + dataURL.split('/').splice(1).join('/');
    } else {
    websiteURL = btoa(dataURL.split('/').splice(0, 3).join('/'));
    websitePath = '/' + dataURL.split('/').splice(3).join('/');
    }
    if (websitePath == '/') { return `${websiteURL}`; } else return `${websiteURL}${websitePath}`;
  };

  app.use(session({
    secret: 'alloy',
    saveUninitialized: true,
    resave: true
}));
// We made our own version of body-parser instead, due to issues.
  app.use((req, res, next) => {
      if (req.method == 'POST') {
     req.raw_body = '';
     req.on('data', chunk => {
          req.raw_body += chunk.toString(); // convert Buffer to string
     });
     req.on('end', () => {
          req.str_body = req.raw_body;
          try {
              req.body = JSON.parse(req.raw_body);
          } catch(err) {
              req.body = {}
          }
         next();
     });
  } else return next();
  });

  app.use(`${config.prefix}utils/`, async(req, res, next) => {
      if (req.url.startsWith('/assets/')){res.sendFile(__dirname + '/utils' + req.url);}
     if (req.query.url) {
        let url = atob(req.query.url);
        if (url.startsWith('https://') || url.startsWith('http://')) {
            url = url;
        } else if (url.startsWith('//')) {
            url = 'http:' + url; 
        } else {
          url = 'http://' + url;
        }
        return res.redirect(307, config.prefix + rewrite_url(url)); 
        }
  });

  app.post(`${config.prefix}session/`, async(req, res, next) => {
     let url = querystring.parse(req.raw_body).url;
     if (url.startsWith('//')) { url = 'http:' + url; }
     else if (url.startsWith('https://') || url.startsWith('http://')) { url = url }
     else {url = 'http://' + url};
     return res.redirect(config.prefix + rewrite_url(url));
  });

  app.use(config.prefix, async(req, res, next) => {
    var proxy = {};
    proxy.url = rewrite_url(req.url.slice(1), 'decode');
    proxy.url = {
      href: proxy.url,
      hostname : proxy.url.split('/').splice(2).splice(0, 1).join('/'),
      origin : proxy.url.split('/').splice(0, 3).join('/'),
      encoded_origin : btoa(proxy.url.split('/').splice(0, 3).join('/')),
      path : '/' + proxy.url.split('/').splice(3).join('/'),
      protocol : proxy.url.split('\:').splice(0, 1).join(''), 
    }

    proxy.url.encoded_origin = btoa(proxy.url.origin);

    proxy.requestHeaders = req.headers;
    proxy.requestHeaders['host'] = proxy.url.hostname;
    if (proxy.requestHeaders['referer']) {
      let referer =  '/' + String(proxy.requestHeaders['referer']).split('/').splice(3).join('/');

      referer = rewrite_url(referer.replace(config.prefix, ''), 'decode');

      if (referer.startsWith('https://') || referer.startsWith('http://')) {
        referer = referer;

      } else referer = proxy.url.href;

      proxy.requestHeaders['referer'] = referer;
    }


    if (proxy.requestHeaders['origin']) {
      let origin =  '/' + String(proxy.requestHeaders['origin']).split('/').splice(3).join('/');

      origin = rewrite_url(origin.replace(config.prefix, ''), 'decode');

      if (origin.startsWith('https://') || origin.startsWith('http://')) {

        origin = origin.split('/').splice(0, 3).join('/');

      } else origin = proxy.url.origin;

       proxy.requestHeaders['origin'] = origin;
    }

    if (proxy.requestHeaders.cookie) {
        delete proxy.requestHeaders.cookie;
    }
    const httpAgent = new http.Agent({
	  keepAlive: true
    });
    const httpsAgent = new https.Agent({
	  keepAlive: true
    });
    proxy.options = {
      method: req.method,
      headers: proxy.requestHeaders,
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
      proxy.options.body = req.str_body;
  }
  if (proxy.url.hostname == 'discord.com' && proxy.url.path == '/') { return res.redirect(307, config.prefix + rewrite_url('https://discord.com/login'));};

  if (proxy.url.hostname == 'www.reddit.com') { return res.redirect(307, config.prefix + rewrite_url('https://old.reddit.com'));};

  if (!req.url.slice(1).startsWith(`${proxy.url.encoded_origin}/`)) { return res.redirect(307, config.prefix + proxy.url.encoded_origin + '/');};
  
  proxy.response = await fetch(proxy.url.href, proxy.options).catch(err => res.send(fs.readFileSync('./utils/error/error.html', 'utf8').toString().replace('%ERROR%', `Error 400: Could not make request to '${sanitizer.sanitize(proxy.url.href)}'!`)));

  if(typeof proxy.response.buffer != 'function')return;

  proxy.buffer = await proxy.response.buffer();

  proxy.content_type = 'text/plain';

  proxy.response.headers.forEach((e, i, a) => {
      if (i == 'content-type') proxy.content_type = e;
    });
  if (proxy.content_type == null || typeof proxy.content_type == 'undefined') proxy.content_type = 'text/html';

  proxy.sendResponse = proxy.buffer;
  
   // Parsing the headers from the response to remove square brackets so we can set them as the response headers.
  proxy.headers = Object.fromEntries(
      Object.entries(JSON.parse(JSON.stringify(proxy.response.headers.raw())))
        .map(([key, val]) => [key, val[0]])
   );
  
   // Parsing all the headers to remove all of the bad headers that could affect proxies performance.
   Object.entries(proxy.headers).forEach(([header_name, header_value]) => {
    if (header_name.startsWith('content-encoding') || header_name.startsWith('x-') || header_name.startsWith('cf-') || header_name.startsWith('strict-transport-security') || header_name.startsWith('content-security-policy')) {
        delete proxy.headers[header_name];
    }
   });

  // If theres a location for a redirect in the response, then the proxy will get the response location then redirect you to the proxied version of the url.
  if (proxy.response.headers.get('location')) {
    return res.redirect(307, config.prefix + rewrite_url(String(proxy.response.headers.get('location'))));
  }

  res.status(proxy.response.status);
  res.set(proxy.headers);
  res.contentType(proxy.content_type);
  if (proxy.content_type.startsWith('text/html')) {
      req.session.url = proxy.url.origin;
      proxy.sendResponse = proxy.sendResponse.toString()
     .replace(/integrity="(.*?)"/gi, '')
     .replace(/nonce="(.*?)"/gi, '')
     .replace(/(href|src|poster|data|action|srcset)="\/\/(.*?)"/gi, `$1` + `="http://` + `$2` + `"`)
     .replace(/(href|src|poster|data|action|srcset)='\/\/(.*?)'/gi, `$1` + `='http://` + `$2` + `'`)
     .replace(/(href|src|poster|data|action|srcset)="\/(.*?)"/gi, `$1` + `="${config.prefix}${proxy.url.encoded_origin}/` + `$2` + `"`)
     .replace(/(href|src|poster|data|action|srcset)='\/(.*?)'/gi, `$1` + `='${config.prefix}${proxy.url.encoded_origin}/` + `$2` + `'`)
     .replace(/'(https:\/\/|http:\/\/)(.*?)'/gi, function(str) {
        str = str.split(`'`).slice(1).slice(0, -1).join(``);
        return `'${config.prefix}${rewrite_url(str)}'`
      })
     .replace(/"(https:\/\/|http:\/\/)(.*?)"/gi, function(str) {
        str = str.split(`"`).slice(1).slice(0, -1).join(``);
        return `"${config.prefix}${rewrite_url(str)}"`
      })
     .replace(/(window|document).location.href/gi, `"${proxy.url.href}"`)
     .replace(/(window|document).location.hostname/gi, `"${proxy.url.hostname}"`)
     .replace(/(window|document).location.pathname/gi, `"${proxy.url.path}"`)
     .replace(/location.href/gi, `"${proxy.url.href}"`)
     .replace(/location.hostname/gi, `"${proxy.url.hostname}"`)
     .replace(/location.pathname/gi, `"${proxy.url.path}"`)
     .replace(/<html(.*?)>/gi, `<html` + '$1' + `><script src="${config.prefix}utils/assets/inject.js" id="_alloy_data" prefix="${config.prefix}" url="${btoa(proxy.url.href)}"></script>`);

     // Temp hotfix for Youtube search bar until my script injection can fix it.

     if (proxy.url.hostname == 'www.youtube.com') { proxy.sendResponse = proxy.sendResponse.replace(/\/results/gi, `${config.prefix}${proxy.url.encoded_origin}/results`);};
  } else if (proxy.content_type.startsWith('text/css')) {
      proxy.sendResponse = proxy.sendResponse.toString()      
     .replace(/url\("\/\/(.*?)"\)/gi, `url("http://` + `$1` + `")`)
     .replace(/url\('\/\/(.*?)'\)/gi, `url('http://` + `$1` + `')`)
     .replace(/url\(\/\/(.*?)\)/gi, `url(http://` + `$1` + `)`)
     .replace(/url\("\/(.*?)"\)/gi, `url("${config.prefix}${proxy.url.encoded_origin}/` + `$1` + `")`)
     .replace(/url\('\/(.*?)'\)/gi, `url('${config.prefix}${proxy.url.encoded_origin}/` + `$1` + `')`)
     .replace(/url\(\/(.*?)\)/gi, `url(${config.prefix}${proxy.url.encoded_origin}/` + `$1` + `)`)
     .replace(/"(https:\/\/|http:\/\/)(.*?)"/gi, function(str) {
      str = str.split(`"`).slice(1).slice(0, -1).join(``);
      return `"${config.prefix}${rewrite_url(str)}"`
      })
     .replace(/'(https:\/\/|http:\/\/)(.*?)'/gi, function(str) {
      str = str.split(`'`).slice(1).slice(0, -1).join(``);
      return `'${config.prefix}${rewrite_url(str)}'`
      })
     .replace(/\((https:\/\/|http:\/\/)(.*?)\)/gi, function(str) {
      str = str.split(`(`).slice(1).join(``).split(')').slice(0, -1).join('');
      return `(${config.prefix}${rewrite_url(str)})`
      });

  };
// We send the response from the server rewritten.
  res.send(proxy.sendResponse);
  });

  app.use('/', express.static('public'));

  app.use(async(req, res, next) => {
   if (req.headers['referer']) {

    let referer =  '/' + String(req.headers['referer']).split('/').splice(3).join('/');

    referer = rewrite_url(referer.replace(config.prefix, ''), 'decode').split('/').splice(0, 3).join('/');

    if (referer.startsWith('https://') || referer.startsWith('http://')) {
      res.redirect(307, config.prefix + btoa(referer) + req.url)
    } else {
       if (req.session.url) {

         res.redirect(307, config.prefix + btoa(req.session.url) + req.url)

       } else return next();
    }
   } else if (req.session.url) {

    res.redirect(307, config.prefix + btoa(req.session.url) + req.url)

  } else return next();
  });
