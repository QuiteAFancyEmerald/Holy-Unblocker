import Fastify from 'fastify';
import { createServer } from 'node:http';
import { connect } from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import createRammerhead from '../lib/rammerhead/src/server/index.js';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import {
  config,
  serverUrl,
  pages,
  externalPages,
  getAltPrefix,
} from './routes.mjs';
import { tryReadFile, preloaded404 } from './templates.mjs';
import { fileURLToPath } from 'node:url';
import { existsSync, unlinkSync } from 'node:fs';

/* Record the server's location as a URL object, including its host and port.
 * The host can be modified at /src/config.json, whereas the ports can be modified
 * at /ecosystem.config.js.
 */
console.log(serverUrl);

/* Wisp (Python) configuration.
 * A managed wisp-server-python instance is started locally and upgrade requests
 * to the Wisp route are proxied to it. Disable autostart or point host/port to
 * an external instance via config.json > wispPython.
 */
const wispDefaults = Object.freeze({
    enabled: true,
    autostart: true,
    host: '127.0.0.1',
    port: 8070,
    allowLoopback: true,
    allowPrivate: true,
    blockUdp: false,
    logLevel: 'warning',
    pythonPath: '',
    proxy: '',
  }),
  wispConfig = Object.freeze({
    ...wispDefaults,
    ...(config.wispPython || {}),
  }),
  wispPath = getAltPrefix('wisp', serverUrl.pathname),
  formatHeaders = (req) => {
    let headerStr = '';
    for (let i = 0; i < req.rawHeaders.length; i += 2)
      headerStr += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
    return headerStr;
  },
  proxyWispUpgrade = (req, socket, head) => {
    if (!wispConfig.enabled) {
      socket.write(
        'HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\nContent-Length: 16\r\n\r\nWisp unavailable'
      );
      return socket.destroy();
    }

    const upstream = connect(
      { host: wispConfig.host, port: wispConfig.port },
      () => {
        upstream.write(
          `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${formatHeaders(req)}\r\n`
        );
        if (head?.length) upstream.write(head);
        socket.pipe(upstream);
        upstream.pipe(socket);
      }
    );

    const handleProxyError = (err) => {
      if (!socket.destroyed) {
        socket.write(
          'HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Length: 11\r\n\r\nBad Gateway'
        );
        socket.destroy();
      }
      if (!upstream.destroyed) upstream.destroy();
      if (err?.message) console.error('[Wisp Python] proxy error:', err.message);
    };

    upstream.on('error', handleProxyError);
    socket.on('error', handleProxyError);
    upstream.on('close', () => !socket.destroyed && socket.destroy());
    socket.on('close', () => !upstream.destroyed && upstream.destroy());
  },
  resolvePython = () => {
    const candidates = [
      wispConfig.pythonPath,
      process.env.WISP_PYTHON,
      process.platform === 'win32' ? 'py' : 'python3',
      'python',
    ].filter(Boolean);

    for (const cmd of candidates) {
      const probe = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
      if (!probe.error) return cmd;
    }
    return null;
  },
  waitForWispPort = (host, port, timeout = 2000) =>
    new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), timeout);
      const socket = connect({ host, port }, () => {
        clearTimeout(timer);
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => {
        clearTimeout(timer);
        resolve(false);
      });
    });

let wispProcess;

const startWispPython = async () => {
  if (!wispConfig.enabled || wispConfig.autostart === false) return;
  if (await waitForWispPort(wispConfig.host, wispConfig.port)) {
    console.log(
      `[Wisp Python] Found an existing instance on ${wispConfig.host}:${wispConfig.port}; not starting a managed one.`
    );
    return;
  }

  const pythonBin = resolvePython();
  if (!pythonBin) {
    console.warn(
      '[Wisp Python] No Python interpreter found. Wisp traffic will fail until one is available.'
    );
    return;
  }

  const args = [
    '-m',
    'wisp.server',
    '--host',
    wispConfig.host,
    '--port',
    String(wispConfig.port),
  ];
  if (wispConfig.allowLoopback) args.push('--allow-loopback');
  if (wispConfig.allowPrivate) args.push('--allow-private');
  if (wispConfig.blockUdp) args.push('--block-udp');
  if (wispConfig.proxy) args.push('--proxy', wispConfig.proxy);
  if (wispConfig.logLevel) args.push('--log-level', wispConfig.logLevel);

  console.log(
    `[Wisp Python] Starting managed wisp-server-python via ${pythonBin} ${args.join(' ')}`
  );

  wispProcess = spawn(pythonBin, args, { stdio: 'inherit' });
  wispProcess.once('exit', (code, signal) => {
    console.warn(
      `[Wisp Python] Process exited with code ${code ?? 'null'}${signal ? ` (signal ${signal})` : ''}`
    );
  });
};

const stopWispPython = () => {
  if (wispProcess && !wispProcess.killed) wispProcess.kill();
};

