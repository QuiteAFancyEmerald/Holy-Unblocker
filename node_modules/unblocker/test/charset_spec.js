'use strict';

var test = require('tap').test;
var fs = require('fs');
var crypto = require('crypto');
var http = require('http');
var concat = require('concat-stream');
var getServers = require('./test_utils.js').getServers;


// source is http://qa-dev.w3.org/wmvs/HEAD/dev/tests/xhtml-windows-1250.xhtml which is linked to from http://validator.w3.org/dev/tests/#encoding
var source = fs.readFileSync(__dirname + '/source/xhtml-windows-1250.xhtml');
var expected = fs.readFileSync(__dirname + '/expected/xhtml-windows-1250-converted-to-utf-8.xhtml');

// first validate that the IDE or whatever didn't change the file encoding
var SOURCE_HASH = '11f694099b205b26a19648ab22602b39c6deb125';
var EXPECTED_HASH = '4a04a0aa660da6f0eec9534c0e25212a7045ea7c';
test("source and expected xhtml-windows-1250.xhtml files should not have changed", function(t) {
    t.equal(crypto.createHash('sha1').update(source).digest('hex'), SOURCE_HASH);
    t.equal(crypto.createHash('sha1').update(expected).digest('hex'), EXPECTED_HASH);
    t.end();
});

test("should properly decode and update non-native charsets when charset is in header", function(t) {
    t.plan(1);
    getServers({
        sourceContent: source,
        charset: 'windows-1250'
    }, function(err, servers) {
        http.get(servers.proxiedUrl, function(res) {
            res.pipe(concat(function(actual) {
                servers.kill();
                t.same(actual, expected);
            }));
        }).on('error', function(e) {
            t.bailout(e);
        });
    });
});

test("should properly decode and update charsets when charset is in body", function(t) {
    t.plan(1);
    getServers(source, function(err, servers) {
        http.get(servers.proxiedUrl, function(res) {
            res.pipe(concat(function(actual) {
                servers.kill();
                t.same(actual, expected);
            }));
        }).on('error', function(e) {
            t.bailout(e);
        });
    });
});

test("should still work when charset can be determined", function(t) {
    t.plan(1);
    var source = '<h1>test</h1>',
        expected = '<h1>test</h1>';
    getServers(source, function(err, servers) {
        http.get(servers.proxiedUrl, function(res) {
            res.pipe(concat(function(actual) {
                servers.kill();
                t.same(actual.toString(), expected);
            }));
        }).on('error', function(e) {
            t.bailout(e);
        });
    });
});
