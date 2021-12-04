function createHistoryRewriter(ctx) {
    return function rewriteHistory() {
        if (ctx.serviceWorker) return;
        if (ctx.window.History.prototype.pushState) {
            ctx.window.History.prototype.pushState = new Proxy(ctx.window.History.prototype.pushState, {
                apply: (target, that, args) => {
                    if (args[2]) args[2] = ctx.url.wrap(args[2], ctx.meta);
                    const ret = Reflect.apply(target, that, args);
                    ctx.updateLocation();
                    return ret;
                },
            });
        };
        if (ctx.window.History.prototype.replaceState) {
            ctx.window.History.prototype.replaceState = new Proxy(ctx.window.History.prototype.replaceState, {
                apply: (target, that, args) => {
                    if (args[2]) args[2] = ctx.url.wrap(args[2], ctx.meta);
                    const ret = Reflect.apply(target, that, args);
                    ctx.updateLocation();
                    return ret;
                },
            });
        };
    };
};
module.exports = createHistoryRewriter;