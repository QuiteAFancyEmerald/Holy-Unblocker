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
import {
  randomizeGlobal,
  preloaded404,
  tryReadFile,
} from './randomization.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync, unlinkSync } from 'node:fs';
import ecosystem from '../ecosystem.config.js';

const ecosystemConfig = Object.freeze(
  ecosystem.apps.find((app) => app.name === 'HolyUB') || ecosystem.apps[0]
);
const { config, pages, externalPages, getAltPrefix, cacheBustList } =
  pageRoutes;

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
      else if (req.url.endsWith(getAltPrefix('wisp')))
        wisp.routeRequest(req, socket, head);
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
  root: fileURLToPath(new URL('../views/dist/pages', import.meta.url)),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../views/dist/assets', import.meta.url)),
  prefix: getAltPrefix('assets'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../views/archive', import.meta.url)),
  prefix: getAltPrefix('archive'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch', import.meta.url)
  ),
  prefix: getAltPrefix('serving'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch/cores', import.meta.url)
  ),
  prefix: getAltPrefix('cores'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch/info', import.meta.url)
  ),
  prefix: getAltPrefix('info'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch/cores', import.meta.url)
  ),
  prefix: getAltPrefix('uauth'),
  decorateReply: false,
});

// You should NEVER commit roms, due to piracy concerns.
app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch/roms', import.meta.url)
  ),
  prefix: getAltPrefix('roms'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL(
      // Use the pre-compiled, minified scripts instead, if enabled in config.
      config.minifyScripts
        ? '../views/min-dist/assets/js'
        : '../views/dist/assets/js',
      import.meta.url
    )
  ),
  prefix: getAltPrefix('assets/js'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL(
      // Use the pre-compiled, minified stylesheets instead, if enabled in config.
      config.minifyScripts
        ? '../views/min-dist/assets/css'
        : '../views/dist/assets/css',
      import.meta.url
    )
  ),
  prefix: getAltPrefix('assets/css'),
  decorateReply: false,
});

// This combines scripts from the official UV repository with local UV scripts into
// one directory path. Local versions of files override the official versions.
app.register(fastifyStatic, {
  root: [
    fileURLToPath(
      new URL(
        // Use the pre-compiled, minified scripts instead, if enabled in config.
        config.minifyScripts ? '../views/min-dist/uv' : '../views/dist/uv',
        import.meta.url
      )
    ),
    uvPath,
  ],
  prefix: getAltPrefix('uv'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL(
      // Use the pre-compiled, minified scripts instead, if enabled in config.
      config.minifyScripts ? '../views/min-dist/scram' : '../views/dist/scram',
      import.meta.url
    )
  ),
  prefix: getAltPrefix('scram'),
  decorateReply: false,
});

// Register proxy paths to the website.
app.register(fastifyStatic, {
  root: epoxyPath,
  prefix: getAltPrefix('epoxy'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: libcurlPath,
  prefix: getAltPrefix('libcurl'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: bareModulePath,
  prefix: getAltPrefix('bareasmodule'),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: baremuxPath,
  prefix: getAltPrefix('baremux'),
  decorateReply: false,
});

/* If you are trying to add pages or assets in the root folder and
 * NOT entire folders, check ./src/routes.mjs and add it manually.
 *
 * All website files are stored in the /views directory.
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

  // Set the index the as the default page. Serve as an html file by default.
  const fileName = reqPath ? pages[reqPath] : pages.index,
    supportedTypes = {
      default: 'text/html',
      html: 'text/html',
      txt: 'text/plain',
      xml: 'application/xml',
      ico: 'image/vnd.microsoft.icon',
    },
    type =
      supportedTypes[fileName.slice(fileName.lastIndexOf('.') + 1)] ||
      supportedTypes.default;

  reply.type(type);
  if (type === supportedTypes.default)
    reply.send(tryReadFile('../views/dist/' + fileName, import.meta.url));
  else reply.send(tryReadFile('../views/dist/' + fileName, import.meta.url));
});

app.get('/github/:redirect', (req, reply) => {
  if (req.params.redirect in externalPages.github)
    reply.redirect(externalPages.github[req.params.redirect]);
  else reply.code(404).type('text/html').send(preloaded404);
});

app.get(
  getAltPrefix('assets/js') + cacheBustList['common.js'],
  (req, reply) => {
    reply
      .type('text/javascript')
      .send(
        randomizeGlobal(
          '../views' + (config.minifyScripts ? '/min-dist' : '/dist') + req.url
        )
      );
  }
);

app.get(getAltPrefix('uv') + ':file.js', (req, reply) => {
  const destination = existsSync(
    fileURLToPath(new URL('../views/dist' + req.url, import.meta.url))
  )
    ? '../views' + (config.minifyScripts ? '/min-dist' : '/dist') + req.url
    : pathToFileURL(uvPath) + `/${req.params.file}.js`;
  reply
    .type('text/javascript')
    .send(
      randomizeGlobal(destination).replace(
        /(["'`])\{\{ultraviolet-error\}\}\1/g,
        JSON.stringify(
          tryReadFile('../views/dist/' + pages['uverror'], import.meta.url)
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
