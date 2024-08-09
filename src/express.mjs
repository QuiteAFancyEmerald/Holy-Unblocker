import { paintSource, tryReadFile } from './randomization.mjs';
import loadTemplates from './templates.mjs';
import pkg from './routes.mjs';
import { readFile } from 'fs/promises';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import createRammerhead from 'rammerhead/src/server/index.js';
import wisp from 'wisp-server-node';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { bareModulePath } from '@mercuryworkshop/bare-as-module3';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
// import { createBareServer } from "@tomphttp/bare-server-node";

const config = JSON.parse(
    await readFile(new URL('./config.json', import.meta.url))
  ),
  { pages, text404 } = pkg,
  __dirname = path.resolve(),
  port = process.env.PORT || config.port,
  app = express(),
  router = express.Router(),
  // bare = createBareServer("/bare/"),
  rh = createRammerhead();

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
    const url = new URL(req.url, 'http://0.0.0.0');
    return (
      rammerheadScopes.includes(url.pathname) ||
      rammerheadSession.test(url.pathname)
    );
  },
  routeRhRequest = (req, res) => {
    rh.emit('request', req, res);
  },
  routeRhUpgrade = (req, socket, head) => {
    rh.emit('upgrade', req, socket, head);
  },
  server = http.createServer((req, res) => {
    /*
    if (bare.shouldRoute(req)) {
      bare.routeRequest(req, res);
    } else 
    */
    if (shouldRouteRh(req)) {
      routeRhRequest(req, res);
    } else {
      app(req, res);
    }
  });

server.on('upgrade', (req, socket, head) => {
  /*
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else 
  */
  if (shouldRouteRh(req)) {
    routeRhUpgrade(req, socket, head);
  } else if (req.url.endsWith('/wisp/')) {
    wisp.routeRequest(req, socket, head);
  }
});

// Apply Helmet middleware for security.
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP
  })
);

/* All website files are stored in the /views directory.
 * This takes one of those files and displays it for a site visitor.
 * Query strings like /?j are converted into paths like /views/hidden.html
 * back here. Which query string converts to what is defined in routes.mjs.
 */
router.get('/', async (req, res) =>
  res.send(
    paintSource(
      loadTemplates(
        tryReadFile(
          path.join(
            __dirname,
            'views',
            // Return the error page if the query is not found in
            // routes.mjs. Also set index as the default page.
            '/?'.indexOf(req.url)
              ? pages[Object.keys(req.query)[0]] || 'error.html'
              : pages.index
          )
        )
      )
    )
  )
);

app.use(router);
app.use(express.static(path.join(__dirname, 'views')));
app.use('/uv/', express.static(uvPath));
app.use('/epoxy/', express.static(epoxyPath));
app.use('/libcurl/', express.static(libcurlPath));
app.use('/bareasmodule/', express.static(bareModulePath));
app.use('/baremux/', express.static(baremuxPath));

app.disable('x-powered-by');

// Redundant code since 404 is handled elsewhere; left here as insurance.
app.use((req, res) => {
  res.status(404).send(paintSource(loadTemplates(text404)));
});

server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '.');
