'use strict'

/**
 * Flatten nested maps of JSONifiable data.
 *
 * Ex: {a: 5, b: {c: true, d: 7}} -> {a: 5, 'b.c': true, 'b.d': 7}
 *
 * @param result Object to place key-value pairs into, normally called with {}
 * @param prefix Prefix for keys, normally called with ''
 * @param obj    Object to be flattened
 *
 * @return Object with flattened key-value pairs
 */
module.exports = function flatten(result, prefix, obj, seen) {
  seen = seen || []
  seen.push(obj)

  for (var key in obj) {
    if (seen.indexOf(obj[key]) > -1) {
      continue
    }

    if (obj[key] instanceof Object) flatten(result, prefix + key + '.', obj[key], seen)
    else result[prefix + key] = obj[key]
  }

  return result
}
