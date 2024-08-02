const RequestPipelineContext = require('testcafe-hammerhead/lib/request-pipeline/context');
const StrShuffler = require('./StrShuffler');
const getSessionId = require('./getSessionId');

const replaceUrl = (url, replacer) => {
    //        regex:              https://google.com/    sessionid/   url
    return (url || '').replace(/^((?:[a-z0-9]+:\/\/[^/]+)?(?:\/[^/]+\/))([^]+)/i, function (_, g1, g2) {
        return g1 + replacer(g2);
    });
};

function patch(url) {
	// url = _rhsEPrcb://bqhQko.tHR/
	// remove slash
	return url.replace(/(^.*?:\/)\//, '$1');
}

function unpatch(url) {
	// url = _rhsEPrcb:/bqhQko.tHR/
	// restore slash
	return url.replace(/^.*?:\/(?!\/)/, '$&/');
}

// unshuffle incoming url //
const BUILTIN_HEADERS = require('testcafe-hammerhead/lib/request-pipeline/builtin-header-names');
const _dispatch = RequestPipelineContext.prototype.dispatch;
RequestPipelineContext.prototype.dispatch = function (openSessions) {
    let sessionId = getSessionId(this.req.url);
    let session = sessionId && openSessions.get(sessionId);
    if (!session) {
        sessionId = getSessionId(this.req.headers[BUILTIN_HEADERS.referer]);
        session = sessionId && openSessions.get(sessionId);
    }
    if (session && session.shuffleDict) {
        const shuffler = new StrShuffler(session.shuffleDict);
        this.req.url = replaceUrl(this.req.url, (url) => shuffler.unshuffle(unpatch(url)));
        if (getSessionId(this.req.headers[BUILTIN_HEADERS.referer]) === sessionId) {
            this.req.headers[BUILTIN_HEADERS.referer] = replaceUrl(this.req.headers[BUILTIN_HEADERS.referer], (url) =>
                shuffler.unshuffle(unpatch(url))
            );
        }
    }

    return _dispatch.call(this, openSessions);
};

// shuffle rewritten proxy urls //
let disableShuffling = false; // for later use
const _toProxyUrl = RequestPipelineContext.prototype.toProxyUrl;
RequestPipelineContext.prototype.toProxyUrl = function (...args) {
    const proxyUrl = _toProxyUrl.apply(this, args);

    if (!this.session.shuffleDict || disableShuffling) return proxyUrl;

    const shuffler = new StrShuffler(this.session.shuffleDict);
    return replaceUrl(proxyUrl, (url) => patch(shuffler.shuffle(url)));
};

// unshuffle task.js referer header
const Proxy = require('testcafe-hammerhead/lib/proxy/index');
const __onTaskScriptRequest = Proxy.prototype._onTaskScriptRequest;
Proxy.prototype._onTaskScriptRequest = async function _onTaskScriptRequest(req, ...args) {
    const referer = req.headers[BUILTIN_HEADERS.referer];

    const sessionId = getSessionId(referer);
    const session = sessionId && this.openSessions.get(sessionId);
    if (session && session.shuffleDict) {
        const shuffler = new StrShuffler(session.shuffleDict);
        req.headers[BUILTIN_HEADERS.referer] = replaceUrl(req.headers[BUILTIN_HEADERS.referer], (url) =>
            shuffler.unshuffle(unpatch(url))
        );
    }
    return __onTaskScriptRequest.call(this, req, ...args);
};

// don't shuffle action urls (because we don't get to control the rewriting when the user submits the form)
const DomProcessor = require('testcafe-hammerhead/lib/processing/dom/index');
const __processUrlAttrs = DomProcessor.prototype._processUrlAttrs;
DomProcessor.prototype._processUrlAttrs = function _processUrlAttrs(el, urlReplacer, pattern) {
    try {
        disableShuffling = pattern.urlAttr?.toLowerCase() === 'action';
        __processUrlAttrs.call(this, el, urlReplacer, pattern);
        disableShuffling = false;
    } catch (e) {
        disableShuffling = false;
        throw e;
    }
};
