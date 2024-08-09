'use strict'

var NAMES = require('../names')
var DB = NAMES.DB
var REDIS = NAMES.REDIS


function recordRedis(segment, scope) {
  var duration = segment.getDurationInMillis()
  var exclusive = segment.getExclusiveDurationInMillis()
  var transaction = segment.transaction
  var type = transaction.isWeb() ? DB.WEB : DB.OTHER
  var operation = segment.name


  if (scope) transaction.measure(operation, scope, duration, exclusive)

  transaction.measure(operation, null, duration, exclusive)
  transaction.measure(DB.PREFIX + type, null, duration, exclusive)
  transaction.measure(DB.PREFIX + REDIS.PREFIX + '/' + type, null, duration, exclusive)
  transaction.measure(DB.ALL, null, duration, exclusive)
  transaction.measure(REDIS.ALL, null, duration, exclusive)

  // Datastore instance metrics.
  if (segment.parameters.hasOwnProperty('host') &&
      segment.parameters.hasOwnProperty('port_path_or_id')) {
    var instanceName =
      DB.INSTANCE + '/' + REDIS.PREFIX + '/' + segment.parameters.host + '/' +
      segment.parameters.port_path_or_id
    transaction.measure(instanceName, null, duration, exclusive)
  }
}
// disabled until metric explosions can be handled by server
/*
  if (segment.port > 0) {
  var hostname = segment.host || 'localhost'
  var location = hostname + ':' + segment.port
  var instance = DB.INSTANCE + '/' + REDIS.PREFIX + '/' + location

  transaction.measure(instance, null, duration, exclusive)
  }
*/


module.exports = recordRedis
