const http = require('http');
const https = require('https');
const stream = require('stream');
const fs = require('fs');
const path = require('path');
const { getPathname } = require('testcafe-hammerhead/lib/utils/url');
const { Proxy } = require('testcafe-hammerhead');
const WebSocket = require('ws');
const httpResponse = require('../util/httpResponse');
const streamToString = require('../util/streamToString');
const URLPath = require('../util/URLPath');
const RammerheadLogging = require('../classes/RammerheadLogging');

require('../util/fixCorsHeader');
require('../util/fixWebsocket');
require('../util/addMoreErrorGuards');
require('../util/addUrlShuffling');
require('../util/patchAsyncResourceProcessor');
let addJSDiskCache = function (path, size) {
    require('../util/addJSDiskCache')(path, size);
    // modification only works once
    addJSDiskCache = () => {};
};

/**
 * taken directly from
 * https://github.com/DevExpress/testcafe-hammerhead/blob/a9fbf7746ff347f7bdafe1f80cf7135eeac21e34/src/typings/proxy.d.ts#L1
 * @typedef {object} ServerInfo
 * @property {string} hostname
 * @property {number} port
 * @property {number} crossDomainPort
 * @property {string} protocol
 * @property {string} domain
 * @property {boolean} cacheRequests
 */

/**
 * @typedef {object} RammerheadServerInfo
 * @property {string} hostname
 * @property {number} port
 * @property {'https:'|'http:'} protocol
 */

/**
 * @private
 * @typedef {import('./RammerheadSession')} RammerheadSession
 */

/**
 * wrapper for hammerhead's Proxy
 */
class RammerheadProxy extends Proxy {
    /**
     *
     * @param {object} options
     * @param {RammerheadLogging|undefined} options.logger
     * @param {(req: http.IncomingMessage) => string} options.loggerGetIP - use custom logic to get IP, either from headers or directly
     * @param {string} options.bindingAddress - hostname for proxy to bind to
     * @param {number} options.port - port for proxy to listen to
     * @param {number|null} options.crossDomainPort - crossDomain port to simulate cross origin requests. set to null
     * to disable using this. highly not recommended to disable this because it breaks sites that check for the origin header
     * @param {boolean} options.dontListen - avoid calling http.listen() if you need to use sticky-session to load balance
     * @param {http.ServerOptions} options.ssl - set to null to disable ssl
     * @param {(req: http.IncomingMessage) => RammerheadServerInfo} options.getServerInfo - force hammerhead to rewrite using specified
     * server info (server info includes hostname, port, and protocol). Useful for a reverse proxy setup like nginx where you
     * need to rewrite the hostname/port/protocol
     * @param {boolean} options.disableLocalStorageSync - disables localStorage syncing (default: false)
     * @param {string} options.diskJsCachePath - set to null to disable disk cache and use memory instead (disabled by default)
     * @param {number} options.jsCacheSize - in bytes. default: 50mb
     */
    constructor({
        loggerGetIP = (req) => req.socket.remoteAddress,
        logger = new RammerheadLogging({ logLevel: 'disabled' }),
        bindingAddress = '127.0.0.1',
        port = 8080,
        crossDomainPort = 8081,
        dontListen = false,
        ssl = null,
        getServerInfo = (req) => {
            const { hostname, port } = new URL('http://' + req.headers.host);
            return {
                hostname,
                port,
                protocol: req.socket.encrypted ? 'https:' : 'http:'
            };
        },
        disableLocalStorageSync = false,
        diskJsCachePath = null,
        jsCacheSize = 50 * 1024 * 1024
    } = {}) {
        if (!crossDomainPort) {
            const httpOrHttps = ssl ? https : http;
            const proxyHttpOrHttps = http;
            const originalProxyCreateServer = proxyHttpOrHttps.createServer;
            const originalCreateServer = httpOrHttps.createServer; // handle recursion case if proxyHttpOrHttps and httpOrHttps are the same
            let onlyOneHttpServer = null;

            // a hack to force testcafe-hammerhead's proxy library into using only one http port.
            // a downside to using only one proxy server is that crossdomain requests
            // will not be simulated correctly
            proxyHttpOrHttps.createServer = function (...args) {
                const emptyFunc = () => {};
                if (onlyOneHttpServer) {
                    // createServer for server1 already called. now we return a mock http server for server2
                    return { on: emptyFunc, listen: emptyFunc, close: emptyFunc };
                }
                if (args.length !== 2) throw new Error('unexpected argument length coming from hammerhead');
                return (onlyOneHttpServer = originalCreateServer(...args));
            };

            // now, we force the server to listen to a specific port and a binding address, regardless of what
            // hammerhead server.listen(anything)
            const originalListen = http.Server.prototype.listen;
            http.Server.prototype.listen = function (_proxyPort) {
                if (dontListen) return;
                originalListen.call(this, port, bindingAddress);
            };

            // actual proxy initialization
            // the values don't matter (except for developmentMode), since we'll be rewriting serverInfo anyway
            super('hostname', 'port', 'port', {
                ssl,
                developmentMode: true,
                cache: true
            });

            // restore hooked functions to their original state
            proxyHttpOrHttps.createServer = originalProxyCreateServer;
            http.Server.prototype.listen = originalListen;
        } else {
            // just initialize the proxy as usual, since we don't need to do hacky stuff like the above.
            // we still need to make sure the proxy binds to the correct address though
            const originalListen = http.Server.prototype.listen;
            http.Server.prototype.listen = function (portArg) {
                if (dontListen) return;
                originalListen.call(this, portArg, bindingAddress);
            };
            super('doesntmatter', port, crossDomainPort, {
                ssl,
                developmentMode: true,
                cache: true
            });
            this.crossDomainPort = crossDomainPort;
            http.Server.prototype.listen = originalListen;
        }

        this._setupRammerheadServiceRoutes();
        this._setupLocalStorageServiceRoutes(disableLocalStorageSync);

        this.onRequestPipeline = [];
        this.onUpgradePipeline = [];
        this.websocketRoutes = [];
        this.rewriteServerHeaders = {
            'permissions-policy': (headerValue) => headerValue && headerValue.replace(/sync-xhr/g, 'sync-yes'),
            'feature-policy': (headerValue) => headerValue && headerValue.replace(/sync-xhr/g, 'sync-yes'),
            'referrer-policy': () => 'no-referrer-when-downgrade',
            'report-to': () => undefined,
            'cross-origin-embedder-policy': () => undefined
        };

        this.getServerInfo = getServerInfo;
        this.serverInfo1 = null; // make sure no one uses these serverInfo
        this.serverInfo2 = null;

        this.loggerGetIP = loggerGetIP;
        this.logger = logger;

        addJSDiskCache(diskJsCachePath, jsCacheSize);
    }

