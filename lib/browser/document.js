const { overrideAccessors, overrideFunction } = require("./utils");

function createDocumentRewriter(ctx) {
    if (ctx.serviceWorker) return () => false;
    if (ctx.docProto.hasOwnProperty('cookie')) ctx.originalAccessors.DocumentCookie = Object.getOwnPropertyDescriptor(ctx.docProto, 'cookie');
    if (ctx.docProto.hasOwnProperty('domain')) ctx.originalAccessors.DocumentDomain = Object.getOwnPropertyDescriptor(ctx.docProto, 'domain');
    if (ctx.docProto.hasOwnProperty('title')) ctx.originalAccessors.DocumentTitle = Object.getOwnPropertyDescriptor(ctx.docProto, 'title');
    if (ctx.docProto.hasOwnProperty('documentURI')) ctx.originalAccessors.DocumentURI = Object.getOwnPropertyDescriptor(ctx.docProto, 'documentURI');
    if (ctx.docProto.hasOwnProperty('URL')) ctx.originalAccessors.DocumentURL = Object.getOwnPropertyDescriptor(ctx.docProto, 'URL');
    if (ctx.docProto.write) ctx.originalFn.documentWrite = ctx.docProto.write;
    if (ctx.docProto.writeln) ctx.originalFn.documentWriteln = ctx.docProto.writeln;
    function rewriteDomain() {
        let spoof = ctx.location.hostname;
        if (ctx.originalAccessors.DocumentDomain) {
            overrideAccessors(ctx.docProto, 'domain', {
                getter: () => spoof,
                setter: (target, that, [ val ]) => {
                    if (!val.toString().endsWith(ctx.location.hostname.split('.').slice(-2).join('.'))) target.call(that, '');
                    return spoof = val;
                },
            });
        };
        return true;
    };
    function rewriteCookie() {
        if (ctx.originalAccessors.DocumentCookie) {
            overrideAccessors(ctx.docProto, 'cookie', {
                getter: (target, that) => ctx.config.cookie ? ctx.cookies.decode(target.call(that), ctx.meta) : '',
                setter: (target, that, [ val ]) => target.call(that, ctx.config.cookie ? ctx.cookies.encode(val, ctx.meta) : ''),
            });
        };
        return true;
    };
    function rewriteTitle() {
        let spoof = '';
        if (ctx.originalAccessors.DocumentTitle && ctx.config.title) {
            overrideAccessors(ctx.docProto, 'title', {
                getter: () => spoof,
                setter: (target, that, [ val ]) => spoof = val,
            });
        };
        return true;
    };
    function rewriteUrl() {
        if (ctx.originalAccessors.DocumentURL) {
            overrideAccessors(ctx.docProto, 'URL', {
                getter: (target, that) => ctx.url.unwrap(target.call(that), ctx.meta),
            });
        };
        if (ctx.originalAccessors.DocumentURI) {
            overrideAccessors(ctx.docProto, 'documentURI', {
                getter: (target, that) => ctx.url.unwrap(target.call(that), ctx.meta),
            });
        };
        return true; 
    };
    function rewriteWrite() {
        if (ctx.originalFn.documentWrite) {
            overrideFunction(ctx.docProto, 'write', (target, that, args) => {
                if (args.length) args = [ ctx.html.process(args.join(''), { meta: ctx.meta }) ];
                return target.apply(that, args);
            });
        };
        if (ctx.originalFn.documentWriteln) {
            overrideFunction(ctx.docProto, 'writeln', (target, that, args) => {
                if (args.length) args = [ ctx.html.process(args.join(''), { meta: ctx.meta }) ];
                return target.apply(that, args);
            });
        };
    };
    return function rewriteDocument() {
        rewriteCookie();
        rewriteUrl();
        rewriteTitle();
        rewriteDomain();
        rewriteWrite();
        return true;
    };
};

module.exports = createDocumentRewriter;