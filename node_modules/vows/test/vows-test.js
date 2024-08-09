var path   = require('path'),
    events = require('events'),
    assert = require('assert'),
    fs     = require('fs'),
    vows   = require('../lib/vows');

var api = vows.prepare({
    get: function (id, callback) {
        process.nextTick(function () { callback(null, id) });
    },
    version: function () { return '1.0' }
}, ['get']);

var emitNextTick = function (val) {
    return function () {
        var emitter = new(events.EventEmitter);
        process.nextTick(function () { emitter.emit('success', val) });
        return emitter;
    }
};

vows.describe("Vows").addBatch({
    "A context": {
        topic: emitNextTick("hello world"),

        "with a nested context": {
            topic: function (parent) {
                this.state = 42;
                return emitNextTick(parent)();
            },
            "has access to the environment": function () {
                assert.equal(this.state, 42);
            },
            "and a sub nested context": {
                topic: function () {
                    return this.state;
                },
                "has access to the parent environment": function (r) {
                    assert.equal(r, 42);
                    assert.equal(this.state, 42);
                },
                "has access to the parent context object": function (r) {
                    assert.ok(Array.isArray(this.context.topics));
                    assert.include(this.context.topics, "hello world");
                }
            }
        }
    },
    "A nested context": {
        topic: emitNextTick(1),

        ".": {
            topic: function (a) { return emitNextTick(2)() },

            ".": {
                topic: function (b, a) { return emitNextTick(3)() },

                ".": {
                    topic: function (c, b, a) { return emitNextTick([4, c, b, a])() },

                    "should have access to the parent topics": function (topics) {
                        assert.equal(topics.join(), [4, 3, 2, 1].join());
                    }
                },

                "from": {
                    topic: function (c, b, a) { return emitNextTick([4, c, b, a])() },

                    "the parent topics": function(topics) {
                        assert.equal(topics.join(), [4, 3, 2, 1].join());
                    }
                }
            }
        }
    },
    "Nested contexts with callback-style async": {
        topic: function () {
            fs.stat(__dirname + '/vows-test.js', this.callback);
        },
        'after a successful `fs.stat`': {
            topic: function (stat) {
                fs.open(__dirname + '/vows-test.js', "r", stat.mode, this.callback);
            },
            'after a successful `fs.open`': {
                topic: function (fd, stat) {
                    var buf = new Buffer(stat.size);
                    fs.read(fd, buf, 0, stat.size, null, this.callback);
                },
                'after a successful `fs.read`': function (err, bytesRead, buf) {
                    assert.ifError(err);
                    assert.isNumber(bytesRead);
                    assert.isObject(buf);
                    assert.instanceOf(buf, Buffer);
                    var data = buf.toString('utf8');
                    assert.match (data, /after a successful `fs.read`/);
                }
            }
        }
    },
    "A nested context with no topics": {
        topic: 45,
        ".": {
            ".": {
                "should pass the value down": function (topic) {
                    assert.equal(topic, 45);
                }
            }
        }
    },
    "A Nested context with topic gaps": {
        topic: 45,
        ".": {
            ".": {
                topic: 101,
                ".": {
                    ".": {
                        topic: function (prev, prev2) {
                            return this.context.topics.slice(0);
                        },
                        "should pass the topics down": function (topics) {
                            assert.lengthOf(topics, 2);
                            assert.equal(topics[0], 101);
                            assert.equal(topics[1], 45);
                        }
                    }
                }
            }
        }
    },
    "A non-EventEmitter return value": {
        topic: function () { return 1 },
        "should be converted to a vow": function (val) {
            assert.equal(val, 1);
        }
    },
    "A 'prepared' interface": {
        "with a wrapped function": {
            topic: function () { return api.get(42) },
            "should work as expected": function (val) {
                assert.equal(val, 42);
            }
        },
        "with a non-wrapped function": {
            topic: function () { return api.version() },
            "should work as expected": function (val) {
                assert.equal(val, '1.0');
            }
        }
    },
    "A non-function topic": {
        topic: 45,

        "should work as expected": function (topic) {
            assert.equal(topic, 45);
        }
    },
    "A non-function topic with a falsy value": {
        topic: 0,

        "should work as expected": function (topic) {
            assert.equal(topic, 0);
        }
    },
    "A topic returning a function": {
        topic: function () {
            return function () { return 42 };
        },

        "should work as expected": function (topic) {
            assert.isFunction(topic);
            assert.equal(topic(), 42);
        },
        "in a sub-context": {
            "should work as expected": function (topic) {
                assert.isFunction(topic);
                assert.equal(topic(), 42);
            }
        }
    },
    "A topic emitting an error": {
        topic: function () {
            var emitter = new(events.EventEmitter);
            process.nextTick(function () {
                emitter.emit("error", 404);
            });
            return emitter;
        },
        "shouldn't raise an exception if the test expects it": function (e, res) {
            assert.equal(e, 404);
            assert.ok(! res);
        }
    },
    "A topic not emitting an error": {
        topic: function () {
            var emitter = new(events.EventEmitter);
            process.nextTick(function () {
                emitter.emit("success", true);
            });
            return emitter;
        },
        "should pass `null` as first argument, if the test is expecting an error": function (e, res) {
            assert.strictEqual(e, null);
            assert.equal(res, true);
        },
        "should pass the result as first argument if the test isn't expecting an error": function (res) {
            assert.equal(res, true);
        }
    },
    "A topic with callback-style async": {
        "when successful": {
            topic: function () {
                var that = this;
                process.nextTick(function () {
                    that.callback(null, "OK");
                });
            },
            "should work like an event-emitter": function (res) {
                assert.equal(res, "OK");
            },
            "should assign `null` to the error argument": function (e, res) {
                assert.strictEqual(e, null);
                assert.equal(res, "OK");
            }
        },
        "when unsuccessful": {
            topic: function () {
                function async(callback) {
                    process.nextTick(function () {
                        callback("ERROR");
                    });
                }
                async(this.callback);
            },
            "should have a non-null error value": function (e, res) {
                assert.equal(e, "ERROR");
            },
            "should work like an event-emitter": function (e, res) {
                assert.equal(res, undefined);
            }
        },
        "using this.callback synchronously": {
            topic: function () {
                this.callback(null, 'hello');
            },
            "should work the same as returning a value": function (res) {
                assert.equal(res, 'hello');
            }
        },
        "using this.callback with a user context": {
            topic: function () {
                this.callback.call({ boo: true }, null, 'hello');
            },
            "should give access to the user context": function (res) {
                assert.isTrue(this.boo);
            }
        },
        "passing this.callback to a function": {
            topic: function () {
                this.boo = true;
                var async = function (callback) {
                    callback(null);
                };
                async(this.callback);
            },
            "should give access to the topic context": function () {
                assert.isTrue(this.boo);
            }
        },
        "with multiple arguments": {
            topic: function () {
                this.callback(null, 1, 2, 3);
            },
            "should pass them to the vow": function (e, a, b, c) {
                assert.strictEqual(e, null);
                assert.strictEqual(a, 1);
                assert.strictEqual(b, 2);
                assert.strictEqual(c, 3);
            },
            "and a sub-topic": {
                topic: function (a, b, c) {
                    return [a, b, c];
                },
                "should receive them too": function (val) {
                    assert.deepEqual(val, [1, 2, 3]);
                }
            }
        }
    }
}).addBatch({
    "A Sibling context": {
        "'A', with `this.foo = true`": {
            topic: function () {
                this.foo = true;
                return this;
            },
            "should have `this.foo` set to true": function (res) {
                assert.equal(res.foo, true);
            }
        },
        "'B', with `this.bar = true`": {
            topic: function () {
                this.bar = true;
                return 42;
            },
            "should pass the result": function (res) {
                assert.equal(res, 42);
            },
            "should have `this.bar` set to true": function () {
                assert.equal(this.bar, true);
            },
            'with a sub context': {
              topic: function(){
                this.barSubContext = { sub: true }
                return 42;
              },
              "should have `this.bar` set to true": function (res) {
                  assert.equal(this.bar, true);
              },
              "should have `this.barSubContext`": function (res) {
                  assert.deepEqual(this.barSubContext, { sub: true });
              },
              'with gaps': {
                '.': {
                  '.': {
                    '.': {
                      topic: 12,
                      '.': {
                        '.': {
                          topic: function(){
                            this.barSubContext.subsub = true;
                            return 42;
                          },
                          "should have `this.bar` set to true": function (res) {
                              assert.equal(this.bar, true);
                          },
                          'should have `this.barSubContext`': function(){
                            assert.deepEqual(this.barSubContext, { sub: true, subsub: true });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
        },
        "'C', with nothing set": {
            topic: function () {
                return this;
            },
            "shouldn't have access to `this.foo`": function (res) {
                assert.isUndefined(res.foo);
                assert.isUndefined(this.foo);
            },
            "shouldn't have access to `this.bar`": function (res) {
                assert.isUndefined(res.bar);
                assert.isUndefined(this.bar);
            },
            "shouldn't have access to `this.barSubContext`": function (res) {
                assert.isUndefined(res.barSubContext);
                assert.isUndefined(this.barSubContext);
            }
        }
    },
    "Sibling context asynchronous": {
        "'A', with `this.foo = true`": {
            topic: function () {
                this.foo = true;
                var self = this;
                process.nextTick(function(){
                  self.callback(null, self);
                })
            },
            "should have `this.foo` set to true": function (res) {
                assert.equal(res.foo, true);
            }
        },
        "'B', with `this.bar = true`": {
            topic: function () {
                this.bar = true;
                var self = this;
                process.nextTick(function(){
                  self.callback(null, 42);
                })
            },
            "should pass the result": function (res) {
                assert.equal(res, 42);
            },
            "should have `this.bar` set to true": function (res) {
                assert.equal(this.bar, true);
            },
            'with a sub context': {
              topic: function(){
                this.barSubContext = { sub: true };
                var self = this;
                process.nextTick(function(){
                  self.callback(null, 42);
                })
              },
              "should have `this.foo` set to true": function (res) {
                  assert.equal(this.bar, true);
              },
              "should have `this.fooSubContext`": function (res) {
                  assert.deepEqual(this.barSubContext, { sub: true });
              },
              'with gaps': {
                '.': {
                  '.': {
                    '.': {
                      topic: 12,
                      '.': {
                        '.': {
                          topic: function(){
                            this.barSubContext.subsub = true;
                            var self = this;
                            process.nextTick(function(){
                              self.callback(null, 42);
                            })
                          },
                          "should have `this.bar` set to true": function (res) {
                              assert.equal(this.bar, true);
                          },
                          'should have `this.barSubContext': function(){
                            assert.deepEqual(this.barSubContext, { sub: true, subsub: true });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
        },
        "'C', with nothing set": {
            topic: function () {
                var self = this;
                process.nextTick(function(){
                  self.callback(null, self);
                })
            },
            "shouldn't have access to `this.foo`": function (e, res) {
                assert.isUndefined(res.foo);
            },
            "shouldn't have access to `this.bar`": function (e, res) {
                assert.isUndefined(res.bar);
            },
            "shouldn't have access to `this.barSubContext`": function (e, res) {
                assert.isUndefined(res.barSubContext);
            }

        }
    }
}).addBatch({
    "A 2nd batch": {
        topic: function () {
            var p = new(events.EventEmitter);
            setTimeout(function () {
                p.emit("success");
            }, 100);
            return p;
        },
        "should run after the first": function () {}
    }
}).addBatch({
    "A 3rd batch": {
        topic: true, "should run last": function () {}
    }
}).addBatch({}).export(module);

vows.describe("Vows with a single batch", {
    "This is a batch that's added as the optional parameter to describe()": {
        topic: true,
        "And a vow": function () {}
    }
}).export(module);

vows.describe("Vows with multiple batches added as optional parameters", {
    "First batch": {
        topic: true,
        "should be run first": function () {}
    }
}, {
    "Second batch": {
        topic: true,
        "should be run second": function () {}
    }
}).export(module);

vows.describe("Vows with teardowns").addBatch({
    "A context": {
        topic: function () {
            return { flag: true };
        },
        "And a vow": function (topic) {
            assert.isTrue(topic.flag);
        },
        "And another vow": function (topic) {
            assert.isTrue(topic.flag);
        },
        "And a final vow": function (topic) {
            assert.isTrue(topic.flag);
        },
        'subcontext': {
          'nested': function (_, topic) {
            assert.isTrue(topic.flag);
          }
        },
        teardown: function (topic) {
            topic.flag = false;
        },
        "with a subcontext" : {
            topic: function (topic) {
                var that = this;
                process.nextTick(function () {
                    that.callback(null, topic);
                });
            },
            "Waits for the subcontext before teardown" : function(topic) {
                assert.isTrue(topic.flag);
            }
        }
    }
}).export(module);

vows.describe("Vows with sub events").addBatch({
    "A context with sub-events": {
        topic: function () {
            var topic = new(events.EventEmitter);
            topic.emit('before', 'before');

            process.nextTick(function () {
                topic.emit('request', 'request_data');
            });

            process.nextTick(function () {
                topic.emit('end', 'end_data');
            });

            process.nextTick(function () {
                topic.emit('nested', 'empty_nest');
            });

            process.nextTick(function () {
                topic.emit('success', 'legacey_data');
            });

            return topic;
        },
        on: {
            "before": {
                "will catch events emited before the topic returns" : function (ret) {
                    assert.strictEqual(ret, 'before');
                }
            },
            "request": {
                "will catch request": function (ret) {
                    assert.strictEqual(ret, 'request_data');
                },
                on: {
                    on: {
                        "end": {
                            "will require that 'end' is emitted after 'request'": function (ret) {
                                assert.strictEqual(ret, 'end_data');
                                // TODO need a test that fails to prove this works
                            }
                        }
                    }
                }
            },
            on: {
                on: {
                    "nested": {
                        "will catch nested, even if it is in empty nested 'on'": function (ret) {
                            assert.strictEqual(ret, 'empty_nest')
                        }
                    }
                }
            }
        },
        "will catch the legacy success event": function (err, ret) {
            assert.strictEqual(ret, 'legacey_data');
        }
    },
    "Sub-events emitted by children of EventEmitter": {
        topic: function() {
            var MyEmitter = function () {
                events.EventEmitter.call(this);
            };
            require('util').inherits(MyEmitter, events.EventEmitter);

            var topic = new(MyEmitter);
            process.nextTick(function () {
                topic.emit('success', 'Legacy Does not Catch');
            });

            return topic;
        },
        "will return the emitter for traditional vows" : function (err, ret) {
            assert.ok(ret instanceof events.EventEmitter);
        },
        // events is an alias for on
        events: {
            "success" : {
                "will catch the event" : function (ret) {
                    assert.strictEqual(ret, 'Legacy Does not Catch');
                },
                "will change events to on in the title" : function() {
                    assert.strictEqual(this.context.title,
                        'Sub-events emitted by children of EventEmitter on success');
                }
            }
        }
    }
}).export(module);

var tornDown = false

vows.describe("Vows with asynchonous teardowns").addBatch({
    "Context with long-running teardown": {
        "is run first": function () {},
        teardown: function () {
            var callback = this.callback;

            setTimeout(function () {
                tornDown = true;
                callback();
            }, 100);
        }
    }
}).addBatch({
    "The next batch": {
        "is not run until the teardown is complete": function () {
            assert.ok(tornDown);
        }
    }
}).export(module);

vows.describe('Async topic is passed to vows with topic-less subcontext').addBatch({
    'Async 42': {
        topic: function () {
            var callback = this.callback;
            process.nextTick(function () {
                callback(null, 42);
            });
        },
        'equals 42': function (topic) {
            assert.equal(topic, 42);
        },
        'has the property that': {
            'it is equal to 42': function (topic) {
                // <-- This vow fails, topic is undefined!?
                assert.equal(topic, 42);
            }
        },
        'plus 1': {
            topic: function (parentTopic) {
                return parentTopic + 1;
            },
            'equals 43': function (topic) {
                assert.equal(topic, 43);
            }
        }
    }
})['export'](module);