    // add WS routing
    /**
     * since we have .GET and .POST, why not add in a .WS also
     * @param {string|RegExp} route - can be '/route/to/things' or /^\\/route\\/(this)|(that)\\/things$/
     * @param {(ws: WebSocket, req: http.IncomingMessage) => WebSocket} handler - ws is the connection between the client and the server
     * @param {object} websocketOptions - read https://www.npmjs.com/package/ws for a list of Websocket.Server options. Note that
     * the { noServer: true } will always be applied
     * @returns {WebSocket.Server}
     */
    WS(route, handler, websocketOptions = {}) {
        if (this.checkIsRoute(route)) {
            throw new TypeError('WS route already exists');
        }

        const wsServer = new WebSocket.Server({
            ...websocketOptions,
            noServer: true
        });
        this.websocketRoutes.push({ route, handler, wsServer });

        return wsServer;
    }
    unregisterWS(route) {
        if (!this.getWSRoute(route, true)) {
            throw new TypeError('websocket route does not exist');
        }
    }
    /**
     * @param {string} path
     * @returns {{ route: string|RegExp, handler: (ws: WebSocket, req: http.IncomingMessage) => WebSocket, wsServer: WebSocket.Server}|null}
     */
    getWSRoute(path, doDelete = false) {
        for (let i = 0; i < this.websocketRoutes.length; i++) {
            if (
                (typeof this.websocketRoutes[i].route === 'string' && this.websocketRoutes[i].route === path) ||
                (this.websocketRoutes[i] instanceof RegExp && this.websocketRoutes[i].route.test(path))
            ) {
                const route = this.websocketRoutes[i];
                if (doDelete) {
                    this.websocketRoutes.splice(i, 1);
                    i--;
                }
                return route;
            }
        }
        return null;
    }
    /**
     * @private
     */
    _WSRouteHandler(req, socket, head) {
        const route = this.getWSRoute(req.url);
        if (route) {
            // RH stands for rammerhead. RHROUTE is a custom implementation by rammerhead that is
            // unrelated to hammerhead
            this.logger.traffic(`WSROUTE UPGRADE ${this.loggerGetIP(req)} ${req.url}`);
            route.wsServer.handleUpgrade(req, socket, head, (client, req) => {
                this.logger.traffic(`WSROUTE OPEN ${this.loggerGetIP(req)} ${req.url}`);
                client.once('close', () => {
                    this.logger.traffic(`WSROUTE CLOSE ${this.loggerGetIP(req)} ${req.url}`);
                });
                route.handler(client, req);
            });
            return true;
        }
    }

