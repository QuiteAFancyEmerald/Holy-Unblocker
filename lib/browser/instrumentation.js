function createInstrumentation(ctx) {
    function getParent(input) {
        try {
            if (!ctx.serviceWorker && input == ctx.window.parent && !ctx.window.parent.$corrosion) return ctx.window;
            return input;
        } catch(e) {
            return input;
        };
    };
    function getTop(input) {
        try {
            if (!ctx.serviceWorker && input == ctx.window.parent && !ctx.window.parent.$corrosion) return ctx.window;
            return input;
        } catch(e) {
            return input;
        };
    };
    function getLoc(input) {
        if (input == ctx.window.location) return ctx.location;
        return input;
    };
    function setLoc(input, val, operator) {
        if (input == ctx.window.location) return set(ctx.window, 'location', val, operator);
        return false;
    };
    function get(obj, prop) {
        if (!ctx.serviceWorker) {
            if (obj instanceof ctx.Window && obj != ctx.window && obj.$corrosion) return obj.$corrosion.instrumentation.get(obj, prop);
            if (obj instanceof ctx.Document && obj != ctx.window.document && obj.defaultView.$corrosion) return obj.defaultView.$corrosion.instrumentation.get(obj, prop);
        };
        switch(prop) {
            case 'top':
                return getTop(obj[prop]);
            case 'parent':
                return getParent(obj[prop]);
            case 'location':
                return getLoc(obj[prop]);
            default:
                return obj[prop];
        };
    };
    function set(obj, prop, val, operator) {
        if (!ctx.serviceWorker) {
            if (obj instanceof ctx.Window && obj != ctx.window && obj.$corrosion) return obj.$corrosion.instrumentation.set(obj, prop, val, operator);
            if (obj instanceof ctx.Document && obj != ctx.window.document && obj.defaultView.$corrosion) return obj.defaultView.$corrosion.instrumentation.set(obj, prop, val, operator);
        };
        if (obj == ctx.window.location) obj = ctx.location;
        if (prop == 'location' && (obj == ctx.window || !ctx.serviceWorker && obj == ctx.window.document)) {
            obj = ctx.location;
            prop = 'href';
        };
        switch(operator) {
            case '+=':
                return obj[prop] += val;
            case '-=':
                return obj[prop] -= val;
            case '*=':
                return obj[prop] *= val;
            case '/=':
                return obj[prop] /= val;
            case '%=':
                return obj[prop] %= val;
            case '**=':
                return obj[prop] **= val;
            case '<<=':
                return obj[prop] <<= val;
            case '>>=':
                return obj[prop] >>= val;
            case '>>>=':
                return obj[prop] >>>= val;
            case '&=':
                return obj[prop] &= val;
            case '^=':
                return obj[prop] ^= val;
            case '|=':
                return obj[prop] |= val;
            case '&&=':
                return obj[prop] &&= val;
            case '||=':
                return obj[prop] ||= val;
            case '??=':
                return obj[prop] ??= val;
            case '++':
                return obj[prop]++;
            case '--':
                return obj[prop]--;
            default:
                return obj[prop] = val;
        };
    };
    return { set, get, setLoc, getLoc, getParent, getTop, }
};

module.exports = createInstrumentation;