var vows = require('vows');
var assert = require('assert');
var session = require('../../lib/session');

var TIME_ORIGIN = 1;
var TIME_CURRENT = 1;
var TIME_EXPIRE = 100;

function getTime() {
	return TIME_CURRENT;
}

function setTime(time) {
	TIME_CURRENT = time || TIME_ORIGIN;
}

function addTime(time) {
	TIME_CURRENT += (time || 1);
}

function Manager(options) {
	options = options || {};
	options.debug = options.debug == undefined ? true : options.debug;
	options.expiration = TIME_EXPIRE;
	var manager = new session.Manager(options);
	manager.__defineGetter__('_currentTime', getTime);// to test expiration time
	return manager;
}

function Session(options) {
	options = options || {};
	options.manager = options.manager || {};
	options.debug = options.debug == undefined ? true : options.debug;

	options.manager = Manager(options.manager);
	var sessionNew = new session.Session(options);
	sessionNew.__defineGetter__('_currentTime', getTime);// to test expiration time
	return sessionNew;
}

/**
 * Session class
 */
exports.SessionTest = vows.describe('Session class').addBatch( {
	"get() " : {
		topic : function(item) {// Topic
			return Session();
		},
		'should return undefined if key does not exists' : function(topic) {
			assert.equal(topic.get('fldjslfkjdlks'), undefined);
		},
		'should return defaultValue if key does not exists' : function(topic) {
			assert.equal(topic.get('fldjslfkjdlks', 'defaultArg'), 'defaultArg');
		},
		'should return data if key exists' : function(topic) {
			topic.set('myId', 'helloworld');
			assert.equal(topic.get('myId'), 'helloworld');
		}
	},
	"set() " : {
		topic : function(item) {// Topic
			return Session();
		},
		'should return this' : function(topic) {
			assert.equal(topic.set('fldjslfkjdlks', 'jkljlm'), topic);
		},
		'should return set data' : function(topic) {
			topic.set('myId', 'helloworld');
			assert.equal(topic.get('myId'), 'helloworld');
		},
		'should return set many value if called as set({key: value, ...})' : function(topic) {
			topic.set( {
				myId : 'helloworld2',
				key2 : 'lol'
			});
			assert.equal(topic.get('myId'), 'helloworld2');
			assert.equal(topic.get('key2'), 'lol');
		}
	},
	"isset() " : {
		topic : function(item) {// Topic
			return Session();
		},
		'should return false if key does not exists' : function(topic) {
			assert.equal(topic.isset('fsdqfjdlk'), false);
		},
		'should return true if key exists' : function(topic) {
			topic.set('myId', 'helloworld');
			assert.equal(topic.isset('myId'), true);
		}
	},
	"unset()" : {
		topic : function(item) {// Topic
			return Session();
		},
		'should return this' : function(topic) {
			assert.equal(topic.unset('jakhhk', {}), topic);
		},
		'should delete element if existing' : function(topic) {
			topic.set('myId', 'helloworld');
			assert.equal(topic.isset('myId'), true);
			topic.unset('myId');
			assert.equal(topic.isset('myId'), false);
		}
	},
	"pop()" : {
		topic : function(item) {
			return Session();
		},
		'should return default param if key does not exist' : function(topic) {
			assert.equal(topic.pop('jakhhk', 'defaultValue'), 'defaultValue');
		},
		'should delete element and return this element' : function(topic) {
			topic.set('myId', 'helloworld');
			assert.equal(topic.isset('myId'), true);
			var result = topic.pop('myId', 'defaultValue');
			assert.equal(topic.isset('myId'), false);
			assert.equal(result, 'helloworld');
		}
	},
	"keys()" : {
		topic : function(item) {
			return Session();
		},
		'should return array containing all data keys' : function(topic) {
			topic.set('foo', 1);
			assert.deepEqual(topic.keys(), [ 'foo' ]);
			topic.set('bar', 2);
			assert.deepEqual(topic.keys(), [ 'foo', 'bar' ]);
			topic.unset('foo');
			assert.deepEqual(topic.keys(), [ 'bar' ]);
		}
	},
	"values()" : {
		topic : function(item) {
			return Session();
		},
		'should return array containing all data keys' : function(topic) {
			topic.set('foo', 1);
			assert.deepEqual(topic.values(), [ 1 ]);
			topic.set('bar', 2);
			assert.deepEqual(topic.values(), [ 1, 2 ]);
			topic.unset('foo');
			assert.deepEqual(topic.values(), [ 2 ]);
		}
	}
});

