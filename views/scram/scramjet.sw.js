importScripts(
    "/scram/scramjet.wasm.js",
    "/scram/scramjet.shared.js",
    "/scram/scramjet.worker.js"
);
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
    await scramjet.loadConfig();
    if (scramjet.route(event)) {
        return scramjet.fetch(event);
    }

    return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event));
});

let playgroundData;
self.addEventListener("message", ({ data }) => {
    if (data.type === "playgroundData") {
        playgroundData = data;
    }
});