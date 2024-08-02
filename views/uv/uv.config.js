// This file overwrites the stock UV config.js

self.__uv$config = {
  prefix: "/uv/service/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/uv-static/uv.handler.js",
  client: "/uv-static/uv.client.js",
  bundle: "/uv-static/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv-static/uv.sw.js",
};