await startWispPython();
process.on('exit', stopWispPython);
['SIGINT', 'SIGTERM'].forEach((sig) =>
  process.on(sig, () => {
    stopWispPython();
    process.exit();
  })
);

// The server will check for the existence of this file when a shutdown is requested.
// The shutdown script in run-command.js will temporarily produce this file.
const shutdown = fileURLToPath(new URL('./.shutdown', import.meta.url));

const rh = createRammerhead();
const rammerheadScopes = [
  '/rammerhead.js',
  '/hammerhead.js',
  '/transport-worker.js',
  '/task.js',
  '/iframe-task.js',
  '/worker-hammerhead.js',
  '/messaging',
  '/sessionexists',
  '/deletesession',
  '/newsession',
  '/editsession',
  '/needpassword',
  '/syncLocalStorage',
  '/api/shuffleDict',
  '/mainport',
].map((pathname) => pathname.replace('/', serverUrl.pathname));

const rammerheadSession = new RegExp(
    `^${serverUrl.pathname.replaceAll('.', '\\.')}[a-z0-9]{32}`
  ),
  shouldRouteRh = (req) => {
    try {
      const url = new URL(req.url, serverUrl);
      return (
        rammerheadScopes.includes(url.pathname) ||
        rammerheadSession.test(url.pathname)
      );
    } catch (e) {
      return false;
    }
  },
  routeRhRequest = (req, res) => {
    req.url = req.url.slice(serverUrl.pathname.length - 1);
    rh.emit('request', req, res);
  },
  routeRhUpgrade = (req, socket, head) => {
    req.url = req.url.slice(serverUrl.pathname.length - 1);
    rh.emit('upgrade', req, socket, head);
  };

// Create a server factory for Rammerhead and Wisp
const serverFactory = (handler) => {
  return createServer()
    .on('request', (req, res) => {
      if (shouldRouteRh(req)) routeRhRequest(req, res);
      else handler(req, res);
    })
    .on('upgrade', (req, socket, head) => {
      if (shouldRouteRh(req)) routeRhUpgrade(req, socket, head);
      else if (req.url.endsWith(wispPath)) proxyWispUpgrade(req, socket, head);
    });
};

// Set logger to true for logs.
const app = Fastify({
  routerOptions: {
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
  },
  logger: false,
  serverFactory: serverFactory,
});

// Apply Helmet middleware for security.
app.register(fastifyHelmet, {
  contentSecurityPolicy: false, // Disable CSP
  xPoweredBy: false,
});

// Assign server file paths to different paths, for serving content on the website.
app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../views/dist/pages', import.meta.url)),
  prefix: serverUrl.pathname,
  decorateReply: false,
});

// All entries in the dist folder are created with source rewrites.
// Minified scripts are also served here, if minification is enabled.
[
  'assets',
  'archive',
  'uv',
  'scram',
  'epoxy',
  'libcurl',
  'baremux',
  'chii',
].forEach((prefix) => {
  app.register(fastifyStatic, {
    root: fileURLToPath(new URL('../views/dist/' + prefix, import.meta.url)),
    prefix: getAltPrefix(prefix, serverUrl.pathname),
    decorateReply: false,
  });
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/dist/archive/gfiles/rarch', import.meta.url)
  ),
  prefix: getAltPrefix('serving', serverUrl.pathname),
  decorateReply: false,
});

// You should NEVER commit roms, due to piracy concerns.
['cores', 'info', 'roms'].forEach((prefix) => {
  app.register(fastifyStatic, {
    root: fileURLToPath(
      new URL('../views/dist/archive/gfiles/rarch/' + prefix, import.meta.url)
    ),
    prefix: getAltPrefix(prefix, serverUrl.pathname),
    decorateReply: false,
  });
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/dist/archive/gfiles/rarch/cores', import.meta.url)
  ),
  prefix: getAltPrefix('uauth', serverUrl.pathname),
  decorateReply: false,
});

/* If you are trying to add pages or assets in the root folder and
 * NOT entire folders, check ./src/routes.mjs and add it manually.
 *
 * All website files are stored in the /views directory.
 * This takes one of those files and displays it for a site visitor.
 * Paths like /browsing are converted into paths like /views/dist/pages/surf.html
 * back here. Which path converts to what is defined in routes.mjs.
 */

const supportedTypes = {
    default: config.disguiseFiles ? 'image/vnd.microsoft.icon' : 'text/html',
    html: 'text/html',
    txt: 'text/plain',
    xml: 'application/xml',
    ico: 'image/vnd.microsoft.icon',
  },
  disguise = 'ico';

