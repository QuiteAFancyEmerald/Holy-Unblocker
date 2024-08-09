'use strict';

var debug = require('debug')('unblocker:hsts');

module.exports = function( /*config*/ ) {

    function hsts(data) {
        // this leaks to all sites that are visited by the client & it can block the client from accessing the proxy if https is not avaliable.
        if (data.headers['strict-transport-security']) {
            debug('deleting strict-transport-security header');
            delete data.headers['strict-transport-security'];
        }
    }

    return hsts;
};
