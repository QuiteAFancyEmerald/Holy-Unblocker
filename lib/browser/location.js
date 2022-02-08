const { wrapFunction } = require("./utils");
const locationProperties = [
    'hash', 
    'host', 
    'hostname', 
    'href',
    'pathname', 
    'port', 
    'protocol', 
    'search',
    'origin',
];
const locationMethods = [
    'replace',
    'reload',
    'assign',
];

class Location {
    get [Symbol.toPrimitive]() {
        return () => this.href;
    };
};

function createLocation(ctx, url) {
    const _url = new URL(url);
    const _location = new Location();
    for (const property of locationProperties) {
        Object.defineProperty(_location, property, {
            get: () => _url[property],
            set: val => {
                if (ctx.serviceWorker || property == 'origin') return;
                if (property == 'href') {
                    return ctx.window.location.href = ctx.url.wrap(new URL(val, _url).href);
                };
                _url[property] = val;
                return ctx.window.location.href = ctx.url.wrap(_url);
            },
        });
    };
    if (!ctx.serviceWorker) {
        for (const method of locationMethods) {
            _location[method] =  wrapFunction(ctx.window.location[method], (target, that, args) => {
                if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                return target.apply(ctx.window.location, args);
            });
        };
    };
    _location.toString = wrapFunction(_url.toString, target => target.call(_url));
    ctx.proxyToOriginalMp.set(_location, ctx.window.location);
    return _location;
};

module.exports = { createLocation, Location, locationMethods, locationProperties };