    // manage pipelines //
    /**
     * @param {(req: http.IncomingMessage,
     *          res: http.ServerResponse,
     *          serverInfo: ServerInfo,
     *          isRoute: boolean,
     *          isWebsocket: boolean) => Promise<boolean>} onRequest - return true to terminate handoff to proxy.
     * There is an isWebsocket even though there is an onUpgrade pipeline already. This is because hammerhead
     * processes the onUpgrade and then passes it directly to onRequest, but without the "head" Buffer argument.
     * The onUpgrade pipeline is to solve that lack of the "head" argument issue in case one needs it.
     * @param {boolean} beginning - whether to add it to the beginning of the pipeline
     */
    addToOnRequestPipeline(onRequest, beginning = false) {
        if (beginning) {
            this.onRequestPipeline.push(onRequest);
        } else {
            this.onRequestPipeline.unshift(onRequest);
        }
    }
    /**
     * @param {(req: http.IncomingMessage,
     *          socket: stream.Duplex,
     *          head: Buffer,
     *          serverInfo: ServerInfo,
     *          isRoute: boolean) => Promise<boolean>} onUpgrade - return true to terminate handoff to proxy
     * @param {boolean} beginning - whether to add it to the beginning of the pipeline
     */
    addToOnUpgradePipeline(onUpgrade, beginning = false) {
        if (beginning) {
            this.onUpgradePipeline.push(onUpgrade);
        } else {
            this.onUpgradePipeline.unshift(onUpgrade);
        }
    }

