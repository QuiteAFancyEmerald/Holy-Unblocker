const createAttributeRewriter = require('./attributes');
const createDocumentRewriter = require('./document');
const createDomRewriter = require('./dom');
const createFunctionRewriter = require('./function');
const createHistoryRewriter = require('./history');
const createHttpRewriter = require('./http');
const createIframeRewriter = require('./iframe');
const createInstrumentation = require('./instrumentation');
const { createLocation } = require('./location');
const createMessageRewriter = require('./message');
const createWorkerRewriter = require('./worker');
const createStyleRewriter = require('./style');
const utils = require('./utils');
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
        this.utils = utils;
        this.serviceWorker = this.config.serviceWorker;
        this.window = config.window;
        this.Window = this.serviceWorker ? null : this.window.Window;
        this.Document = this.Window ? this.window.Document : null;
        this.docProto = (this.Document || {}).prototype;
        this.origin = this.window.location.origin;
        this._url = new URL((this.config.url || this.url.unwrap(this.window.location.href, { origin: this.window.location.origin, })));
        this.proxyToOriginalMp = new Map();
        this.location = createLocation(this, this._url);
        this.meta = {
            origin: this.origin,
            get base() {
                if (corrosion.serviceWorker) return corrosion._url;
                return corrosion.window.document.baseURI != corrosion.location.href ? new URL(corrosion.window.document.baseURI) : corrosion._url;
            },
            url: this._url,
        };
        this.originalFn = {};
        this.originalAccessors = {};
        this.rewriteFunction = createFunctionRewriter(this);
        this.rewriteHttp = createHttpRewriter(this);
        this.rewriteDocument = createDocumentRewriter(this);
        this.rewriteDom = createDomRewriter(this);
        this.rewriteAttributes = createAttributeRewriter(this);
        this.rewriteIframes = createIframeRewriter(this);
        this.rewriteMessage = createMessageRewriter(this);
        this.rewriteHistory = createHistoryRewriter(this);
        this.rewriteWorker = createWorkerRewriter(this);
        this.rewriteStyle = createStyleRewriter(this);
        this.instrumentation = createInstrumentation(this);
        this.windowEvents = [];
        this.window.__get$ = this.instrumentation.get;
        this.window.__get$Parent = this.instrumentation.getParent;
        this.window.__get$Top = this.instrumentation.getTop;
        this.window.__get$Loc = this.instrumentation.getLoc;
        this.window.__set$ = this.instrumentation.set;
        this.window.__set$Loc = this.instrumentation.setLoc;
        this.window.__processScript = this.processScript.bind(this);
        this.window.__processStyle = this.processStyle.bind(this);
        this.window.__processHtml = this.processHtml.bind(this);
        this.window.__call$ = this.call.bind(this);
    };  
    processStyle(val, context) {
        return this.css.process(val, { meta: this.meta, context });
    };
    processScript(val) {
        return this.js.process(val, this.meta.url.href);
    };
    processHtml(val, document = false) {
        if (!val) return val;
        return this.html.process(val, { document, meta: this.meta, });
    };
    call(obj, method, args) {
        return obj[method](...args);
    };
    proxyToOriginal(input) {
        return this.proxyToOriginalMp.get(input) || input;
    };
    init() {
        this.rewriteFunction();
        this.rewriteHttp();
        this.rewriteDocument();
        this.rewriteDom();
        this.rewriteAttributes();
        this.rewriteIframes();
        this.rewriteMessage();
        this.rewriteHistory();
        this.rewriteWorker();
        this.rewriteStyle();
        console.log('Corrosion initiated.');
    };
};

globalThis.Corrosion = Corrosion;