'use strict'

var wrap = require('../../shimmer').wrapMethod

module.exports = initialize

function initialize(agent, inspector) {
  var sessionProto = inspector.Session && inspector.Session.prototype
  if (!sessionProto) {
    return false
  }

  wrap(
    sessionProto,
    'inspector.Session.prototype',
    'post',
    function wrapPost(fn) {
      return agent.tracer.wrapFunctionNoSegment(fn, 'post')
    }
  )
}
