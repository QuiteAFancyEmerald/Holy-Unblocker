'use strict';

var debug = require('debug')('unblocker:content-length');

module.exports = function( /*config*/ ) {

    function contentLength(data) {

        // if any of the middleware is possibly changing the body, remove the content-length header
        if (data.stream != data.remoteResponse) {
            debug('deleting content-length header due to possible content changes by other middleware');
            delete data.headers['content-length'];
        }
    }

    return contentLength;
};
