const zlib = require('zlib');

function decompress(ctx) {
    if (!ctx.body || !ctx.remoteResponse) return;
    try {
        switch(ctx.headers['content-encoding']) {
            case 'br':
                ctx.body = zlib.brotliDecompressSync(ctx.body);
                break;
            case 'gzip':
                ctx.body = zlib.gunzipSync(ctx.body);
                break;
            case 'deflate':
                ctx.body = zlib.inflateRawSync(ctx.body);
                break;
        };
    } catch(err) {};
    delete ctx.headers['content-encoding'];
    return true;
};

module.exports = decompress;