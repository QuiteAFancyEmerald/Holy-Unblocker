/* -----------------------------------------------
/* Author : QuiteAFancyEmerald and YÖCTDÖNALD'S with help from MikeLime, SexyDuceDuce and Divide
/* MIT license: http://opensource.org/licenses/MIT
/* ----------------------------------------------- */

const
    express = require('express'),
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
const unblocker = new alloy({
    prefix: '/fetch/',
    request: [],
    response: [],
    injection: true,
});    

app.use(unblocker.app);    

unblocker.ws(server);   

//Cloudflare Attack Mode Fix

app.post('/', async(req, res) => {
    switch (req.url) {
        case '/':
            return res.send(fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf8'));
    }
});

//Querystrings
app.get('/', async(req, res, t) => res.send(fs.readFileSync(path.join(__dirname, 'views', 'pages,index.html,info.html,archive,archive,hidden.html'.split(',')['/,/?in,/?fg,/?rr,/?j'.split(',').indexOf(req.url) + 1], ',surf.html,f.html,run.html,frames,redirects3,proxnav5,nav7'.replace(/,[^,]+/g, e => ([] + e.match(/\D+/)).repeat(+e.match(/\d+/) + 1)).split(',')[t = 'z,fg,rr,k,dd,n,yh,ym,a,b,y,e,d,p,c,f,g,h,i,m,t,x'.split(',').indexOf(req.url.slice(2)) + 1], (t = ',,,,krunker,discordprox,chatbox,ythub,ytmobile,alloy,node,youtube,pydodge,discordhub,pmprox,credits,flash,gtools,games5,icons,gba,terms,bookmarklets'.split(',')[t]) && t + '.html'), 'utf8')));

/*
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
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?z':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'surf.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?a':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'proxnav', 'alloy.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?dd':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'redirects', 'discordprox.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?b':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'proxnav', 'node.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?y':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'proxnav', 'youtube.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?e':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'proxnav', 'pydodge.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?d':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'proxnav', 'discordhub.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?c':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'nav', 'credits.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?f':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'nav', 'flash.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?g':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'nav', 'gtools.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?h':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'nav', 'games5.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?i':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'nav', 'icons.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?in':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'info.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?v':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'redirect.html'), 'utf8'));
    }

    switch (req.url == '/?k') {
        case '/?k':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'frames', 'krunker.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?m':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'nav', 'gba.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?n':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'redirects', 'chatbox.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?update':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'update.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?p':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'proxnav', 'pmprox.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?t':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'nav', 'terms.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?x':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'nav', 'bookmarklets.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?yh':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'redirects', 'ythub.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?ym':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'pages', 'redirects', 'ytmobile.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?fg':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'archive', 'f.html'), 'utf8'));
    }

    switch (req.url) {
        case '/?rr':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'archive', 'run.html'), 'utf8'));
    }


    switch (req.url) {
        case '/?j':
            return res.send(fs.readFileSync(path.join(__dirname, 'public', 'hidden.html'), 'utf8'))
    }

}); */
app.use(char_insert.static(path.join(__dirname, 'views')));

server.listen(process.env.PORT || config.port);