const webpack = require('webpack');
const createWebSocketProxy = require('./upgrade');
const createRequestProxy = require('./request');
const createGateway = require('./gateway');
const middleware = {
    ...require('./headers'),
    ...require('./middleware'),
    decompress: require('./decompress'),
    rewriteBody: require('./rewrite-body'),
};
const path = require('path');
const fs = require('fs');
const defaultConfig = {
    prefix: '/service/',
    codec: 'plain',
    forceHttps: false,
    ws: true,
    cookie: true,
    title: 'Service',
    requestMiddleware: [],
    responseMiddleware: [],
    standardMiddleware: true,
};  

class Corrosion extends require('../rewrite') {
    constructor(config = defaultConfig) {
        super(Object.assign(defaultConfig, config));
        if (this.config.standardMiddleware) {
            this.config.requestMiddleware.unshift(
                middleware.requestHeaders,
            );  
            this.config.responseMiddleware.unshift(
                middleware.responseHeaders,
                middleware.decompress,
                middleware.rewriteBody,
            );
        };
        this.gateway = createGateway(this);
        this.upgrade = createWebSocketProxy(this);
        this.request = createRequestProxy(this);
        if (!fs.existsSync(path.join(__dirname, 'bundle.js'))) this.bundleScripts();
    }; 
    bundleScripts() {
        webpack({
            mode: 'none',
            entry: path.join(__dirname, '../../lib/browser/index.js'),
            output: {
                path: __dirname,
                filename: 'bundle.js',
            }
        }, err => 
            console.log(err || 'Bundled scripts')
        );
    };
    get script() {
        return fs.existsSync(path.join(__dirname, 'bundle.js')) ? fs.readFileSync(path.join(__dirname, 'bundle.js')) : 'Client script is still compiling or has crashed.'
    };
};

Corrosion.middleware = middleware;
module.exports = Corrosion;