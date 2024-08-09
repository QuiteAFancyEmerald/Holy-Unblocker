const assert = require('assert');
const {parseChunked} = require('../parse-chunked');

describe("parseChunked", () => {
  it("errors when you don't give it a buffer", () => {
    assert.throws(() => {
      parseChunked('3\r\nXYZ');
    }, /parseChunked needs to be given a buffer/);
  });

  it("parses [0]", () => {
    const body = parseChunked(new Buffer('0\r\n'));
    assert.strictEqual(body.length, 0);
  });

  it("parses [4, 4, 0x1a]", () => {
    const body = parseChunked(new Buffer([
      '4\r\n', 'Foo\n',
      '4\r\n', 'Bar\n',
      '1a\r\n', 'Chunk with 1a=16+10 bytes\n',
      '0\r\n',
    ].join(''), 'utf8'));
    assert.equal(body.toString('utf8'), 'Foo\nBar\nChunk with 1a=16+10 bytes\n');
  });

  it("errors when it can't find a CRLF", () => {
    assert.throws(() => {
      parseChunked(new Buffer('foo', 'utf8'));
    }, /Invalid chunked encoding: can't find a CRLF/);
  });

  it("errors when the length field is blank for the first chunk", () => {
    assert.throws(() => {
      parseChunked(new Buffer('\r\nFoo'));
    }, /Invalid chunked encoding: got CRLF too soon/);
  });

  it("errors when the length field is blank for the second chunk", () => {
    assert.throws(() => {
      parseChunked(new Buffer('3\r\nABC\r\nFoo'));
    }, /Invalid chunked encoding: got CRLF too soon/);
  });

  it("errors when the length field contains invalad characters", () => {
    assert.throws(() => {
      parseChunked(new Buffer('notHex\r\n'));
    }, /Invalid bytes for chunk length/);
  });
});
