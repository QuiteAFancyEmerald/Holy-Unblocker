const { overrideAccessors } = require("./utils");

function createAttributeRewriter(ctx) {
    if (ctx.serviceWorker) return () => null;
    const {
        HTMLMediaElement,
        HTMLScriptElement, 
        HTMLAudioElement, 
        HTMLVideoElement, 
        HTMLInputElement, 
        HTMLEmbedElement, 
        HTMLTrackElement, 
        HTMLAnchorElement, 
        HTMLIFrameElement,
        HTMLAreaElement,
        HTMLLinkElement, 
        HTMLBaseElement,
        HTMLFormElement,
        HTMLImageElement, 
        HTMLSourceElement,
    } = ctx.window;
    function rewriteAttribute(elem, attr, handler) {
        if (Array.isArray(elem)) {
            elem.forEach(elem => rewriteAttribute(elem, attr, handler));
            return true;
        };
        if (!elem.prototype || !elem.prototype.hasOwnProperty(attr)) return;
        const proto = elem.prototype;
        overrideAccessors(proto, attr, {
            getter: (target, that) => {
                const val = target.call(that);
                switch(handler) {
                    case 'url':
                        return ctx.url.unwrap(val, ctx.meta);
                    case 'srcset':
                        return ctx.html.unsrcset(val, ctx.meta);
                    case 'delete':
                        return ctx.originalFn.elementGetAttribute.call(that, `corrosion-attr`) || '';
                    default:
                        return val;
                };
            },
            setter: (target, that, [ val ]) => {
                switch(handler) {
                    case 'url':
                        return target.call(that, ctx.url.wrap(val, ctx.meta));
                    case 'srcset':
                        return target.call(that, ctx.html.srcset(val, ctx.meta));
                    case 'delete':
                        ctx.originalFn.elementSetAttribute.call(that, `corrosion-attr`, val);
                        return val;
                    default:
                        return target.call(that, val);
                };
            },
        });
        return true;
    }; 
    return function rewriteAttributes() {
        rewriteAttribute([ HTMLScriptElement, HTMLMediaElement, HTMLImageElement, HTMLAudioElement, HTMLVideoElement, HTMLInputElement, HTMLEmbedElement, HTMLIFrameElement, HTMLTrackElement, HTMLSourceElement ], 'src', 'url');
        rewriteAttribute(HTMLFormElement, 'action', 'url');
        rewriteAttribute([ HTMLAnchorElement, HTMLAreaElement, HTMLLinkElement, HTMLBaseElement ], 'href', 'url');
        rewriteAttribute([ HTMLImageElement, HTMLSourceElement ], 'srcset', 'srcset');
        rewriteAttribute(HTMLScriptElement, 'integrity', 'delete');
        return true;
    };
};

module.exports = createAttributeRewriter;