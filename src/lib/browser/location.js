class Location {
    get [Symbol.toPrimitive]() {
        return () => this.href;
    };
};

function createLocation(ctx, url) {
    const _location = new Location();
    const _url = new URL(url);
    [
        'hash', 
        'host', 
        'hostname', 
        'href',
        'pathname', 
        'port', 
        'protocol', 
        'search',
        'origin',
    ].forEach(property => {
        Object.defineProperty(_location, property, {
            get() {
                return _url[property];
            },
            set(val) {
                if (ctx.serviceWorker || property == 'origin') return;
                if (property == 'href') {
                    return ctx.window.location.href = ctx.url.wrap(new URL(val, _url).href);
                };
                _url[property] = val;
                return ctx.window.location.href = ctx.url.wrap(_url);
            },
        });
    });
    if (!ctx.serviceWorker) [
        'assign',
        'replace',
        'reload',
    ].forEach(method => {
        _location[method] = new Proxy(ctx.window.location[method], {
            apply(target, that, args) {
                if (args[0]) args[0] = ctx.url.wrap(args[0], ctx.meta);
                return Reflect.apply(target.bind(ctx.window.location), that, args);
            },  
        });
    });
    _location.toString = new Proxy(_url.toString, {
        apply(target, that, args) {
            return Reflect.apply(target.bind(_url), that, args);
        },  
    });
    return _location;
};

createLocation.Location = Location;
module.exports = createLocation;