    // override hammerhead's proxy functions to use the pipeline //
    checkIsRoute(req) {
        if (req instanceof RegExp) {
            return !!this.getWSRoute(req);
        }
        // code modified from
        // https://github.com/DevExpress/testcafe-hammerhead/blob/879d6ae205bb711dfba8c1c88db635e8803b8840/src/proxy/router.ts#L95
        const routerQuery = `${req.method} ${getPathname(req.url || '')}`;
        const route = this.routes.get(routerQuery);
        if (route) {
            return true;
        }
        for (const routeWithParams of this.routesWithParams) {
            const routeMatch = routerQuery.match(routeWithParams.re);
            if (routeMatch) {
                return true;
            }
        }
        return !!this.getWSRoute(req.url);
    }
    /**
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     * @param {ServerInfo} serverInfo
     */
    async _onRequest(req, res, serverInfo) {
        serverInfo = this._rewriteServerInfo(req);

        const isWebsocket = res instanceof stream.Duplex;

        if (!isWebsocket) {
            // strip server headers
            const originalWriteHead = res.writeHead;
            const self = this;
            res.writeHead = function (statusCode, statusMessage, headers) {
                if (!headers) {
                    headers = statusMessage;
                    statusMessage = undefined;
                }

                if (headers) {
                    const alreadyRewrittenHeaders = [];
                    if (Array.isArray(headers)) {
                        // [content-type, text/html, headerKey, headerValue, ...]
                        for (let i = 0; i < headers.length - 1; i += 2) {
                            const header = headers[i].toLowerCase();
                            if (header in self.rewriteServerHeaders) {
                                alreadyRewrittenHeaders.push(header);
                                headers[i + 1] =
                                    self.rewriteServerHeaders[header] &&
                                    self.rewriteServerHeaders[header](headers[i + 1]);
                                if (!headers[i + 1]) {
                                    headers.splice(i, 2);
                                    i -= 2;
                                }
                            }
                        }
                        for (const header in self.rewriteServerHeaders) {
                            if (alreadyRewrittenHeaders.includes(header)) continue;
                            // if user wants to add headers, they can do that here
                            const value = self.rewriteServerHeaders[header] && self.rewriteServerHeaders[header]();
                            if (value) {
                                headers.push(header, value);
                            }
                        }
                    } else {
                        for (const header in headers) {
                            if (header in self.rewriteServerHeaders) {
                                alreadyRewrittenHeaders.push(header);
                                headers[header] =
                                    self.rewriteServerHeaders[header] && self.rewriteServerHeaders[header]();
                                if (!headers[header]) {
                                    delete headers[header];
                                }
                            }
                        }
                        for (const header in self.rewriteServerHeaders) {
                            if (alreadyRewrittenHeaders.includes(header)) continue;
                            const value = self.rewriteServerHeaders[header] && self.rewriteServerHeaders[header]();
                            if (value) {
                                headers[header] = value;
                            }
                        }
                    }
                }

                if (statusMessage) {
                    originalWriteHead.call(this, statusCode, statusMessage, headers);
                } else {
                    originalWriteHead.call(this, statusCode, headers);
                }
            };
        }

        const isRoute = this.checkIsRoute(req);
        const ip = this.loggerGetIP(req);

        this.logger.traffic(`${isRoute ? 'ROUTE ' : ''}${ip} ${req.url}`);
        for (const handler of this.onRequestPipeline) {
            if ((await handler.call(this, req, res, serverInfo, isRoute, isWebsocket)) === true) {
                return;
            }
        }
        // hammerhead's routing does not support websockets. Allowing it
        // will result in an error thrown
        if (isRoute && isWebsocket) {
            httpResponse.badRequest(this.logger, req, res, ip, 'Rejected unsupported websocket request');
            return;
        }
        super._onRequest(req, res, serverInfo);
    }
    /**
     * @param {http.IncomingMessage} req
     * @param {stream.Duplex} socket
     * @param {Buffer} head
     * @param {ServerInfo} serverInfo
     */
    async _onUpgradeRequest(req, socket, head, serverInfo) {
        serverInfo = this._rewriteServerInfo(req);
        for (const handler of this.onUpgradePipeline) {
            const isRoute = this.checkIsRoute(req);
            if ((await handler.call(this, req, socket, head, serverInfo, isRoute)) === true) {
                return;
            }
        }
        if (this._WSRouteHandler(req, socket, head)) return;
        super._onUpgradeRequest(req, socket, head, serverInfo);
    }

