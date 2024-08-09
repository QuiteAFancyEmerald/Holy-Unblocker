'use strict'

var NAMES = require('../names')
var DB = NAMES.DB
var CASSANDRA = NAMES.CASSANDRA


function record(segment, scope) {
  var duration = segment.getDurationInMillis()
  var exclusive = segment.getExclusiveDurationInMillis()
  var transaction = segment.transaction
  var type = transaction.isWeb() ? DB.WEB : DB.OTHER
  var operation = segment.name


  if (scope) transaction.measure(operation, scope, duration, exclusive)

  transaction.measure(operation, null, duration, exclusive)
  transaction.measure(DB.PREFIX + type, null, duration, exclusive)
  transaction.measure(DB.ALL, null, duration, exclusive)
  transaction.measure(
    DB.PREFIX + CASSANDRA.PREFIX + '/' + type,
    null,
    duration,
    exclusive
  )
  transaction.measure(CASSANDRA.ALL, null, duration, exclusive)
}
// disabled until metric explosions can be handled by server
/*
  if (segment.port > 0) {
  var hostname = segment.host || 'localhost'
  var location = hostname + ':' + segment.port
  var instance = DB.INSTANCE + '/' + CASSANDRA.PREFIX + '/' + location

  transaction.measure(instance, null, duration, exclusive)
  }
*/

module.exports = record
