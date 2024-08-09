function parseChunked(rawChunkedData) {
  if (!Buffer.isBuffer(rawChunkedData)) {
    throw new Error('parseChunked needs to be given a buffer');
  }

  const bodyDataSlices = [];
  let pos = 0;
  while (true) {
    if (pos >= rawChunkedData.length) {
      break;
    }

    // Find next CRLF
    let i = rawChunkedData.indexOf('\r\n', pos);
    if (i === -1) { throw new Error("Invalid chunked encoding: can't find a CRLF"); }
    if (i <= pos) { throw new Error('Invalid chunked encoding: got CRLF too soon'); }

    const chunkLengthText = rawChunkedData.slice(pos, i).toString('utf8');

    if (!chunkLengthText.match(/^[0-9a-f]+$/)) {
      throw new Error('Invalid bytes for chunk length');
    }
    const chunkLength = parseInt(chunkLengthText, 16);
    if (chunkLength === 0) {
      break;
    }

    const chunkData = rawChunkedData.slice(i + 2, i + 2 + chunkLength);
    bodyDataSlices.push(chunkData);

    pos = i + 2 + chunkLength;
  }
  const parsedData = Buffer.concat(bodyDataSlices);
  return parsedData;
}

module.exports = {parseChunked};
