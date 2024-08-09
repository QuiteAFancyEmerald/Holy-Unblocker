'use strict'

function record(path, segment, scope) {
  var duration = segment.getDurationInMillis()
  var exclusive = segment.getExclusiveDurationInMillis()
  var transaction = segment.transaction

  var metricName = segment.name + '/' + path

  if (scope) transaction.measure(metricName, scope, duration, exclusive)

  transaction.measure(metricName, null, duration, exclusive)
}

module.exports = record
