import { paintSource, tryReadFile } from './randomization.mjs';
import pkg from './routes.mjs';
import { readFile } from 'fs/promises';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import createRammerhead from 'rammerhead/src/server/index.js';
import { createBareServer } from '@tomphttp/bare-server-node';
import wisp from "wisp-server-node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

const config = JSON.parse(await readFile(new URL('./config.json', import.meta.url)));
const { pages, text404 } = pkg;
const __dirname = path.resolve();
const port = process.env.PORT || config.port;
const app = express();
const router = express.Router();
const bare = createBareServer('/bare/');
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
    '/mainport'
];

const rammerheadSession = /^\/[a-z0-9]{32}/;

function shouldRouteRh(req) {
    const url = new URL(req.url, 'http://0.0.0.0');
    return (
        rammerheadScopes.includes(url.pathname) ||
        rammerheadSession.test(url.pathname)
    );
}

function routeRhRequest(req, res) {
    rh.emit('request', req, res);
}

function routeRhUpgrade(req, socket, head) {
    rh.emit('upgrade', req, socket, head);
}

const server = http.createServer((req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
    } else if (shouldRouteRh(req)) {
        routeRhRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else if (shouldRouteRh(req)) {
        routeRhUpgrade(req, socket, head);
    } else if (req.url.endsWith('/wisp/')) {
        wisp.routeRequest(req, socket, head);
    }
});

// Apply Helmet middleware for security
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        scriptSrc: ["'self'", 'https:', "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', '*.amazonaws.com'],
        fontSrc: ["'self'", 'https:', 'data:'],
        mediaSrc: ["'self'", 'https:', 'data:'],
        connectSrc: ["'self'", 'https:'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
}));

//  All website files are stored in the /views directory.
//  This takes one of those files and displays it for a site visitor.
//  Query strings like /?j are converted into paths like /views/hidden.html
//  back here. Which query string converts to what is defined in routes.mjs.
router.get('/', async (req, res) => res.send(paintSource(tryReadFile(
    path.join(__dirname,
    'views',
//  This returns the file path, and has the index page set as the home page.
    '/?'.indexOf(req.url) ? pages[Object.keys(req.query)[0]] : pages.index
    )
))));


app.use(router);
app.use(express.static(path.join(__dirname, 'views')));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

app.disable('x-powered-by');

app.use((req, res) => {
    res.status(404).send(paintSource(text404));
});


server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '.');