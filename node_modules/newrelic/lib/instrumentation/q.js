'use strict'

var wrap = require('../shimmer').wrapMethod

module.exports = initialize

function initialize(agent, Q) {
  function wrapUninstrumented(original, method) {
    return agent.tracer.wrapFunctionFirstNoSegment(original, method)
  }

  if (Q.nextTick) {
    // The wrap() call for nextTick wipes the sub-function.  Save a reference
    // now so it can be restored later
    var savedRunAfter = Q.nextTick.runAfter

    wrap(Q, 'Q', 'nextTick', wrapUninstrumented)

    if (savedRunAfter) {
      Q.nextTick.runAfter = savedRunAfter
      wrap(Q.nextTick, 'Q.nextTick', 'runAfter', wrapUninstrumented)
    }
  }
}
