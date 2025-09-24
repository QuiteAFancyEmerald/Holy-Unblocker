import { readFileSync } from 'node:fs';
import ecosystem from '../ecosystem.config.js';

// For toggling SEO display and more, see the config.json file.
const config = Object.freeze(
  JSON.parse(readFileSync(new URL('../config.json', import.meta.url)))
);

const ecosystemConfig = Object.freeze(
  ecosystem.apps.find((app) => app.name === 'HolyUB') || ecosystem.apps[0]
);

/* Record the server's location as a URL object, including its host and port.
 * The host can be modified at /src/config.json, whereas the ports can be modified
 * at /ecosystem.config.js.
 */
const serverUrl = ((base) => {
  try {
    base = new URL(config.host);
  } catch (e) {
    base = new URL('http://a');
    base.host = config.host;
  }
  base.port =
    ecosystemConfig[config.production ? 'env_production' : 'env'].PORT;
  base.pathname =
    (config.pathname || '/').replace(/\/+$|[^\w\/\.-]+/g, '') + '/';
  return Object.freeze(base);
})();

let pages = {
  /* If you are trying to add pages or assets in the root folder and
   * NOT entire folders, check the routes below and add it manually.
   * If you change route names here, also check the altPaths variable below.
   */

  // Set the default page for when no pathname is supplied. Be sure to change the
  // option for disguiseFiles if the entry point should be hidden.
  default: config.disguiseFiles ? 'login' : 'index',
  index: 'index.html',
  'manifest.json': 'manifest.json',

  /* Users must visit this route if disguiseFiles is enabled. The page loader only
   * requests the site's contents if it has a local key, which is given by this page.
   * Be sure to update the following line(s) in src/server.mjs if you change this
   * variable:
   *   let exemptPages = ['login', .........];
   *   if (pages.default === 'login') exemptPages.push('');
   */
  login: 'pages/misc/deobf/entry-point.html',

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
  codespaces: 'https://github.com/codespaces',
  'tor-project': 'https://tb-manual.torproject.org/installation',
  'titaniumnetwork-documentation': 'https://docs.titaniumnetwork.org',
  'patreon': 'https://www.patreon.com/holyunblockerlts',
  'titaniumnetwork-discord': 'https://discord.gg/CwWpdGkuWY',
  'truffled': 'https://truffled.lol',
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
  codespaces: 'codesp',
  'tor-project': 'tr',
  'titaniumnetwork-discord': 'social',
  'truffled': 'educational',
  'rammerhead-discord': 'rdis',
  /* Raw File Names */
  files: {
    'scramjet.all.js': 'working.all.js',
    'scramjet.sw.js': 'working.sw.js',
    'scramjet.sw-blacklist.js': 'working.sw-blacklist.js',
    'scramjet.sync.js': 'working.sync.js',
    'scramjet.wasm.wasm': 'working.wasm.wasm',
    'uv.handler.js': 'networking.handler.js',
    'uv.client.js': 'networking.client.js',
    'uv.bundle.js': 'networking.bundle.js',
    'uv.config.js': 'networking.config.js',
    'uv.sw.js': 'networking.sw.js',
    'uv.webp': 'nt.webp',
    'scramjet.webp': 'wr.webp',
    'rammerhead.webp': 'physics.webp',
    'fastify.webp': 'fs.webp',
    'nordtheme.webp': 'nord.webp',
    'nodejs.webp': 'node.webp',
    'fontawesome.webp': 'fa.webp',
    'webretro.webp': 'notebook.webp',
    'ruffle.webp': 'rs.webp',
  },
  /* Prefixes */
  prefixes: {
    roms: 'ms',
    uv: 'network',
    scram: 'worker',
    chii: 'ani',
    epoxy: 'epoch',
    libcurl: 'unix',
    bareasmodule: 'utc',
    baremux: 'gmt',
    wisp: 'cron',
  },
};

const useAltPaths = (altPaths, targetPaths, ancestor, tempKey = '') => {
  if ('object' === typeof altPaths) {
    for (const [key, value] of Object.entries(altPaths)) {
      if (key in targetPaths) {
        const isEndPoint = 'object' !== typeof value;
        delete altPaths[
          useAltPaths(
            value,
            isEndPoint ? targetPaths : targetPaths[key],
            altPaths,
            key
          )
        ];
        if (isEndPoint) delete targetPaths[key];
      }
    }
    if ('object' === typeof ancestor) delete ancestor[tempKey];
  } else {
    targetPaths[altPaths] = targetPaths[tempKey];
    return tempKey;
  }
  return altPaths;
};

const getAltPrefix = (prefix, serverPathname = '/') =>
    serverPathname +
    ((!config.usingSEO && altPaths.prefixes[prefix]) || prefix) +
    '/',
  getPathEntries = (pathObject, prefix = '') => {
    if (prefix) prefix += '/';
    let inserts = [];
    for (let [key, value] of Object.entries(pathObject)) {
      if ('object' === typeof value)
        inserts = inserts.concat(getPathEntries(value, key));
      else
        inserts.push([
          prefix + key,
          prefix.replace(/^(?:prefixes|files)\//, '') +
            (config.usingSEO ? key : value),
        ]);
    }
    return inserts;
  },
  normalizePaths = (pathObject) =>
    Object.fromEntries(getPathEntries(pathObject));

const flatAltPaths = Object.freeze(normalizePaths(altPaths));

const insert = JSON.parse(
    readFileSync(new URL('./data.json', import.meta.url))
  ),
  text404 = readFileSync(
    new URL('../views/' + pages['test-404'], import.meta.url),
    'utf8'
  ),
  uvError = readFileSync(
    new URL('../views/' + pages['uverror'], import.meta.url),
    'utf8'
  ),
  sjError = readFileSync(
    new URL('../views/' + pages['sjerror'], import.meta.url),
    'utf8'
  );

if (!config.usingSEO) {
  useAltPaths(altPaths, pages);
  useAltPaths(altPaths, externalPages);
  delete pages['robots.txt'];
  delete pages['sitemap.xml'];
}

const cookingInserts = insert.content,
  vegetables = insert.keywords,
  charRandom = insert.chars,
  delimiter = insert.delimiter,
  textMasks = insert.textMasks,
  splashRandom = insert.splash,
  versionValue = insert.version,
  cacheBustList = {
    'styles.css': 'styles-1755147161.css',
    'common.js': 'common-1735118314.js',
  };

export {
  config,
  serverUrl,
  pages,
  externalPages,
  flatAltPaths,
  getAltPrefix,
  text404,
  uvError,
  sjError,
  cookingInserts,
  vegetables,
  charRandom,
  delimiter,
  textMasks,
  splashRandom,
  versionValue,
  cacheBustList,
};
