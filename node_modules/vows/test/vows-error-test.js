var path   = require('path'),
    events = require('events'),
    assert = require('assert'),
    fs     = require('fs'),
    vows   = require('../lib/vows'),
    silent = require('../lib/vows/reporters/silent');
    
function doSomethingAsync(callback) {
  	var err = null;
  	var testValue = 'a';

  	process.nextTick(function() {
  		  callback(err, testValue);
  	});
}

function doSomethingAsyncWithError(callback) {
  	var err = true;
  	var testValue = 'a';

  	process.nextTick(function() {
  		  callback(err, testValue);
  	});
}


vows.describe('vows/error').addBatch({
	'Generate success response to async function': {
    		topic: function() {
    			  doSomethingAsync(this.callback)
    		},
    		'Validate success': function(err, testValue) {
    			  assert.ok(!err);
    		},
    		'Validate testValue': function(err, testValue) {
    			  assert.equal(testValue, 'a');
    		}
  	},

  	'Generate error response to async function': {
    		topic: function() {
    			  doSomethingAsyncWithError(this.callback)
    		},
    		'Validate error': function(err, testValue) {
    			  assert.ok(err);
    		},
    		'Validate testValue': function(err, testValue) {
    			  // This assertion fails. It shouldn't.
    			  assert.equal(testValue, 'a');
    		}
  	}
}).export(module)

vows.describe('Error Handling').addBatch({
    "A topic with a function that errors": {
        topic: function() {
            throw("Something wrong here");
        },
        "should return an error to a vow with two parameters": function(e, data) {
            assert.equal(e, "Something wrong here");
        }
    },
    "A topic with a built-in error": {
        topic: function() {
            bad.bad;
        },
        "should return an error to a vow with two parameters": function(e, data) {
            assert(e instanceof Error, "Return value " + e + " wasn't an Error.");
        }
    },
    "The previous two topics run in their own suite," : {
        "connected to two vows expecting one argument each" : {
            topic: function(){
                vows.describe().addBatch({
                    "A topic with a function that errors": {
                        topic: function() {
                            throw("Something wrong here");
                        },
                        "should record the error in the test results" : function(data) {
                            assert.ok(!data);
                        }
                        //» An unexpected error was caught: "Something wrong here"
                    },
                    "A topic with a built-in error": {
                        topic: function() {
                            bad.bad;
                        },
                        "should record the error in the test results" : function(data) {
                            assert.ok(!data);
                        }
                        //» An unexpected error was caught: ReferenceError: bad is not defined
                    }
                }).run({reporter : silent}, this.callback);
            },
            "should have an errored count of two" : function(results, unused) {
                assert.equal(results.errored, 2);
            },
            "should have a total count of two" : function(results, unused) {
                assert.equal(results.total, 2);
            },
            "should have an honored count of zero" : function(results, unused){
                assert.equal(results.honored, 0);
            }
        }
    },
    "A topic with an error in it" : {
        topic : function(){
            throw('awesome');
        },
        "should error" : function(error, result){
            assert.equal(error, 'awesome');
        },
        "containing a subtopic" : {
            topic : function(){
                return 52;
            },
            "should reach a vow in the subtopic" : function(){
            }
        }
    }
}).export(module);

