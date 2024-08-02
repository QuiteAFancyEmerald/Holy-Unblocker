import Fastify from 'fastify';
import { createServer } from 'node:http';
import wisp from 'wisp-server-node';
import createRammerhead from "rammerhead/src/server/index.js";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { bareModulePath } from "@mercuryworkshop/bare-as-module3";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import pkg from "./routes.mjs";
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { paintSource, tryReadFile } from './randomization.mjs';
import loadTemplates from './templates.mjs';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
const config = JSON.parse(await readFile(new URL("./config.json", import.meta.url))), { pages, text404 } = pkg;
const __dirname = path.resolve();
const port = process.env.PORT || config.port;

const rh = createRammerhead();
const rammerheadScopes = [
  "/rammerhead.js",
  "/hammerhead.js",
  "/transport-worker.js",
  "/task.js",
  "/iframe-task.js",
  "/worker-hammerhead.js",
  "/messaging",
  "/sessionexists",
  "/deletesession",
  "/newsession",
  "/editsession",
  "/needpassword",
  "/syncLocalStorage",
  "/api/shuffleDict",
  "/mainport",
];
const rammerheadSession = /^\/[a-z0-9]{32}/;
const shouldRouteRh = req => {
  const url = new URL(req.url, "http://0.0.0.0");
  return (
    rammerheadScopes.includes(url.pathname) ||
    rammerheadSession.test(url.pathname)
  );
}
const routeRhRequest = (req, res) => {
  rh.emit("request", req, res);
}
const routeRhUpgrade = (req, socket, head) => {
  rh.emit("upgrade", req, socket, head);
}

//create a server factory for RH, and wisp (and bare if you please)
const serverFactory = (handler) => {
    return createServer()
        .on('request', (req, res) => {
            if (shouldRouteRh(req)) {
                routeRhRequest(req, res);
            }
            else {
                handler(req, res);
            }
        })
        .on('upgrade', (req, socket, head) => {
            if (shouldRouteRh(req)) {
                routeRhUpgrade(req, socket, head);
            }
            else if (req.url.endsWith('/wisp/')) {
                wisp.routeRequest(req, socket, head);
            }
        })
}

//set logger to true for logs
const app = Fastify({ logger: false, serverFactory: serverFactory });
app.register(fastifyStatic, {
    root: fileURLToPath(new URL('../views', import.meta.url)),
});
app.register(fastifyStatic, {
    root: uvPath,
    //due to how Fastify works, we have to have the uvPath live on a different prefix then the one in /views/
    prefix: "/uv-static/",
    decorateReply: false
});
app.register(fastifyStatic, {
    root: epoxyPath,
    prefix: "/epoxy/",
    decorateReply: false 
});
app.register(fastifyStatic, {
    root: libcurlPath,
    prefix: "/libcurl/",
    decorateReply: false
});
app.register(fastifyStatic, {
    root: bareModulePath,
    prefix: "/bareasmodule/",
    decorateReply: false 
});
app.register(fastifyStatic, {
    root: baremuxPath,
    prefix: "/baremux/",
    decorateReply: false 
});
app.get("/", function(req, reply) {
    reply.type('html');
    reply.send(paintSource(loadTemplates(tryReadFile(path.join(__dirname, "views", "/?".indexOf(req.url) ? pages[Object.keys(req.query)[0]] || "error.html" : pages.index)))))
});

//host is set as to avoid just being on localhost
app.listen({ port: port, host: '0.0.0.0' });
