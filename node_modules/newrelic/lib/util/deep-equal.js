'use strict'

function isArguments(object) {
  return Object.prototype.toString.call(object) === '[object Arguments]'
}

function slice(args) {
  // Array.prototype.slice on arguments array-like is expensive
  var l = args.length, a = [], i
  for (i = 0; i < l; i++) {
    a[i] = args[i]
  }
  return a
}

/**
 * This is a node-specific version of deepEquals, modeled on bits and pieces
 * of loads of other implementations of this algorithm, most notably the
 * one in the Node.js source and Underscore's. It doesn't throw and handles
 * cycles.
 *
 * Everybody who writes one of these functions puts the documentation
 * inline, which makes it incredibly hard to follow. Here's what this version
 * of the algorithm does, in order:
 *
 * 1. === only tests objects and and functions by reference. Null is an object.
 *    Any pair of identical entities failing this test are therefore objects
 *    (including null), which need a recursive compare by attribute.
 * 2. Since the only matching entities to get to this test must be objects, if
 *    a or b is not an object, they're clearly not the same. All unfiltered a
 *    and b getting are objects (including null).
 * 3. null is an object, but null === null. All unfiltered a and b are non-null
 *    objects.
 * 4. Buffers need to be special-cased because they live partially on the wrong
 *    side of the C++ / JavaScript barrier. Still, calling this on structures
 *    that can contain Buffers is a bad idea, because they can contain
 *    multiple megabytes of data and comparing them byte-by-byte is very
 *    expensive. buffertools is a better solution here, but this version of
 *    this code is dependency free.
 * 5. It's much faster to compare dates by numeric value than by lexical value.
 * 6. Same goes for Regexps.
 * 7. The parts of an arguments list most people care about are the arguments
 *    themselves, not the callee, which you shouldn't be looking at anyway.
 * 8. Objects are more complex:
 *    a. ensure that a and b are on the same constructor chain
 *    b. ensure that a and b have the same number of own properties (which is
 *       what Object.keys returns).
 *    c. ensure that cyclical references don't blow up the stack.
 *    d. ensure that all the key names match (faster)
 *    e. ensure that all of the associated values match, recursively (slower)
 *
 * (SOMEWHAT UNTESTED) ASSUMPTIONS:
 *
 * o Functions are only considered identical if they unify to the same
 *   reference. To anything else is to invite the wrath of the halting problem.
 * o V8 is smart enough to optimize treating an Array like any other kind of
 *   object.
 * o Users of this function are cool with mutually recursive data structures
 *   that are otherwise identical being treated as the same.
 */
function deeper(a, b, ca, cb) {
  if (a === b) {
    return true
  } else if (typeof a !== 'object' || typeof b !== 'object') {
    return false
  } else if (a === null || b === null) {
    return false
  } else if (Buffer.isBuffer(a) && Buffer.isBuffer(b)) {
    if (a.length !== b.length) return false

    // potentially incredibly expensive
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false

    return true
  } else if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  } else if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source &&
           a.global === b.global &&
           a.multiline === b.multiline &&
           a.lastIndex === b.lastIndex &&
           a.ignoreCase === b.ignoreCase
  } else if (isArguments(a) || isArguments(b)) {
    if (!(isArguments(a) && isArguments(b))) return false

    return deeper(slice(a), slice(b), ca, cb)
  }

  if (a.constructor !== b.constructor) return false

  var ka = Object.keys(a), kb = Object.keys(b)
  if (ka.length !== kb.length) return false

  var cal = ca.length
  while (cal--) if (ca[cal] === a) return cb[cal] === b
  ca.push(a); cb.push(b)

  ka.sort(); kb.sort()
  for (var j = ka.length - 1; j >= 0; j--) if (ka[j] !== kb[j]) return false

  var key
  for (var k = ka.length - 1; k >= 0; k--) {
    key = ka[k]
    if (!deeper(a[key], b[key], ca, cb)) return false
  }

  ca.pop(); cb.pop()

  return true
}

module.exports = function exports(a, b) {
  return deeper(a, b, [], [])
}
