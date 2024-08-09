'use strict'

var NAMES = require('../names')
var DB = NAMES.DB
var MEMCACHE = NAMES.MEMCACHE


function recordMemcache(segment, scope) {
  var duration = segment.getDurationInMillis()
  var exclusive = segment.getExclusiveDurationInMillis()
  var transaction = segment.transaction
  var type = transaction.isWeb() ? DB.WEB : DB.OTHER
  var operation = segment.name


  if (scope) transaction.measure(operation, scope, duration, exclusive)

  transaction.measure(operation, null, duration, exclusive)
  transaction.measure(DB.PREFIX + type, null, duration, exclusive)
  transaction.measure(DB.PREFIX + MEMCACHE.PREFIX + '/' + type, null, duration, exclusive)
  transaction.measure(DB.ALL, null, duration, exclusive)
  transaction.measure(MEMCACHE.ALL, null, duration, exclusive)

  // Datastore instance metrics.
  if (segment.parameters.hasOwnProperty('host') &&
      segment.parameters.hasOwnProperty('port_path_or_id')) {
    var instanceName =
      DB.INSTANCE + '/' + MEMCACHE.PREFIX + '/' + segment.parameters.host + '/' +
      segment.parameters.port_path_or_id
    transaction.measure(instanceName, null, duration, exclusive)
  }
}
// disabled until metric explosions can be handled by server
/*
  if (segment.port > 0) {
  var hostname = segment.host || 'localhost'
  var location = hostname + ':' + segment.port
  var instance = DB.INSTANCE + '/' + MEMCACHE.PREFIX + '/' + location

  transaction.measure(instance, null, duration, exclusive)
  }
*/


module.exports = recordMemcache
