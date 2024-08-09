'use strict'

var NAMES = require('../../metrics/names.js')

function recordBackground(segment, scope) {
  // if there was a nested otherTransaction use its recorder instead
  var transaction = segment.transaction
  if (transaction.bgSegment && segment !== transaction.bgSegment) return

  var duration = segment.getDurationInMillis()
  var exclusive = segment.getExclusiveDurationInMillis()
  var totalTime = segment.transaction.trace.getTotalTimeDurationInMillis()
  var group = segment.partialName
  var name = group + '/' + segment.name

  if (scope) {
    transaction.measure(scope, null, duration, exclusive)
    transaction.measure(
      NAMES.BACKGROUND.TOTAL_TIME + '/' + name,
      null,
      totalTime,
      exclusive
    )
  }
  // rollup for background total time doesn't have `/all` where the response
  // time version does.
  transaction.measure(
    NAMES.BACKGROUND.RESPONSE_TIME + '/all',
    null,
    duration,
    exclusive
  )
  transaction.measure(NAMES.BACKGROUND.TOTAL_TIME, null, totalTime, exclusive)
}

module.exports = recordBackground
