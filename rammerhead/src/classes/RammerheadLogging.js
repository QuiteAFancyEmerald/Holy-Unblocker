/**
 * @typedef {'disabled'|'debug'|'traffic'|'info'|'warn'|'error'} LoggingLevels
 */

const LOG_LEVELS = ['disabled', 'debug', 'traffic', 'info', 'warn', 'error'];

function defaultGeneratePrefix(level) {
    return `[${new Date().toISOString()}] [${level.toUpperCase()}] `;
}

class RammerheadLogging {
    /**
     * @param {object} options
     * @param {LoggingLevels} options.logLevel - logLevel to initialize the logger with
     * @param {(data: string) => void} options.logger - expects the logger to automatically add a newline, just like what console.log does
     * @param {*} options.loggerThis - logger will be called with loggerThis binded
     * @param {(level: LoggingLevels) => string} options.generatePrefix - generates a prefix before every log. set to null to disable
     */
    constructor({
        logLevel = 'info',
        logger = console.log,
        loggerThis = console,
        generatePrefix = defaultGeneratePrefix
    } = {}) {
        this.logger = logger;
        this.loggerThis = loggerThis;
        this.generatePrefix = generatePrefix;

        /**
         * @private
         */
        this._logRank = this._getLogRank(logLevel);
    }

    get logLevel() {
        return LOG_LEVELS[this._logRank];
    }
    /**
     * logger() will be called based on this log level
     * @param {LoggingLevels} level
     */
    set logLevel(level) {
        this._logRank = this._getLogRank(level);
    }
    callLogger(data) {
        this.logger.call(this.loggerThis, data);
    }
    /**
     * @param {LoggingLevels} level
     * @param {string} data
     */
    log(level, data) {
        const rank = this._getLogRank(level);
        // the higher the log level, the more important it is.
        // ensure it's not disabled
        if (rank && this._logRank <= rank) {
            this.callLogger((this.generatePrefix ? this.generatePrefix(level) : '') + data);
        }
    }
    debug = (data) => this.log('debug', data);
    traffic = (data) => this.log('traffic', data);
    info = (data) => this.log('info', data);
    warn = (data) => this.log('warn', data);
    error = (data) => this.log('error', data);

    /**
     * @private
     * @param {LoggingLevels} level
     * @returns {number}
     */
    _getLogRank(level) {
        const index = LOG_LEVELS.indexOf(level);
        if (index === -1) {
            throw new TypeError(`Invalid log level '${level}'. Valid log levels: ${LOG_LEVELS.join(', ')}`);
        }
        return index;
    }
}

module.exports = RammerheadLogging;
