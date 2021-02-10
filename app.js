/* -----------------------------------------------
/* Author : QuiteAFancyEmerald, YÖCTDÖNALD'S and SexyDuceDuce with help from Divide
/* MIT license: http://opensource.org/licenses/MIT
/* ----------------------------------------------- */
const [express, alloy, http, fs, path, char_insert] = [require('express'), require('alloyproxy'), require('http'), require('fs'), require('path'), require('./src/charinsert.js')], [app, config] = [express(), JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf8' }))], server = http.createServer(app), localprox = new alloy({
    prefix: '/fetch/',
    error: (proxy) => { proxy.res.send(fs.readFileSync('./views/error.html', { encoding: 'utf8' }).replace('%ERR%', proxy.error.info.message.replace(/</gi, '<&zwnj;').replace(/>/gi, '>&zwnj;'))); }, // Doing replace functions on "<" and ">" to prevent XSS.
    request: [],
    response: [],
    injection: true
});

app.use(localprox.app);

//Cloudflare Attack Mode Fix

app.post('/', async(req, res) => res.send(fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf8')));

//Querystring Navigation

app.get('/', async(req, res, t) => res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages,index.html,info.html,faq.html,status.html,archive,archive,hidden.html'.split(',')['/,/?in,/?faq,/?status,/?fg,/?rr,/?j'.split(',').indexOf(req.url) + 1], ',surf.html,f.html,run.html,frames,redirects3,proxnav5,nav7'.replace(/,[^,]+/g, e => ([] + e.match(/\D+/)).repeat(+e.match(/\d+/) + 1)).split(',')[t = 'z,fg,rr,k,dd,n,yh,ym,a,w,y,e,d,p,c,f,g,h,el,i,m,t,x'.split(',').indexOf(req.url.slice(2)) + 1], (t = ',,,,krunker,discordprox,chatbox,ythub,ytmobile,alloy,womginx,youtube,pydodge,discordhub,pmprox,credits,flash,gtools,games5,emulators,icons,gba,terms,bookmarklets'.split(',')[t]) && t + '.html'), 'utf8')));

app.use(char_insert.static(path.join(__dirname, 'views')));

app.use(function(req, res) {
    res.status(404, res.send(fs.readFileSync(path.join(__dirname, 'views', 'error.html'), 'utf8')));
});

localprox.ws(server);

server.listen(process.env.PORT || config.port);


/* 
// Easier to read version of app.js. Remove this if you would like an optimized version

 const express = require('express'),
    alloy = require('alloyproxy'),
    app = express(),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    char_insert = require('./src/charinsert.js');

const config = JSON.parse(fs.readFileSync('./config.json', {
    encoding: 'utf8'
}));
 
const server = http.createServer(app);   

//Local Alloy Proxy

const localprox = new alloy({
    prefix: '/fetch/',
    error: (proxy) => { return proxy.res.send(fs.readFileSync(path.join(__dirname, 'views', 'error.html'), 'utf8'));},
    request: [],
    response: [],
    injection: true
});    

app.get('/', async (req, res) => {
 
        const path = require("path"); //Use this for path.
        
        fs.readFileSync( path, options );
        Use this for improved navigation. Massive help from MikeLime and Duce. 
        if (req.url == '/?querystringhere') {
           return res.send(fs.readFileSync(path.resolve() + 'filepath', {
             encoding: 'utf8'
           }));
        }
    

     var hbsites = {}; 
        && hostname == hbsites
    

    switch (req.url) {
        case '/':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?z':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'surf.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?a':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'proxnav', 'alloy.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?dd':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'redirects', 'discordprox.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?b':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'proxnav', 'node.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?y':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'proxnav', 'youtube.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?e':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'proxnav', 'pydodge.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?d':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'proxnav', 'discordhub.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?c':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'nav', 'credits.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?f':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'nav', 'flash.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?g':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'nav', 'gtools.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?h':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'nav', 'games5.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?i':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'nav', 'icons.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?in':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'info.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?v':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'redirect.html'), 'utf8'));
    }

    switch (req.url == '/?k') {
        case '/?k':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'frames', 'krunker.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?m':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'nav', 'gba.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?n':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'redirects', 'chatbox.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?update':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'update.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?p':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'proxnav', 'pmprox.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?t':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'nav', 'terms.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?x':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'nav', 'bookmarklets.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?yh':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'redirects', 'ythub.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?ym':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages', 'redirects', 'ytmobile.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?fg':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'archive', 'f.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?rr':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'archive', 'run.html'), 'utf8'));
    }


    switch (req.url) {
        case '/?j':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'hidden.html'), 'utf8'))
    }

}); */

/* No proxy hosted locally
const
    char_insert = require('./src/charinsert.js'),
    path = require('path'),
    config = require('./config.json'),
    fs = require('fs'),
    http = require('http'),
    express = require('express'),
    app = express();

var server = 'http://';

server = http.createServer(app);

btoa = (str) => {
    str = new Buffer.from(str).toString('base64');
    return str;
};

atob = (str) => {
    str = new Buffer.from(str, 'base64').toString('utf-8');
    return str;
};

*/
