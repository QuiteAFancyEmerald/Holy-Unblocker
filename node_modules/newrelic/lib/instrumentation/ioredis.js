'use strict'

var stringifySync = require('../util/safe-json').stringifySync
var shimmer = require('../shimmer')
var urltils = require('../util/urltils.js')
var recordRedis = require('../metrics/recorders/redis.js')
var REDIS = require('../metrics/names').REDIS


module.exports = function initialize(agent, redis) {
  var tracer = agent.tracer

  shimmer.wrapMethod(
    redis && redis.prototype,
    'redis.prototype',
    'sendCommand',
    function wrapSendCommand(original) {
      return tracer.wrapFunction(
        REDIS.OPERATION + 'Unknown',
        recordRedis,
        original,
        wrapper
      )
    }
  )

  function wrapper(segment, args) {
    var command = args[0]

    var keys = command.args
    segment.name = REDIS.OPERATION + (command.name || 'unknown')
    if (keys && typeof keys !== 'function') {
      urltils.copyParameters(agent.config,
        {key: stringifySync(keys[0], 'Unknown')}, segment.parameters)
    }

    // capture connection info for datastore instance metric
    segment.port = this.connector.options.port
    segment.host = this.connector.options.host

    // record duration when promise resolves
    command.promise.finally(function cb_resolved() {
      segment.touch()
    })

    return args
  }
}
