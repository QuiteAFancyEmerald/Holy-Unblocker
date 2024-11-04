importScripts('/network/network.bundle.js');
importScripts('/network/network.config.js');
importScripts(self['{{__uv$config}}'].sw || '/network/network.sw.js');

const uv = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      if (uv.route(event)) return await uv.fetch(event);

      return await fetch(event.request);
    })()
  );
});
