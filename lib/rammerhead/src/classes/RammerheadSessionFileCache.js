const fs = require('fs');
const path = require('path');
const RammerheadSessionAbstractStore = require('./RammerheadSessionAbstractStore');
const RammerheadSession = require('./RammerheadSession');
const RammerheadLogging = require('../classes/RammerheadLogging');

// rh = rammerhead. extra f to distinguish between rhsession (folder) and rhfsession (file)
const sessionFileExtension = '.rhfsession';

class RammerheadSessionFileCache extends RammerheadSessionAbstractStore {
    /**
     *
     * @param {object} options
     * @param {string} options.saveDirectory - all cacheTimeouted sessions will be saved in this folder
     * to avoid storing all the sessions in the memory.
     * @param {RammerheadLogging|undefined} options.logger
     * @param {number} options.cacheTimeout - timeout before saving cache to disk and deleting it from the cache
     * @param {number} options.cacheCheckInterval
     * @param {boolean} options.deleteUnused - (default: true) if set to true, it deletes unused sessions when saving cache to disk
     * @param {boolean} options.deleteCorruptedSessions - (default: true) if set to true, auto-deletes session files that
     * give a parse error (happens when nodejs exits abruptly while serializing session to disk)
     * @param {object|null} options.staleCleanupOptions - set to null to disable cleaning up stale sessions
     * @param {number|null} options.staleCleanupOptions.staleTimeout - stale sessions that are inside saveDirectory that go over
     * this timeout will be deleted. Set to null to disable.
     * @param {number|null} options.staleCleanupOptions.maxToLive - any created sessions that are older than this will be deleted no matter the usage.
     * Set to null to disable.
     * @param {number} options.staleCleanupOptions.staleCheckInterval
     */
    constructor({
        saveDirectory = path.join(__dirname, '../../sessions'),
        logger = new RammerheadLogging({ logLevel: 'disabled' }),
        cacheTimeout = 1000 * 60 * 20, // 20 minutes
        cacheCheckInterval = 1000 * 60 * 10, // 10 minutes,
        deleteUnused = true,
        deleteCorruptedSessions = true,
        staleCleanupOptions = {
            staleTimeout: 1000 * 60 * 60 * 24 * 1, // 1 day
            maxToLive: 1000 * 60 * 60 * 24 * 4, // four days
            staleCheckInterval: 1000 * 60 * 60 * 1 // 1 hour
        }
    } = {}) {
        super();
        this.saveDirectory = saveDirectory;
        this.logger = logger;
        this.deleteUnused = deleteUnused;
        this.cacheTimeout = cacheTimeout;
        this.deleteCorruptedSessions = deleteCorruptedSessions;
        /**
         * @type {Map.<string, RammerheadSession>}
         */
        this.cachedSessions = new Map();
        setInterval(() => this._saveCacheToDisk(), cacheCheckInterval).unref();
        if (staleCleanupOptions) {
            this._removeStaleSessions(staleCleanupOptions.staleTimeout, staleCleanupOptions.maxToLive);
            setInterval(
                () => this._removeStaleSessions(staleCleanupOptions.staleTimeout, staleCleanupOptions.maxToLive),
                staleCleanupOptions.staleCheckInterval
            ).unref();
        }
    }

