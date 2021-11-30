function createWorkerRewriter(ctx = {}) {
    return function rewriteWorker() {
        if (ctx.window.Worker) {
            ctx.window.Worker = new Proxy(ctx.window.Worker, {
                construct: (target, args) => {
                    if (args[0])  {
                        if (args[0].trim().startsWith(`blob:${ctx.window.location.origin}`)) {
                            const xhr = new ctx.originalXhr();
                            xhr.open('GET', args[0], false);
                            xhr.send();
                            const script = ctx.js.process(xhr.responseText, ctx.location.origin + args[0].trim().slice(`blob:${ctx.window.location.origin}`.length));
                            const blob = new Blob([ script ], { type: 'application/javascript' });
                            args[0] = URL.createObjectURL(blob);
                        } else {
                            args[0] = ctx.url.wrap(args[0], ctx.meta);
                        };
                    };
                    return Reflect.construct(target, args);
                },
            }); 
        };  
        if (ctx.serviceWorker && ctx.window.importScripts) {
            ctx.window.importScripts = new Proxy(ctx.window.importScripts, {
                apply: (target, that, args) => {
                    if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                    return Reflect.apply(target, that, args);
                },
            });
        };
    };
};

module.exports = createWorkerRewriter;