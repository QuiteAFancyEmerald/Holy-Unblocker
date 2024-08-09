'use strict'

var wrap = require('../../shimmer').wrapMethod

module.exports = initialize

function initialize(agent, childProcess) {
  var methods = ['exec', 'execFile']

  wrap(childProcess, 'childProcess', methods, wrapMethod)

  function wrapMethod(fn, method) {
    return agent.tracer.wrapFunctionLast('child_process.' + method, null, fn)
  }
}
