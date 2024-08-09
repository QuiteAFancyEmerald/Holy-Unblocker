'use strict';

var debug = require('debug')('unblocker:hpkp');

module.exports = function( /*config*/ ) {

    function hpkp(data) {
        // this could potentially block clients from using the proxy successfully.
        if (data.headers['public-key-pins']) {
            debug('deleting public-key-pins header');
            delete data.headers['public-key-pins'];
        }
    }

    return hpkp;
};
