var http = require('http'),
    async = require('async'),
        PassThrough = require('stream').PassThrough,
        Unblocker = require('../lib/unblocker.js');


var unblocker = new Unblocker({});

function app(req, res) {
    // first let unblocker try to handle the requests
    unblocker(req, res, function(err) {
        // this callback will be fired for any request that unblocker does not serve
        var headers = {
            'content-type': 'text/plain'
        };
        if (err) {
            res.writeHead(500, headers);
            return res.end(err.stack || err.message);
        }
        if (req.url == '/') {
            res.writeHead(200, headers);
            return res.end('this is the home page');
        } else {
            res.writeHead(404, headers);
            return res.end('Error 404: file not found.');
        }
    });
}

/**
 * Creates two servers, a proxy instance and a remote server that serves up sourceContent
 * @param options|sourceContent
 *  - options is an object with one or more of {sourceContent,charset,remoteFn},
 *  or
 *  - sourceContent can be a buffer or string that is automatically served by the default remoteFn
 * @param next
 */
exports.getServers = function(options, next) {
    if (typeof options == 'string' || options instanceof Buffer) {
        options = {
            sourceContent: options
        };
    }

    function sendContent(req, res) {
        res.writeHead(200, {
            'content-type': 'text/html' + (options.charset ? '; charset=' + options.charset : '')
        });
        res.end(options.sourceContent);
    }

    options.remoteFn = options.remoteFn || sendContent;

    var proxyServer = http.createServer(app),
        remoteServer = http.createServer(options.remoteFn);

    proxyServer.setTimeout(5000);
    remoteServer.setTimeout(5000);

    async.parallel([
        proxyServer.listen.bind(proxyServer),
        remoteServer.listen.bind(remoteServer)
    ], function(err) {
        if (err) {
            return next(err);
        }
        var ret = {
            proxyServer: proxyServer,
            proxyPort: proxyServer.address().port,
            remoteServer: remoteServer,
            remotePort: remoteServer.address().port,
            kill: function(next) {
                async.parallel([
                    remoteServer.close.bind(remoteServer),
                    proxyServer.close.bind(proxyServer),
                ], next);
            }
        };
        ret.homeUrl = 'http://localhost:' + ret.proxyPort + '/';
        ret.proxiedUrl = ret.homeUrl + 'proxy/http://localhost:' + ret.remotePort + '/';
        next(null, ret);
    });
};

exports.getData = function() {
    return {
        url: 'http://example.com/',
        contentType: 'text/html',
        headers: {},
        stream: new PassThrough(),
        clientRequest: {},
        clientResponse: {},
        remoteRequest: {},
        remoteResponse: {
            statusCode: 200
        }
    };
};
