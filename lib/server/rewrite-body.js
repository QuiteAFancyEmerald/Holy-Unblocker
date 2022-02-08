/*const route = [
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
            ctx.body = ctx.rewrite.html.process.bind(ctx.rewrite.html)(ctx.body.toString(), { meta, document: true });
            break;
        case 'css':
            ctx.body = ctx.rewrite.css.process(ctx.body.toString(), { meta });
            break;
        case 'js':
            ctx.body = ctx.rewrite.js.process(ctx.body.toString(), ctx.url);
            break;
    };
};
*/

const map = [
    {
        condition: ctx => {
            if (!ctx.contentType && !ctx.extension) return false;
            if (ctx.contentType && !['application/javascript', 'application/x-javascript', 'text/javascript', 'text/x-javascript'].includes(ctx.contentType)) return false;
            if (ctx.extension != 'js') return false;
            return true;
        },
        run: (ctx) => ctx.rewrite.js.process(ctx.body.toString()),
    },
    {
        condition: ctx => {
            if (!ctx.contentType && !ctx.extension) return false;
            if (ctx.contentType && ctx.contentType != 'text/css') return false;
            if (ctx.extension != 'css') return false;
            return true;
        },
        run: (ctx, meta) => ctx.rewrite.css.process(ctx.body.toString(), { meta, }),
    },
    {
        condition: ctx => {
            if (ctx.contentType && ctx.contentType != 'text/html') return false;
            if (ctx.extension && !['html', 'htm'].includes(ctx.extension)) return false;
            return true;
        },
        run: (ctx, meta) => ctx.rewrite.html.process.bind(ctx.rewrite.html)(ctx.body.toString(), { meta, document: true })
    },
];

function rewriteBody(ctx) {
    if (!ctx.body || !ctx.remoteResponse || ctx.flags.includes('xhr')) return;
    const meta = {
        base: ctx.url,
        origin: ctx.origin,
    };
    ctx.contentType = (ctx.headers['content-type'] || '').split(';')[0];
    ctx.extension = ctx.url.pathname.includes('.') ? ctx.url.pathname.split('.').slice(-1)[0] : '';
    for (const entry of map) {
        if (entry.condition(ctx, meta)) {
            ctx.body = entry.run(ctx, meta);
            break;
        };
    };
};

module.exports = rewriteBody;