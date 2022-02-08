const { overrideFunction, overrideAccessors, overrideConstructor, wrapFnString } = require("./utils");

function createFunctionRewriter(ctx) {
    if (ctx.window.Function && ctx.window.Function.prototype) {
        ctx.originalFn.Function = ctx.window.Function;
        ctx.originalFn.FunctionToString = ctx.window.Function.prototype.toString;
        ctx.originalAccessors.FunctionArguments = Object.getOwnPropertyDescriptor(ctx.window.Function.prototype, 'arguments');
    };
    function rewriteFn() {
        if (ctx.originalFn.Function) {
            //const fnProto = ctx.window.Function.prototype;
            /*overrideFunction(ctx.window, 'Function', (target, that, args) => {
                if (args.length) args[args.length - 1] = ctx.js.process(args[args.length - 1], ctx.meta.url);
                return target.apply(that, args);
            });*/
            /*ctx.window.Function = new Proxy(ctx.window.Function, {
                apply: (target, that, args) => {
                    if (args.length) args[args.length - 1] = ctx.processScript(args[args.length - 1]);
                    return target.apply(that, args);
                },
                construct: (target, args) => {
                    if (args.length) args[args.length - 1] = ctx.processScript(args[args.length - 1]);
                    return new target(...args);
                },
                get: (target, prop) => target[prop],
                set: (target, prop, val) => target[prop] = val,
            });*/
            /*
            ctx.window.Function = function(...args) {
                if (args.length) args[args.length - 1] = ctx.processScript(args[args.length - 1]);
                return new ctx.originalFn.Function(...args);
            };
            ctx.window.Function.prototype = ctx.originalFn.Function.prototype;
            ctx.window.Function.prototype.constructor = ctx.window.Function;
            wrapFnString(ctx.originalFn.Function, ctx.window.Function);
            */
           overrideConstructor(ctx.window, 'Function', (target, args) => {
                const old = args[args.length - 1];
                if (args.length) args[args.length - 1] = ctx.processScript(args[args.length - 1]);
                console.log(old, args[args.length - 1]);
                return target.apply(this, args);
           });
        };
        return true;
    };
    function rewriteFnArguments() {
        if (ctx.originalAccessors.FunctionArguments) {
            overrideAccessors(ctx.window.Function.prototype, 'arguments', {
                getter: (target, that) => target.call(ctx.proxyToOriginal(that)),
            });
        };
        return true;
    };
    function rewriteFnString() {
        if (ctx.originalFn.FunctionToString) {
            overrideFunction(ctx.window.Function.prototype, 'toString',  (target, that, args) => {
                if (that.hasOwnProperty('$corrosion_string')) return that.$corrosion_string;
                return target.apply(that, args);
            });
        };
        return true;
    };
    return function rewriteFunction() {
        rewriteFnString();
        rewriteFn();
        //rewriteFnArguments();
    };
};

module.exports = createFunctionRewriter;