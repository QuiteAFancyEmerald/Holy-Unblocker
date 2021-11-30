const createDocumentRewriter = require('./document');
const createHistoryRewriter = require('./history');
const createHttpRewriter = require('./http');
const createLocation = require('./location');
const createWorkerRewriter = require('./worker');
const defaultConfig = {
    prefix: '/service/',
    codec: 'plain',
    ws: true,
    cookie: true,
    title: 'Service',
    serviceWorker: false,
    url: null,
    window: false,
};  

class Corrosion extends require('../rewrite') {
    constructor(config = defaultConfig) {
        super(Object.assign(defaultConfig, config));
        const corrosion = this;
        if (!this.config.window) throw 'Corrosion Error: No window was given.';
        this.serviceWorker = this.config.serviceWorker || false;
        this.window = this.config.window;
        this.document = this.serviceWorker ? this.window.document : {};
        this._url = new URL((this.config.url || this.url.unwrap(this.window.location.href, { origin: this.window.location.origin, })));
        this.originalXhr = this.window.XMLHttpRequest;
        this.meta = {
            origin: this.window.location.origin,
            get base() {
                if (corrosion.serviceWorker) return corrosion._url;
                return corrosion.window.document.baseURI != corrosion.location.href ? new URL(corrosion.window.document.baseURI) : corrosion._url;
            },
            url: this._url,
        };
        this.location = createLocation(this, this._url);
        this.rewriteHttp = createHttpRewriter(this);
        this.rewriteDocument = createDocumentRewriter(this);
        this.rewriteHistory = createHistoryRewriter(this);
        this.rewriteWorker = createWorkerRewriter(this);
        if (!this.serviceWorker && this.window.document.currentScript) this.window.document.currentScript.remove();
    };
    get parent() {
        if (this.serviceWorker) return false;
        try {
            return this.window.parent.$corrosion ? this.window.parent : this.window;
        } catch(e) {
            return this.window;
        };
    };
    get top() {
        if (this.serviceWorker) return false;
        try {
            return this.window.top.$corrosion ? this.window.top : this.parent;
        } catch(e) {
            return this.parent;
        };
    };
    init() {
        this.rewriteHttp();
        this.rewriteDocument();
        this.rewriteHistory();
        this.rewriteWorker();
        this.window.Location = createLocation.Location;
        this.window.$corrosionGet$ = this.get$.bind(this);
        this.window.$corrosionSet$ = this.set$.bind(this);
        this.window.$corrosionGet$m = this.get$m.bind(this);
        this.window.$corrosionSet$m = this.set$m.bind(this);
        this.window.$corrosionCall$m = this.call$m.bind(this);
    };
    get$m(obj, key) {
        if (!this.serviceWorker && this.window != this.window.parent && obj == this.window.parent) {
            return this.parent.$corrosion.get$m(this.parent, key);
        };
        if (!this.serviceWorker && this.window != this.window.top && obj == this.window.top) {
            return this.top.$corrosion.get$m(this.top, key);
        };
        if (obj == this.window && key == 'location' || !this.serviceWorker && obj == this.window.document && key == 'location') return this.location;
        if (!this.serviceWorker && obj == this.window && key == 'parent' && this.window != this.window.parent) return this.parent;
        if (!this.serviceWorker && obj == this.window && key == 'top' && this.window != this.window.top) return this.top;
        return obj[key];
    };
    set$m(obj, key, val, operator) {
        if (!this.serviceWorker && this.window != this.window.parent && obj == this.window.parent) {
            return this.parent.$corrosion.set$m(this.parent, key, val, operator);
        };
        if (!this.serviceWorker && this.window != this.window.top && obj == this.window.top) {
            return this.top.$corrosion.set$m(this.top, key, val, operator);
        };
        if (obj == this.window && key == 'location' || !this.serviceWorker && obj == this.window.document && key == 'location') obj = this;
        switch(operator) {
            case '+=':
                return obj[key] += val;
            case '-=':
                return obj[key] -= val;
            case '*=':
                return obj[key] *= val;
            case '/=':
                return obj[key] /= val;
            case '%=':
                return obj[key] %= val;
            case '**=':
                return obj[key] **= val;
            case '<<=':
                return obj[key] <<= val;
            case '>>=':
                return obj[key] >>= val;
            case '>>>=':
                return obj[key] >>>= val;
            case '&=':
                return obj[key] &= val;
            case '^=':
                return obj[key] ^= val;
            case '|=':
                return obj[key] |= val;
            case '&&=':
                return obj[key] &&= val;
            case '||=':
                return obj[key] ||= val;
            case '??=':
                return obj[key] ??= val;
            case '++':
                return obj[key]++;
            case '--':
                return obj[key]--;
            case '=':
            default:
                return obj[key] = val;
        };
    };
    call$m(obj, key, args) {
        if (!this.serviceWorker && this.window != this.window.parent && obj == this.window.parent) {
            return this.parent.$corrosion.call$m(this.parent, key, args);
        };
        if (!this.serviceWorker && this.window != this.window.top && obj == this.window.top) {
            return this.top.$corrosion.call$m(this.top, key, args);
        };
        return obj[key](...args);
    };
    get$(obj) {
        if (obj == this.window.location) return this.location;
        if (!this.serviceWorker && obj == this.window.parent) return this.parent;
        if (!this.serviceWorker && obj == this.window.top) return this.top;
        return obj;
    };
    set$(obj, val, operator) {
        if (obj == this.window.location) return this.set$(this.location, val, operator);
        if (!this.serviceWorker && this.window != this.window.parent && obj == this.window.parent) return this.parent.set$(this.parent, val, operator);
        if (!this.serviceWorker && this.window != this.window.top && obj == this.window.top) return this.top.set$(this.top, val, operator);
        switch(operator) {
            case '+=':
                return obj += val;
            case '-=':
                return obj -= val;
            case '*=':
                return obj *= val;
            case '/=':
                return obj /= val;
            case '%=':
                return obj %= val;
            case '**=':
                return obj **= val;
            case '<<=':
                return obj <<= val;
            case '>>=':
                return obj >>= val;
            case '>>>=':
                return obj >>>= val;
            case '&=':
                return obj &= val;
            case '^=':
                return obj ^= val;
            case '|=':
                return obj |= val;
            case '&&=':
                return obj &&= val;
            case '||=':
                return obj ||= val;
            case '??=':
                return obj ??= val;
            case '++':
                return obj++;
            case '--':
                return obj--;
            case '=':
            default:
                return obj = val;
        };
    };
    updateLocation() {
        this._url = new URL(this.url.unwrap(this.window.location.href, this.meta));
        this.location = createLocation(this, this._url);
    }; 
};

globalThis.Corrosion = Corrosion;