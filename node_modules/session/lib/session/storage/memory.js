/**
 * Imports
 */
var sys = require('sys');
var base = require('./base');

/**
 * Utils
 */
function $clone(obj) {
	if (obj == null || typeof (obj) != 'object')
		return obj;

	var temp = {}; // changed

	for ( var key in obj) {
		temp[key] = $clone(obj[key]);
	}
	return temp;
}

/*****************************************************************************************************************************************************
 * Storage
 ****************************************************************************************************************************************************/
/**
 * Storage constructor
 * 
 * @param options
 * @return
 */
function Storage(options) {
	options = options || {};
	base.Storage.call(this, options);
	this._sessions = {};
}
sys.inherits(Storage, base.Storage);

Storage.prototype.exist = function(sid) {
	return (this._sessions[sid] != undefined);
};

Storage.prototype.create = function(session) {
	session.id = this._manager.generateId();

	var currentTime = this._manager._currentTime;
	session.createdAt = currentTime;
	session.accessedAt = currentTime;
	session.expiredAt = currentTime + this._manager.getExpiration();

	var sid = session.getId();
	if (this._sessions[sid]) {
		session.id = undefined;
		throw new base.ErrorCreate();
	}

	// Store data
	this._sessions[sid] = {
		data : $clone(session._getData()),
		createdAt : session.createdAt,
		accessedAt : session.accessedAt,
		expiredAt : session.expiredAt
	};
};

Storage.prototype.update = function(session) {
	var sid = session.getId();
	var sessionStore = this._sessions[sid];

	if (!sessionStore) {
		// Does not exist
		this.create(session);
		return;
		// throw new ErrorInexistent();
	}

	var currentTime = this._manager._currentTime;
	if (currentTime > sessionStore.expiredAt) {
		// Has expired
		this.create(session);
		// throw new base.ErrorExpired();
		return;
	}

	// Touch session
	session.accessedAt = currentTime;
	session.expiredAt = currentTime + this._manager.getExpiration();

	// Store data
	if (session.modified) {
		sessionStore.data = $clone(session._getData());
	}
	sessionStore.accessedAt = session.accessedAt;
	sessionStore.expiredAt = session.expiredAt;
};

Storage.prototype.read = function(session) {
	var sid = session.getId();
	var sessionStore = this._sessions[sid];
	if (!sessionStore) {
		this.create(session);
		return;
		// throw new base.ErrorInexistent();
	}

	var currentTime = this._manager._currentTime;
	if (currentTime > sessionStore.expiredAt) {
		this.create(session);
		return;
		// throw new base.ErrorExpired();
	}

	session._setData($clone(sessionStore.data));
	session.createdAt = sessionStore.createdAt;
	session.accessedAt = sessionStore.accessedAt;
	session.expiredAt = sessionStore.expiredAt;
};

Storage.prototype.destroy = function(session) {
	var sid = session.getId();
	if (this._sessions[sid]) {
		delete this._sessions[sid];
		return true;
	}
	return false;
};

Storage.prototype.flush = function() {
	this._sessions = {};
};

Storage.prototype.clean = function() {
	var currentTime = this._manager._currentTime;
	for (sid in this._sessions) {
		if (currentTime >= this._sessions[sid].expiredAt) {
			delete this._sessions[sid];
		}
	}
};

/**
 * Exports
 */
exports.Storage = Storage;