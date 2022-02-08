const { overrideFunction, overrideConstructor } = require("./utils");

function createWorkerRewriter(ctx) {
    if (ctx.window.Worker) ctx.originalFn.Worker = ctx.window.Worker;
    if (ctx.serviceWorker && ctx.window.importScripts) ctx.originalFn.importScripts = ctx.window.importScripts; 
    if (ctx.window.Worklet) ctx.originalFn.WorkletAddModule = ctx.window.Worklet.prototype.addModule;
    function rewriteWorkerConstruct() {
        if (ctx.originalFn.Worker) {
            overrideConstructor(ctx.window, 'Worker', (target, args) => {
                if (args[0])  {
                    if (args[0].trim().startsWith(`blob:${ctx.window.location.origin}`)) {
                        const xhr = new ctx.window.XMLHttpRequest();
                        ctx.proxyToOriginal(ctx.window.XMLHttpRequest.prototype.open).call(xhr, 'GET', args[0], false)
                        xhr.send();
                        const script = ctx.js.process(xhr.responseText, ctx.location.origin + args[0].trim().slice(`blob:${ctx.window.location.origin}`.length));
                        const blob = new Blob([ script ], { type: 'application/javascript' });
                        args[0] = URL.createObjectURL(blob);
                    } else {
                        args[0] = ctx.url.wrap(args[0], ctx.meta);
                    };
                };
                return new target(...args);
            });
            return true;
        };
    };
    function rewriteImportScripts() {
        if (ctx.originalFn.importScripts) {
            overrideFunction(ctx.window, 'importScripts', (target, that, args) => {
                if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                return target.apply(that, args);
            });
        };
        return true;
    };
    function rewriteWorklet() {
        if (ctx.originalFn.WorkletAddModule) {
            overrideFunction(ctx.window.Worklet.prototype, 'addModule', (target, that, args) => {
                console.log(args[0]);
                if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                return target.apply(that, args);
            });
        };
    };
    return function rewriteWorker() {
        rewriteWorkerConstruct();
        rewriteImportScripts();
        rewriteWorklet();
        return true;
    };
};

module.exports = createWorkerRewriter;