if (config.disguiseFiles) {
  const getActualPath = (path) =>
      path.slice(0, path.length - 1 - disguise.length),
    shouldNotHandle = new RegExp(`\\.(?!html$|${disguise}$)[\\w-]+$`, 'i'),
    loaderFile = tryReadFile(
      '../views/dist/pages/misc/deobf/loader.html',
      import.meta.url,
      false
    );
  let exemptDirs = [
      'assets',
      'uv',
      'scram',
      'epoxy',
      'libcurl',
      'baremux',
      'wisp',
      'chii',
    ].map((dir) => getAltPrefix(dir, serverUrl.pathname).slice(1, -1)),
    exemptPages = ['login', 'test-shutdown', 'favicon.ico'];
  for (const [key, value] of Object.entries(externalPages))
    if ('string' === typeof value) exemptPages.push(key);
    else exemptDirs.push(key);
  for (const path of rammerheadScopes)
    if (!shouldNotHandle.test(path)) exemptDirs.push(path.slice(1));
  exemptPages = exemptPages.concat(exemptDirs);
  if (pages.default === 'login') exemptPages.push('');

  app.addHook('preHandler', (req, reply, done) => {
    if (req.params.modified) return done();
    const reqPath = new URL(req.url, serverUrl).pathname.slice(
      serverUrl.pathname.length
    );
    if (
      shouldNotHandle.test(reqPath) ||
      exemptDirs.some((dir) => reqPath.indexOf(dir + '/') === 0) ||
      exemptPages.includes(reqPath) ||
      rammerheadSession.test(serverUrl.pathname + reqPath)
    )
      return done();

    if (!reqPath.endsWith('.' + disguise)) {
      reply.type(supportedTypes.html).send(loaderFile);
      reply.hijack();
      return done();
    } else if (!(reqPath in pages) && !reqPath.endsWith('favicon.ico')) {
      req.params.modified = true;
      req.raw.url = getActualPath(req.raw.url);
      if (req.params.path) req.params.path = getActualPath(req.params.path);
      if (req.params['*']) req.params['*'] = getActualPath(req.params['*']);
      reply.type(supportedTypes[disguise]);
      reply.header('Access-Control-Allow-Origin', 'null');
    }
    return done();
  });
}

app.get(serverUrl.pathname + ':path', (req, reply) => {
  // Testing for future features that need cookies to deliver alternate source files.
  /*
  if (req.raw.rawHeaders.includes('Cookie'))
    console.log(
      'cookie:',
      req.raw.rawHeaders[req.raw.rawHeaders.indexOf('Cookie') + 1]
    );
  */

  const reqPath = req.params.path;

  // Ignore browsers' automatic requests to favicon.ico, since it does not exist.
  // This approach is needed for certain pages to not have an icon.
  if (reqPath === 'favicon.ico') {
    reply.send();
    return reply.hijack();
  }

  if (reqPath in externalPages) {
    if (req.params.modified)
      return reply.code(404).type(supportedTypes.html).send(preloaded404);
    let externalRoute = externalPages[reqPath];
    if (typeof externalRoute !== 'string')
      externalRoute = externalRoute.default;
    return reply.redirect(externalRoute);
  }

  // If a GET request is sent to /test-shutdown and a script-generated shutdown file
  // is present, gracefully shut the server down.
  if (reqPath === 'test-shutdown' && existsSync(shutdown)) {
    console.log('Holy Unblocker is shutting down.');
    app.close();
    unlinkSync(shutdown);
    process.exitCode = 0;
  }

  // Return the error page if the query is not found in routes.mjs.
  if (reqPath && !(reqPath in pages))
    return reply.code(404).type(supportedTypes.default).send(preloaded404);

  // Serve the default page if the path is the default path.
  const fileName = reqPath ? pages[reqPath] : pages[pages.default],
    type =
      supportedTypes[fileName.slice(fileName.lastIndexOf('.') + 1)] ||
      supportedTypes.default;

  if (req.params.modified) reply.type(supportedTypes[disguise]);
  else reply.type(type);
  reply.send(tryReadFile('../views/dist/' + fileName, import.meta.url));
});

app.get(serverUrl.pathname + 'github/:redirect', (req, reply) => {
  if (req.params.redirect in externalPages.github)
    reply.redirect(externalPages.github[req.params.redirect]);
  else reply.code(404).type(supportedTypes.default).send(preloaded404);
});

if (serverUrl.pathname === '/')
  // Set an error page for invalid paths outside the query string system.
  // If the server URL has a prefix, then avoid doing this for stealth reasons.
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).type(supportedTypes.default).send(preloaded404);
  });
else {
  // Apply the following patch(es) if the server URL has a prefix.

  // Patch to fix serving index.html.
  app.get(serverUrl.pathname, (req, reply) => {
    reply
      .type(supportedTypes.default)
      .send(tryReadFile('../views/dist/' + pages.index, import.meta.url));
  });
}

app.listen({ port: serverUrl.port, host: serverUrl.hostname });
console.log(`Holy Unblocker is listening on port ${serverUrl.port}.`);
console.log(
  `Wisp (Python) is proxied at ${wispPath} -> ${wispConfig.host}:${wispConfig.port}. With a reverse proxy, route that path internally and keep the Python port firewalled from the public internet.`
);
if (config.disguiseFiles)
  console.log(
    'disguiseFiles is enabled. Visit src/routes.mjs to see the entry point, listed within the pages variable.'
  );
