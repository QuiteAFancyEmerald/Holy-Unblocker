var redirect = require('../lib/redirects.js');
var test = require('tap').test;

test('should correctly redirect with http://', function(t) {
    var expected = 'http://foobar.com/proxy/http://example.com/not-a-test/';
    var data = {
        url: 'http://example.com/test/',
        headers: {
            location: 'http://example.com/not-a-test/'
        },
        clientRequest: {
            thisSite: function() {
                return 'http://foobar.com/proxy/';
            }
        }
    };
    redirect()(data);
    t.equal(data.headers.location, expected);
    t.end();
});

test('should correctly redirect with //', function(t) {
    var expected = 'http://foobar.com/proxy/http://example.com/not-a-test/';
    var data = {
        url: 'http://example.com/test/',
        headers: {
            location: '//example.com/not-a-test/'
        },
        clientRequest: {
            thisSite: function() {
                return 'http://foobar.com/proxy/';
            }
        }
    };
    redirect()(data);
    t.equal(data.headers.location, expected);
    t.end();
});

test('should correctly redirect with // and https', function(t) {
    var expected = 'http://foobar.com/proxy/https://example.com/not-a-test/';
    var data = {
        url: 'https://example.com/test/',
        headers: {
            location: '//example.com/not-a-test/'
        },
        clientRequest: {
            thisSite: function() {
                return 'http://foobar.com/proxy/';
            }
        }
    };
    redirect()(data);
    t.equal(data.headers.location, expected);
    t.end();
});
