'use strict'

var NAMES = require('../names')

function record(segment, scope) {
  var duration = segment.getDurationInMillis()
  var exclusive = segment.getExclusiveDurationInMillis()
  var transaction = segment.transaction
  var name = NAMES.CUSTOM + NAMES.ACTION_DELIMITER + segment.name

  if (scope) transaction.measure(name, scope, duration, exclusive)

  transaction.measure(name, null, duration, exclusive)
}

module.exports = record
