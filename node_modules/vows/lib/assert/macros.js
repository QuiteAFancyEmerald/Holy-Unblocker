var assert = require('assert'),
    utils = require('./utils');

var messages = {
    'equal'       : "expected {expected},\n\tgot\t {actual} ({operator})",
    'notEqual'    : "didn't expect {actual} ({operator})"
};
messages['strictEqual']    = messages['deepEqual']    = messages['equal'];
messages['notStrictEqual'] = messages['notDeepEqual'] = messages['notEqual'];

for (var key in messages) {
    assert[key] = (function (key, callback) {
        return function (actual, expected, message) {
            callback(actual, expected, message || messages[key]);
        };
    })(key, assert[key]);
}

assert.epsilon = function (eps, actual, expected, message) {
    assertMissingArguments(arguments, assert.epsilon);
    if (isNaN(eps)) {
        assert.fail(actual, expected, message || "cannot compare {actual} with {expected} \u00B1 NaN");
    } else if (isNaN(actual) || Math.abs(actual - expected) > eps) {
        assert.fail(actual, expected, message || "expected {expected} \u00B1"+ eps +", but was {actual}");
    }
};

assert.ok = (function (callback) {
    assertMissingArguments(arguments, assert.ok);
    return function (actual, message) {
        callback(actual, message ||  "expected expression to evaluate to {expected}, but was {actual}");
    };
})(assert.ok);

assert.match = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.match);
    if (! expected.test(actual)) {
        assert.fail(actual, expected, message || "expected {actual} to match {expected}", "match", assert.match);
    }
};
assert.matches = assert.match;

assert.isTrue = function (actual, message) {
    assertMissingArguments(arguments, assert.isTrue);
    if (actual !== true) {
        assert.fail(actual, true, message || "expected {expected}, got {actual}", "===", assert.isTrue);
    }
};
assert.isFalse = function (actual, message) {
    assertMissingArguments(arguments, assert.isFalse);
    if (actual !== false) {
        assert.fail(actual, false, message || "expected {expected}, got {actual}", "===", assert.isFalse);
    }
};
assert.isZero = function (actual, message) {
    assertMissingArguments(arguments, assert.isZero);
    if (actual !== 0) {
        assert.fail(actual, 0, message || "expected {expected}, got {actual}", "===", assert.isZero);
    }
};
assert.isNotZero = function (actual, message) {
    assertMissingArguments(arguments, assert.isNotZero);
    if (actual === 0) {
        assert.fail(actual, 0, message || "expected non-zero value, got {actual}", "===", assert.isNotZero);
    }
};

assert.greater = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.greater);
    if (actual <= expected) {
        assert.fail(actual, expected, message || "expected {actual} to be greater than {expected}", ">", assert.greater);
    }
};
assert.lesser = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.lesser);
    if (actual >= expected) {
        assert.fail(actual, expected, message || "expected {actual} to be lesser than {expected}", "<", assert.lesser);
    }
};

assert.inDelta = function (actual, expected, delta, message) {
    assertMissingArguments(arguments, assert.inDelta);
    var lower = expected - delta;
    var upper = expected + delta;
    if (actual != +actual || actual < lower || actual > upper) {
        assert.fail(actual, expected, message || "expected {actual} to be in within *" + delta.toString() + "* of {expected}", null, assert.inDelta);
    }
};

//
// Inclusion
//
assert.include = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.include);
    if ((function (obj) {
        if (isArray(obj) || isString(obj)) {
            return obj.indexOf(expected) === -1;
        } else if (isObject(actual)) {
            return ! obj.hasOwnProperty(expected);
        }
        return true;
    })(actual)) {
        assert.fail(actual, expected, message || "expected {actual} to include {expected}", "include", assert.include);
    }
};
assert.includes = assert.include;

assert.notInclude = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.notInclude);
    if ((function (obj) {
        if (isArray(obj) || isString(obj)) {
            return obj.indexOf(expected) !== -1;
        } else if (isObject(actual)) {
            return obj.hasOwnProperty(expected);
        }
        return true;
    })(actual)) {
        assert.fail(actual, expected, message || "expected {actual} not to include {expected}", "include", assert.notInclude);
    }
};
assert.notIncludes = assert.notInclude;

assert.deepInclude = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.deepInclude);
    if (!isArray(actual)) {
        return assert.include(actual, expected, message);
    }
    if (!actual.some(function (item) { return utils.deepEqual(item, expected) })) {
        assert.fail(actual, expected, message || "expected {actual} to include {expected}", "include", assert.deepInclude);
    }
};
assert.deepIncludes = assert.deepInclude;

