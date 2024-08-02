const { Session } = require('testcafe-hammerhead');
const UploadStorage = require('testcafe-hammerhead/lib/upload/storage');
const generateId = require('../util/generateId');
const StrShuffler = require('../util/StrShuffler');

// disable UploadStorage, a testcafe testing feature we do not need
const emptyFunc = () => {};
UploadStorage.prototype.copy = emptyFunc;
UploadStorage.prototype.get = emptyFunc;
UploadStorage.prototype.store = emptyFunc;

/**
 * wrapper for initializing Session with saving capabilities
 */
class RammerheadSession extends Session {
    data = {};
    createdAt = Date.now();
    lastUsed = Date.now();

    /**
     * @param {object} options
     * @param {string} options.id
     * @param {boolean} options.dontConnectToData - used when we want to connect to data later (or simply don't want to)
     * @param {boolean} options.disableShuffling
     * @param {string[]} options.prependScripts
     */
    constructor({ id = generateId(), dontConnectToData = false, disableShuffling = false, prependScripts = [] } = {}) {
        super(['blah/blah'], {
            allowMultipleWindows: true,
            disablePageCaching: false
        });

        // necessary abstract methods for Session
        this.getIframePayloadScript = async () => '';
        this.getPayloadScript = async () => '';
        this.getAuthCredentials = () => ({});
        this.handleFileDownload = () => void 0;
        this.handlePageError = () => void 0;
        this.handleAttachment = () => void 0;
        // this.handlePageError = (ctx, err) => {
        //     console.error(ctx.req.url);
        //     console.error(err);
        // };

        // intellisense //
        /**
         * @type {{ host: string, hostname: string, bypassRules?: string[]; port?: string; proxyAuth?: string, authHeader?: string } | null}
         */
        this.externalProxySettings = null;

        // disable http2. error handling from http2 proxy client to non-http2 user is too complicated to handle
        // (status code 0, for example, will crash rammerhead)
        this.isHttp2Disabled = () => true;
        this.injectable.scripts.push(...prependScripts);
        this.injectable.scripts.push('/rammer/rammerhead.js');

        this.id = id;
        this.shuffleDict = disableShuffling ? null : StrShuffler.generateDictionary();
        if (!dontConnectToData) {
            this.connectHammerheadToData();
        }
    }
    /**
     * @param {boolean} dontCookie - set this to true if the store is using a more reliable approach to
     * saving the cookies (like in serializeSession)
     */
    connectHammerheadToData(dontCookie = false) {
        this._connectObjectToHook(this, 'createdAt');
        this._connectObjectToHook(this, 'lastUsed');
        this._connectObjectToHook(this, 'injectable');
        this._connectObjectToHook(this, 'externalProxySettings');
        this._connectObjectToHook(this, 'shuffleDict');
        if (!dontCookie) this._connectObjectToHook(this.cookies._cookieJar.store, 'idx', 'cookies');
    }

    updateLastUsed() {
        this.lastUsed = Date.now();
    }
    serializeSession() {
        return JSON.stringify({
            data: this.data,
            serializedCookieJar: this.cookies.serializeJar()
        });
    }
    // hook system and serializing are for two different store systems
    static DeserializeSession(id, serializedSession) {
        const parsed = JSON.parse(serializedSession);
        if (!parsed.data) throw new Error('expected serializedSession to contain data object');
        if (!parsed.serializedCookieJar)
            throw new Error('expected serializedSession to contain serializedCookieJar object');

        const session = new RammerheadSession({ id, dontConnectToData: true });
        session.data = parsed.data;
        session.connectHammerheadToData(true);
        session.cookies.setJar(parsed.serializedCookieJar);
        return session;
    }

    hasRequestEventListeners() {
        // force forceProxySrcForImage to be true
        // see https://github.com/DevExpress/testcafe-hammerhead/blob/a9fbf7746ff347f7bdafe1f80cf7135eeac21e34/src/session/index.ts#L180
        return true;
    }
    /**
     * @private
     */
    _connectObjectToHook(obj, prop, dataProp = prop) {
        const originalValue = obj[prop];
        Object.defineProperty(obj, prop, {
            get: () => this.data[dataProp],
            set: (value) => {
                this.data[dataProp] = value;
            }
        });
        if (!(dataProp in this.data)) {
            this.data[dataProp] = originalValue;
        }
    }
}

module.exports = RammerheadSession;