    keysStore() {
        return fs
            .readdirSync(this.saveDirectory)
            .filter((file) => file.endsWith(sessionFileExtension))
            .map((file) => file.slice(0, -sessionFileExtension.length));
    }
    /**
     * @returns {string[]} - list of session ids in store
     */
    keys() {
        let arr = this.keysStore();
        for (const id of this.cachedSessions.keys()) {
            if (!arr.includes(id)) arr.push(id);
        }
        return arr;
    }
    /**
     * @param {string} id
     * @returns {boolean}
     */
    has(id) {
        return this.cachedSessions.has(id) || fs.existsSync(this._getSessionFilePath(id));
    }
    /**
     * @param {string} id
     * @param {boolean} updateActiveTimestamp
     * @returns {RammerheadSession|undefined}
     */
    get(id, updateActiveTimestamp = true, cacheToMemory = true) {
        if (!this.has(id)) {
            this.logger.debug(`(FileCache.get) ${id} does not exist`);
            return;
        }

        this.logger.debug(`(FileCache.get) ${id}`);
        if (this.cachedSessions.has(id)) {
            this.logger.debug(`(FileCache.get) returning memory cached session ${id}`);
            return this.cachedSessions.get(id);
        }

        let session;
        try {
            session = RammerheadSession.DeserializeSession(id, fs.readFileSync(this._getSessionFilePath(id)));
        } catch (e) {
            if (e.name === 'SyntaxError' && e.message.includes('JSON')) {
                this.logger.warn(`(FileCache.get) ${id} bad JSON`);
                if (this.deleteCorruptedSessions) {
                    this.delete(id);
                    this.logger.warn(`(FileCache.get) ${id} deleted because of bad JSON`);
            }
                return;
            }
        }

        if (updateActiveTimestamp) {
            this.logger.debug(`(FileCache.get) ${id} update active timestamp`);
            session.updateLastUsed();
        }

        if (cacheToMemory) {
            this.cachedSessions.set(id, session);
            this.logger.debug(`(FileCache.get) saved ${id} into cache memory`);
        }

        return session;
    }
    /**
     * @param {string} id
     * @returns {RammerheadSession}
     */
    add(id) {
        if (this.has(id)) throw new Error(`session ${id} already exists`);

        fs.writeFileSync(this._getSessionFilePath(id), new RammerheadSession().serializeSession());

        this.logger.debug(`FileCache.add ${id}`);

        return this.get(id);
    }
    /**
     * @param {string} id
     * @returns {boolean} - returns true when a delete operation is performed
     */
    delete(id) {
        this.logger.debug(`(FileCache.delete) deleting ${id}`);
        if (this.has(id)) {
            fs.unlinkSync(this._getSessionFilePath(id));
            this.cachedSessions.delete(id);
            this.logger.debug(`(FileCache.delete) deleted ${id}`);
            return true;
        }
        this.logger.debug(`(FileCache.delete) ${id} does not exist`);
        return false;
    }
    /**
     * @param {string} id
     * @param {string} serializedSession
     */
    addSerializedSession(id, serializedSession) {
        this.logger.debug(`(FileCache.addSerializedSession) adding serialized session id ${id} to store`);
        const session = RammerheadSession.DeserializeSession(id, serializedSession);
        fs.writeFileSync(this._getSessionFilePath(id), session.serializeSession());
        this.logger.debug(`(FileCache.addSerializedSession) added ${id} to cache`);
    }
    close() {
        this.logger.debug(`(FileCache.close) calling _saveCacheToDisk`);
        this._saveCacheToDisk(true);
    }

    /**
     * @private
     * @param {string} id
     * @returns {string} - generated file path to session
     */
    _getSessionFilePath(id) {
        return path.join(this.saveDirectory, id.replace(/\/|\\/g, '') + sessionFileExtension);
    }
    /**
     * @private
     * @param {number|null} staleTimeout
     * @param {number|null} maxToLive
     */
    _removeStaleSessions(staleTimeout, maxToLive) {
        const sessionIds = this.keysStore();
        let deleteCount = 0;
        this.logger.debug(`(FileCache._removeStaleSessions) Need to go through ${sessionIds.length} sessions in store`);

        const now = Date.now();
        for (const id of sessionIds) {
            const session = this.get(id, false, false);
            if (!session) {
                this.logger.debug(`(FileCache._removeStaleSessions) skipping ${id} as .get() returned undefined`);
                continue;
            }
            if (
                (staleTimeout && now - session.lastUsed > staleTimeout) ||
                (maxToLive && now - session.createdAt > maxToLive)
            ) {
                this.delete(id);
                deleteCount++;
                this.logger.debug(`(FileCache._removeStaleSessions) deleted ${id}`);
            }
        }

        this.logger.debug(`(FileCache._removeStaleSessions) Deleted ${deleteCount} sessions from store`);
    }
    /**
     * @private
     */
    _saveCacheToDisk(forceSave) {
        let deleteCount = 0;
        this.logger.debug(`(FileCache._saveCacheToDisk) need to go through ${this.cachedSessions.size} sessions`);

        const now = Date.now();
        for (const [sessionId, session] of this.cachedSessions) {
            if (forceSave || now - session.lastUsed > this.cacheTimeout) {
                if (session.lastUsed === session.createdAt && this.deleteUnused) {
                    this.cachedSessions.delete(sessionId);
                    deleteCount++;
                    this.logger.debug(`(FileCache._saveCacheToDisk) deleted unused ${sessionId} from memory`);
                } else {
                    fs.writeFileSync(this._getSessionFilePath(sessionId), session.serializeSession());
                    this.cachedSessions.delete(sessionId);
                    deleteCount++;
                    this.logger.debug(
                        `(FileCache._saveCacheToDisk) removed ${sessionId} from memory and saved to store`
                    );
                }
            }
        }

        this.logger.debug(`(FileCache._saveCacheToDisk) Removed ${deleteCount} sessions from memory`);
    }
}

module.exports = RammerheadSessionFileCache;
