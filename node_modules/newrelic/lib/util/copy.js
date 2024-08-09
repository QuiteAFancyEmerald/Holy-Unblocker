'use strict'

exports.shallow = shallowCopy

/**
 * Performs a shallow copy of all properties on the source object.
 *
 * @param {object} source     - The object to copy the properties from.
 * @param {object} [dest={}]  - The object to copy the properties to.
 *
 * @return {object} The destination object.
 */
function shallowCopy(source, dest) {
  dest = dest || {}
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      dest[k] = source[k]
    }
  }
  return dest
}
