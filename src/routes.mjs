import { readFileSync } from 'fs';
import path from 'path';
import { readFile } from 'fs/promises';


const insert = JSON.parse(await readFile(new URL('./data.json',
    import.meta.url)));

const __dirname = path.resolve();

const text404 = readFileSync(path.normalize(__dirname + '/views/404.html'), 'utf8');
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
    'q': 'pages/proxnav/ultraviolet.html',
    'rh': 'pages/proxnav/rammerhead.html',
    'w': 'pages/proxnav/womginx.html',
    /* Proxy Presets */
    'sx': 'pages/proxnav/preset/spotify.html',
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
    "common.js": "common-16451543478.js",
    "links.js": "links-1644738239.js"
};

export default { pages, text404, cookingInserts, vegetables, charRandom, splashRandom, cacheBustList };