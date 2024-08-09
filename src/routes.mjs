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
  games: 'pages/nav/gtools.html',
  'web-games': 'pages/nav/games5.html',
  emulators: 'pages/nav/emulators.html',
  'flash-games': 'pages/nav/flash.html',
  'retro-games': 'pages/nav/emulibrary.html',
  /* Proxies */
  ultraviolet: 'pages/proxnav/ultraviolet.html',
  rammerhead: 'pages/proxnav/rammerhead.html',
  /* Proxy Presets */
  youtube: 'pages/proxnav/preset/youtube.html',
  apps: 'pages/proxnav/preset/applications.html',
  /* Misc */
  flash: 'archive/gfiles/flash/index.html',
  webretro: 'archive/gfiles/rarch/index.html',
  'vibe-os': 'archive/vibeOS/index.html',
};

const externalPages = {
  github: {
    default: 'https://github.com/QuiteAFancyEmerald/Holy-Unblocker',
    aos: 'https://github.com/michalsnik/aos',
    'bare-module': 'https://github.com/motortruck1221/bare-as-module3',
    'bare-mux': 'https://github.com/MercuryWorkshop/bare-mux',
    epoxy: 'https://github.com/MercuryWorkshop/epoxy-tls',
    fastify: 'https://github.com/fastify/fastify',
    'font-awesome': 'https://github.com/FortAwesome/Font-Awesome',
    'libcurl-js': 'https://github.com/ading2210/libcurl.js',
    'nord-theme': 'https://github.com/nordtheme',
    ultraviolet: 'https://github.com/titaniumnetwork-dev/Ultraviolet',
    wisp: 'https://github.com/MercuryWorkshop/wisp-protocol',
  },
  'titaniumnetwork-documentation': 'https://docs.titaniumnetwork.org',
  'rammerhead-discord': 'https://discord.gg/VNT4E7gN5Y',
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
