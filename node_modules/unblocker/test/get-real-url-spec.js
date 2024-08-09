var it = require('tap').test,
    getRealUrl = require('../lib/get-real-url.js');

var config = {
    prefix: '/proxy/'
};

var instance = getRealUrl(config);

it("should extract the url", function(t) {
    t.equal(instance('/proxy/http://example.com/'), 'http://example.com/');
    t.end();
});

it("should extract incpmplete urls", function(t) {
    t.equal(instance('/proxy/example.com/'), 'example.com/');
    t.end();
});


it("should keep querystring data", function(t) {
    t.equal(instance('/proxy/http://example.com/?foo=bar'), 'http://example.com/?foo=bar');
    t.end();
});



it("should should fix merged slashes (http:/ instead of http://", function(t) {
    t.equal(instance('/proxy/http:/example.com/'), 'http://example.com/');
    t.equal(instance('/proxy/https:/example.com/'), 'https://example.com/');
    t.end();
});

it("should fix double-prefixed urls)", function(t) {
    t.equal(instance('/proxy/http://proxy/http://example.com/'), 'http://example.com/');
    t.equal(instance('/proxy/http:/proxy/http://example.com/'), 'http://example.com/');
    t.equal(instance('/proxy/https://proxy/https://example.com/'), 'https://example.com/');
    t.end();
});
