//Built from: https://github.com/motortruck1221/bare-as-module3 (commit: 36759f801e0009027878edecff156408b06404c6)
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.BareMod = {})));
})(this, function (exports) {
  'use strict';

  // The user likely has overwritten all networking functions after importing bare-client
  // It is our responsibility to make sure components of Bare-Client are using native networking functions
  // These exports are provided to plugins by @rollup/plugin-inject
  const fetch = globalThis.fetch;
  const WebSocket = globalThis.WebSocket;
  const WebSocketFields = {
    prototype: {
      send: WebSocket.prototype.send,
    },
    CLOSED: WebSocket.CLOSED,
    CLOSING: WebSocket.CLOSING,
    CONNECTING: WebSocket.CONNECTING,
    OPEN: WebSocket.OPEN,
  };

  class BareError extends Error {
    status;
    body;
    constructor(status, body) {
      super(body.message || body.code);
      this.status = status;
      this.body = body;
    }
  }
  class Client {
    base;
    /**
     *
     * @param version Version provided by extension
     * @param server Bare Server URL provided by BareClient
     */
    constructor(version, server) {
      this.base = new URL(`./v${version}/`, server);
    }
  }

  /*
   * JavaScript MD5
   * Adopted from https://github.com/blueimp/JavaScript-MD5
   *
   * Copyright 2011, Sebastian Tschan
   * https://blueimp.net
   *
   * Licensed under the MIT license:
   * https://opensource.org/licenses/MIT
   *
   * Based on
   * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
   * Digest Algorithm, as defined in RFC 1321.
   * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
   * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
   * Distributed under the BSD License
   * See http://pajhome.org.uk/crypt/md5 for more info.
   */
  /**
   * Add integers, wrapping at 2^32.
   * This uses 16-bit operations internally to work around bugs in interpreters.
   *
   * @param x First integer
   * @param y Second integer
   * @returns Sum
   */
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  /**
   * Bitwise rotate a 32-bit number to the left.
   *
   * @param num 32-bit number
   * @param cnt Rotation count
   * @returns  Rotated number
   */
  function bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param q q
   * @param a a
   * @param b b
   * @param x x
   * @param s s
   * @param t t
   * @returns Result
   */
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param a a
   * @param b b
   * @param c c
   * @param d d
   * @param x x
   * @param s s
   * @param t t
   * @returns Result
   */
  function md5ff(a, b, c, d, x, s, t) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param a a
   * @param b b
   * @param c c
   * @param d d
   * @param x x
   * @param s s
   * @param t t
   * @returns Result
   */
  function md5gg(a, b, c, d, x, s, t) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param a a
   * @param b b
   * @param c c
   * @param d d
   * @param x x
   * @param s s
   * @param t t
   * @returns Result
   */
  function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param a a
   * @param b b
   * @param c c
   * @param d d
   * @param x x
   * @param s s
   * @param t t
   * @returns Result
   */
  function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  /**
   * Calculate the MD5 of an array of little-endian words, and a bit length.
   *
   * @param x Array of little-endian words
   * @param len Bit length
   * @returns MD5 Array
   */
  function binlMD5(x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a;
      const oldb = b;
      const oldc = c;
      const oldd = d;
      a = md5ff(a, b, c, d, x[i], 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = md5ii(a, b, c, d, x[i], 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }
  /**
   * Convert an array of little-endian words to a string
   *
   * @param input MD5 Array
   * @returns MD5 string
   */
  function binl2rstr(input) {
    let output = '';
    const length32 = input.length * 32;
    for (let i = 0; i < length32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
    }
    return output;
  }
  /**
   * Convert a raw string to an array of little-endian words
   * Characters >255 have their high-byte silently ignored.
   *
   * @param input Raw input string
   * @returns Array of little-endian words
   */
  function rstr2binl(input) {
    const output = [];
    const outputLen = input.length >> 2;
    for (let i = 0; i < outputLen; i += 1) {
      output[i] = 0;
    }
    const length8 = input.length * 8;
    for (let i = 0; i < length8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
    }
    return output;
  }
  /**
   * Calculate the MD5 of a raw string
   *
   * @param s Input string
   * @returns Raw MD5 string
   */
  function rstrMD5(s) {
    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
  }
  /**
   * Calculates the HMAC-MD5 of a key and some data (raw strings)
   *
   * @param key HMAC key
   * @param data Raw input string
   * @returns Raw MD5 string
   */
  function rstrHMACMD5(key, data) {
    let bkey = rstr2binl(key);
    const ipad = [];
    const opad = [];
    if (bkey.length > 16) {
      bkey = binlMD5(bkey, key.length * 8);
    }
    for (let i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5c5c5c5c;
    }
    const hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
    return binl2rstr(binlMD5(opad.concat(hash), 512 + 128));
  }
  /**
   * Convert a raw string to a hex string
   *
   * @param input Raw input string
   * @returns Hex encoded string
   */
  function rstr2hex(input) {
    const hexTab = '0123456789abcdef';
    let output = '';
    for (let i = 0; i < input.length; i += 1) {
      const x = input.charCodeAt(i);
      output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
    }
    return output;
  }
  /**
   * Encode a string as UTF-8
   *
   * @param input Input string
   * @returns UTF8 string
   */
  function str2rstrUTF8(input) {
    return unescape(encodeURIComponent(input));
  }
  /**
   * Encodes input string as raw MD5 string
   *
   * @param s Input string
   * @returns Raw MD5 string
   */
  function rawMD5(s) {
    return rstrMD5(str2rstrUTF8(s));
  }
  /**
   * Encodes input string as Hex encoded string
   *
   * @param s Input string
   * @returns Hex encoded string
   */
  function hexMD5(s) {
    return rstr2hex(rawMD5(s));
  }
  /**
   * Calculates the raw HMAC-MD5 for the given key and data
   *
   * @param k HMAC key
   * @param d Input string
   * @returns Raw MD5 string
   */
  function rawHMACMD5(k, d) {
    return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
  }
  /**
   * Calculates the Hex encoded HMAC-MD5 for the given key and data
   *
   * @param k HMAC key
   * @param d Input string
   * @returns Raw MD5 string
   */
  function hexHMACMD5(k, d) {
    return rstr2hex(rawHMACMD5(k, d));
  }
  /**
   * Calculates MD5 value for a given string.
   * If a key is provided, calculates the HMAC-MD5 value.
   * Returns a Hex encoded string unless the raw argument is given.
   *
   * @param string Input string
   * @param key HMAC key
   * @param raw Raw output switch
   * @returns MD5 output
   */
  function md5(string, key, raw) {
    if (!key) {
      if (!raw) {
        return hexMD5(string);
      }
      return rawMD5(string);
    }
    if (!raw) {
      return hexHMACMD5(key, string);
    }
    return rawHMACMD5(key, string);
  }

  const MAX_HEADER_VALUE = 3072;
  /**
   *
   * Splits headers according to spec
   * @param headers
   * @returns Split headers
   */
  function splitHeaders(headers) {
    const output = new Headers(headers);
    if (headers.has('x-bare-headers')) {
      const value = headers.get('x-bare-headers');
      if (value.length > MAX_HEADER_VALUE) {
        output.delete('x-bare-headers');
        let split = 0;
        for (let i = 0; i < value.length; i += MAX_HEADER_VALUE) {
          const part = value.slice(i, i + MAX_HEADER_VALUE);
          const id = split++;
          output.set(`x-bare-headers-${id}`, `;${part}`);
        }
      }
    }
    return output;
  }
  /**
   * Joins headers according to spec
   * @param headers
   * @returns Joined headers
   */
  function joinHeaders(headers) {
    const output = new Headers(headers);
    const prefix = 'x-bare-headers';
    if (headers.has(`${prefix}-0`)) {
      const join = [];
      for (const [header, value] of headers) {
        if (!header.startsWith(prefix)) {
          continue;
        }
        if (!value.startsWith(';')) {
          throw new BareError(400, {
            code: 'INVALID_BARE_HEADER',
            id: `request.headers.${header}`,
            message: `Value didn't begin with semi-colon.`,
          });
        }
        const id = parseInt(header.slice(prefix.length + 1));
        join[id] = value.slice(1);
        output.delete(header);
      }
      output.set(prefix, join.join(''));
    }
    return output;
  }

  class ClientV3 extends Client {
    ws;
    http;
    meta() {
      return {};
    }
    constructor(server) {
      super(3, server);
      this.ws = new URL(this.base);
      this.http = new URL(this.base);
      if (this.ws.protocol === 'https:') {
        this.ws.protocol = 'wss:';
      } else {
        this.ws.protocol = 'ws:';
      }
    }
    ready = true;
    async init() {
      this.ready = true;
    }
    connect(
      url,
      origin,
      protocols,
      requestHeaders,
      onopen,
      onmessage,
      onclose,
      onerror
    ) {
      const ws = new WebSocket(this.ws);
      const cleanup = () => {
        ws.removeEventListener('close', closeListener);
        ws.removeEventListener('message', messageListener);
      };
      const closeListener = () => {
        cleanup();
      };
      const messageListener = (event) => {
        cleanup();
        // ws.binaryType is irrelevant when sending text
        if (typeof event.data !== 'string')
          throw new TypeError(
            'the first websocket message was not a text frame'
          );
        const message = JSON.parse(event.data);
        // finally
        if (message.type !== 'open')
          throw new TypeError('message was not of open type');
        // onMeta({
        // 	protocol: message.protocol,
        // 	setCookies: message.setCookies,
        // });
        onopen(message.protocol);
        // TODO
        ws.addEventListener('message', (ev) => {
          onmessage(ev.data);
        });
      };
      ws.addEventListener('close', closeListener);
      ws.addEventListener('message', messageListener);
      // CONNECTED TO THE BARE SERVER, NOT THE REMOTE
      ws.addEventListener(
        'open',
        (event) => {
          // getRequestHeaders().then((headers:any) =>
          WebSocketFields.prototype.send.call(
            ws,
            JSON.stringify({
              type: 'connect',
              remote: url.toString(),
              protocols,
              headers: requestHeaders,
              forwardHeaders: [],
            })
          );
          // );
        },
        // only block the open event once
        { once: true }
      );
      return ws.send.bind(ws);
    }
    async request(remote, method, body, headers, signal) {
      const options = {
        credentials: 'omit',
        method: method,
        signal,
      };
      if (body !== undefined) {
        options.body = body;
      }
      options.headers = this.createBareHeaders(remote, headers);
      const response = await fetch(
        this.http + '?cache=' + md5(remote.toString()),
        options
      );
      const readResponse = await this.readBareResponse(response);
      // const result: Response & Partial<BareResponse> = new Response(
      // 	statusEmpty.includes(readResponse.status!) ? undefined : response.body,
      // 	{
      // 		status: readResponse.status,
      // 		statusText: readResponse.statusText ?? undefined,
      // 		headers: new Headers(readResponse.headers as HeadersInit),
      // 	}
      // );
      //
      // result.rawHeaders = readResponse.headers;
      // result.rawResponse = response;
      return {
        body: response.body,
        headers: readResponse.headers,
        status: readResponse.status,
        statusText: readResponse.statusText,
      };
    }
    async readBareResponse(response) {
      if (!response.ok) {
        throw new BareError(response.status, await response.json());
      }
      const responseHeaders = joinHeaders(response.headers);
      const result = {};
      const xBareStatus = responseHeaders.get('x-bare-status');
      if (xBareStatus !== null) result.status = parseInt(xBareStatus);
      const xBareStatusText = responseHeaders.get('x-bare-status-text');
      if (xBareStatusText !== null) result.statusText = xBareStatusText;
      const xBareHeaders = responseHeaders.get('x-bare-headers');
      if (xBareHeaders !== null) result.headers = JSON.parse(xBareHeaders);
      return result;
    }
    createBareHeaders(
      remote,
      bareHeaders,
      forwardHeaders = [],
      passHeaders = [],
      passStatus = []
    ) {
      const headers = new Headers();
      headers.set('x-bare-url', remote.toString());
      headers.set('x-bare-headers', JSON.stringify(bareHeaders));
      for (const header of forwardHeaders) {
        headers.append('x-bare-forward-headers', header);
      }
      for (const header of passHeaders) {
        headers.append('x-bare-pass-headers', header);
      }
      for (const status of passStatus) {
        headers.append('x-bare-pass-status', status.toString());
      }
      splitHeaders(headers);
      return headers;
    }
  }

  exports.BareClient = ClientV3;
});
//# sourceMappingURL=bare.cjs.map
