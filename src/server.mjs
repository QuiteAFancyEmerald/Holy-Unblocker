import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import createBareServer from '@tomphttp/bare-server-node';
import http from 'http';
import path from 'path';
import express from 'express';
import { readFile } from 'fs/promises';
import pkg from './routes.mjs';
import { paintSource, tryReadFile } from './randomization.mjs';

const bare = createBareServer('/bare/');
const config = JSON.parse(await readFile(new URL('./config.json',
    import.meta.url)));
const { pages, text404 } = pkg;
const __dirname = path.resolve();
const port = process.env.PORT || config.port;
const app = express();
const router = express.Router();
const server = http.createServer();

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        app(req, res);
    }
});

router.get('/', async(req, res) => res.send(paintSource(tryReadFile(path.join(__dirname, 'views', ['/', '/?'].includes(req.url) ? pages.index : pages[Object.keys(req.query)[0]])))));
app.use(router);
app.use(express.static(path.join(__dirname, 'views')));
app.use("/uv/", express.static(uvPath));
app.disable('x-powered-by');
app.use((req, res) => {
    res.status(404).send(paintSource(text404));
});

server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '.');