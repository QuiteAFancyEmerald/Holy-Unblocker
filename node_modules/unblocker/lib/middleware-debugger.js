/**
 * Adds an extra piece of middleware before and after EVERY other piece of middleware in the stack
 * Reports on what has changed
 *
 * enable by setting the DEBUG environment parameter to `unblocker:middleware`, `unblocker:*`, or `*`. For example:
 *
 *     DEBUG=unblocker:middleware node mycoolapp.js
 */

var Transform = require('stream').Transform;
var crypto = require('crypto');
var _ = require('lodash');
var debug = require('debug')('unblocker:middleware');

function getDebugMiddlewareFor(middleware, dir) {
    var nextName = middleware && (middleware.name || middleware.toString());
    return function debugMiddleware(data) {
        var prevMiddleware = data.middlewareName;
        if (!prevMiddleware) {
            debug('starting %s middleware stack for %s %s', dir, data.contentType || '', data.url);
            data.prevStream = null;
        }
        if (!data.prevStream || (data.prevStream && data.stream != data.prevStream)) {
            debug('stream added');
            data.prevStream = data.stream = data.stream.pipe(new Transform({
                decodeStrings: false,
                transform: function(chunk, encoding, next) {
                    var hash = crypto.createHash('sha1').update(chunk).digest('hex');
                    debug('%s %s chunk received from %s, length=%s, hash=%s', data.url, dir, prevMiddleware || 'source', chunk.length, hash);
                    if (data.prevHash && hash != data.prevHash) {
                        debug('chunk modified by ' + prevMiddleware);
                    }
                    data.hash = hash;
                    this.push(chunk);
                    next();
                }
            }));
        }
        if (nextName) {
            debug('setting up ' + nextName);
            data.middlewareName = nextName;
        }
        if (prevMiddleware && !nextName) {
            debug('all ' + dir + ' middleware setup');
        }
    };
}

function debugMiddleware(middleware, dir) {
    return _(middleware).map(function(m) {
        return [getDebugMiddlewareFor(m, dir), m];
    }).flatten().push(getDebugMiddlewareFor(null, dir)).value();
}

module.exports.enabled = debug.enabled;
module.exports.debugMiddleware = debugMiddleware;
