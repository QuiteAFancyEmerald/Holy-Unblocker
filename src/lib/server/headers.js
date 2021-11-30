function requestHeaders(ctx) {
    if (ctx.headers.cookie && ctx.rewrite.config.cookie) ctx.headers.cookie = ctx.rewrite.cookies.decode(ctx.headers.cookie, { url: ctx.url, });
    else delete ctx.headers.cookie;
    if (ctx.headers.origin) {
        if (ctx.clientSocket) {
            const params = new URLSearchParams((ctx.clientRequest.url.split('?')[1] || ''));
            delete ctx.headers.origin;
            delete ctx.headers.host;
            ctx.headers.Origin = params.get('origin') || ctx.url.origin;
            ctx.headers.Host = ctx.url.host;
            // Some websocket servers oddly only accept Host and Origin headers if the first character of the header is uppercase.
        } else {
            ctx.headers.origin = ctx.url.origin;
        };
    };
    
    if (ctx.headers.referer) {
        try {
            ctx.headers.referer = new URL(ctx.rewrite.url.unwrap(ctx.headers.referer, { origin: ctx.origin, })).href;
        } catch(err) {
            ctx.headers.referer = ctx.url.href;
        };
    };
    for (let header in ctx.headers) {
        if (header.startsWith('cf-') || header.startsWith('x-forwarded') ||  header == 'cdn-loop') delete ctx.headers[header];
    };
    ctx.headers.host = ctx.url.host;
    return true;
};

function responseHeaders(ctx) {
    if (ctx.headers.location) ctx.headers.location = ctx.rewrite.url.wrap(ctx.headers.location, { base: ctx.url, origin: ctx.origin, });
    if (ctx.headers['set-cookie']) ctx.headers['set-cookie'] = ctx.rewrite.cookies.encode(ctx.headers['set-cookie'], { domain: ctx.clientRequest.headers.host, url: ctx.url, });
    [
        'content-length',
        'content-security-policy',
        'content-security-policy-report-only',
        'strict-transport-security',
        'x-frame-options'
    ].forEach(name => delete ctx.headers[name]);
    return true;
};

exports.requestHeaders = requestHeaders;
exports.responseHeaders = responseHeaders;