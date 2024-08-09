var cp = require('child_process'),
    assert = require('assert'),
    http = require('http'),
    request = require('request'),
    gatlingPath = __dirname + '/../gatling';

describe("Gatling", function() {
    it("should start the test server and send a {type: 'ready'} message", function(done) {
        var g = cp.fork(gatlingPath, ['./test/app.js', '--quiet']).once('message', function(msg) {
            assert('ready', msg.type);
            g.on('close', function() {
                done();
            });
            g.kill();
        });
    });

    it("should allow the app to respond to requests", function(done) {
        var g = cp.fork(gatlingPath, ['./test/app.js', '--quiet']).once('message', function(msg) {
            request('http://localhost:8080/ok', function(err, data) {
                if (err) return done(err);

                assert('ok', data);

                g.on('close', function() {
                    done();
                });
                g.kill();
            });
        });
    });

    it("should not allow errors in one request to kill another request", function(done) {
        var g = cp.fork(gatlingPath, ['./test/app.js', '--quiet']).once('message', function(msg) {
            request('http://localhost:8080/slow', function(err, data) {
                if (err) return done(err);

                assert('ok', data);

                g.on('close', function() {
                    done();
                });
                g.kill();
            });

            request('http://localhost:8080/error', function(err, data) {

            });
        });
    });

    it("should bring up new workers after one dies", function(done) {
        var g = cp.fork(gatlingPath, ['./test/app.js', '--quiet']).once('message', function(msg) {
            request('http://localhost:8080/error', function(err, data) {
                request('http://localhost:8080/ok', function(err, data) {
                    if (err) return done(err);

                    assert('ok', data);

                    g.on('close', function() {
                        done();
                    });
                    g.kill();
                });
            });

        });
    });


    it("should handle situations where app.bind !== Function.prototype.bind", function(done) {
        var g = cp.fork(gatlingPath, ['./test/app-bind.js', '--quiet']).once('message', function(msg) {
            request('http://localhost:8080/ok', function(err, data) {
                if (err) return done(err);

                assert('ok', data);

                g.on('close', function() {
                    done();
                });
                g.kill();
            });
        });
    });
});
