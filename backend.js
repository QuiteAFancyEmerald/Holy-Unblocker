/* -----------------------------------------------
 * Authors: QuiteAFancyEmerald, BinBashBanana (OlyB), YÖCTDÖNALD'S and the lime
 * Additional help from Divide and SexyDuceDuce >:D test aaaa
 * ----------------------------------------------- */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const corrosion = require('corrosion');
const config = require('./config.json');
const insert = require('./randomization.json');
const app = express();
const port = process.env.PORT || config.port;
const server = config.ssl ? https.createServer({ key: fs.readFileSync('./ssl/ssl.key'), cert: fs.readFileSync('./ssl/ssl.cert') }, app) : http.createServer(app);

btoa = (str) => {
    return new Buffer.from(str).toString('base64');
}

atob = (str) => {
    return new Buffer.from(str, 'base64').toString('utf-8');
}

const text404 = fs.readFileSync(path.normalize(__dirname + '/views/404.html'), 'utf8'),
    pages = {
        'index': 'index.html',
        /* Main */
        'in': 'info.html',
        'faq': 'faq.html',
        'j': 'hidden.html',
        's': 'pages/frame.html',
        'z': 'pages/surf.html',
        'c': 'pages/nav/credits.html',
        'x': 'pages/nav/bookmarklets.html',
        'i': 'pages/nav/icons.html',
        't': 'pages/nav/terms.html',
        /* Games */
        'g': 'pages/nav/gtools.html',
        'h': 'pages/nav/games5.html',
        'el': 'pages/nav/emulators.html',
        'f': 'pages/nav/flash.html',
        'm': 'pages/nav/emulibrary.html',
        /* Proxies */
        'q': 'pages/proxnav/corrosion.html',
        'w': 'pages/proxnav/womginx.html',
        'y': 'pages/proxnav/youtube.html',
        'd': 'pages/proxnav/discordhub.html',
        /* Ruffle and Webretro */
        'fg': 'archive/gfiles/flash/index.html',
        'eg': 'archive/gfiles/rarch/index.html'
    };

const cookingInserts = insert.content;
const vegetables = insert.keywords;
const charRandom = insert.chars;

function randomListItem(lis) {
    return lis[Math.floor(Math.random() * lis.length)];
}

function redditFix(str) {
    return str.replace(/Ch&#173;a&#173;tbo&#173;x/g, 'Re&#173;dd&#173;it');
}

function insertCharset(str) {
    return str.replace(/&#173;|&#8203;|<wbr>/g, function() { return randomListItem(charRandom); });
}

function insertCooking(str) {
    return str.replace(/<!-- IMPORTANT-HUCOOKINGINSERT-DONOTDELETE -->/g, function() { return '<span style="display: none;" data-fact="' + randomListItem(vegetables) + '" data-type="' + randomListItem(vegetables) + '">' + randomListItem(cookingInserts) + '</span>'; });
}

function cacheBusting(str) {
    return str.replace(/styles.min.css/g, 'styles-1636936688.min.css');
}

function cacheBusting2(str) {
    return str.replace(/common.js/g, 'common-1628457888.js');
}

function cacheBusting3(str) {
    return str.replace(/surf.js/g, 'surf-1628130462.js');
}

function insertAll(str) {
    return insertCharset(insertCooking(redditFix(cacheBusting(cacheBusting2(cacheBusting3(str))))));
}

function tryReadFile(file) {
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : text404;
}

const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));

let blacklist;

fetch("https://blocklistproject.github.io/Lists/alt-version/everything-nl.txt").then(response => response.text()).then(data => {
    blacklist = data.split("\n") && config.blacklist;
});

const proxy = new corrosion({
    title: config.title,
    prefix: config.prefix || '/search/',
    forceHttps: true,
    codec: config.codec || 'xor',
    ws: config.ws,
    requestMiddleware: [
        corrosion.middleware.blacklist(blacklist, 'Service not allowed due to bot protection! Make sure you are not trying to verify on a proxy.'),
    ],
});

proxy.bundleScripts();

/* Querystring Navigation */
app.get('/', async(req, res) => res.send(insertAll(tryReadFile(path.normalize(__dirname + '/views/' + (['/', '/?'].includes(req.url) ? pages.index : pages[Object.keys(req.query)[0]]))))));

/* Static Files Served */
app.use(express.static(path.normalize(__dirname + '/views')));
app.use((req, res) => {
    if (req.url.startsWith(proxy.prefix)) return proxy.request(req, res);
    res.status(404, res.send(insertAll(text404)))
});

server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '. This is simply a public for Holy Unblocker. Certain functions may not work properly.');