/**
 * Manager Test class
 */
exports.ManagerTest = vows.describe('Manager class').addBatch( {
	"generateId()" : {
		topic : function(item) {// Topic
			return Manager();
		},
		'should generate SID with length 32bytes(chars).' : function(topic) {
			for ( var i = 0; i < 10000; i++) {
				assert.equal(topic.generateId().length, 32);
			}
		},
		'should generate distinct SID.' : function(topic) {
			var listId = [];
			var sid;
			for ( var i = 0; i < 1000; i++) {
				sid = topic.generateId();
				assert.ok(listId.indexOf(sid) < 0);
				listId.push(sid);
			}
		}
	},
	"create()" : {
		topic : function(item) {// Topic
			return Manager();
		},
		'should throw error if cannot create' : function(topic) {
			var oldGenerateId = topic.generateId;
			topic.generateId = function() {
				return '123456789';
			};
			assert.throws(function() {
				var sessionNew = manager.create();
			});
			topic.generateId = oldGenerateId;
		},
		'should return a new session' : function(topic) {
			var sessionNew = topic.create();
			assert.notEqual(sessionNew, undefined);
			assert.notEqual(sessionNew.getId(), undefined);
			assert.deepEqual(sessionNew._getData(), {});
		},
		'should generate distinct SID.' : function(topic) {
			var listId = [];
			for (i = 0; i < 1000; i++) {
				var session;
				assert.doesNotThrow(function() {
					session = topic.create();
				});
				assert.ok(listId.indexOf(session.getId()) < 0);
				listId.push(session.getId());
			}
		},
		'should set appropriate createdAt to current time.' : function(topic) {
			var sessionNew = topic.create();
			assert.equal(sessionNew.createdAt, getTime());
			assert.equal(sessionNew.accessedAt, getTime());
			assert.equal(sessionNew.expiredAt, getTime() + TIME_EXPIRE);
		}
	},
	"exist()" : {
		topic : function(item) {// Topic
			return Manager();
		},
		'should return false if SID does not exists' : function(topic) {
			assert.equal(topic.exist('fsdqfjdlk'), false);
		},
		'should return true if SID exists' : function(topic) {
			var session = topic.create();
			assert.equal(topic.exist(session.getId()), true);
		},
		'should return true if Session has expired' : function(topic) {// TODO return true OR false and auto destroy session what is the best?
			var session = topic.create();
			setTime(session.expireAt + 1);
			assert.equal(topic.exist(session.getId()), true);
		}
	},
	"open()" : {
		topic : function(item) {// Topic
			return Manager();
		},
		'should set new SID if SID does not exists' : function(topic) {
			var sid = 'fldjslfkjdlkjksdkls';
			var sessionOpened = topic.open(sid);
			sessionOpened.read();
			assert.notEqual(sessionOpened.getId(), sid);
		},
		'should set new SID if Session has expired' : function(topic) {
			var sessionNew = topic.create();
			var sid = sessionNew.getId();
			sessionNew.set('foo', 1);
			sessionNew.save();

			setTime(sessionNew.expiredAt + 1);

			var sessionOpened = topic.open(sid);
			sessionOpened.read();
			assert.notEqual(sessionOpened.getId(), sid);
		},
		'should return Session object if SID exists' : function(topic) {
			var sessionNew = topic.create();

			var sessionOpened = topic.open(sessionNew.getId());
			assert.notEqual(sessionOpened, undefined);
			assert.equal(sessionOpened.getId(), sessionNew.getId());
			assert.deepEqual(sessionOpened._getData(), sessionNew._getData());

			assert.equal(sessionOpened.createdAt, sessionNew.createdAt);
			assert.equal(sessionOpened.accessedAt, sessionNew.accessedAt);
			assert.equal(sessionOpened.expiredAt, sessionNew.expiredAt);
		},

		'should save new data after Session.save()' : function(topic) {
			var sessionNew = topic.create();
			var sid = sessionNew.getId();

			var sessionOpened = topic.open(sid);
			sessionOpened.set('foo', 'bar');

			assert.equal(topic.open(sid).get('foo'), undefined);
			sessionOpened.save();
			assert.equal(topic.open(sid).get('foo'), 'bar');

		},
		'should set access and expiration time after Session.save()' : function(topic) {
			var sessionNew = topic.create();
			var sid = sessionNew.getId();

			var sessionOpened = topic.open(sid);
			sessionOpened.set('foo', 'bar');

			addTime();
			assert.equal(sessionOpened.accessedAt, sessionNew.accessedAt);
			assert.equal(sessionOpened.expiredAt, sessionNew.expiredAt);

			addTime();
			sessionOpened.save();
			assert.equal(sessionOpened.accessedAt, getTime());
			assert.equal(sessionOpened.expiredAt, getTime() + TIME_EXPIRE);
		}
	},
	"destroy()" : {
		topic : function(item) {// Topic
			return Manager();
		},
		'should not send an error if SID does not exists' : function(topic) {
			assert.doesNotThrow(function() {
				var session = topic.create();
				session.id = 'fjdlskjfsdkl';
				topic.destroy(session, {});
			}, topic);
		},
		'should return destroy session if exists' : function(topic) {
			var session = topic.create();
			assert.equal(topic.exist(session.getId()), true);
			topic.destroy(session);
			assert.equal(topic.exist(session.getId()), false);
		},
		'should return this' : function(topic) {
			var session = topic.create();
			assert.equal(topic.destroy(session), topic);
		}
	},
	"flush()" : {
		topic : function(item) {// Topic
			return Manager();
		},
		'should not throw any errors if no session' : function(topic) {
			assert.doesNotThrow(function() {
				topic.flush();
			}, topic);
		},
		'should destroy all sessions' : function(topic) {
			var sessions = [];
			for ( var i = 0; i < 100; i++) {
				var sessionCreated = topic.create();
				sessions.push(sessionCreated);
				assert.ok(topic.exist(sessionCreated.getId()));
			}
			topic.flush();
			sessions.forEach(function(sessionCreated) {
				assert.ok(!topic.exist(sessionCreated.getId()));
			});
		}
	},
	"clean()" : {
		topic : function(item) {// Topic
			return Manager();
		},
		'should not throw any errors if no session' : function(topic) {
			assert.doesNotThrow(function() {
				topic.clean();
			}, topic);
		},
		'should destroy all expired sessions' : function(topic) {
			var sessions = [];
			var sessionsExpired = [];
			for ( var i = 0; i < 100; i++) {
				var sessionCreated = topic.create();
				sessions.push(sessionCreated);
				addTime();
				assert.ok(topic.exist(sessionCreated.getId()));
			}

			for ( var i = 0; i < 100; i++) {
				sessionsExpired.push(sessions.shift());

				topic.clean();
				sessions.forEach(function(sessionCreated) {
					assert.ok(topic.exist(sessionCreated.getId()));
				});
				sessionsExpired.forEach(function(sessionCreated) {
					assert.ok(!topic.exist(sessionCreated.getId()));
				});
				addTime();
			}
		}
	}
});
