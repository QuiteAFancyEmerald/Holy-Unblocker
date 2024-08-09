## parse-raw-http


### Parse a response
```js
const {parseResponse} = require('parse-raw-http');

const data = new Buffer([
  'HTTP/1.1 200 OK\r\n',
  'Content-Type: text/plain; charset=utf-8\r\n',
  'Transfer-Encoding: chunked\r\n',
  '\r\n',
  '4\r\n',  'Foo\n',
  '1a\r\n', 'Chunk with 1a=16+10 bytes\n',
].join(''), 'utf8');

const res = parseResponse(data, {
  decodeContentEncoding: true,
});

// Response object:
res.statusCode      // 200
res.statusMessage   // 'OK'
res.headers         // {'content-type': '...', ...}
res.bodyData        // Buffer: decoded response body
```


### Why do all of the options always need to be specified?

- "Explicit is better than implicit" and "In the face of ambiguity, refuse the temptation to guess"

- I think the aspects involved must not be unknown unknowns for you if you're parsing raw HTTP. You need to know these aspects exist and explicitly decide what you want.


### How comprehensive are the tests?

They're a start. Pull requests welcome.

Before changing the major semver from 0, we'll also be testing on a massive subset of the Common Crawl WARC files, with the results cross-checked with those of running nodejs's HTTP C library on the same input.


### Other HTTP-parsing libraries

- [nodejs/http-parser](https://github.com/nodejs/http-parser)

- [creationix/http-parser-js](https://github.com/creationix/http-parser-js)

- [AlexanderMac/http-request-parser](https://github.com/AlexanderMac/http-request-parser)

- [apiaryio/http-string-parser](https://github.com/apiaryio/http-string-parser)

- [for-GET/api-pegjs](https://github.com/for-GET/api-pegjs)


### License: MIT
