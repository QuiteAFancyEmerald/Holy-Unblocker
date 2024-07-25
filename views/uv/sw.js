importScripts("uv.bundle.js");
importScripts("uv.config.js");
importScripts(__uv$config.sw || "uv.sw.js");

/*

Workerware does not work yet due to one of the following possibilities:

1. UV or the bare client is not updated to support workerware yet.
2. Workerware is unfinished.
3. We are doofuses and do not know how to use workerware properly.

Going to implement a ghetto domain blacklist for now.

importScripts("./workerware.js");

const ww = new WorkerWare({
  debug: true,
  randomNames: true,
  timing: true
});


ww.use({
  function: event => console.log(event),
  events: ["fetch", "message"]
});

*/


const uv = new UVServiceWorker();

//  Get list of blacklisted domains.
let blacklist;
fetch("/assets/json/blacklist.json").then(request => {
  request.json().then(jsonData => {
    blacklist = new RegExp(jsonData.map(
      domain =>
        encodeURIComponent(domain)
        .replace(/([()])/g, "\\$1")
        .replaceAll("*.", "(?:.+\\.)?")
        .replaceAll(".", "\\.")
    ).join("|"));
  });
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
//    The one and only ghetto domain blacklist.
      if (!new URL(event.request.url).pathname.indexOf("/uv/service/")) {
        const url = new URL(uv.config.decodeUrl(new URL(event.request.url).pathname.replace(/^\/uv\/service\//, "")));
        if (blacklist.test(url.hostname))
          return new Response(new Blob(), {status: 406});
      }

      if (uv.route(event)) {
        return await uv.fetch(event);
      }
      return await fetch(event.request);
    })()
  );
});