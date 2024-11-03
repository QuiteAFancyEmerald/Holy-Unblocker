importScripts('/config/config.bundle.js');
importScripts('/config/config.config.js');
importScripts(self['{{__uv$config}}'].sw || '/config/config.sw.js');

const uv = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      if (uv.route(event)) return await uv.fetch(event);

      return await fetch(event.request);
    })()
  );
});
