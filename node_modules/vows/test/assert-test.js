var vows = require('../lib/vows');
var assert = require('assert');

vows.describe('vows/assert').addBatch({
    "The Assertion module": {
        "`equal`": function () {
            assert.equal("hello world", "hello world");
            assert.equal(1, true);
        },
        "`epsilon`": function() {
            assertNoArguments(assert.epsilon);
            assert.epsilon(1e-5, 0.1+0.2, 0.3);
            assert.throws(function() {
              assert.epsilon(1e-5, NaN, 0.3);
            });
            assert.throws(function() {
              assert.epsilon(NaN, 1.0, 1.0);
            });
        },
        "`match`": function () {
            assertNoArguments(assert.match);
            assert.match("hello world", /^[a-z]+ [a-z]+$/);
        },
        "`lengthOf`": function () {
            assertNoArguments(assert.lengthOf);
            assert.lengthOf("hello world", 11);
            assert.lengthOf([1, 2, 3], 3);
            assert.lengthOf({goo: true, gies: false}, 2);
        },
        "`isDefined`": function () {
            assertNoArguments(assert.isDefined);
            assert.isDefined(null);
            assertError(assert.isDefined, undefined);
        },
        "`include`": function () {
            assertNoArguments(assert.include);
            assert.include("hello world", "world");
            assert.include([0, 42, 0],    42);
            assert.include({goo:true},    'goo');
        },
        "`deepInclude`": function () {
            assertNoArguments(assert.deepInclude);
            assert.deepInclude([{a:'b'},{c:'d'}], {a:'b'});
            assert.deepInclude("hello world", "world");
            assert.deepInclude({goo:true},    'goo');
        },
        "`typeOf`": function () {
            assertNoArguments(assert.typeOf);
            assert.typeOf('goo', 'string');
            assert.typeOf(42,    'number');
            assert.typeOf([],    'array');
            assert.typeOf({},    'object');
            assert.typeOf(false, 'boolean');
        },
        "`instanceOf`": function () {
            assertNoArguments(assert.instanceOf);
            assert.instanceOf([], Array);
            assert.instanceOf(function () {}, Function);
        },
        "`isArray`": function () {
            assertNoArguments(assert.isArray);
            assert.isArray([]);
            assertError(assert.isArray, {});
        },
        "`isString`": function () {
            assertNoArguments(assert.isString);
            assert.isString("");
        },
        "`isObject`": function () {
            assertNoArguments(assert.isObject);
            assert.isObject({});
            assertError(assert.isObject, []);
        },
        "`isNumber`": function () {
            assertNoArguments(assert.isNumber);
            assert.isNumber(0);
        },
        "`isBoolean`": function (){
            assertNoArguments(assert.isBoolean);
            assert.isBoolean(true);
            assert.isBoolean(false);
            assertError(assert.isBoolean, 0);
        },
        "`isNan`": function () {
            assertNoArguments(assert.isNaN);
            assert.isNaN(0/0);
        },
        "`isTrue`": function () {
            assertNoArguments(assert.isTrue);
            assert.isTrue(true);
            assertError(assert.isTrue, 1);
        },
        "`isFalse`": function () {
            assertNoArguments(assert.isFalse);
            assert.isFalse(false);
            assertError(assert.isFalse, 0);
        },
        "`isZero`": function () {
            assertNoArguments(assert.isZero);
            assert.isZero(0);
            assertError(assert.isZero, null);
        },
        "`isNotZero`": function () {
            assertNoArguments(assert.isNotZero);
            assert.isNotZero(1);
        },
        "`isUndefined`": function () {
            assertNoArguments(assert.isUndefined);
            assert.isUndefined(undefined);
            assertError(assert.isUndefined, null);
        },
        "`isNull`": function () {
            assertNoArguments(assert.isNull);
            assert.isNull(null);
            assertError(assert.isNull, 0);
            assertError(assert.isNull, undefined);
        },
        "`isNotNull`": function () {
            assertNoArguments(assert.isNotNull);
            assert.isNotNull(0);
        },
        "`greater` and `lesser`": function () {
            assertNoArguments(assert.greater);
            assertNoArguments(assert.lesser);
            assert.greater(5, 4);
            assert.lesser(4, 5);
        },
        "`inDelta`": function () {
            assertNoArguments(assert.inDelta);
            assert.inDelta(42, 40, 5);
            assert.inDelta(42, 40, 2);
            assert.inDelta(42, 42, 0);
            assert.inDelta(3.1, 3.0, 0.2);
            assertError(assert.inDelta, [42, 40, 1]);
        },
        "`isEmpty`": function () {
            assertNoArguments(assert.isEmpty);
            assert.isEmpty({});
            assert.isEmpty([]);
            assert.isEmpty("");
        },
        "`isNotEmpty`": function () {
            assertNoArguments(assert.isNotEmpty);
            assert.isNotEmpty({goo:true});
            assert.isNotEmpty([1]);
            assert.isNotEmpty(" ");
            assertError(assert.isNotEmpty, {});
            assertError(assert.isNotEmpty, []);
            assertError(assert.isNotEmpty, "");
        },
        "`notIncludes`": function () {
            assert.notIncludes([1, 2, 3], 4);
            assert.notIncludes({"red": 1, "blue": 2}, "green");
        }
    },

    'An AssertionError': {
        topic: function generateAssertionError() {
            try {
                assert.isFalse(true);
            } catch (e) {
                return e.toStringEx();
            }
        },
        'should have full path in stack trace': function(topic) {
            var regexp = new RegExp("// " + __filename + ":\\d+");
            assert.isTrue(regexp.test(topic));
        }
    },
}).export(module);

function assertError(assertion, args, fail) {
    if (!Array.isArray(args)) { args = [args]; }
    try {
        assertion.apply(null, args);
        fail = true;
    } catch (e) {/* Success */}

    if (fail) {
        assert.fail(
            args.join(' '), assert.AssertionError,
           "expected an AssertionError for {actual}",
           "assertError", assertError
        );
    }
}

function assertNoArguments(assertion) {
    var fail;
    try {
        assertion.apply(null, []);
        fail = true;
    } catch (e) {/* Success */}

    if (fail) {
        assert.fail(
            "", assert.AssertionError,
            "expected an AssertionError for missing argument(s)",
            "assertError", assertError
        );
    }
}
