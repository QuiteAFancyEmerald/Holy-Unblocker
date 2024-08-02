/* eslint-disable no-unused-vars */

/**
 * @private
 * @typedef {import("./RammerheadSession")} RammerheadSession
 */

/**
 * this is the minimum in order to have a fully working versatile session store. Though it is an abstract
 * class and should be treated as such, it includes default functions deemed necessary that are not
 * particular to different implementations
 * @abstract
 */
class RammerheadSessionAbstractStore {
    constructor() {
        if (this.constructor === RammerheadSessionAbstractStore) {
            throw new Error('abstract classes cannot be instantiated');
        }
    }

    /**
     *
     * @param {import('./RammerheadProxy')} proxy - this will overwrite proxy.openSessions with this class instance and
     * adds a request handler that calls loadSessionToMemory
     * @param {boolean} removeExistingSessions - whether to remove all sessions before overwriting proxy.openSessions
     */
    attachToProxy(proxy, removeExistingSessions = true) {
        if (proxy.openSessions === this) throw new TypeError('already attached to proxy');

        if (removeExistingSessions) {
            for (const [, session] of proxy.openSessions.entries()) {
                proxy.closeSession(session);
            }
        }
        proxy.openSessions = this;
    }

    /**
     * @private
     */
    _mustImplement() {
        throw new Error('must be implemented');
    }

    /**
     * @abstract
     * @returns {string[]} - list of session ids in store
     */
    keys() {
        this._mustImplement();
    }
    /**
     * @abstract
     * @param {string} id
     * @returns {boolean}
     */
    has(id) {
        this._mustImplement();
    }
    /**
     * @abstract
     * @param {string} id
     * @param {boolean} updateActiveTimestamp
     * @returns {RammerheadSession|undefined}
     */
    get(id, updateActiveTimestamp = true) {
        this._mustImplement();
    }
    /**
     * the implemented method here will use the dataOperation option in RammerheadSession however they
     * see fit
     * @abstract
     * @param {string} id
     * @returns {RammerheadSession}
     */
    add(id) {
        this._mustImplement();
    }
    /**
     * @abstract
     * @param {string} id
     * @returns {boolean} - returns true when a delete operation is performed
     */
    delete(id) {
        this._mustImplement();
    }
    /**
     * @abstract
     * @param {string} id
     * @param {string} serializedSession
     */
    addSerializedSession(id, serializedSession) {
        this._mustImplement();
    }
    /**
     * optional abstract method
     */
    close() {}
}

module.exports = RammerheadSessionAbstractStore;
