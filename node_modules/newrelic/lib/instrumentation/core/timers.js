'use strict'

var wrap = require('../../shimmer').wrapMethod
var semver = require('semver')

module.exports = initialize

function initialize(agent, timers) {
  // As of iojs 1.6.3 all timers are on the global object, and do
  // not need a require('timers') call to access them
  if (timers !== global && semver.satisfies(process.version, '>=1.6.3') &&
      global.setTimeout && !global.setTimeout.__NR_original) {
    initialize(agent, global)
  }

  var processMethods = ['nextTick', '_nextDomainTick', '_tickDomainCallback']

  wrap(process, 'process', processMethods, function bindProcess(original, method) {
    return agent.tracer.wrapFunctionFirstNoSegment(original, method)
  })

  var asynchronizers = [
    'setTimeout',
    'setInterval'
  ]

  wrap(timers, 'timers', asynchronizers, function wrapTimers(original, method) {
    return agent.tracer.wrapFunctionFirst('timers.' + method, null, original)
  })

  // We don't want to create segments for setImmediate calls, as the
  // object allocation may incur too much overhead in some situations
  var uninstrumented = [
    'setImmediate'
  ]

  wrap(timers, 'timers', uninstrumented, function wrapUninstrumented(original, method) {
    return agent.tracer.wrapFunctionFirstNoSegment(original, method)
  })

  var clearTimeouts = ['clearTimeout']

  wrap(timers, 'timers', clearTimeouts, function wrapClear(original) {
    return function wrappedClear(timer) {
      var segment
      if (timer && timer._onTimeout) {
        segment = agent.tracer.getSegmentFromWrapped(timer._onTimeout)
        timer._onTimeout = agent.tracer.getOriginal(timer._onTimeout)
      }

      if (timer && timer._onImmediate) {
        timer._onImmediate = agent.tracer.getOriginal(timer._onImmediate)
      }

      if (segment) segment.ignore = true

      return original.apply(this, arguments)
    }
  })
}
