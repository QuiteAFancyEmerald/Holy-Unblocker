#!/usr/bin/env node

var crypto = require('crypto');
var os = require('os');
var querystring = require('querystring');
var url = require('url');

var Cookies = require('cookies');

var settings = {
    hashes: [],
    redirect: '/',
};

module.exports = function(env) {
    for (var k in env) {
        settings[k] = env[k];
    }
    return module.exports;
};

module.exports.auth = function(req, res, next) {
    // Allow using with express as well as socket.io
    next = next || res;
    var cookies = new Cookies(req);
    var hash = cookies.get('session') ?
        module.exports.hash(cookies.get('session')) : '';
    if (settings.hashes.indexOf(hash) >= 0) {
        next();
    } else {
        next(new Error('Bad session key.'));
    }
};

module.exports.sign = function(req, res, next) {
    var cookies = new Cookies(req, res);
    var query = url.parse(req.url, true).query;
    cookies.set('session', query.key ? module.exports.hash(query.key) : null);
    res.writeHead(302, { location: query.path ? query.path : settings.redirect });
    res.end();
};

module.exports.generate = function() {
    var key = crypto.randomBytes(24).toString('base64');
    var hash = module.exports.hash(module.exports.hash(key));
    settings.hashes.push(hash);
    return { key: key, hash: hash };
};

module.exports.hash = function(key) {
    var hmac = crypto.createHmac('SHA256', key);
    hmac.update(key);
    return hmac.digest('base64');
};

if (require.main === module) {
    var pair = module.exports.generate();
    console.log('Call authlink.generate() for a keypair or add\n' +
        'authlink({hashes:[\'' + pair.hash + '\']})\n' +
        'and then authenticate on authlink.sign with the querystring\n?' +
        querystring.stringify({ key: pair.key }));
}