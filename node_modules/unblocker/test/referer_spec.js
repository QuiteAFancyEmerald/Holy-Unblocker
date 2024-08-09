var referer = require('../lib/referer.js');
var test = require('tap').test;

test('should correctly rewrite referers', function(t) {
    var expected = 'http://foobar.com/proxy/a';
    var data = {
        url: 'http://foobar.com/b',
        headers: {
            referer: 'http://localhost:8080/proxy/' + expected
        }
    };
    referer({
        prefix: '/proxy/'
    })(data);
    t.equal(data.headers.referer, expected);
    t.end();
});
