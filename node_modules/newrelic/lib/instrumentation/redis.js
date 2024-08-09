'use strict'

var logger = require('../logger').child({component: 'redis'})
var stringifySync = require('../util/safe-json').stringifySync
var shimmer = require('../shimmer')
var urltils = require('../util/urltils.js')
var recordRedis = require('../metrics/recorders/redis.js')
var REDIS = require('../metrics/names').REDIS


module.exports = function initialize(agent, redis) {
  var tracer = agent.tracer

  var redisPrototype = redis && redis.RedisClient && redis.RedisClient.prototype
  if (redisPrototype) {
    if (redisPrototype.internal_send_command) {
      shimmer.wrapMethod(
        redisPrototype,
        'redis.RedisClient.prototype',
        'internal_send_command',
        function wrapSendCommand(original) {
          return tracer.wrapFunction(
            REDIS.OPERATION + 'Unknown',
            recordRedis,
            original,
            internalSendCommandWrapper
          )
        }
      )
    } else {
      shimmer.wrapMethod(
        redisPrototype,
        'redis.RedisClient.prototype',
        'send_command',
        function wrapSendCommand(original) {
          return tracer.wrapFunction(
            REDIS.OPERATION + 'Unknown',
            recordRedis,
            original,
            sendCommandWrapper
          )
        }
      )
    }
  }

  function sendCommandWrapper(segment, args, bind) {
    var position = args.length - 1
    var keys = args[1]
    var last = args[position]

    segment.name = REDIS.OPERATION + (args[0] || 'unknown')

    if (keys && typeof keys !== 'function') {
      urltils.copyParameters(agent.config,
        {key: stringifySync(keys[0], 'Unknown')}, segment.parameters)
    }

    // capture connection info for datastore instance metric
    captureInstanceAttributes(segment, this)

    if (typeof last === 'function') {
      args[position] = bind(last, true, true)
    } else if (Array.isArray(last) && typeof last[last.length - 1] === 'function') {
      last[last.length - 1] = bind(last[last.length - 1], true, true)
    } else { // let's shove a callback in there for fun
      args.push(bind(null, true, true))
    }

    return args
  }

  function internalSendCommandWrapper(segment, args, bind) {
    var keys = args[0].args
    var command = args[0].command
    var cb = args[0].callback

    if (cb instanceof Function) {
      args[0].callback = bind(cb, true, true)
    } else {
      var self = this
      args[0].callback = tracer.bindFunction(function __NR_redisCallback(err) {
        if (err && self.emit instanceof Function) {
          self.emit('error', err)
        }
      }, segment, true)
    }

    segment.name = REDIS.OPERATION + (command || 'unknown')

    if (keys && typeof keys !== 'function') {
      urltils.copyParameters(agent.config,
        {key: stringifySync(keys[0], 'Unknown')}, segment.parameters)
    }

    // capture connection info for datastore instance metric
    captureInstanceAttributes(segment, this)

    return args
  }
}

function captureInstanceAttributes(segment, client) {
  if (client.hasOwnProperty('port') && client.hasOwnProperty('host')) {
    // for redis <=0.11
    doCapture(client)
  } else if (client.hasOwnProperty('connection_options')) {
    // for redis 2.4.0 - 2.6.2
    doCapture(client.connection_options)
  } else if (client.hasOwnProperty('connectionOption')) {
    // for redis 0.12 - 2.2.5
    doCapture(client.connectionOption)
  } else if (client.hasOwnProperty('options')) {
    // for redis 2.3.0 - 2.3.1
    doCapture(client.options)
  } else {
    logger.debug('Could not access instance attributes on connection.')
  }

  function doCapture(opts) {
    var db = (client.hasOwnProperty('selected_db') ? client.selected_db : opts.db) || 0

    segment.captureDBInstanceAttributes(
      opts.host || 'localhost',
      opts.path || opts.port || '6379',
      db
    )
  }
}
