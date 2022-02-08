const { overrideAccessors } = require("./utils");

function createIframeRewriter(ctx) {
    if (ctx.serviceWorker) return () => null;
    const {
        HTMLIFrameElement
    } = ctx.window;
    function rewriteContentDocument() {
        overrideAccessors(HTMLIFrameElement.prototype, 'contentDocument', {
            getter: (target, that) => {
                const doc = target.call(that);
                try {
                    if (!doc.defaultView.$corrosion) initCorrosion(doc.defaultView);
                    return doc;
                } catch(e) {    
                    return doc;
                };
            },
        });
    };  
    function rewriteContentWindow() {
        overrideAccessors(HTMLIFrameElement.prototype, 'contentWindow', {
            getter: (target, that) => {
                const win = target.call(that);
                try {
                    if (!win.$corrosion) initCorrosion(win);
                    return win;
                } catch(e) {
                    return win;
                };
            },
        });
    };
    function initCorrosion(win) {
        win.$corrosion = new ctx.constructor({ ...ctx.config, window: win, });
        win.$corrosion.init();
        win.$corrosion.meta = ctx.meta;
    };
    return function rewriteIframe() {
        rewriteContentWindow();
        rewriteContentDocument();
    };
};

module.exports = createIframeRewriter;