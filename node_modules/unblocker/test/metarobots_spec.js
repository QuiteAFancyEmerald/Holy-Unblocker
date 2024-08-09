var test = require('tap').test,
    concat = require('concat-stream');

var metaRobots = require('../lib/meta-robots.js');

var head = '<html><head><title>test</title></head>';
var body = '<body><p>asdf</p></body></html>';

test("should add a meta tag to the head", function(t) {
    var expected = '<html><head><title>test</title><meta name="ROBOTS" content="NOINDEX, NOFOLLOW"/>\n</head>';
    var stream = metaRobots().createStream();
    stream.setEncoding('utf8');
    stream.pipe(concat(function(actual) {
        t.equal(actual, expected);
        t.end();
    }));
    stream.end(head);
});


test("should do nothing to the body", function(t) {
    var expected = body;
    var stream = metaRobots().createStream();
    stream.setEncoding('utf8');
    stream.pipe(concat(function(actual) {
        t.equal(actual, expected);
        t.end();
    }));
    stream.end(body);
});
