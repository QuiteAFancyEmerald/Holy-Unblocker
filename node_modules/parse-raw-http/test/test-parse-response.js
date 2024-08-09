const assert = require('assert');
const zlib = require('zlib');
const {parseResponse} = require('../parse-response');

const OPT = {
  decodeContentEncoding: false,
};

describe("parseResponse", () => {

  it("errors when decodeContentEncoding is omitted", () => {
    assert.throws(() => {
      parseResponse('foo', {});
    }, /Option must be specified: decodeContentEncoding/);
  });

  it("errors when passed a string", () => {
    assert.throws(() => {
      parseResponse('foo', OPT);
    }, /Expected a Buffer/);
  });

  it("errors when there is no CRLFCRLF", () => {
    assert.throws(() => {
      parseResponse(new Buffer('foo'), OPT);
    }, /Data does not contain CRLFCRLF/);
  });

  it("errors when the head includes a non-ASCII Windows-1252 byte", () => {
    assert.throws(() => {
      parseResponse(Buffer.concat([
        new Buffer('HTTP/1.0 200 OK\r\nServer: '),
        new Buffer([0xF1]), // 'LATIN SMALL LETTER N WITH TILDE' (U+00F1)
        new Buffer('ginx\r\n\r\n'),
      ]), OPT);
    }, /Expected response head to be ASCII/);
  });

  it("errors when the head includes non-ASCII UTF-8 bytes", () => {
    assert.throws(() => {
      parseResponse(Buffer.concat([
        new Buffer('HTTP/1.0 200 OK\r\nServer: some '),
        new Buffer([0xE2, 0x90, 0x8D]), // 'SYMBOL FOR CARRIAGE RETURN' (U+240D)
        new Buffer('appy server\r\n\r\n'),
      ]), OPT);
    }, /Expected response head to be ASCII/);
  });

  it("errors when there is no valid status line", () => {
    assert.throws(() => {
      parseResponse(new Buffer('foo\r\n\r\n'), OPT);
    }, /Invalid status line/);
  });

  it("errors when a header line does not contain ': '", () => {
    assert.throws(() => {
      parseResponse(new Buffer('HTTP/1.0 200 OK\r\nFoo bar\r\n\r\n'), OPT);
    }, /Header line does not contain ": "/);
  });

  it("parses {statusCode, statusMessage} from 'HTTP/1.1 200 OK'", () => {
    const raw = new Buffer([
      'HTTP/1.1 200 OK\r\n',
      'Content-Length: 3\r\n',
      '\r\n',
      'Foo',
    ].join(''), 'utf-8');
    const {statusCode, statusMessage} = parseResponse(raw, OPT);
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(statusMessage, 'OK');
  });

  it("parses {statusCode, statusMessage} from 'HTTP/1.1 404 Not Found'", () => {
    const raw = new Buffer([
      'HTTP/1.1 404 Not Found\r\n',
      'Content-Length: 3\r\n',
      '\r\n',
      'Foo',
    ].join(''), 'utf-8');
    const {statusCode, statusMessage} = parseResponse(raw, OPT);
    assert.strictEqual(statusCode, 404);
    assert.strictEqual(statusMessage, 'Not Found');
  });

  it("parses headers", () => {
    const raw = new Buffer([
      'HTTP/1.1 200 OK\r\n',
      'Content-Length: 3\r\n',
      'Content-Type: text/html; charset=utf-8\r\n',
      '\r\n',
      'Foo',
    ].join(''), 'utf-8');
    const {headers} = parseResponse(raw, OPT);
    assert.deepEqual(headers, {
      'content-length': '3',
      'content-type': 'text/html; charset=utf-8',
    });
  });

  it("includes the most recent value for any repeated header", () => {
    const raw = new Buffer([
      'HTTP/1.1 200 OK\r\n',
      'Foo: bar1\r\n',
      'Content-Length: 3\r\n',
      'Foo: bar2\r\n',
      '\r\n',
      'Foo',
    ].join(''), 'utf-8');
    const {headers} = parseResponse(raw, OPT);
    assert.strictEqual(headers['foo'], 'bar2');
  });

  it("errors when content-length does not match /^[1-9][0-9]*$/", () => {
    assert.throws(() => {
      const raw = new Buffer([
        'HTTP/1.1 200 OK\r\n',
        'Content-Length: 4\r\n',
        '\r\n',
        'Foo',
      ].join(''), 'utf-8');
      parseResponse(raw, OPT);
    }, /Content-Length does not match/);
  });

  it("errors when content-length is specified but is too large", () => {
    assert.throws(() => {
      const raw = new Buffer([
        'HTTP/1.1 200 OK\r\n',
        'Content-Length: 4\r\n',
        '\r\n',
        'Foo',
      ].join(''), 'utf-8');
      parseResponse(raw, OPT);
    }, /Content-Length does not match the length of the body data we have/);
  });

  it("errors when content-length is specified but is too small", () => {
    assert.throws(() => {
      const raw = new Buffer([
        'HTTP/1.1 200 OK\r\n',
        'Content-Length: 2\r\n',
        '\r\n',
        'Foo',
      ].join(''), 'utf-8');
      parseResponse(raw, OPT);
    }, /Content-Length does not match the length of the body data we have/);
  });

  it("parses {bodyData}", () => {
    const raw = new Buffer([
      'HTTP/1.1 200 OK\r\n',
      'Content-Length: 3\r\n',
      '\r\n',
      'Foo',
    ].join(''), 'utf-8');
    const {bodyData} = parseResponse(raw, OPT);
    assert.strictEqual(bodyData.toString('utf-8'), 'Foo');
  });

  it("errors when neither Content-Length nor 'Transfer-Encoding: chunked' is present", () => {
    assert.throws(() => {
      const raw = new Buffer([
        'HTTP/1.1 200 OK\r\n',
        'Foo: bar\r\n',
        '\r\n',
        'Foo',
      ].join(''), 'utf-8');
      parseResponse(raw, OPT);
    }, /We need Content-Length or 'Transfer-Encoding: chunked'/);
    assert.throws(() => {
      const raw = new Buffer([
        'HTTP/1.1 200 OK\r\n',
        'Transfer-Encoding: something else\r\n',
        '\r\n',
        'Foo',
      ].join(''), 'utf-8');
      parseResponse(raw, OPT);
    }, /We need Content-Length or 'Transfer-Encoding: chunked'/);
  });

  it("parses chunked responses", () => {
    const raw = new Buffer([
      'HTTP/1.1 200 OK\r\n',
      'Transfer-Encoding: chunked\r\n',
      '\r\n',
      '4\r\n', 'Foo\n',
      '4\r\n', 'Bar\n',
      '1a\r\n', 'Chunk with 1a=16+10 bytes\n',
      '0\r\n',
    ].join(''), 'utf-8');
    const {bodyData} = parseResponse(raw, OPT);
    assert.strictEqual(bodyData.length, 4 + 4 + 26);
    assert.strictEqual(bodyData.toString('utf8'), 'Foo\nBar\nChunk with 1a=16+10 bytes\n');
  });

  it("errors when asked to decode an unsupported content encoding", () => {
    assert.throws(() => {
      const raw = new Buffer([
        'HTTP/1.1 200 OK\r\n',
        'Transfer-Encoding: chunked\r\n',
        'Content-Encoding: asdf\r\n',
        '\r\n',
        '4\r\n', 'Foo\n',
        '0\r\n',
      ].join(''), 'utf-8');
      const {bodyData} = parseResponse(raw, {
        decodeContentEncoding: true
      });
    }, /Unsupported Content-Encoding/);
  });

  it("un-gzips the body if 'Content-Encoding: gzip' and decodeContentEncoding", () => {
    const data = new Buffer('Foo', 'utf-8');
    const gz = zlib.gzipSync(data);
    const headData = new Buffer([
      'HTTP/1.1 200 OK\r\n',
      'Content-Length: ' + gz.length + '\r\n',
      'Content-Encoding: gzip\r\n',
      '\r\n',
    ].join(''), 'utf-8');
    const {bodyData} = parseResponse(Buffer.concat([headData, gz]), {
      decodeContentEncoding: true
    });
    assert.strictEqual(bodyData.toString('hex'), data.toString('hex'));
  });
});
