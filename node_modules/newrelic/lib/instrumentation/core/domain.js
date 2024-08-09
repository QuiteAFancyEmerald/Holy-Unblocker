'use strict'

var wrap = require('../../shimmer').wrapMethod

module.exports = initialize

function initialize(agent, domain) {
  var proto = domain.Domain.prototype
  wrap(
    proto,
    'domain.Domain.prototype',
    'emit',
    wrapEmit
  )

  function wrapEmit(original) {
    return function wrappedEmit(ev) {
      var shouldRestoreContext = ev === 'error' &&
          agent.tracer.segment === null &&
          this.__NR_transactionSegment
      if (!shouldRestoreContext) {
        return original.apply(this, arguments)
      }

      agent.tracer.segment = this.__NR_transactionSegment
      try {
        return original.apply(this, arguments)
      } finally {
        agent.tracer.segment = null
        this.__NR_transactionSegment = null
      }
    }
  }
}
