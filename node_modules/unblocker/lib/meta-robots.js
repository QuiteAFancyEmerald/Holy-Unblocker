'use strict';

var Transform = require('stream').Transform;
var contentTypes = require('./content-types');

module.exports = function(config) {

    function createStream() {
        return new Transform({
            decodeStrings: false,
            transform: function(chunk, encoding, next) {
                var updated = chunk.toString().replace('</head>', '<meta name="ROBOTS" content="NOINDEX, NOFOLLOW"/>\n</head>');
                this.push(updated, 'utf8');
                next();
            }
        });
    }

    function metaRobots(data) {
        // this leaks to all sites that are visited by the client & it can block the client from accessing the proxy if https is not avaliable.
        if (contentTypes.shouldProcess(config, data)) {
            data.stream = data.stream.pipe(createStream());
        }
    }

    metaRobots.createStream = createStream; // for testing

    return metaRobots;
};
