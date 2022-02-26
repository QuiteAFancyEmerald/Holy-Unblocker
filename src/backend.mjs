import http from 'http';
import path from 'path';
import express from 'express';
import { readFile } from 'fs/promises';
import pkg from './routes.mjs';
import { paintSource, tryReadFile } from './randomization.mjs';
import { proxy } from './proxy.mjs';

const config = JSON.parse(await readFile(new URL('./config.json',
    import.meta.url)));
const { pages, text404 } = pkg;
const __dirname = path.resolve();
const port = process.env.PORT || config.port;
const app = express();
const router = express.Router();
const server = http.createServer(app);
proxy.bundleScripts();

router.get('/', async(req, res) => res.send(paintSource(tryReadFile(path.normalize(__dirname + '/views/' + (['/', '/?'].includes(req.url) ? pages.index : pages[Object.keys(req.query)[0]]))))));
app.use(router);
app.use(express.static(path.normalize(__dirname + '/views')));
app.disable('x-powered-by');
app.use((req, res) => {
    if (req.url.startsWith(proxy.prefix)) return proxy.request(req, res);
    res.status(404).send(paintSource(text404));
});

server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '.');