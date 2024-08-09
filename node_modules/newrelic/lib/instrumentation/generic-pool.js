'use strict'

var shimmer = require('../shimmer')


module.exports = function initialize(agent, generic) {
  if (!generic || !generic.Pool || !generic.Pool.prototype) {
    return false
  }

  var proto = generic.Pool.prototype
  shimmer.wrapMethod(proto, 'Pool', 'acquire', function wrapAcquire(acquire) {
    return function wrappedAcquire(callback, priority) {
      if (typeof callback === 'function') {
        /* See adjustCallback in generic-pool.js for the motivation behind
         * this grotesque hack. Tl;dr: depending on Function.length is evil.
         */
        var proxied = agent.tracer.bindFunction(callback)
        switch (callback.length) {
          case 2:
            callback = function moveAlongNothingToSeeHere(error, client) {
              return proxied.call(this, error, client)
            }
            break
          case 1:
            callback = function moveAlongNothingToSeeHere(client) {
              return proxied.call(this, client)
            }
            break
          default:
            callback = proxied
        }
      }

      return acquire.call(this, callback, priority)
    }
  })

  shimmer.wrapMethod(proto, 'Pool', ['drain', 'destroyAllNow'], function wrap(original) {
    return function wrapper(cb) {
      return original.call(this, agent.tracer.bindFunction(cb))
    }
  })
}
