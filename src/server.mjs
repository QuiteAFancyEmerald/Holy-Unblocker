import Fastify from 'fastify';
import { createServer } from 'node:http';
import wisp from 'wisp-server-node';
import createRammerhead from '../lib/rammerhead/src/server/index.js';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { bareModulePath } from '@mercuryworkshop/bare-as-module3';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import pageRoutes from './routes.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { paintSource, preloaded404, tryReadFile } from './randomization.mjs';
import loadTemplates from './templates.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync, unlinkSync } from 'node:fs';
import ecosystem from '../ecosystem.config.js';

const config = Object.freeze(
    JSON.parse(await readFile(new URL('./config.json', import.meta.url)))
  ),
  ecosystemConfig = Object.freeze(
    ecosystem.apps.find((app) => app.name === 'HolyUB') || ecosystem.apps[0]
  ),
  { pages, externalPages } = pageRoutes,
  __dirname = path.resolve();

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
  return Object.freeze(base);
})();
console.log(serverUrl);

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
];

const rammerheadSession = /^\/[a-z0-9]{32}/,
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
    rh.emit('request', req, res);
  },
  routeRhUpgrade = (req, socket, head) => {
    rh.emit('upgrade', req, socket, head);
  };

// Create a server factory for RH, and wisp (and bare if you please).
const serverFactory = (handler) => {
  return createServer()
    .on('request', (req, res) => {
      if (shouldRouteRh(req)) routeRhRequest(req, res);
      else handler(req, res);
    })
    .on('upgrade', (req, socket, head) => {
      if (shouldRouteRh(req)) routeRhUpgrade(req, socket, head);
      else if (req.url.endsWith('/wisp/')) wisp.routeRequest(req, socket, head);
    });
};

// Set logger to true for logs.
const app = Fastify({
  ignoreDuplicateSlashes: true,
  ignoreTrailingSlash: true,
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
  root: fileURLToPath(new URL('../views/pages', import.meta.url)),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../views/assets', import.meta.url)),
  prefix: '/assets/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../views/archive', import.meta.url)),
  prefix: '/archive/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL(
      // Use the pre-compiled, minified scripts instead, if enabled in config.
      config.minifyScripts ? '../views/dist/assets/js' : '../views/assets/js',
      import.meta.url
    )
  ),
  prefix: '/assets/js/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL(
      // Use the pre-compiled, minified stylesheets instead, if enabled in config.
      config.minifyScripts ? '../views/dist/assets/css' : '../views/assets/css',
      import.meta.url
    )
  ),
  prefix: '/assets/css/',
  decorateReply: false,
});

// This combines scripts from the official UV repository with local UV scripts into
// one directory path. Local versions of files override the official versions.
app.register(fastifyStatic, {
  root: [
    fileURLToPath(
      new URL(
        // Use the pre-compiled, minified scripts instead, if enabled in config.
        config.minifyScripts ? '../views/dist/uv' : '../views/uv',
        import.meta.url
      )
    ),
    uvPath,
  ],
  prefix: '/uv/',
  decorateReply: false,
});

// Register proxy paths to the website.
app.register(fastifyStatic, {
  root: epoxyPath,
  prefix: '/epoxy/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: libcurlPath,
  prefix: '/libcurl/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: bareModulePath,
  prefix: '/bareasmodule/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: baremuxPath,
  prefix: '/baremux/',
  decorateReply: false,
});

/* All website files are stored in the /views directory.
 * This takes one of those files and displays it for a site visitor.
 * Paths like /browsing are converted into paths like /views/pages/surf.html
 * back here. Which path converts to what is defined in routes.mjs.
 */
app.get('/:path', (req, reply) => {
  // Testing for future features that need cookies to deliver alternate source files.
  if (req.raw.rawHeaders.includes('Cookie'))
    console.log(req.raw.rawHeaders[req.raw.rawHeaders.indexOf('Cookie') + 1]);

  const reqPath = req.params.path;

  if (reqPath in externalPages) {
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
    return reply.code(404).type('text/html').send(preloaded404);

  reply.type('text/html').send(
    paintSource(
      loadTemplates(
        tryReadFile(
          '../views/' +
            // Set the index the as the default page.
            (reqPath ? pages[reqPath] : pages.index),
          import.meta.url
        )
      )
    )
  );
});

app.get('/github/:redirect', (req, reply) => {
  if (req.params.redirect in externalPages.github)
    reply.redirect(externalPages.github[req.params.redirect]);
  else reply.code(404).type('text/html').send(preloaded404);
});

const encodingTable = (() => {
    let yummyOneBytes = '';
    for (let i = 0; i < 128; i++)
      if (
        JSON.stringify(JSON.stringify(String.fromCodePoint(i)).slice(1, -1))
          .length < 6
      )
        yummyOneBytes += String.fromCodePoint(i);
    return yummyOneBytes;
  })(),
  randomValue = crypto
    .randomUUID()
    .split('-')
    .map((gibberish) => {
      let randomNumber = parseInt(gibberish, 16),
        output = '';
      while (randomNumber >= encodingTable.length) {
        output +=
          encodingTable[Math.floor(randomNumber) % encodingTable.length];
        randomNumber = randomNumber / encodingTable.length;
      }
      return output + Math.floor(randomNumber);
    })
    .join(''),
  randomizeGlobal = config.randomizeIdentifiers
    ? (file) =>
        tryReadFile(file, import.meta.url).replace(
          /(["'`])\{\{__uv\$config\}\}\1/g,
          JSON.stringify(randomValue)
        )
    : (file) =>
        tryReadFile(file, import.meta.url).replace(
          /(["'`])\{\{__uv\$config\}\}\1/g,
          JSON.stringify('__uv$config')
        );

app.get('/assets/js/common-16451543478.js', (req, reply) => {
  reply
    .type('text/javascript')
    .send(
      randomizeGlobal(
        '../views' + (config.minifyScripts ? '/dist' : '') + req.url
      )
    );
});

app.get('/uv/:file.js', (req, reply) => {
  const destination = existsSync(
    fileURLToPath(new URL('../views' + req.url, import.meta.url))
  )
    ? '../views' + (config.minifyScripts ? '/dist' : '') + req.url
    : pathToFileURL(uvPath) + `/${req.params.file}.js`;
  reply
    .type('text/javascript')
    .send(
      randomizeGlobal(destination).replace(
        /(["'`])\{\{ultraviolet-error\}\}\1/g,
        JSON.stringify(
          tryReadFile(
            '../views/pages/proxnav/ultraviolet-error.html',
            import.meta.url
          )
        )
      )
    );
});

// Set an error page for invalid paths outside the query string system.
app.setNotFoundHandler((req, reply) => {
  reply.code(404).type('text/html').send(preloaded404);
});

app.listen({ port: serverUrl.port, host: serverUrl.hostname });
console.log(`Holy Unblocker is listening on port ${serverUrl.port}.`);
