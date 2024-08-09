'use strict'

var events = require('events')
var wrap = require('../../shimmer').wrapMethod
var promInit = require('../promise')
var semver = require('semver')

module.exports = initialize

/**
 * The spec for the native `Promise` class.
 */
var STATIC_PROMISE_METHODS = ['accept', 'all', 'defer', 'race', 'reject', 'resolve']
var NATIVE_PROMISE_SPEC = {
  name: 'global',
  constructor: 'Promise',
  executor: true,
  $proto: {
    then: ['then', 'chain'],
    catch: ['catch']
  },
  $static: {
    $copy: STATIC_PROMISE_METHODS,
    cast: STATIC_PROMISE_METHODS
  }
}

function initialize(agent) {
  // Add handler for uncaught/fatal exceptions to record them.
  // _fatalException is an undocumented feature of domains, introduced in
  // Node.js v0.8. We use _fatalException when possible because wrapping it will
  // not potentially change the behavior of the server.
  if (process._fatalException) {
    wrap(process, 'process', '_fatalException', function wrapper(original) {
      return function wrappedFatalException(error) {
        // Only record the error if we are not currently within an instrumented
        // domain.
        if (!process.domain) {
          agent.errors.add(null, error)
          agent.tracer.segment = null
        }
        return original.apply(this, arguments)
      }
    })

    wrap(
      process,
      'process',
      'emit',
      function wrapEmit(original) {
        return function wrappedEmit(ev, error, promise) {
          // Check for unhandledRejections here so we don't change the
          // behavior of the event
          if (ev === 'unhandledRejection' && error && !process.domain) {
            if (listenerCount(process, 'unhandledRejection') === 0) {
            // If there are no unhandledRejection handlers report the error
              var transaction = promise.__NR_segment && promise.__NR_segment.transaction
              agent.errors.add(transaction, error)
            }
          }

          return original.apply(this, arguments)
        }
      }
    )
  } else {
    wrap(
      process,
      'process',
      'emit',
      function wrapEmit(original) {
        return function wrappedEmit(ev, error, promise) {
          if (ev === 'uncaughtException' && error && !process.domain) {
            agent.errors.add(null, error)
            agent.tracer.segment = null
          }

          // Check for unhandledRejections here so we don't change the
          // behavior of the event
          if (ev === 'unhandledRejection' && error && !process.domain) {
            // If there are no unhandledRejection handlers report the error
            if (listenerCount(process, 'unhandledRejection') === 0) {
              var transaction = promise.__NR_segment && promise.__NR_segment.transaction
              agent.errors.add(transaction, error)
            }
          }

          return original.apply(this, arguments)
        }
      }
    )
  }

  // Promises don't exist prior to version 12
  if (semver.satisfies(process.version, '>=0.12')) {
    promInit(agent, global, NATIVE_PROMISE_SPEC)
  }
}

function listenerCount(emitter, evnt) {
  if (events.EventEmitter.listenerCount) {
    return events.EventEmitter.listenerCount(emitter, evnt)
  }
  return emitter.listeners(evnt).length
}
