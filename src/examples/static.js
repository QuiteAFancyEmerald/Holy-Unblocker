const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const text404 = fs.readFileSync(path.normalize(__dirname + '/views/404.html'), 'utf8');
const pages = { index: "index.html", in: "docs.html", faq: "faq.html", j: "hidden.html", s: "pages/frame.html", z: "pages/surf.html", c: "pages/nav/credits.html", x: "pages/nav/bookmarklets.html", i: "pages/nav/icons.html", t: "pages/nav/terms.html", g: "pages/nav/gtools.html", h: "pages/nav/games5.html", el: "pages/nav/emulators.html", f: "pages/nav/flash.html", m: "pages/nav/emulibrary.html", q: "pages/proxnav/corrosion.html", w: "pages/proxnav/womginx.html", y: "pages/proxnav/preset/youtube.html", d: "pages/proxnav/preset/discord.html", r: "pages/proxnav/preset/reddit.html", fg: "archive/gfiles/flash/index.html", eg: "archive/gfiles/rarch/index.html", vos: "archive/vibeOS/index.html" };
const cacheBustList = { "common.js": "common-1643838852.js", "links.js": "links-1642900360.js" };

function cacheBusting(str) {
    for (var item of Object.entries(cacheBustList)) {
        str = str.replace(new RegExp(item[0], "g"), item[1]);
    }
    return str;
}

function insertAll(str) {
    return cacheBusting(str);
}

function tryReadFile(file) {
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : text404;
}

app.get('/', async(req, res) => res.send(insertAll(tryReadFile(path.normalize(__dirname + '/views/' + (['/', '/?'].includes(req.url) ? pages.index : pages[Object.keys(req.query)[0]]))))));
app.use(express.static(path.normalize(__dirname + "/views"))), app.use((e, s) => { s.status(404).send(insertAll(text404)) });
server.listen(port);