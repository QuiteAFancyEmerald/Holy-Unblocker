// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const { SetCookie, CookieStore } = require('./cookie-parser');

class CookieRewriter {
    constructor(ctx) {
        this.ctx = ctx;
    };
    decode(store, config = {}) {
        const url = new URL(config.url);
        const cookies = new CookieStore(store);
        cookies.forEach((val, key) => {
            if (!key.includes('@') || key.slice(key.length - url.hostname.length) != url.hostname) return cookies.delete(key);
            cookies.delete(key);
            cookies.set(key.substr(0, key.length - url.hostname.length - 1), val);
        });
        return cookies.serialize();
    };
    encode(input, config = {}) {
        if (Array.isArray(input)) {
            const rw = [ ...input ];
            for (let i in rw) rw[i] = this.encode(rw[i], config);
            return rw;
        };  
        const url = new URL(config.url);
        const cookie = new SetCookie(input);
        if (!cookie.name) return null;
        cookie.domain = config.domain;
        cookie.secure = config.secure;
        cookie.name += `@${url.hostname}`;
        cookie.path = this.ctx.prefix;
        return cookie.serialize() || '';
    };
};

module.exports = CookieRewriter;