    /**
     * @private
     * @param {http.IncomingMessage} req
     * @returns {ServerInfo}
     */
    _rewriteServerInfo(req) {
        const serverInfo = this.getServerInfo(req);
        return {
            hostname: serverInfo.hostname,
            port: serverInfo.port,
            crossDomainPort: serverInfo.crossDomainPort || this.crossDomainPort || serverInfo.port,
            protocol: serverInfo.protocol,
            domain: `${serverInfo.protocol}//${serverInfo.hostname}:${serverInfo.port}`,
            cacheRequests: false
        };
    }
    /**
     * @private
     */
    _setupRammerheadServiceRoutes() {
        this.GET('/rammerhead.js', {
            content: fs.readFileSync(
                path.join(__dirname, '../client/rammerhead' + (process.env.DEVELOPMENT ? '.js' : '.min.js'))
            ),
            contentType: 'application/x-javascript'
        });
        this.GET('/api/shuffleDict', (req, res) => {
            const { id } = new URLPath(req.url).getParams();
            if (!id || !this.openSessions.has(id)) {
                return httpResponse.badRequest(this.logger, req, res, this.loggerGetIP(req), 'Invalid session id');
            }
            res.end(JSON.stringify(this.openSessions.get(id).shuffleDict) || '');
        });
    }
    /**
     * @private
     */
    _setupLocalStorageServiceRoutes(disableSync) {
        this.POST('/syncLocalStorage', async (req, res) => {
            if (disableSync) {
                res.writeHead(404);
                res.end('server disabled localStorage sync');
                return;
            }
            const badRequest = (msg) => httpResponse.badRequest(this.logger, req, res, this.loggerGetIP(req), msg);
            const respondJson = (obj) => res.end(JSON.stringify(obj));
            const { sessionId, origin } = new URLPath(req.url).getParams();

            if (!sessionId || !this.openSessions.has(sessionId)) {
                return badRequest('Invalid session id');
            }
            if (!origin) {
                return badRequest('Invalid origin');
            }

            let parsed;
            try {
                parsed = JSON.parse(await streamToString(req));
            } catch (e) {
                return badRequest('bad client body');
            }

            const now = Date.now();
            const session = this.openSessions.get(sessionId, false);
            if (!session.data.localStorage) session.data.localStorage = {};

            switch (parsed.type) {
                case 'sync':
                    if (parsed.fetch) {
                        // client is syncing for the first time
                        if (!session.data.localStorage[origin]) {
                            // server does not have any data on origin, so create an empty record
                            // and send an empty object back
                            session.data.localStorage[origin] = { data: {}, timestamp: now };
                            return respondJson({
                                timestamp: now,
                                data: {}
                            });
                        } else {
                            // server does have data, so send data back
                            return respondJson({
                                timestamp: session.data.localStorage[origin].timestamp,
                                data: session.data.localStorage[origin].data
                            });
                        }
                    } else {
                        // sync server and client localStorage

                        parsed.timestamp = parseInt(parsed.timestamp);
                        if (isNaN(parsed.timestamp)) return badRequest('must specify valid timestamp');
                        if (parsed.timestamp > now) return badRequest('cannot specify timestamp in the future');
                        if (!parsed.data || typeof parsed.data !== 'object')
                            return badRequest('data must be an object');

                        for (const prop in parsed.data) {
                            if (typeof parsed.data[prop] !== 'string') {
                                return badRequest('data[prop] must be a string');
                            }
                        }

                        if (!session.data.localStorage[origin]) {
                            // server does not have data, so use client's
                            session.data.localStorage[origin] = { data: parsed.data, timestamp: now };
                            return respondJson({});
                        } else if (session.data.localStorage[origin].timestamp <= parsed.timestamp) {
                            // server data is either the same as client or outdated, but we
                            // sync even if timestamps are the same in case the client changed the localStorage
                            // without updating
                            session.data.localStorage[origin].data = parsed.data;
                            session.data.localStorage[origin].timestamp = parsed.timestamp;
                            return respondJson({});
                        } else {
                            // client data is stale
                            return respondJson({
                                timestamp: session.data.localStorage[origin].timestamp,
                                data: session.data.localStorage[origin].data
                            });
                        }
                    }
                case 'update':
                    if (!session.data.localStorage[origin])
                        return badRequest('must perform sync first on a new origin');
                    if (!parsed.updateData || typeof parsed.updateData !== 'object')
                        return badRequest('updateData must be an object');
                    for (const prop in parsed.updateData) {
                        if (!parsed.updateData[prop] || typeof parsed.updateData[prop] !== 'string')
                            return badRequest('updateData[prop] must be a non-empty string');
                    }
                    for (const prop in parsed.updateData) {
                        session.data.localStorage[origin].data[prop] = parsed.updateData[prop];
                    }
                    session.data.localStorage[origin].timestamp = now;
                    return respondJson({
                        timestamp: now
                    });
                default:
                    return badRequest('unknown type ' + parsed.type);
            }
        });
    }

    openSession() {
        throw new TypeError('unimplemented. please use a RammerheadSessionStore and use their .add() method');
    }
    close() {
        super.close();
        this.openSessions.close();
    }

    /**
     * @param {string} route
     * @param {StaticContent | (req: http.IncomingMessage, res: http.ServerResponse) => void} handler
     */
    GET(route, handler) {
        if (route === '/hammerhead.js') {
            handler.content = fs.readFileSync(
                path.join(__dirname, '../client/hammerhead' + (process.env.DEVELOPMENT ? '.js' : '.min.js'))
            );
        }
        super.GET(route, handler);
    }

    // the following is to fix hamerhead's typescript definitions
    /**
     * @param {string} route
     * @param {StaticContent | (req: http.IncomingMessage, res: http.ServerResponse) => void} handler
     */
    POST(route, handler) {
        super.POST(route, handler);
    }
}

module.exports = RammerheadProxy;
