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
const server = http.createServer(app);

btoa = (str) => {
    return new Buffer.from(str).toString('base64');
}

atob = (str) => {
    return new Buffer.from(str, 'base64').toString('utf-8');
}

const text404 = fs.readFileSync(path.normalize(__dirname + '/views/404.html'), 'utf8');
const pages = {
    'index': 'index.html',
    /* Main */
    'in': 'docs.html',
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
    'rh': 'pages/proxnav/rammerhead.html',
    'w': 'pages/proxnav/womginx.html',
    /* Proxy Presets */
    'sx': 'pages/proxnav/preset/searx.html',
    'y': 'pages/proxnav/preset/youtube.html',
    'd': 'pages/proxnav/preset/discord.html',
    'r': 'pages/proxnav/preset/reddit.html',
    /* Misc */
    'fg': 'archive/gfiles/flash/index.html',
    'eg': 'archive/gfiles/rarch/index.html',
    'vos': 'archive/vibeOS/index.html'
};

const cookingInserts = insert.content;
const vegetables = insert.keywords;
const charRandom = insert.chars;
const splashRandom = insert.splash;
const cacheBustList = {
    "styles.css": "styles-1644738239.css",
    "h5-nav.js": "h5-nav-1644738239.js",
    "desc.js": "desc-1644738239.js",
    "header.js": "header-1644738239.js",
    "footer.js": "footer-1644738239.js",
    "common.js": "common-1644738239.js",
    "links.js": "links-1644738239.js"
};

function randomListItem(lis) {
    return lis[Math.floor(Math.random() * lis.length)];
}

function insertCharset(str) {
    return str.replace(/&#173;|&#8203;|&shy;|<wbr>/g, function() { return randomListItem(charRandom); }); // this needs to be inside a function, so that not every string is the same
}

function hutaoInsert(str) {
    return str.replace(/<!--HUTAOWOA-->/g, function() { return randomListItem(splashRandom); }); // this needs to be inside a function, so that not every string is the same
}

function insertCooking(str) {
    return str.replace(/<!-- IMPORTANT-HUCOOKINGINSERT-DONOTDELETE -->/g, function() { return '<span style="display: none;" data-fact="' + randomListItem(vegetables) + '" data-type="' + randomListItem(vegetables) + '">' + randomListItem(cookingInserts) + '</span>'; }); // this needs to be inside a function, so that not every string is the same
}

function cacheBusting(str) {
    for (var item of Object.entries(cacheBustList)) {
        str = str.replace(new RegExp(item[0], "g"), item[1]);
    }
    return str;
}

function insertAll(str) {
    return insertCharset(hutaoInsert(insertCooking(cacheBusting(str))));
}

function tryReadFile(file) {
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : text404;
}

let blacklist;

const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));

fetch("https://blocklistproject.github.io/Lists/alt-version/everything-nl.txt").then(response => response.text()).then(data => {
    blacklist = data.split("\n") && config.blacklist;
});

const proxy = new corrosion({
    title: config.title,
    prefix: config.prefix || '/search/',
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
    res.status(404).send(insertAll(text404));
});

server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '. This is simply a public for Holy Unblocker. Certain functions may not work properly.');