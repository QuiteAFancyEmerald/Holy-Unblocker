import Fastify from 'fastify';
import { createServer } from 'node:http';
import wisp from 'wisp-server-node';
import createRammerhead from "../lib/rammerhead/src/server/index.js";
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
const config = Object.freeze(JSON.parse(await readFile(new URL("./config.json", import.meta.url)))), { pages, text404 } = pkg;
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
};
const routeRhRequest = (req, res) => {
  rh.emit("request", req, res);
};
const routeRhUpgrade = (req, socket, head) => {
  rh.emit("upgrade", req, socket, head);
};

//  Create a server factory for RH, and wisp (and bare if you please).
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
};

//  Set logger to true for logs
const app = Fastify({ logger: false, serverFactory: serverFactory });

//  Apply Helmet middleware for security
app.register(fastifyHelmet, {
    contentSecurityPolicy: false, // Disable CSP
    xPoweredBy: false
});

app.register(fastifyStatic, {
    root: fileURLToPath(new URL("../views", import.meta.url))
});

app.register(fastifyStatic, {
    root: fileURLToPath(new URL(
        config.minifyScripts ? "../views/dist/assets/js" : "../views/assets/js",
        import.meta.url
    )),
    prefix: "/assets/js/",
    decorateReply: false
});

app.register(fastifyStatic, {
    root: fileURLToPath(new URL(
        config.minifyScripts ? "../views/dist/assets/css" : "../views/assets/css",
        import.meta.url
    )),
    prefix: "/assets/css/",
    decorateReply: false
});

app.register(fastifyStatic, {
    root: [fileURLToPath(new URL(
        config.minifyScripts ? "../views/dist/uv" : "../views/uv",
        import.meta.url
    )), uvPath],
    prefix: "/uv/",
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


//  All website files are stored in the /views directory.
//  This takes one of those files and displays it for a site visitor.
//  Query strings like /?j are converted into paths like /views/hidden.html
//  back here. Which query string converts to what is defined in routes.mjs.
app.get("/", (req, reply) => {

//    Testing for future features that need cookies to deliver alternate source files.

    if (req.raw.rawHeaders.includes("Cookie"))
        console.log(req.raw.rawHeaders[req.raw.rawHeaders.indexOf("Cookie") + 1]);

    reply.type("text/html").send(
        paintSource(
            loadTemplates(
                tryReadFile(
                    path.join(__dirname,
                        "views",
//                      Return the error page if the query is not found in
//                      routes.mjs. Also set index as the default page.
                        "/?".indexOf(req.url)
                          ? pages[Object.keys(req.query)[0]] || "error.html"
                          : pages.index
                    )
                )
            )
        )
    );
});


/*
Testing for future restructuring of this config file.

app.get("/assets/js/uv/uv.config.js", (req, reply) => {
    console.log(req.url);
    reply.type("text/javascript");
    reply.send(tryReadFile(path.join(__dirname, "views/assets/js/uv/uv.config.js")));
});
*/

//  Set an error page for invalid paths outside the query string system.
app.setNotFoundHandler((req, reply) => {
    reply.code(404).type("text/html").send(paintSource(loadTemplates(tryReadFile(path.join(__dirname, "views/error.html")))));
});

//  Configure host to your liking, but remember to tweak the Rammerhead IP
//  as well above for any changes.
app.listen({ port: port /*, host: '0.0.0.0' */});
console.log("Holy Unblocker is listening on port " + port + ".");
