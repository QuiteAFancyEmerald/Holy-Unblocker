// This file overwrites the stock UV config.js

self['{{__uv$config}}'] = {
  prefix: '/config/service/',
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: '/config/config.handler.js',
  client: '/config/config.client.js',
  bundle: '/config/config.bundle.js',
  config: '/config/config.config.js',
  sw: '/config/config.sw.js',
};
