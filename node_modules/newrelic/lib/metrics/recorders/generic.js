'use strict'

function record(segment, scope) {
  var duration = segment.getDurationInMillis()
  var exclusive = segment.getExclusiveDurationInMillis()
  var transaction = segment.transaction


  if (scope) transaction.measure(segment.name, scope, duration, exclusive)

  transaction.measure(segment.name, null, duration, exclusive)
}

module.exports = record
