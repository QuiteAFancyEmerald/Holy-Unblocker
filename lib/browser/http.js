const { overrideFunction, overrideConstructor, overrideAccessors } = require("./utils");

function createHttpRewriter(ctx) {
    if (ctx.window.fetch) ctx.originalFn.fetch = ctx.window.fetch;
    if (ctx.window.WebSocket && ctx.window.WebSocket.prototype) ctx.originalFn.WebSocket = ctx.window.WebSocket;
    if (ctx.window.Request && ctx.window.Request.prototype) {
        ctx.originalFn.Request = ctx.window.Request;
        ctx.originalAccessors.RequestUrl = Object.getOwnPropertyDescriptor(ctx.window.Request.prototype, 'url');
    };
    if (ctx.window.Response && ctx.window.Response.prototype) {
        ctx.originalAccessors.ResponseUrl = Object.getOwnPropertyDescriptor(ctx.window.Response.prototype, 'url');
    };
    if (ctx.window.XMLHttpRequest && ctx.window.XMLHttpRequest.prototype) {
        ctx.originalFn.xhrOpen = ctx.window.XMLHttpRequest.prototype.open;
        ctx.originalFn.xhrSend = ctx.window.XMLHttpRequest.prototype.send;
        ctx.originalAccessors.xhrResponseUrl = Object.getOwnPropertyDescriptor(ctx.window.XMLHttpRequest.prototype, 'responseURL');
    };
    if (ctx.window.EventSource && ctx.window.EventSource.prototype) {
        ctx.originalFn.EventSource = ctx.window.EventSource;
        ctx.originalAccessors.EventSourceUrl = Object.getOwnPropertyDescriptor(ctx.window.EventSource.prototype, 'url');
    };
    if (ctx.window.open) ctx.originalFn.open = ctx.window.open;
    function rewriteFetch() {
        if (ctx.originalFn.Request) {
            overrideConstructor(ctx.window, 'Request', (target, args) => {
                if (args[0] instanceof ctx.window.Request) return;
                if (args[0]) args[0] = ctx.url.wrap(args[0], { ...ctx.meta, flags: ['xhr'] });
                return new target(...args);
            });
            overrideAccessors(ctx.window.Request.prototype, 'url', {
                getter: (target, that) => ctx.url.unwrap(target.call(that), ctx.meta),
            });
            ctx.proxyToOriginalMp.set(Object.getOwnPropertyDescriptor(ctx.window.Request.prototype, 'url').get, ctx.originalAccessors.RequestUrl);
            ctx.proxyToOriginalMp.set(ctx.window.Request, ctx.originalFn.Request);
        };
        if (ctx.originalAccessors.ResponseUrl) {
            overrideAccessors(ctx.window.Response.prototype, 'url', {
                getter: (target, that) => ctx.url.unwrap(target.call(that), ctx.meta),
            });
            ctx.proxyToOriginalMp.set(Object.getOwnPropertyDescriptor(ctx.window.Response.prototype, 'url').get, ctx.originalAccessors.ResponseUrl);
        };
        if (ctx.originalFn.fetch) {
            overrideFunction(ctx.window, 'fetch', async (target, that, args) => {
                if (args[0] instanceof ctx.window.Request) return target.apply(that, args);
                if (args[0]) args[0] = ctx.url.wrap(args[0], { ...ctx.meta, flags: ['xhr'], query: new URL(args[0], ctx.location.href).origin != ctx.location.origin ? `origin=${ctx.codec.base64.encode(ctx.location.origin)}` : null });
                return target.apply(that, args);
            });
            ctx.proxyToOriginalMp.set(ctx.window.fetch, ctx.originalFn.fetch);
        };
        return true;
    };
    function rewriteXhr() {
        if (ctx.originalFn.xhrOpen) {
            overrideFunction(ctx.window.XMLHttpRequest.prototype, 'open', (target, that, args) => {
                if (args[1]) { 
                    args[1] = ctx.url.wrap(args[1], { ...ctx.meta, flags: ['xhr'], query: new URL(args[1], ctx.location.href).origin != ctx.location.origin ? `origin=${ctx.codec.base64.encode(ctx.location.origin)}` : null });
                };
                return target.apply(that, args);
            });
            ctx.proxyToOriginalMp.set(ctx.window.XMLHttpRequest.prototype.open, ctx.originalFn.xhrOpen);
        };
        if (ctx.originalAccessors.xhrResponseUrl) {
            overrideAccessors(ctx.window.XMLHttpRequest.prototype, 'responseURL', {
                getter: (target, that) => {
                    const url = target.call(that);
                    return url ? ctx.url.unwrap(url, ctx.meta) : url;
                },
            });
            ctx.proxyToOriginalMp.set(Object.getOwnPropertyDescriptor(ctx.window.XMLHttpRequest.prototype, 'responseURL').get, ctx.originalAccessors.xhrResponseUrl.get);
        };
        return true;
    };
    function rewriteWebSocket() {
        if (ctx.originalFn.WebSocket) {
            overrideConstructor(ctx.window, 'WebSocket', (target, args) => {
                try {
                    let url = new URL(args[0]);
                    args[0] = ['wss:', 'ws:'].includes(url.protocol) ? ctx.url.wrap(url.href.replace('ws', 'http'), ctx.meta).replace('http', 'ws') + '?origin=' + ctx.codec.base64.encode(ctx.location.origin) : '';
                } catch(e) {
                    args[0] = '';
                };  
                return new target(...args);
            }); 
        };
    };
    function rewriteOpen() {
        if (ctx.originalFn.open) {
            overrideFunction(ctx.window, 'open', (target, that, args) => {
                if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                return target.apply(that, args); 
            });
            ctx.proxyToOriginalMp.set(ctx.window.open, ctx.originalFn.open);
        };
        return true;
    };
    function rewriteEventSource() {
        if (ctx.originalFn.EventSource) {
            overrideConstructor(ctx.window, 'EventSource', (target, args) => {
                if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                return new target(...args);
            });
            overrideAccessors(ctx.window.EventSource.prototype, 'url', {
                getter: (target, that) => ctx.url.unwrap(target.call(that), ctx.meta),
            });
        };
        return true;
    };
    return function rewriteHttp() {
        rewriteXhr();
        rewriteFetch();
        rewriteWebSocket();
        rewriteOpen();
        rewriteEventSource();
        return true;
    };
};

module.exports = createHttpRewriter;