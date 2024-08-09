//TODO: add license
/**
 * Imports
 */
var base = require('./storage/base');
var crypto = require('crypto');

/**
 * Constants
 */
SESSION_ID_MAX = 18446744073709551616;// 2<<64
SESSION_EXPIRATION = 60 * 60;// 1hours
SESSION_CREATION_ATTEMPTS = 10000;

/*****************************************************************************************************************************************************
 * Manager
 * 
 * Usage :
 * 
 * <code>
 * var manager = new Manager{
 * 	storage :{
 * 		type: SessionStorageMemory, //storage type
 * 		...
 * 	},
 * 	expiration: 100//time in seconds
 *  secret: 'mySecretKey';//SID size
 *  sessionCreationAttempts:10000
 * });
 *
 * //Request #1
 * var session = manager.create();
 * //send here session.getId() to the client
 * session.set('foo', 'bar').set('baz', 3);
 * session.save();
 * 
 * //Request #2
 * var sid = ... //Get the sid from cookie, etc
 * var session = manager.open(sid);
 * console.log(session.get('foo'));//will print 'bar'
 * 
 * </code>
 ****************************************************************************************************************************************************/
/**
 * Manager constructor
 * 
 * @param options
 * @return
 */
function Manager(options) {
	options = options || {};
	options.storage = options.storage || {};

	this._expiration = (options.expiration || SESSION_EXPIRATION);
	this._secret = options.secret || '';
	this._sessionCreationAttempts = options.sessionCreationAttempts || SESSION_CREATION_ATTEMPTS;

	// Generate storage
	this.setStorage(options.storage.type, options.storage);

	this.__defineGetter__('_currentTime', function() {
		return Math.floor((new Date()).getTime() / 1000);
	});
}

Manager.prototype.getExpiration = function() {
	return this._expiration;
};

/**
 * Set the storage used for all sessions
 * 
 * @param type
 * @param options
 * @return this
 */
Manager.prototype.setStorage = function(type, options) {

	if (type == undefined) {
		type = require('./storage/memory').Storage;
	}

	if (typeof (type) == 'string') {
		type = require('./storage/' + type).Storage;
	}

	if (type instanceof Function) {
		type = new type(options);
	}

	if (typeof (type) == 'object') {
		type._manager = this;
		this._storage = type;
		return this;
	}

	throw new Error();
};

/**
 * Return the manager storage
 * 
 * @return SessionStorage
 */
Manager.prototype.getStorage = function() {
	return this._storage;
};

/**
 * Return a random generated SID
 * 
 * @return string
 */
Manager.prototype.generateId = function() {
	var sessionKeyMax = SESSION_ID_MAX;
	var secretKey = this._secret;

	var seed = '' + (Math.random() * sessionKeyMax);
	seed += process.pid;
	seed += this._currentTime;
	seed += secretKey;
	var hash = crypto.createHash('md5').update(seed).digest('hex');
	return hash;
};

/**
 * Return true if Session with sid exists
 * 
 * @param sid
 * @return boolean
 */
Manager.prototype.exist = function(sid) {
	return this._storage.exist(sid);
};

/**
 * Return new Session object with new SID
 * 
 * @return Session
 */
Manager.prototype.create = function() {
	for ( var tryCount = 0; tryCount < this._sessionCreationAttempts; tryCount++) {
		try {
			var sessionNew = new Session( {
				manager : this
			});

			sessionNew.save();
			break;
		} catch (e) {
			throw e;
		}
	}

	return sessionNew;
};

/**
 * Return new Session object with
 * 
 * @param sid
 * @return
 */
Manager.prototype.open = function(sid) {
	var sessionOpened = new Session( {
		manager : this,
		id : sid
	});
	return sessionOpened;
};

/**
 * Destroy
 * 
 * @param session
 * @return
 */
Manager.prototype.destroy = function(session) {
	this._storage.destroy(session);
	return this;
};

/**
 * Destroy all sessions
 * 
 * @return
 */
Manager.prototype.flush = function() {
	this._storage.flush();
	return this;
};

/**
 * Destroy all expired sessions
 * 
 * @return this
 */
Manager.prototype.clean = function() {
	this._storage.clean();
	return this;
};

/**
 * Session constructor
 * 
 * @param options
 * @return
 */
