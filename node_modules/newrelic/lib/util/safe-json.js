'use strict'

var stringifySafe = require('json-stringify-safe')

module.exports = {
  parse: function parseAsync(str, cb) {
    try {
      cb(null, JSON.parse(str))
    } catch (err) {
      cb(err, null)
    }
  },

  stringify: function stringifyAsync(obj, cb) {
    try {
      cb(null, stringifySafe(obj))
    } catch (err) {
      cb(err, '[UNPARSABLE OBJECT]')
    }
  },

  stringifySync: function stringifySync(obj, returnVal) {
    try {
      return stringifySafe(obj)
    } catch (err) {
      return returnVal || '[UNPARSABLE OBJECT]'
    }
  }
}
