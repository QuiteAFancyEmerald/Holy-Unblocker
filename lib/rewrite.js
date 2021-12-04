// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const URLWrapper = require('./url');
const CookieRewriter = require('./cookie');
const CSSRewriter = require('./css');
const HTMLRewriter = require('./html');
const JSRewriter = require('./js');
const defaultConfig = {
    prefix: '/service/',
    codec: 'plain',
    ws: true,
    cookie: true,
    title: 'Service',
};

class Rewrite {
    constructor(config = defaultConfig) {
        this.config = Object.assign(defaultConfig, config);
        this.prefix = this.config.prefix;
        this.forceHttps = this.config.forceHttps;
        this.url = new URLWrapper(this.config || {});
        this.codec = this.url.codec;
        this.cookies = new CookieRewriter(this);
        this.css = new CSSRewriter(this);
        this.js = new JSRewriter(this);
        this.html = new HTMLRewriter(this);
    };
};  
 
module.exports = Rewrite;
