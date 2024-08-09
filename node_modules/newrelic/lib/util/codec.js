'use strict'

var safeJSON = require('./safe-json')
var zlib = require('zlib')

module.exports = {
  /**
   * Take in an object literal, and deflate and then Base64 encode it.
   *
   * zlib works with streams, so this must be used asynchronously.
   *
   * @param {object} data
   *  The data to encode.
   *
   * @param {Function} callback
   *  The callback to take the results. The first parameter is any errors from
   *  encoding, and the second parameter is the encoded data object.
   */
  encode: function encode(data, callback) {
    try {
      zlib.deflate(safeJSON.stringifySync(data), function cb_deflate(err, raw) {
        if (err) return callback(err)

        return callback(null, raw.toString('base64'))
      })
    } catch (err) {
      return callback(err)
    }
  },

  /**
   * Base64 decode a string, decompress it, and then turn the results back into
   * a JavaScript object.
   *
   * zlib works with streams, so this must be used asynchronously.
   *
   * @param {object} encoded
   *  The data to decode.
   *
   * @param {Function} callback
   *  The callback to take the results. The first parameter is any errors from
   *  decoding, and the second parameter is the decoded data object.
   */
  decode: function decode(encoded, callback) {
    zlib.inflate(new Buffer(encoded, 'base64'), function cb_inflate(err, raw) {
      if (err) return callback(err)

      try {
        return callback(null, JSON.parse(raw))
      } catch (error) {
        return callback(error)
      }
    })
  }
}
