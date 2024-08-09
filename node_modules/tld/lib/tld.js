var FS = require('fs');
var HTTP = require('http');
var Path = require('path');
var URL = require('url');

var protocolInfo = {
    'http:': {
        name: 'http',
        port: 80,
        secure: false
    },
    'https:': {
        name: 'https',
        port: 443,
        secure: true
    }
};

function loadURL(url, callback) {
    url = URL.parse(url);
    var protocol = protocolInfo[url.protocol];
    if (!protocol) throw 'unsupported protocol: ' + url.protocol;
    var port = url.port || protocol.port;
    if (!port || port < 0) throw 'unknown or illegal port';
    var source = HTTP.createClient(port, url.hostname, protocol.secure);
    var request = source.request('GET', url.pathname + (url.search ? url.search : ''), {
        'host': url.hostname
    });
    request.end();
    request.on('response', function(response) {
        var chunks = [];
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            chunks.push(chunk);
        });
        response.on('end', function () {
            callback(response.statusCode == 200 ? chunks.join('') : null);
        });
    });
}

function parseTLDs(data) {
    var tlds = {};
    if (data) {
        var lines = data.split(/\n/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line) {
                var comment = line.indexOf('//');
                if (comment == 0) {
                    continue;
                } else if (comment > 0) {
                    line = line.substring(0, comment);
                }
                var tld = line.replace(/\s/g, '');
                if (tld) {
                    var parts = tld.split('.');
                    var part0 = parts[0];
                    if (part0) {
                        var n = parts.length;
                        if (part0.charAt(0) == '!') {
                            parts[0] = part0.substring(1);
                        } else {
                            if (part0 == '*') {
                                parts.shift();
                            }
                            n++;
                        }
                        tld = parts.join('.');
                        tlds[tld] = n;
                    }
                }
            }
        }
    }
    return tlds;
}

function registeredDomain(domain, tlds) {
    var parts = domain.split('.'),
        extra = [];
    while (parts.length > 0) {
        var n = tlds[parts.join('.')];
        if (n) {
            while (parts.length < n && extra.length > 0) {
                parts.unshift(extra.pop());
            }
            return parts.join('.');
        } else {
            extra.push(parts.shift());
        }
    }
    return null;
}

function loadFromFile(path) {
    return parseTLDs(FS.readFileSync(path, 'utf8'));
}

function loadFromURL(url, path, callback) {
    loadURL(url, function(data) {
        if (data) {
            callback(parseTLDS(data));
            if (path) {
                FS.writeFileSync(path, data, 'utf8');
            }
        }
    });
}

var tlds = null;

exports.defaultURL = 'http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1';
exports.defaultFile = Path.join(__dirname, 'effective_tld_names.dat');

exports.registered = function(domain) {
    if (!tlds) {
        tlds = loadFromFile(exports.defaultFile);
    }
    return registeredDomain(domain, tlds);
};

exports.load = function (path) {
    path = path || exports.defaultFile;
    tlds = loadFromFile(path);
};

exports.download = function (url, path) {
    url = url || exports.defaultURL;
    path = path || exports.defaultFile;
    loadFromURL(url, path, function (data) {
        tlds = data;
    });
};
