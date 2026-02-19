import { readFileSync } from 'node:fs';
import ecosystem from '../ecosystem.config.js';

// For toggling SEO display, disguise, etc. → see config.json
const config = Object.freeze(
  JSON.parse(readFileSync(new URL('../config.json', import.meta.url)))
);

const ecosystemConfig = Object.freeze(
  ecosystem.apps.find((app) => app.name === 'Scbypass') || ecosystem.apps[0]
);

/*
 * Server base URL object — host from config.json, port from ecosystem.config.js
 */
const serverUrl = ((base) => {
  try {
    base = new URL(config.host);
  } catch {
    base = new URL('http://a');
    base.host = config.host;
  }
  base.port =
    ecosystemConfig[config.production ? 'env_production' : 'env'].PORT;
  base.pathname =
    (config.pathname || '/').replace(/\/+$|[^\w\/\.-]+/g, '') + '/';
  return Object.freeze(base);
})();
console.log(`SCBypass server base: ${serverUrl}`);

/* ────────────────────────────────────────────────
   Route definitions (what pathname → which file)
   ──────────────────────────────────────────────── */
let pages = {
  // Default entry point (changes if disguiseFiles is enabled)
  default: config.disguiseFiles ? 'login' : 'index',
  index: 'index.html',
  'manifest.json': 'manifest.json',
  // Login / entry point required when disguiseFiles = true
  // Also update exemptPages in src/server.mjs if changed
  login: 'pages/misc/deobf/entry-point.html',
  // 404 / error page base
  'test-404': 'error.html',
  /* ──────────────── Main ──────────────── */
  documentation: 'docs.html',
  questions: 'faq.html',
  s: 'pages/frame.html',
  browsing: 'pages/surf.html',
  credits: 'pages/nav/credits.html',
  terms: 'pages/nav/terms.html',
  /* ──────────────── Games ──────────────── */
  games: 'pages/nav/directory.html',
  'web-games': 'pages/nav/games5.html',
  emulators: 'pages/nav/emulators.html',
  'flash-games': 'pages/nav/flash.html',
  'retro-games': 'pages/nav/emulibrary.html',
  /* ──────────────── Proxies ──────────────── */
  ultraviolet: 'pages/proxnav/ultraviolet.html',
  scramjet: 'pages/proxnav/scramjet.html',
  uverror: 'pages/proxnav/ultraviolet-error.html',
  sjerror: 'pages/proxnav/scramjet-error.html',
  rammerhead: 'pages/proxnav/rammerhead.html',
  /* ──────────────── Proxy Presets ──────────────── */
  youtube: 'pages/proxnav/preset/youtube.html',
  apps: 'pages/proxnav/preset/applications.html',
  /* ──────────────── Misc ──────────────── */
  flash: 'archive/gfiles/flash/index.html',
  webretro: 'archive/gfiles/rarch/index.html',
  'vibe-os': 'archive/vibeOS/index.html',
  'robots.txt': 'robots.txt',
  'sitemap.xml': 'sitemap.xml',
  'browserconfig.xml': 'browserconfig.xml',
};

/* ────────────────────────────────────────────────
   External redirects / links
   ──────────────────────────────────────────────── */
let externalPages = {
  github: {
    default: 'https://www.tiktok.com/@holy.nik.offz', // main profile instead of old repo
    // keep old ones if you want credits, or remove them
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
  patreon: 'https://www.patreon.com/holyunblockerlts', // keep or change
  'discord': 'https://discord.gg/TnPCzYWZAP',
};

/* ────────────────────────────────────────────────
   SEO / obfuscation alternate paths (when usingSEO = false)
   ──────────────────────────────────────────────── */
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
  'discord': 'social',
  /* Raw file renames */
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
  /* Prefix renames */
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

/* ────────────────────────────────────────────────
   Utility functions (unchanged logic)
   ──────────────────────────────────────────────── */
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
  '/';

const getPathEntries = (pathObject, prefix = '') => {
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
};

const normalizePaths = (pathObject) =>
  Object.fromEntries(getPathEntries(pathObject));

const flatAltPaths = Object.freeze(normalizePaths(altPaths));

/* ────────────────────────────────────────────────
   SEO randomization data + error page caches
   ──────────────────────────────────────────────── */
const insert = JSON.parse(
  readFileSync(new URL('./data.json', import.meta.url))
);

const text404 = readFileSync(
  new URL('../views/' + pages['test-404'], import.meta.url),
  'utf8'
);

const uvError = readFileSync(
  new URL('../views/' + pages['uverror'], import.meta.url),
  'utf8'
);

const sjError = readFileSync(
  new URL('../views/' + pages['sjerror'], import.meta.url),
  'utf8'
);

/* Apply alternate paths if SEO is disabled */
if (!config.usingSEO) {
  useAltPaths(altPaths, pages);
  useAltPaths(altPaths, externalPages);
  delete pages['robots.txt'];
  delete pages['sitemap.xml'];
}

/* ────────────────────────────────────────────────
   SAFE EXPORT – no spread syntax in named export list
   (this fixes the SyntaxError on Node 20 ESM)
   ──────────────────────────────────────────────── */
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
  cookingInserts: insert.content,
  vegetables: insert.keywords,
  charRandom: insert.chars,
  delimiter: insert.delimiter,
  textMasks: insert.textMasks,
  splashRandom: insert.splash,
  versionValue: insert.version,
  cacheBustList: {
    'styles.css': 'styles-1755147161.css',
    'common.js': 'common-1735118314.js',
  },
};
