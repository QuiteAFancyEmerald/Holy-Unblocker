const { overrideAccessors, overrideFunction } = require("./utils");

function createStyleRewriter(ctx) {
    if (ctx.serviceWorker) return () => null;
    if (ctx.window.CSSStyleDeclaration && ctx.window.CSSStyleDeclaration.prototype.setProperty) ctx.originalFn.CSSSetProperty = ctx.window.CSSStyleDeclaration.prototype.setProperty;
    function rewriteSetProperty() {
        if (ctx.originalFn.CSSSetProperty) {
            overrideFunction(ctx.window.CSSStyleDeclaration.prototype, 'setProperty', (target, that, args) => {
                if (args[1]) args[1] = ctx.processStyle(args[1], 'value');
                return target.apply(that, args);
            });
        };
    };
    function rewriteStyleProperty(property, attribute) {
        let type = null;
        if (ctx.window.CSSStyleDeclaration || ctx.window.CSS2Properties) {
            type = !!ctx.window.CSS2Properties ? 'CSS2Properties' : 'CSSStyleDeclaration';
        };
        switch(type) {
            case 'CSS2Properties':
                overrideAccessors(ctx.window.CSS2Properties.prototype, property, {
                    setter: (target, that, [ val ]) => target.call(that, ctx.processStyle(val, 'value')),
                });
                break;
            default:
                Object.defineProperty(ctx.window.CSSStyleDeclaration.prototype, property, {
                    get() {
                        return this.getProperty(attribute);
                    },
                    set(val) {
                        return this.setProperty(attribute, val);
                    },
                });
        };
        return true;
    };
    return function rewriteStyle() {
        rewriteStyleProperty('background', 'background');
        rewriteStyleProperty('backgroundImage', 'background-image');
        rewriteStyleProperty('cursor', 'cursor');
        rewriteStyleProperty('listStyle', 'list-style');
        rewriteStyleProperty('listStyleImage', 'list-style-image');
        rewriteStyleProperty('border', 'border');
        rewriteStyleProperty('borderImage', 'border-image');
        rewriteStyleProperty('borderImageSource', 'border-image-source');
        rewriteStyleProperty('maskImage', 'mask-image');
        rewriteSetProperty();
        return true;
    };
};

module.exports = createStyleRewriter;