//
// Length
//
assert.isEmpty = function (actual, message) {
    assertMissingArguments(arguments, assert.isEmpty);
    if ((isObject(actual) && Object.keys(actual).length > 0) || actual.length > 0) {
        assert.fail(actual, 0, message || "expected {actual} to be empty", "length", assert.isEmpty);
    }
};
assert.isNotEmpty = function (actual, message) {
    assertMissingArguments(arguments, assert.isNotEmpty);
    if ((isObject(actual) && Object.keys(actual).length === 0) || actual.length === 0) {
        assert.fail(actual, 0, message || "expected {actual} to be not empty", "length", assert.isNotEmpty);
    }
};

assert.lengthOf = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.lengthOf);
    var len = isObject(actual) ? Object.keys(actual).length : actual.length;
    if (len !== expected) {
        assert.fail(actual, expected, message || "expected {actual} to have {expected} element(s)", "length", assert.length);
    }
};

//
// Type
//
assert.isArray = function (actual, message) {
    assertMissingArguments(arguments, assert.isArray);
    assertTypeOf(actual, 'array', message || "expected {actual} to be an Array", assert.isArray);
};
assert.isObject = function (actual, message) {
    assertMissingArguments(arguments, assert.isObject);
    assertTypeOf(actual, 'object', message || "expected {actual} to be an Object", assert.isObject);
};
assert.isNumber = function (actual, message) {
    assertMissingArguments(arguments, assert.isNumber);
    if (isNaN(actual)) {
        assert.fail(actual, 'number', message || "expected {actual} to be of type {expected}", "isNaN", assert.isNumber);
    } else {
        assertTypeOf(actual, 'number', message || "expected {actual} to be a Number", assert.isNumber);
    }
};
assert.isBoolean = function (actual, message) {
    assertMissingArguments(arguments, assert.isBoolean);
    if (actual !== true && actual !== false) {
        assert.fail(actual, 'boolean', message || "expected {actual} to be a Boolean", "===", assert.isBoolean);
    }
};
assert.isNaN = function (actual, message) {
    assertMissingArguments(arguments, assert.isNaN);
    if (actual === actual) {
        assert.fail(actual, 'NaN', message || "expected {actual} to be NaN", "===", assert.isNaN);
    }
};
assert.isNull = function (actual, message) {
    assertMissingArguments(arguments, assert.isNull);
    if (actual !== null) {
        assert.fail(actual, null, message || "expected {expected}, got {actual}", "===", assert.isNull);
    }
};
assert.isNotNull = function (actual, message) {
    assertMissingArguments(arguments, assert.isNotNull);
    if (actual === null) {
        assert.fail(actual, null, message || "expected non-null value, got {actual}", "===", assert.isNotNull);
    }
};
assert.isUndefined = function (actual, message) {
    assertMissingArguments(arguments, assert.isUndefined);
    if (actual !== undefined) {
        assert.fail(actual, undefined, message || "expected {actual} to be {expected}", "===", assert.isUndefined);
    }
};
assert.isDefined = function (actual, message) {
    assertMissingArguments(arguments, assert.isDefined);
    if(actual === undefined) {
        assert.fail(actual, 0, message || "expected {actual} to be defined", "===", assert.isDefined);
    }
};
assert.isString = function (actual, message) {
    assertMissingArguments(arguments, assert.isString);
    assertTypeOf(actual, 'string', message || "expected {actual} to be a String", assert.isString);
};
assert.isFunction = function (actual, message) {
    assertMissingArguments(arguments, assert.isFunction);
    assertTypeOf(actual, 'function', message || "expected {actual} to be a Function", assert.isFunction);
};
assert.typeOf = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.typeOf);
    assertTypeOf(actual, expected, message, assert.typeOf);
};
assert.instanceOf = function (actual, expected, message) {
    assertMissingArguments(arguments, assert.instanceof);
    if (! (actual instanceof expected)) {
        assert.fail(actual, expected, message || "expected {actual} to be an instance of {expected}", "instanceof", assert.instanceOf);
    }
};

//
// Utility functions
//

function assertMissingArguments(args, caller) {
    if (args.length === 0) {
        assert.fail("", "", "expected number of arguments to be greater than zero", "", caller);
    }
}

function assertTypeOf(actual, expected, message, caller) {
    if (typeOf(actual) !== expected) {
        assert.fail(actual, expected, message || "expected {actual} to be of type {expected}", "typeOf", caller);
    }
}

function isArray (obj) {
    return Array.isArray(obj);
}

function isString (obj) {
    return typeof(obj) === 'string' || obj instanceof String;
}

function isObject (obj) {
    return typeof(obj) === 'object' && obj && !isArray(obj);
}

// A better `typeof`
function typeOf(value) {
    var s = typeof(value),
        types = [Object, Array, String, RegExp, Number, Function, Boolean, Date];

    if (s === 'object' || s === 'function') {
        if (value) {
            types.forEach(function (t) {
                if (value instanceof t) { s = t.name.toLowerCase() }
            });
        } else { s = 'null' }
    }
    return s;
}
