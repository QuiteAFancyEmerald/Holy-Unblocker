'use strict'

var format = require('util').format
var logger = require('../logger').child({component: 'new_relic_response'})


/*
 *
 * CONSTANTS
 *
 */
var RESPONSE_VALUE_NAME = 'return_value'
var EXCEPTION_VALUE_NAME = 'exception'


/**
 * The collector has many ways of indicating failure, and isn't
 * necessarily consistent. Because there can either be a failure at
 * the network level, a nonstandard HTTP status code on the response,
 * or a JSON-encoded exception in the response body, there's a lot of
 * conditional logic in here that tries to grab as much information
 * about errors as possible, and to parse out the return value as often
 * as possible.
 *
 * @param string         name     Remote method name that was invoked.
 * @param ServerResponse response HTTP response stream
 * @param Function       callback Function that will be called with any
 *                                error, the value returned by the server
 *                                (if any), and the raw JSON of the
 *                                server's response.
 *
 * @returns Function Another callback that is meant to be invoked with
 *                   any errors from reading the response stream, as
 *                   well as a string containing the full response.
 */
module.exports = function parse(name, response, callback) {
  if (!name) throw new TypeError('collector method name required!')
  if (!response) throw new TypeError('HTTP response required!')
  if (!callback) throw new TypeError('callback required!')

  return function parser(inError, body) {
    /* jshint maxdepth:4 */

    var code = response.statusCode
    var errors = []
    var errorClass
    var json
    var returned


    if (code !== 200) logger.debug("Got %s as a response code from the collector.", code)

    if (inError) errors.push(inError)

    if (body) {
      try {
        json = JSON.parse(body)

        // Can be super verbose, but useful for debugging.
        logger.trace({response: json}, "Deserialized from collector:")

        // If we get messages back from the collector, be polite and pass them along.
        returned = json[RESPONSE_VALUE_NAME]
        if (returned && returned.messages) {
          returned.messages.forEach(function cb_forEach(element) {
            logger.info(element.message)
          })
        }

        /* Wait to deal with errors in the response until any messages have
         * been passed along. Otherwise, ensure that there was a return
         * value, raising an error if not.
         *
         * Some errors are only interesting if the status code indicates
         * that the request went bad already, so filter out adding more
         * errors when statusCode is not OK (200).
         */
        var exception = json[EXCEPTION_VALUE_NAME]
        if (exception) {
          if (exception.message) {
            errors.push(new Error(exception.message))
          } else if (code === 200 ) {
            errors.push(new Error('New Relic internal error'))
          }

          if (exception.error_type) errorClass = exception.error_type
        } else if (code === 200 && returned === undefined) {
          errors.push(new Error(format('No data found in response to %s.', name)))
        }
      } catch (error) {
        logger.trace(error, 'Could not parse response from the collector: %s', body)
        errors.push(error)
      }
    } else {
      errors.push(new Error(format('No body found in response to %s.', name)))
    }

    if (code !== 200) {
      errors.push(new Error(format('Got HTTP %s in response to %s.', code, name)))
    }

    var error
    if (errors.length > 0) {
      error = errors.shift()
      error.statusCode = code
      // Preserve a consistent hidden class (cheaper than sub-classing Error).
      error.class = errorClass ? errorClass : undefined
      error.laterErrors = (errors.length > 0) ? errors : undefined
    }

    // Raw json is useful for testing and logging.
    process.nextTick(function cb_nextTick() {
      callback(error, returned, json)
    })
  }
}
