'use strict';

var URL = require('url');

module.exports = function( /*config*/ ) {
    return function hostHeader(data) {
        data.headers.host = URL.parse(data.url).host;
    };
};
