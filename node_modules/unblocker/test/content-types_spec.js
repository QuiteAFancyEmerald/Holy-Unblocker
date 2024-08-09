'use strict';

var test = require('tap').test;
var contentTypes = require('../lib/content-types.js');

test("should should handle content types with a charset", function(t) {
    var config = {
        processContentTypes: ['text/html']
    };
    var data = {
        headers: {
            'content-type': 'text/html; charset=utf-8'
        }
    };
    data.contentType = contentTypes.getType(data);
    t.ok(contentTypes.shouldProcess(config, data));
    t.end();
});
