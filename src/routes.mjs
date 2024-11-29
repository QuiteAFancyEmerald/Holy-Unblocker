import { readFileSync } from 'fs';
import path from 'path';
import { readFile } from 'fs/promises';

const insert = JSON.parse(
  await readFile(new URL('./data.json', import.meta.url))
);

const __dirname = path.resolve();

const text404 = readFileSync(
  path.normalize(__dirname + '/views/error.html'),
  'utf8'
);

const pages = {
  index: 'index.html',
  'manifest.json': 'manifest.json',
  'test-404': 'error.html',
  /* Main */
  documentation: 'docs.html',
  questions: 'faq.html',
  s: 'pages/frame.html',
  browsing: 'pages/surf.html',
  credits: 'pages/nav/credits.html',
  bookmarklets: 'pages/nav/bookmarklets.html',
  terms: 'pages/nav/terms.html',
  /* Games */
  g: 'pages/nav/gtools.html',
  e: 'pages/nav/games5.html',
  c: 'pages/nav/emulators.html',
  f: 'pages/nav/flash.html',
  d: 'pages/nav/emulibrary.html',
  /* Proxies */
  a: 'pages/proxnav/ultraviolet.html',
  b: 'pages/proxnav/rammerhead.html',
  /* Proxy Presets */
  youtube: 'pages/proxnav/preset/youtube.html',
  apps: 'pages/proxnav/preset/applications.html',
  /* Misc */
  flash: 'archive/gfiles/flash/index.html',
  webretro: 'archive/gfiles/rarch/index.html',
  'robots.txt': 'robots.txt',
  'vibe-os': 'archive/vibeOS/index.html',
};

const externalPages = {
  github: {
    default: 'https://github.com/QuiteAFancyEmerald/Holy-Unblocker',
    aos: 'https://github.com/michalsnik/aos',
    bam: 'https://github.com/motortruck1221/bare-as-module3',
    bm: 'https://github.com/MercuryWorkshop/bare-mux',
    ep: 'https://github.com/MercuryWorkshop/epoxy-tls',
    fastify: 'https://github.com/fastify/fastify',
    'font-awesome': 'https://github.com/FortAwesome/Font-Awesome',
    lj: 'https://github.com/ading2210/libcurl.js',
    'nord-theme': 'https://github.com/nordtheme',
    config: 'https://github.com/titaniumnetwork-dev/Ultraviolet',
    wm: 'https://github.com/MercuryWorkshop/wisp-protocol',
  },
  'config-docs': 'https://docs.titaniumnetwork.org',
  'config-chat': 'https://discord.gg/VNT4E7gN5Y',
  'nt': 'https://nordtheme.com',
};

const cookingInserts = insert.content,
  vegetables = insert.keywords,
  charRandom = insert.chars,
  splashRandom = insert.splash,
  VersionValue = insert.version,
  cacheBustList = {
    'styles.css': 'styles-1644738239.css',
    'common.js': 'common-16451543478.js',
  };

export default {
  pages,
  externalPages,
  text404,
  cookingInserts,
  vegetables,
  charRandom,
  splashRandom,
  VersionValue,
  cacheBustList,
};
