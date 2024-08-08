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
import { existsSync, unlinkSync } from 'node:fs';
import ecosystem from '../ecosystem.config.js';

const config = Object.freeze(
    JSON.parse(await readFile(new URL("./config.json", import.meta.url)))
  ),
  ecosystemConfig = Object.freeze(
    ecosystem.apps.find(app => app.name === "HolyUB") || apps[0]
  ),
  { pages, text404 } = pkg,
  __dirname = path.resolve();

//  Record the server's location as a URL object, including its host and port.
//  The host can be modified at /src/config.json, whereas the ports can be modified
//  at /ecosystem.config.js.
const serverUrl = (base => {
  try {
    base = new URL(config.host);
  } catch (e) {
    base = new URL("http://a");
    base.host = config.host;
  }
  base.port = ecosystemConfig[ config.production ? "env_production" : "env" ].PORT;
  return Object.freeze(base);
})();
console.log(serverUrl);

//  The server will check for the existence of this file when a shutdown is requested.
//  The shutdown script in run-command.js will temporarily produce this file.
const shutdown = fileURLToPath(new URL("./.shutdown", import.meta.url));

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

const rammerheadSession = /^\/[a-z0-9]{32}/,
  shouldRouteRh = req => {
    const url = new URL(req.url, serverUrl);
    return (
      rammerheadScopes.includes(url.pathname) ||
      rammerheadSession.test(url.pathname)
    );
  },
  routeRhRequest = (req, res) => {
    rh.emit("request", req, res);
  },
  routeRhUpgrade = (req, socket, head) => {
    rh.emit("upgrade", req, socket, head);
  };

//  Create a server factory for RH, and wisp (and bare if you please).
const serverFactory = (handler) => {
  return createServer()
    .on('request', (req, res) => {
      if (shouldRouteRh(req))
        routeRhRequest(req, res);
      else handler(req, res);
    })
    .on('upgrade', (req, socket, head) => {
      if (shouldRouteRh(req))
        routeRhUpgrade(req, socket, head);
      else if (req.url.endsWith('/wisp/'))
        wisp.routeRequest(req, socket, head);
    });
};

//  Set logger to true for logs
const app = Fastify({ logger: false, serverFactory: serverFactory });

//  Apply Helmet middleware for security
app.register(fastifyHelmet, {
  contentSecurityPolicy: false, // Disable CSP
  xPoweredBy: false
});

//  Assign server file paths to different paths, for serving content on the website.
app.register(fastifyStatic, {
  root: fileURLToPath(new URL("../views/pages", import.meta.url)),
  decorateReply: false
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL("../views/assets", import.meta.url)),
  prefix: "/assets/",
  decorateReply: false
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL("../views/archive", import.meta.url)),
  prefix: "/arcade/",
  decorateReply: false
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL(
//  Use the pre-compiled, minified scripts instead, if enabled in config.
    config.minifyScripts ? "../views/dist/assets/js" : "../views/assets/js",
    import.meta.url
  )),
  prefix: "/assets/js/",
  decorateReply: false
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL(
//  Use the pre-compiled, minified stylesheets instead, if enabled in config.
    config.minifyScripts ? "../views/dist/assets/css" : "../views/assets/css",
    import.meta.url
  )),
  prefix: "/assets/css/",
  decorateReply: false
});

//  This combines scripts from the official UV repository with local UV scripts into
//  one directory path. Local versions of files override the official versions.
app.register(fastifyStatic, {
  root: [
    fileURLToPath(new URL(
//    Use the pre-compiled, minified scripts instead, if enabled in config.
      config.minifyScripts ? "../views/dist/uv" : "../views/uv",
      import.meta.url
    )),
    uvPath
  ],
  prefix: "/uv/",
  decorateReply: false
});

//  Register proxy paths to the website.
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
//  Paths like /browsing are converted into paths like /views/pages/surf.html
//  back here. Which path converts to what is defined in routes.mjs.
app.get("/:file", (req, reply) => {

//  If a GET request is sent to /test-shutdown and a script-generated shutdown file
//  is present, gracefully shut the server down.
  if (req.params.file === "test-shutdown" && existsSync(shutdown)) {
      console.log("Holy Unblocker is shutting down.");
      app.close();
      unlinkSync(shutdown);
      process.exitCode = 0;
  }

//  Testing for future features that need cookies to deliver alternate source files.
  if (req.raw.rawHeaders.includes("Cookie"))
    console.log(req.raw.rawHeaders[req.raw.rawHeaders.indexOf("Cookie") + 1]);

  reply.type("text/html").send(
    paintSource(
      loadTemplates(
        tryReadFile(
          path.join(
            __dirname,
            "views",
//          Return the error page if the query is not found in routes.mjs. Also set
//          the index the as the default page.
            req.params.file
              ? pages[req.params.file] || "error.html"
              : pages.index
          )
        )
      )
    )
  );
});

//  Ignore trailing slashes for the above path handling.
app.get("/:file/", (req, reply) => {
  reply.redirect("/" + req.params.file);
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
app.listen({ port: serverUrl.port, host: serverUrl.hostname });
console.log("Holy Unblocker is listening on port " + serverUrl.port + ".");
