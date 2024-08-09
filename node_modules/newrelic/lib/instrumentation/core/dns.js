'use strict'

var shimmer = require('../../shimmer')

module.exports = initialize

function initialize(agent, dns) {
  var methods = [
    'lookup',
    'resolve',
    'resolve4',
    'resolve6',
    'resolveCname',
    'resolveMx',
    'resolveNaptr',
    'resolveNs',
    'resolvePtr',
    'resolveSrv',
    'resolveTxt',
    'reverse'
  ]

  shimmer.wrapMethod(dns, 'dns', methods, function wrapMethods(fn, method) {
    return agent.tracer.wrapFunction('dns.' + method, null, fn, wrapDnsArgs)
  })

  function wrapDnsArgs(segment, args) {
    var lastIdx = args.length - 1
    args[lastIdx] = agent.tracer.bindFunction(args[lastIdx], segment, true)
    return args
  }
}
