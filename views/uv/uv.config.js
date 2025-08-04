// This file overwrites the stock UV config.js

self['{{__uv$config}}'] = {
  prefix: '/{{prefixes/uv}}/service/',
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: '/{{prefixes/uv}}/{{files/uv.handler.js}}',
  client: '/{{prefixes/uv}}/{{files/uv.client.js}}',
  bundle: '/{{prefixes/uv}}/{{files/uv.bundle.js}}',
  config: '/{{prefixes/uv}}/{{files/uv.config.js}}',
  sw: '/{{prefixes/uv}}/{{files/uv.sw.js}}',
};
