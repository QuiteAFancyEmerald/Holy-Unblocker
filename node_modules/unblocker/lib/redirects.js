'use strict';

var debug = require('debug')('unblocker:redirects');

module.exports = function( /*config*/ ) {
    function proxyRedirects(data) {

        // fix absolute url redirects
        // (relative redirects will be re-redirected to the correct path, and they're disallowed by the RFC anyways)
        // '//' redirects makes unblocker add the http/https before appending the url to it
        if (data.headers.location && (data.headers.location.substr(0, 4) == 'http' || data.headers.location.substr(0, 2) == '//')) {
            var location = data.clientRequest.thisSite() +
                (data.headers.location.substr(0, 2) == '//' ? (data.url.substr(0, 5) === 'https' ? 'https:' : 'http:') : '') +
                data.headers.location;
            data.redirectUrl = (data.headers.location.substr(0, 2) == '//' ? (data.url.substr(0, 5) === 'https' ? 'https:' : 'http:') : '') +
                data.headers.location; // the cookie handler uses this to know to possibly copy cookies between protocols or subdomains
            debug('rewriting redirect from %s to %s', data.headers.location, location);
            data.headers.location = location;
        }

    }

    return proxyRedirects;
};
