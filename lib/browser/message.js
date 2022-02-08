const { overrideFunction, wrapFunction, overrideAccessors } = require('./utils');

function createMessageRewriter(ctx) {
    if (ctx.window.postMessage) ctx.originalFn.postMessage = ctx.window.postMessage;
    if (ctx.window.addEventListener) ctx.originalFn.addEventListener = ctx.window.addEventListener;
    if (ctx.window.removeEventListener) ctx.originalFn.removeEventListener = ctx.window.removeEventListener;
    if (ctx.window.Event) ctx.originalFn.Event = ctx.window.Event;
    function rewritePostMessage() {
        if (ctx.originalFn.postMessage) {
            overrideFunction(ctx.window, 'postMessage', (target, that, args) => {               
                /*if (args[0]) {
                    args[0] = {
                        from: ctx.serviceWorker ? ctx.location.origin : args[1] || ctx.location.origin,
                        message: args[0],
                    };
                };
                console.log(args[0]);*/
                if (!ctx.serviceWorker && args[1]) args[1] = ctx.window.location.origin;
                return target.apply(that, args);
            });
        };
        return true;
    };
    function rewriteMessageEvent() {
        if (ctx.originalFn.Event) {
            overrideAccessors(ctx.window.Event.prototype, 'target', {
                getter: (target, that) => { 
                    console.log(that.$corrosion_messageTarget);
                    return that.$corrosion_messageTarget 
                },
            });
            overrideAccessors(ctx.window.Event.prototype, 'srcElement', {
                getter: (target, that) => that.$corrosion_messageSrcElement || target.call(that),
            });
            overrideAccessors(ctx.window.Event.prototype, 'currentTarget', {
                getter: (target, that) => that.$corrosion_messageCurrentTarget || target.call(that),
            });
            overrideAccessors(ctx.window.Event.prototype, 'eventPhase', {
                getter: (target, that) => that.$corrosion_messageEventPhase || target.call(that),
            });
            overrideAccessors(ctx.window.Event.prototype, 'path', {
                getter: (target, that) => that.$corrosion_messagePath || target.call(that),
            });
        };
    };
    function rewriteEventListener() {
        if (ctx.originalFn.addEventListener) {
            overrideFunction(ctx.window, 'addEventListener', (target, that, args) => {
                if (args[0] == 'message' && typeof args[1] == 'function') {
                    const data = {
                        type: 'message',
                        originalHandler: args[1],
                        proxyHandler: wrapFunction(args[1], (target, that, [ event ]) => {
                            let rw = new ctx.window.MessageEvent('message', {
                                bubbles: event.bubbles,
                                cancelable: event.cancelable,
                                data: event.data.message,
                                origin: event.data.from,
                                lastEventId: event.lastEventId,
                                source: event.source,
                                target: event.target,
                                ports: event.ports
                            });
                            return target.call(that, rw);
                        }),
                    };
                    ctx.windowEvents.push(data);
                    args[1] = data.proxyHandler;
                };
                return target.apply(that, args);
            });
        };
        if (ctx.originalFn.removeEventListener) {
            overrideFunction(ctx.window, 'removeEventListener', (target, that, args) => {
                if (args[0] == 'message' && ctx.windowEvents.find(entry => entry.originalHandler == args[1])) {
                    args[1] = ctx.windowEvents.find(entry => entry.originalHandler == args[1]).proxyHandler;
                };
                return target.apply(that, args);
            });
        };
        overrideAccessors(ctx.window, 'onmessage', {
            setter: (target, that, [ val ]) => {
                return target.call(that, wrapFunction(val, (target, that, [ event ]) => {
                    let rw = new ctx.window.MessageEvent('message', {
                        bubbles: event.bubbles,
                        cancelable: event.cancelable,
                        data: event.data.message,
                        origin: event.data.from,
                        lastEventId: event.lastEventId,
                        source: event.source,
                        ports: event.ports
                    });
                    
                    [
                        'target',
                        'srcElement',
                        'currentTarget',
                        'eventPhase',
                        'path',
                    ].forEach(key => {
                        Object.defineProperty(rw, key, {
                            get: () => event[key],
                        });
                    });
                    return target.call(that, rw);
                }));
            },
        });
    };
    return function rewriteMessage() {
        //rewriteMessageEvent();
        rewritePostMessage();
        //rewriteEventListener();
        return true;
    };
};

module.exports = createMessageRewriter;