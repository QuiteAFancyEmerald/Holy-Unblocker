import { Server } from '../bare/Server.mjs';
import http from 'http';
import path from 'path';
import express from 'express';
import { readFile } from 'fs/promises';
import pkg from './routes.mjs';
import { paintSource, tryReadFile } from './randomization.mjs';

const bare = new Server('/bare/', '');
const config = JSON.parse(await readFile(new URL('./config.json',
    import.meta.url)));
const { pages, text404 } = pkg;
const __dirname = path.resolve();
const port = process.env.PORT || config.port;
const app = express();
const router = express.Router();
const server = http.createServer(app);

router.get('/', async(req, res) => res.send(paintSource(tryReadFile(path.normalize(__dirname + '/views/' + (['/', '/?'].includes(req.url) ? pages.index : pages[Object.keys(req.query)[0]]))))));
app.use(router);
app.use('/', (req, res, next) => {
    if (!bare.route_request(req, res)) return next()
}); 
app.use(express.static(path.normalize(__dirname + '/views')));
app.disable('x-powered-by');
app.use((req, res) => {
    res.status(404).send(paintSource(text404));
});

server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '.');