import { readFileSync } from 'node:fs';

// For toggling SEO display and more, see the config.json file.
const config = Object.freeze(
  JSON.parse(readFileSync(new URL('../config.json', import.meta.url)))
);

let pages = {
  /* If you are trying to add pages or assets in the root folder and
   * NOT entire folders, check the routes below and add it manually.
   * If you change route names here, also check the altPaths variable below.
   * Also, please don't use RegEx symbols in the names.
   */
  index: 'index.html',
  'manifest.json': 'manifest.json',

  // This route for the error page is also used to define text404 down below.
  'test-404': 'error.html',
  /* Main */
  documentation: 'docs.html',
  questions: 'faq.html',
  s: 'pages/frame.html',
  browsing: 'pages/surf.html',
  credits: 'pages/nav/credits.html',
  terms: 'pages/nav/terms.html',
  /* Games */
  games: 'pages/nav/directory.html',
  'web-games': 'pages/nav/games5.html',
  emulators: 'pages/nav/emulators.html',
  'flash-games': 'pages/nav/flash.html',
  'retro-games': 'pages/nav/emulibrary.html',
  /* Proxies */
  ultraviolet: 'pages/proxnav/ultraviolet.html',
  scramjet: 'pages/proxnav/scramjet.html',
  uverror: 'pages/proxnav/ultraviolet-error.html',
  sjerror: 'pages/proxnav/scramjet-error.html',
  rammerhead: 'pages/proxnav/rammerhead.html',
  /* Proxy Presets */
  youtube: 'pages/proxnav/preset/youtube.html',
  apps: 'pages/proxnav/preset/applications.html',
  /* Misc */
  flash: 'archive/gfiles/flash/index.html',
  webretro: 'archive/gfiles/rarch/index.html',
  'vibe-os': 'archive/vibeOS/index.html',
  'robots.txt': 'robots.txt',
  'sitemap.xml': 'sitemap.xml',
  'browserconfig.xml': 'browserconfig.xml',
  'favicon.ico': 'favicon.ico',
};

let externalPages = {
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
    scramjet: 'https://github.com/MercuryWorkshop/scramjet',
    ultraviolet: 'https://github.com/titaniumnetwork-dev/Ultraviolet',
    wisp: 'https://github.com/MercuryWorkshop/wisp-protocol',
  },
  'titaniumnetwork-documentation': 'https://docs.titaniumnetwork.org',
  'titaniumnetwork-discord': 'https://discord.gg/CwWpdGkuWY',
  'rammerhead-discord': 'https://discord.gg/VNT4E7gN5Y',
};

// Override the route names below when usingSEO is disabled in config.json.
let altPaths = {
  games: 'books',
  'web-games': 'dictionary',
  emulators: 'catalogue',
  'flash-games': 'textbook',
  'retro-games': 'math',
  ultraviolet: 'networking',
  scramjet: 'working',
  uverror: 'network-error',
  sjerror: 'worker-error',
  rammerhead: 'physics',
  youtube: 'wiki',
  apps: 'software',
  flash: 'whiteboard',
  webretro: 'notebook',
  'vibe-os': 'pencil',
  github: {
    'bare-module': 'module',
    'bare-mux': 'bm',
    epoxy: 'ep',
    fastify: 'fs',
    'libcurl-js': 'ljs',
    scramjet: 'wr',
    ultraviolet: 'nt',
    wisp: 'router',
  },
  'titaniumnetwork-documentation': 'docs',
  'titaniumnetwork-discord': 'social',
  'rammerhead-discord': 'rdis',
  /* Image Paths */
  'uv.webp': 'nt.webp',
  'sj.webp': 'wr.webp',
  'rammerhead.webp': 'physics.webp',
  /* Prefixes */
  prefixes: {
    roms: 'ms',
    uv: 'network',
    scram: 'worker',
    epoxy: 'epoch',
    libcurl: 'unix',
    bareasmodule: 'utc',
    baremux: 'gmt',
  },
};

const useAltPaths = (altPaths, targetPaths, ancestor, tempKey = '') => {
  if ('object' === typeof altPaths) {
    for (const [key, value] of Object.entries(altPaths)) {
      if (key in targetPaths) {
        delete altPaths[
          useAltPaths(
            value,
            'object' === typeof value ? targetPaths[key] : targetPaths,
            altPaths,
            key
          )
        ];
        delete targetPaths[key];
      }
    }
    if ('object' === typeof ancestor) delete ancestor[tempKey];
  } else {
    targetPaths[altPaths] = targetPaths[tempKey];
    return tempKey;
  }
  return altPaths;
};

const getAltPrefix = (prefix) =>
    `/${(!config.usingSEO && altPaths.prefixes[prefix]) || prefix}/`,
  getPathEntries = (pathObject, prefix = '') => {
    if (prefix) prefix += '/';
    let inserts = [];
    for (let [key, value] of Object.entries(pathObject)) {
      if ('object' === typeof value)
        inserts = inserts.concat(getPathEntries(value, key));
      else inserts.push([prefix + key, prefix.replace(/^prefixes\//, '') + value]);
    }
    return inserts;
  },
  normalizePaths = (pathObject) =>
    Object.fromEntries(getPathEntries(pathObject));

const flatAltPaths = normalizePaths(altPaths);

if (!config.usingSEO) {
  useAltPaths(altPaths, pages);
  useAltPaths(altPaths, externalPages);
}

const insert = JSON.parse(
    readFileSync(new URL('./data.json', import.meta.url))
  ),
  text404 = readFileSync(
    new URL('../views/' + pages['test-404'], import.meta.url),
    'utf8'
  );

const cookingInserts = insert.content,
  vegetables = insert.keywords,
  charRandom = insert.chars,
  delimiter = insert.delimiter,
  textMasks = insert.textMasks,
  splashRandom = insert.splash,
  VersionValue = insert.version,
  cacheBustList = {
    'styles.css': 'styles-1735118314.css',
    'common.js': 'common-1735118314.js',
  };

export default {
  config,
  pages,
  externalPages,
  flatAltPaths,
  getAltPrefix,
  text404,
  cookingInserts,
  vegetables,
  charRandom,
  delimiter,
  textMasks,
  splashRandom,
  VersionValue,
  cacheBustList,
};
