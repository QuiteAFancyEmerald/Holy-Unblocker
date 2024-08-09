const zlib = require('zlib');
const {parseChunked} = require('./parse-chunked');

function parseResponse(data, opt) {
  if ((typeof opt.decodeContentEncoding) !== 'boolean') {
    throw new Error('Option must be specified: decodeContentEncoding');
  }
  if (!Buffer.isBuffer(data)) {
    throw new Error('Expected a Buffer');
  }

  // Split into (head, body)
  const splitIndex = data.indexOf('\r\n\r\n');
  if (splitIndex === -1) {
    throw new Error('Data does not contain CRLFCRLF');
  }
  const headData = data.slice(0, splitIndex);
  const rawBodyData = data.slice(splitIndex + 4);
  const headText = headData.toString('ascii');
  const headLines = headText.split('\r\n');

  // Assert the head data is ASCII
  // (because `.toString('ascii')` strips the high bit instead of erroring)
  const headData2 = new Buffer(headText, 'ascii');
  if (Buffer.compare(headData, headData2) !== 0) {
    throw new Error('Expected response head to be ASCII');
  }

  // First line
  const firstLine = headLines[0];
  const m = firstLine.match(/^HTTP\/1\.[01] ([0-9]{3}) (.*)$/); // TODO HTTP 2
  if (!m) {
    throw new Error('Invalid status line');
  }
  const statusCode = parseInt(m[1], 10);
  const statusMessage = m[2];

  // Headers
  const headers = {};
  for (const line of headLines.slice(1)) {
    // TODO: support alternate whitespace after first ":"?
    const i = line.indexOf(': ');
    if (i === -1) {
      throw new Error('Header line does not contain ": "');
    }
    const k = line.substr(0, i).toLowerCase();
    const v = line.substr(i + 2);
    headers[k] = v;
  }

  let bodyData;

  const contentLengthText = headers['content-length'];
  if (contentLengthText) {
    if (!contentLengthText.match(/^[1-9][0-9]*$/)) {
      throw new Error('Content-Length does not match /^[1-9][0-9]*$/');
    }
    const contentLength = parseInt(contentLengthText, 10);
    if (contentLength != rawBodyData.length) {
      throw new Error('Content-Length does not match the length of the body data we have');
    }
    bodyData = rawBodyData;
  } else {
    if (headers['transfer-encoding'] != 'chunked') {
      throw new Error("We need Content-Length or 'Transfer-Encoding: chunked'");
    }
    bodyData = parseChunked(rawBodyData);
  }

  if (opt.decodeContentEncoding && headers.hasOwnProperty('content-encoding')) {
    if (headers['content-encoding'] !== 'gzip') {
      throw new Error('Unsupported Content-Encoding');
    }
    bodyData = zlib.gunzipSync(bodyData);
  }

  return {statusCode, statusMessage, headers, bodyData};
}

module.exports = {parseResponse};
