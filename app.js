/* -----------------------------------------------
 * Authors: QuiteAFancyEmerald, BinBashBanana (OlyB), YÖCTDÖNALD'S
 * Additional help from Divide and SexyDuceDuce
 * MIT license: http://opensource.org/licenses/MIT
 * ----------------------------------------------- */
const
    char_insert = require('./src/charinsert.js'),
    path = require('path'),
    config = require('./config.json'),
    fs = require('fs'),
    http = require('http'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || config.port,
    server = http.createServer(app);

btoa = (str) => {
    return new Buffer.from(str).toString('base64');
}

atob = (str) => {
    return new Buffer.from(str, 'base64').toString('utf-8');
}

const text404 = fs.readFileSync(path.normalize(__dirname + '/views/404.html'), 'utf8'),
    siteIndex = 'index.html',
    pages = {
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
        /* Proxies */
        'a': 'pages/proxnav/alloy.html',
        'w': 'pages/proxnav/womginx.html',
        'p': 'pages/proxnav/pmprox.html',
        'e': 'pages/proxnav/pydodge.html',
        'y': 'pages/proxnav/youtube.html',
        'd': 'pages/proxnav/discordhub.html',
        /* Ruffle and Webretro */
        'fg': 'archive/gfiles/flash/index.html',
        'eg': 'archive/gfiles/rarch/index.html'
    },
    /* Randomize Keywords */
    cookingInserts = [
        "This is a cool example cooking sentence.",
        "I wish I could boil hot water. Try to fill this sentence with a lot of cooking related keywords."
    ],
    vegetables = ['Beet', 'Potato'],
    charrandom = ['&#173;', '&zwnj;'];

function randomListItem(lis) {
    return lis[Math.floor(Math.random() * lis.length)];
}

function insertCharset(str) {
    return str.replace(/&#173;|&#8203;|<wbr>/g, randomListItem(charrandom));
}

function insertCooking(str) {
    return str.replace(/<!-- IMPORTANT-HUCOOKINGINSERT-DONOTDELETE -->/g, '<span style="display: none;" data-cooking="' + randomListItem(vegetables) + '" data-ingredients="' + randomListItem(vegetables) + '">' + randomListItem(cookingInserts) + '</span>');
}

function tryReadFile(file) {
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : text404;
}

/* Querystring Navigation */
app.get('/', async(req, res) => res.send(insertCooking(insertCharset(tryReadFile(path.normalize(__dirname + '/views/' + (['/', '/?'].includes(req.url) ? siteIndex : pages[Object.keys(req.query)[0]])))))));

/* Static Files Served */
app.use(char_insert.static(path.normalize(__dirname + '/views')));
app.use((req, res) => res.status(404, res.send(insertCooking(text404))));

server.listen(port);
console.log('Public distribution of Holy Unblocker available on port ' + port + '!');