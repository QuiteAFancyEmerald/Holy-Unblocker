var URL = require('url');
var libCookie = require('cookie');
var setCookie = require('set-cookie-parser');
var TLD = require('tld');
var Transform = require('stream').Transform;
var contentTypes = require('./content-types.js');
var debug = require('debug')('unblocker:cookies');
var _ = require('lodash');

/**
 * Forwards cookies on to client, rewriting domain and path to match site's "directory" on proxy server.
 *
 * Gets a bit hackey when switching protocols or subdomains - cookies are copied over to the new "directory" but flags such as httponly and expires are lost and path is reset to site root
 *
 * Todo: consider creating an extra cookie to hold flags for other cookies when switching protocols or subdomains
 *
 * @param config
 */

function cookies(config) {

    var REDIRECT_QUERY_PARAM = '__proxy_cookies_to';

    // normally we do nothing here, but when the user is switching protocols or subdomains, the handleResponse function
    // will rewrite the links to start with the old protocol & domain (so that we get sent the cookies), and then it
    // will copy the old cookies to the new path
    function redirectCookiesWith(data) {
        var uri = URL.parse(data.url, true); // true = parseQueryString
        if (uri.query[REDIRECT_QUERY_PARAM]) {
            var nextUri = URL.parse(uri.query[REDIRECT_QUERY_PARAM]);
            debug('copying cookies from %s to %s', data.url, uri.query[REDIRECT_QUERY_PARAM]);
            var cookies = libCookie.parse(data.headers.cookie || '');
            var setCookieHeaders = Object.keys(cookies).map(function(name) {
                var value = cookies[name];
                return libCookie.serialize(name, value, {
                    path: config.prefix + nextUri.protocol + '//' + nextUri.host + '/'
                });
            });
            data.clientResponse.redirectTo(uri.query.__proxy_cookies_to, {
                'set-cookie': setCookieHeaders
            });
        }

        // todo: copy cookies over from clientRequest when the remote server sends a 3xx redirect to a differnet protocol / subdomain
    }

    function rewriteCookiesAndLinks(data) {
        var uri = URL.parse(data.url);
        var nextUri;

        // this is set by the redirect middleware in the case of a 3xx redirect
        if (data.redirectUrl) {
            nextUri = URL.parse(data.redirectUrl);
        }

        // first update any set-cookie headers to ensure the path is prefixed with the site
        var cookies = setCookie.parse(data, {
            decodeValues: false // Calls dcodeURIComponent on each value - but we want to just pass them along unchanged in this case.
        });
        if (cookies.length) {
            debug('remaping set-cookie headers');
            data.headers['set-cookie'] = cookies.map(function(cookie) {
                var targetUri = nextUri || uri;
                cookie.path = config.prefix + targetUri.protocol + '//' + targetUri.host + (cookie.path || '/');
                delete cookie.domain;
                delete cookie.secure; // todo: maybe leave this if we knot the proxy is being accessed over https?
                cookie.value = decodeURIComponent(cookie.value); // Used to avoid double percent-encoding
                return libCookie.serialize(cookie.name, cookie.value, cookie);
            });
        }

        if (data.redirectUrl) {
            var diffProto = nextUri.protocol != uri.protocol;
            var diffHost = nextUri.hostname != uri.hostname;
            // if protocol or hostname are changing, but the registered tld is the same, copy the cookies over to the new "path"
            if ((diffProto || diffHost) && TLD.registered(nextUri.hostname) == TLD.registered(uri.hostname)) {
                debug('copying cookies from %s to %s', data.url, data.redirectUrl);

                // get all of the old cookies (from the request) indexed by name, and create set-cookie headers for each one
                var oldCookies = libCookie.parse(data.clientRequest.headers.cookie || '');
                var oldSetCookieHeaders = _.mapValues(oldCookies, function(value, name) {
                    return libCookie.serialize(name, value, {
                        path: config.prefix + nextUri.protocol + '//' + nextUri.host + '/'
                    });
                });

                // but, if we have a new cookie with the same name as an old one, delete the old one
                cookies.forEach(function(cookie) {
                    delete oldSetCookieHeaders[cookie.name];
                });

                // finally, append the remaining old cookie headers to any existing set-cookie headers in the response
                data.headers['set-cookie'] = (data.headers['set-cookie'] || []).concat(_.values(oldSetCookieHeaders));
            }
        }

        // takes a link that switches protocol and/or subdomain and makes it first go through the cookie handler on the current protocol/sub and then redirect with the cookies coppied over
        function updateLink(proxiedUrl, url /*, subdomain*/ ) {
            var next_uri = URL.parse(url);
            if (next_uri.protocol != uri.protocol || next_uri.host != uri.host) {
                // rewrite the url - we want the old proto and domain, but the new path just in case there are any cookies that are limited to that sub-path (although they won't be on the new protodomain...)
                var cookieProxiedUrl = config.prefix + uri.protocol + '//' + uri.host + next_uri.pathname + '?' + REDIRECT_QUERY_PARAM + '=' + encodeURIComponent(url);
                debug('rewriting link from %s to %s in order to allow cookies to be copied over to new path', proxiedUrl, cookieProxiedUrl);
                return cookieProxiedUrl;
            } else {
                // if neither the proto nor the host have changed, just replace it with the same string
                return proxiedUrl;
            }
        }

        // next scan the links for anything that switches subdomain or protocol (if this is a content-type that we want to process
        if (contentTypes.shouldProcess(config, data)) {

            var tld = TLD.registered(uri.hostname);
            var RE_PROTO_SUBDOMAIN_URL = new RegExp(config.prefix + "(https?://([a-z0-9.-]+\.)?" + tld + "[^'\") ]*)", "ig");

            data.stream = data.stream.pipe(new Transform({
                decodeStrings: false,
                transform: function(chunk, encoding, next) {
                    var updated = chunk.toString().replace(RE_PROTO_SUBDOMAIN_URL, updateLink);
                    this.push(updated, 'utf8');
                    next();
                }
            }));
        }
    }

    return {
        handleRequest: redirectCookiesWith,
        handleResponse: rewriteCookiesAndLinks
    };
}


module.exports = cookies;
