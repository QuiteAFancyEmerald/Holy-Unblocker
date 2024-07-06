import wisp from "wisp-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import http from 'http';
import path from 'path';
import express from 'express';
import { readFile } from 'fs/promises';
import pkg from './routes.mjs';
import { paintSource, tryReadFile } from './randomization.mjs';


const config = JSON.parse(await readFile(new URL('./config.json', import.meta.url)));
const { pages, text404 } = pkg;
const __dirname = path.resolve();
const port = process.env.PORT || config.port;
const app = express();
const router = express.Router();
const server = http.createServer();


router.get('/', async (req, res) => res.send(paintSource(tryReadFile(path.join(__dirname, 'views', ['/', '/?'].includes(req.url) ? pages.index : pages[Object.keys(req.query)[0]])))));
app.use(router);
app.use(express.static(path.join(__dirname, 'views')));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));
app.disable('x-powered-by');

app.use((req, res) => {
    res.status(404).send(paintSource(text404));
});

server.on("request", (req, res) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    app(req, res);
});
server.on("upgrade", (req, socket, head) => {
    if (req.url.endsWith("/wisp/"))
        wisp.routeRequest(req, socket, head);
    else
        socket.end();
});

server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '.');