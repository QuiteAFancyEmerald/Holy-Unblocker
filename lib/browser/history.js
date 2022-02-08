const { overrideFunction } = require("./utils");

function createHistoryRewriter(ctx) {
    if (ctx.serviceWorker) return () => null;
    if (ctx.window.History && ctx.window.History.prototype) {
        ctx.originalFn.historyPushstate = ctx.window.History.prototype.pushState;
        ctx.originalFn.historyReplacestate = ctx.window.History.prototype.replaceState;
    };
    function rewritePushReplaceState() {
        const handler = (target, that, args) => {
            if (args[2]) {
                /*if (new URL(args[2], ctx.meta.base).origin != ctx.location.origin) {
                    args[2] = '';
                } else {*/
                    args[2] = ctx.url.wrap(args[2], ctx.meta);
                //};
            };
            return target.apply(that, args);
        }
        if (ctx.originalFn.historyPushstate) overrideFunction(ctx.window.History.prototype, 'pushState', handler);
        if (ctx.originalFn.historyReplacestate) overrideFunction(ctx.window.History.prototype, 'replaceState', handler);
        return true;
    };
    return function rewriteHistory() {
        rewritePushReplaceState();
        return true;
    };
};

module.exports = createHistoryRewriter;