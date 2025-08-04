importScripts('/{{prefixes/uv}}/{{files/uv.bundle.js}}');
importScripts('/{{prefixes/uv}}/{{files/uv.config.js}}');
importScripts(self['{{__uv$config}}'].sw || '/{{prefixes/uv}}/{{files/uv.sw.js}}');

const uv = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      if (uv.route(event)) return await uv.fetch(event);

      return await fetch(event.request);
    })()
  );
});
