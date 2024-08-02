const exitHook = require('async-exit-hook');
const RammerheadProxy = require('../classes/RammerheadProxy');
const addStaticDirToProxy = require('../util/addStaticDirToProxy');
const RammerheadSessionFileCache = require('../classes/RammerheadSessionFileCache');
const config = require('../config');
const setupRoutes = require('./setupRoutes');
const setupPipeline = require('./setupPipeline');
const RammerheadLogging = require('../classes/RammerheadLogging');

/**
 *
 * @returns {import('node:http').Server}
 */
function createRammerhead() {
    require.main = module;

    const logger = new RammerheadLogging({
        logLevel: config.logLevel,
        generatePrefix: (level) => config.generatePrefix(level)
    });

    const proxyServer = new RammerheadProxy({
        logger,
        loggerGetIP: config.getIP,
        bindingAddress: config.bindingAddress,
        port: config.port,
        crossDomainPort: null,
        dontListen: true,
        ssl: config.ssl,
        getServerInfo: config.getServerInfo,
        disableLocalStorageSync: config.disableLocalStorageSync,
        diskJsCachePath: config.diskJsCachePath,
        jsCacheSize: config.jsCacheSize
    });

    if (config.publicDir) addStaticDirToProxy(proxyServer, config.publicDir);

    const fileCacheOptions = { logger, ...config.fileCacheSessionConfig };
    const sessionStore = new RammerheadSessionFileCache(fileCacheOptions);
    sessionStore.attachToProxy(proxyServer);

    setupPipeline(proxyServer, sessionStore);
    setupRoutes(proxyServer, sessionStore, logger);

    // nicely close proxy server and save sessions to store before we exit
    exitHook(() => {
        proxyServer.close();
    });

    return proxyServer.server1;
}

module.exports = createRammerhead;
