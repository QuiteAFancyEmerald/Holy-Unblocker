/**
 * Imports
 */
var vows = require('vows');
var assert = require('assert');
var sys = require('sys');
var base = require('../../../lib/session/storage/base');

function Storage(options) {
	return new base.Storage(options);
}

var rawData = {
	data : {
		foo : 1,
		bar : 'baz'
	},
	createdAt : 0,
	accessedAt : 0,
	expiredAt : 0
};

var jsonData = '{"data":{"foo":1,"bar":"baz"},"createdAt":0,"accessedAt":0,"expiredAt":0}';
var jsonMd5 = require('crypto').createHash('md5').update(jsonData).digest('hex');

/**
 * Session class
 */
var methodsAbstract = [ 'exist', 'create', 'update', 'destroy', 'flush', 'clean' ];
exports.StorageTest = vows.describe('Base class').addBatch( {
	"exist(), 'create(), 'update(), 'destroy(), flush(), clean()" : {
		topic : function(item) {// Topic
			return Storage();
		},
		'should throw errors' : function(topic) {
			assert.throws(function() {
				methodsAbstract.forEach(function(method) {
					topic[method]();
				});
			});
		}
	},
	"encode()" : {
		topic : function(item) {// Topic
			return Storage();
		},
		'should encode as string with JSON then md5' : function(topic) {
			var encoded = topic.encode(rawData);
			assert.ok(typeof (encoded) == 'string', 'encoded data is not string');
			assert.equal(encoded.substr(0, jsonData.length), jsonData);
			assert.equal(encoded.substr(jsonData.length), jsonMd5);
		}
	},
	"decode()" : {
		topic : function(item) {// Topic
			return Storage();
		},
		'should throw error for wrong data' : function(topic) {
			assert.throws(function() {
				topic.decode('wrong data');
			});
		},
		'should throw error for wrong MD5 check' : function(topic) {
			var base = 16;
			var jsonMd5Wrong = (parseInt(jsonMd5[0], base) + 1 % base).toString(16) + jsonMd5.substr(1);// just increment first char

		assert.throws(function() {
			topic.decode(jsonData + jsonMd5Wrong);
		});
	},
	'should decode right value' : function(topic) {
		var decoded = topic.decode(jsonData + jsonMd5);
		assert.deepEqual(decoded, rawData);
	}
	}
});