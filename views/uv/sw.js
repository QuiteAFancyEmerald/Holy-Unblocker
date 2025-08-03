importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts(self['{{__uv$config}}'].sw || '/uv/uv.sw.js');

const uv = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      if (uv.route(event)) return await uv.fetch(event);

      return await fetch(event.request);
    })()
  );
});
