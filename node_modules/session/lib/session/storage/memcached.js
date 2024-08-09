//TODO implements
/**
 * Imports
 */
var sys = require('sys');
var memcached = require('memcached');

/*****************************************************************************************************************************************************
 * Storage
 ****************************************************************************************************************************************************/
/**
 * Storage constructor
 * 
 * @param adapter
 * @return
 */
function Storage(options) {
	options = options || {};
	base.Storage.call(this, options);

	this._client = couchdb.createClient(options.port, options.host, options.user, options.pass);
}
sys.inherits(Storage, base.Storage);

/**
 * Must return true if the session SID exist
 * 
 * @param sid
 * @return boolean
 */
Storage.prototype.exist = function(sid) {
	throw new ErrorNotImplemented();
};

/**
 * Must create a new session
 * 
 * @param session
 * @return undefined
 */
Storage.prototype.create = function(session) {
	throw new ErrorNotImplemented();
};

/**
 * Must update the session
 * 
 * @param session
 * @return undefined
 */
Storage.prototype.update = function(session) {
	throw new ErrorNotImplemented();
};

/**
 * Must read the session
 * 
 * @param session
 * @return undefined
 */
Storage.prototype.read = function(session) {
	throw new ErrorNotImplemented();
};

/**
 * Must destroy specified session
 * 
 * @param session
 * @return undefined
 */
Storage.prototype.destroy = function(session) {
	throw new ErrorNotImplemented();
};

/**
 * Must destroy all sessions
 * 
 * @return undefined
 */
Storage.prototype.flush = function() {
	throw new ErrorNotImplemented();
};

/**
 * Must clean all expired sessions
 * 
 * @return undefined
 */
Storage.prototype.clean = function() {
	throw new ErrorNotImplemented();
};

/**
 * Exports
 */
exports.Storage = Storage;