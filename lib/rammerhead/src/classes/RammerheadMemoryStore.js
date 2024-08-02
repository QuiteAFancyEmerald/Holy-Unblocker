const RammerheadLogging = require('./RammerheadLogging');
const RammerheadSession = require('./RammerheadSession');
const RammerheadSessionAbstractStore = require('./RammerheadSessionAbstractStore');

class RammerheadSessionMemoryStore extends RammerheadSessionAbstractStore {
    /**
     * @param {object} options
     * @param {RammerheadLogging|undefined} options.logger
     * @param {number|null} options.staleTimeout - if inactivity goes beyond this, then the session is deleted. null to disable
     * @param {number|null} options.maxToLive - if now - createdAt surpasses maxToLive, then the session is deleted. null to disable
     * @param {number} options.cleanupInterval - every cleanupInterval ms will run a cleanup check
     */
    constructor({
        logger = new RammerheadLogging({ logLevel: 'disabled' }),
        staleTimeout = 1000 * 60 * 30, // 30 minutes
        maxToLive = 1000 * 60 * 60 * 4, // 4 hours
        cleanupInterval = 1000 * 60 * 1 // 1 minute
    } = {}) {
        super();
        this.logger = logger;
        this.mapStore = new Map();
        setInterval(() => this._cleanupRun(staleTimeout, maxToLive), cleanupInterval).unref();
    }

    /**
     * @returns {string[]} - list of session ids in store
     */
    keys() {
        return Array.from(this.mapStore.keys());
    }
    /**
     * @param {string} id
     * @returns {boolean}
     */
    has(id) {
        const exists = this.mapStore.has(id);
        this.logger.debug(`(MemoryStore.has) ${id} ${exists}`);
        return exists;
    }
    /**
     * @param {string} id
     * @param {boolean} updateActiveTimestamp
     * @returns {RammerheadSession|undefined}
     */
    get(id, updateActiveTimestamp = true) {
        if (!this.has(id)) return;
        this.logger.debug(`(MemoryStore.get) ${id} ${updateActiveTimestamp}`);

        const session = this.mapStore.get(id);
        if (updateActiveTimestamp) session.updateLastUsed();

        return session;
    }
    /**
     * @param {string} id
     * @returns {RammerheadSession}
     */
    add(id) {
        if (this.has(id)) throw new Error('the following session already exists: ' + id);
        this.logger.debug(`(MemoryStore.add) ${id}`);
        const session = new RammerheadSession({ id });
        this.mapStore.set(id, session);
        return session;
    }
    /**
     * @param {string} id
     * @returns {boolean} - returns true when a delete operation is performed
     */
    delete(id) {
        return this.mapStore.delete(id);
    }
    /**
     * @param {string} id
     * @param {string} serializedSession
     */
    addSerializedSession(id, serializedSession) {
        this.logger.debug(`(MemoryStore.addSerializedSession) adding serialized session id ${id} to store`);
        const session = RammerheadSession.DeserializeSession(id, serializedSession);
        session.updateLastUsed();
        this.mapStore.set(id, session);
        this.logger.debug(`(FileCache.addSerializedSession) added ${id}`);
    }

    /**
     * @private
     * @param {number|null} staleTimeout
     * @param {number|null} maxToLive
     */
    _cleanupRun(staleTimeout, maxToLive) {
        this.logger.debug(`(MemoryStore._cleanupRun) cleanup run. Need to go through ${this.mapStore.size} sessions`);

        const now = Date.now();
        for (const [sessionId, session] of this.mapStore) {
            if (
                (staleTimeout && now - session.lastUsed > staleTimeout) ||
                (maxToLive && now - session.createdAt > maxToLive)
            ) {
                this.mapStore.delete(sessionId);
                this.logger.debug(`(MemoryStore._cleanupRun) delete ${sessionId}`);
            }
        }

        this.logger.debug('(MemoryStore._cleanupRun) finished cleanup run');
    }
}

module.exports = RammerheadSessionMemoryStore;
