const route = [
    {
        types: ['text/html'],
        handler: 'html',
    },
    {
        types: ['text/css'],
        handler: 'css',
    },
    {
        types: ['application/javascript', 'application/x-javascript', 'text/javascript', 'text/x-javascript'],
        handler: 'js',
    },
]
function rewriteBody(ctx) {
    if (!ctx.body || !ctx.remoteResponse || ctx.flags.includes('xhr')) return;
    const meta = {
        base: ctx.url,
        origin: ctx.origin,
    };
    const data = route.find(entry => ctx.flags == entry.handler) || route.find(entry => entry.types.includes((ctx.headers['content-type'] || '').split(';')[0])) || {};

    switch(data.handler) {
        case 'html':
            ctx.body = ctx.rewrite.html.process(ctx.body.toString(), { ...meta, document: true });
            break;
        case 'css':
            ctx.body = ctx.rewrite.css.process(ctx.body.toString(), meta);
            break;
        case 'js':
            ctx.body = ctx.rewrite.js.process(ctx.body.toString(), ctx.url);
            break;
    };
};

module.exports = rewriteBody;