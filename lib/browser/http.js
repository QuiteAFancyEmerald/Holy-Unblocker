function createHttpRewriter(ctx = {}) {
    return function rewriteHttp() {
        if (ctx.window.Request) { 
            const requestURL = Object.getOwnPropertyDescriptor(ctx.window.Request.prototype, 'url');
            ctx.window.Request = new Proxy(ctx.window.Request, {
                construct(target, args) {
                    if (args[0]) args[0] = ctx.url.wrap(args[0], { ...ctx.meta, flags: ['xhr'], })
                    return Reflect.construct(target, args);
                },
            });
            Object.defineProperty(ctx.window.Request.prototype, 'url', {
                get: new Proxy(requestURL.get, {
                    apply: (target, that, args) => {
                        var url = Reflect.apply(target, that, args);
                        return url ? ctx.url.unwrap(url, ctx.meta) : url;
                    },
                }),
            });
        };
        if (ctx.window.Response) {
            const responseURL = Object.getOwnPropertyDescriptor(ctx.window.Response.prototype, 'url');
            Object.defineProperty(ctx.window.Response.prototype, 'url', {
                get: new Proxy(responseURL.get, {
                    apply: (target, that, args) => {
                        var url = Reflect.apply(target, that, args);
                        return url ? ctx.url.unwrap(url, ctx.meta) : url;
                    },
                }),
            });
        };
        if (ctx.window.open) {
            ctx.window.open = new Proxy(ctx.window.open, {
                apply: (target, that, args) => {
                    if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                    return Reflect.apply(target, that, args)
                },
            });
        };
        if (ctx.window.fetch) { 
            ctx.window.fetch = new Proxy(ctx.window.fetch, {
                apply: (target, that, args) => {
                    if (args[0] instanceof ctx.window.Request) return Reflect.apply(target, that, args);
                    if (args[0]) args[0] = ctx.url.wrap(args[0], { ...ctx.meta, flags: ['xhr'], });
                    return Reflect.apply(target, that, args);
                },
            });
        };
        if (ctx.window.Navigator && ctx.window.Navigator.prototype.sendBeacon) {
            ctx.window.Navigator.prototype.sendBeacon = new Proxy(ctx.window.Navigator.prototype.sendBeacon, {
                apply: (target, that, args) => {
                    if (args[0]) ctx.url.wrap(args[0], { ...ctx.meta, flags: ['xhr'], });
                    return Reflect.apply(target, that, args);
                },
            });
        };
        if (ctx.window.XMLHttpRequest) {
            const responseURL = Object.getOwnPropertyDescriptor(ctx.window.XMLHttpRequest.prototype, 'responseURL');
            ctx.window.XMLHttpRequest.prototype.open = new Proxy(ctx.window.XMLHttpRequest.prototype.open, {
                apply: (target, that, args) => {
                    if (args[1]) args[1] = ctx.url.wrap(args[1], { ...ctx.meta, flags: ['xhr'], });
                    return Reflect.apply(target, that, args);
                },
            });
            Object.defineProperty(ctx.window.XMLHttpRequest.prototype, 'responseURL', {
                get: new Proxy(responseURL.get, {
                    apply: (target, that, args) => {
                        const url = Reflect.apply(target, that, args);
                        return url ? ctx.url.unwrap(url, ctx.meta) : url;
                    },
                }),
            });
        };
        if (ctx.window.postMessage) {
            ctx.window.postMessage = new Proxy(ctx.window.postMessage, {
                apply: (target, that, args) => {
                    if (!ctx.serviceWorker && args[1]) args[1] = ctx.meta.origin;
                    return Reflect.apply(target, that, args);
                },
            });
        };
        if (ctx.window.WebSocket && ctx.config.ws) {
            ctx.window.WebSocket = new Proxy(ctx.window.WebSocket, {
                construct: (target, args) => {
                    if (args[0]) args[0] = ctx.url.wrap(args[0].toString().replace('ws', 'http'), ctx.meta).replace('http', 'ws') + '?origin=' + ctx.location.origin;
                    return Reflect.construct(target, args);
                },
            });
        };
    };
};

module.exports = createHttpRewriter;