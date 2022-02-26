importScripts('./uv.bundle.js');
importScripts('./uv.handler.js');

__uv.client.location.overrideWorkerLocation(() => new URL('https://www.google.com'));

console.log(postMessage.__uv$string);