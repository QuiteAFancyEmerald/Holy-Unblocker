// This file overwrites the stock UV config.js

self['{{__uv$config}}'] = {
  prefix: '/network/service/',
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: '/network/network.handler.js',
  client: '/network/network.client.js',
  bundle: '/network/network.bundle.js',
  config: '/network/network.config.js',
  sw: '/network/network.sw.js',
};