function Session(options) {
	options = options || {};
	this._manager = options.manager;

	this.id = options.id;
	this._data = options.data || {};

	this.accessed = false;
	this.modified = false;

	this.__defineGetter__('_currentTime', function() {
		return this._manager._currentTime;
	});

	// Created At
	this.__defineGetter__('createdAt', this.getCreatedAt);
	this.__defineSetter__('createdAt', this.setCreatedAt);
	this.createdAt = options.createdAt;

	// Accessed At
	this.__defineGetter__('accessedAt', this.getAccessedAt);
	this.__defineSetter__('accessedAt', this.setAccessedAt);
	this.accessedAt = options.accessedAt || options.createdAt;

	// Expired At
	this.__defineGetter__('expiredAt', this.getExpiredAt);
	this.__defineSetter__('expiredAt', this.setExpiredAt);
	this.expiredAt = options.expiredAt || Number.MAX_VALUE;
}

/**
 * Return the SID
 * 
 * @return the id
 */
Session.prototype.getId = function() {
	return this.id;
};

Session.prototype.getCreatedAt = function() {
	if (!this._createdAt) {
		this.read();
	}
	return this._createdAt;
};

Session.prototype.setCreatedAt = function(value) {
	this._createdAt = value;
	return this;
};

Session.prototype.getAccessedAt = function() {
	if (!this._accessedAt) {
		this.read();
	}
	return this._accessedAt;
};

Session.prototype.setAccessedAt = function(value) {
	this._accessedAt = value;
	return this;
};

Session.prototype.getExpiredAt = function() {
	if (!this._expiredAt) {
		this.read();
	}
	return this._expiredAt;
};

Session.prototype.setExpiredAt = function(value) {
	this._expiredAt = value;
	return this;
};

/**
 * Return the session data
 * 
 * @return an object {}
 */
Session.prototype._getData = function() {
	return this._data;
};

/**
 * Set session data (overwrite it)
 * 
 * @param data
 * @return this
 */
Session.prototype._setData = function(data) {
	this._data = data || {};
	return this;
};

/**
 * Return Array containing all keys
 * 
 * @return Array
 */
Session.prototype.keys = function() {
	this.read();
	var keys = [];
	for ( var key in this._data) {
		keys.push(key);
	}
	return keys;
};

/**
 * Return Array containing all values
 * 
 * @return Array
 */
Session.prototype.values = function() {
	this.read();
	var values = [];
	for ( var key in this._data) {
		values.push(this._data[key]);
	}
	return values;
};

/**
 * Return data[key] or defaultValue (and delete it)
 * 
 * @param key
 * @param defaultValue
 * @return
 */
Session.prototype.pop = function(key, defaultValue) {
	this.read();

	var value = this._data[key];
	if (value != undefined) {
		this.modified = true;
		delete this._data[key];
		return value;
	} else {
		return defaultValue;
	}
};

/**
 * Return true if data[key] is set
 * 
 * @param key
 * @return boolean
 */
Session.prototype.isset = function(key) {
	this.read();
	return this._data[key] != undefined;
};

/**
 * Return the data[key] value or defaultValue if not set
 * 
 * @param key
 * @param defaultValue
 * @return mixed
 */
Session.prototype.get = function(key, defaultValue) {
	this.read();
	var value = this._data[key];
	return value == undefined ? defaultValue : value;
};

/**
 * Set the data[key] to value
 * 
 * @param key
 * @param value
 * @return this
 */
Session.prototype.set = function(key, value) {
	this.read();
	if (typeof (key) == 'object') {
		for ( var property in key) {
			this._data[property] = key[property];
		}
	} else {
		if (value != undefined) {
			this._data[key] = value;
		} else {
			delete this._data[key];
		}
	}
	this.modified = true;
	return this;
};

/**
 * Unset the data[key]
 * 
 * @param key
 * @return this
 */
Session.prototype.unset = function(key) {
	this.pop(key);
	return this;
};

/**
 * Read data from storage (can be done only once)
 * 
 * @return this
 */
Session.prototype.read = function() {
	if (this.accessed == false) {
		this.accessed = true;
		if (this._manager && this._manager.getStorage()) {
			this._manager.getStorage().read(this);
		}
	}
	return this;
};

/**
 * Save or create session into storage
 * 
 * @return this
 */
Session.prototype.save = function() {

	if (this.id == undefined) {
		this._manager.getStorage().create(this);
		this.modified = false;
	} else {
		this._manager.getStorage().update(this);
		this.modified = false;
	}

	return this;
};

/**
 * Destroy me
 * 
 * TODO: check not to destroy twice? and block set/set, etc?
 * 
 * @return
 */
Session.prototype.destroy = function() {
	if (this.id != undefined) {
		this._manager.getStorage().destroy(this);
		this.id = undefined;
	}
	return this;
};

/**
 * Exports
 */
exports.Manager = Manager;
exports.Session = Session;
