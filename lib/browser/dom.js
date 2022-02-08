const { overrideAccessors, overrideFunction, overrideConstructor } = require("./utils");

function createDomRewriter(ctx) {
    if (ctx.serviceWorker) return () => null;
    if (ctx.window.Node && ctx.window.Node.prototype)  {
        ctx.originalAccessors.nodeBaseURI = Object.getOwnPropertyDescriptor(ctx.window.Node.prototype, 'baseURI');
        ctx.originalAccessors.nodeTextContent = Object.getOwnPropertyDescriptor(ctx.window.Node.prototype, 'textContent');
    };
    if (ctx.window.Element && ctx.window.Element.prototype) {
        ctx.originalAccessors.elementInnerHtml = Object.getOwnPropertyDescriptor(ctx.window.Element.prototype, 'innerHTML');
        ctx.originalAccessors.elementOuterHtml = Object.getOwnPropertyDescriptor(ctx.window.Element.prototype, 'outerHTML');
        ctx.originalFn.elementSetAttribute = ctx.window.Element.prototype.setAttribute;
        ctx.originalFn.elementGetAttribute = ctx.window.Element.prototype.getAttribute;
        ctx.originalFn.elementHasAttribute = ctx.window.Element.prototype.hasAttribute;
    };
    if (ctx.window.Audio) ctx.originalFn.Audio = ctx.window.Audio;
    function rewriteTextContent() {
        if (ctx.originalAccessors.nodeTextContent) {
            overrideAccessors(ctx.window.Node.prototype, 'textContent', {
                setter: (target, that, [ val ]) => {
                    switch(that.tagName) {
                        case 'SCRIPT':
                            val = ctx.processScript(val);
                            break;
                        case 'STYLE':
                            val = ctx.processStyle(val);
                            break;
                    };
                    return target.call(that, val);
                },
            });
        };
    };
    function rewriteUrl() {
        if (ctx.originalAccessors.nodeBaseURI) {
            overrideAccessors(ctx.window.Node.prototype, 'baseURI', {
                getter: (target, that) => {
                    const url = target.call(that);
                    return url.startsWith(ctx.meta.origin) ? ctx.url.unwrap(url, ctx.meta) : url;
                },
            });
        };
    };
    function rewriteHtml() {
        if (ctx.originalAccessors.elementInnerHtml) {
            overrideAccessors(ctx.window.Element.prototype, 'innerHTML', {
                getter: (target, that) => ['STYLE', 'SCRIPT'].includes(that.tagName) ? target.call(that) : ctx.html.source(target.call(that)),
                setter: (target, that, [ val ]) => {
                    switch(that.tagName) {
                        case 'STYLE':
                            val = ctx.processStyle(val);
                            break;
                        case 'SCRIPT':
                            val = ctx.processScript(val);
                            break;
                        default:
                            val = ctx.processHtml(val);
                            break;
                    };
                    return target.call(that, val);
                },
            });
        };
    };
    function rewriteAttribute() {
        if (ctx.originalFn.elementSetAttribute) {
            overrideFunction(ctx.window.Element.prototype, 'setAttribute', (target, that, args) => {
                if (args[0] && args[1]) {
                    let data = {
                        attr: {
                            name: args[0],
                            value: args[1],
                        },
                        node: that,
                        meta: ctx.meta,
                        setAttribute: ctx.originalFn.elementSetAttribute.bind(that),
                        delete: false,
                        ctx,
                    };
                    const tag = ctx.html.attrs.get(that.tagName.toLowerCase()) || ctx.html.attrs.get('*');
                    if (tag[data.attr.name]) tag[data.attr.name](that, data);
                    args[0] = data.attr.name;
                    args[1] = data.attr.value;
                };
                return target.apply(that, args);
            });
        };  
        if (ctx.originalFn.elementGetAttribute) {
            overrideFunction(ctx.window.Element.prototype, 'getAttribute', (target, that, args) => {
                if (args[0] && ctx.originalFn.elementHasAttribute.call(that, `corrosion-attr-${args[0]}`)) args[0] = `corrosion-attr-${args[0]}`;
                return target.apply(that, args);
            });
        };
    };
    function rewriteAudio() {
        if (ctx.originalFn.Audio) {
            overrideConstructor(ctx.window, 'Audio', (target, args) => {
                if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                return new target(...args);
            });
        };
    };
    return function rewriteDom() {
        rewriteUrl();
        rewriteTextContent();
        rewriteHtml();
        rewriteAttribute();
        rewriteAudio();
        return true;
    };
};

module.exports = createDomRewriter;