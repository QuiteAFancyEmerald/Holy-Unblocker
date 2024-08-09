'use strict';

var URL = require('url');
var debug = require('debug')('proxyReferer');

module.exports = function(config) {

    function proxyReferer(data) {
        // overwrite the referer with the correct referer
        if (data.headers.referer) {
            var uri = URL.parse(data.headers.referer);
            if (uri.path.substr(0, config.prefix.length) == config.prefix) {
                var ref = uri.path.substr(config.prefix.length);
                debug("rewriting referer from %s to %s", ref, data.headers.referer);
                data.headers.referer = ref;
            }
        }
    }

    return proxyReferer;
};
