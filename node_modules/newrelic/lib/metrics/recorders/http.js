'use strict'

var NAMES = require('../../metrics/names.js')

// CONSTANTS
var TO_MILLIS = 1e3

function recordWeb(segment, scope) {
  // in web metrics, scope is required
  if (!scope) return

  var transaction = segment.transaction
  // if there was a nested webTransaction use its recorder instead
  if (transaction.webSegment && segment !== transaction.webSegment) return

  var duration = segment.getDurationInMillis()
  var totalTime = transaction.trace.getTotalTimeDurationInMillis()
  var exclusive = segment.getExclusiveDurationInMillis()
  var partial = segment.partialName
  var config = segment.transaction.agent.config
  // named / key transaction support requires per-name apdexT
  var keyApdexInMillis = config.web_transactions_apdex[scope] * TO_MILLIS || 0

  transaction.measure(NAMES.WEB.RESPONSE_TIME, null, duration, exclusive)
  transaction.measure(NAMES.WEB.TOTAL_TIME, null, totalTime, exclusive)
  transaction.measure(NAMES.HTTP, null, duration, exclusive)
  transaction.measure(scope, null, duration, exclusive)
  transaction.measure(NAMES.WEB.TOTAL_TIME + '/' + partial, null, totalTime, exclusive)

  if (transaction.queueTime > 0) {
    transaction.measure(NAMES.QUEUETIME, null, transaction.queueTime)
  }

  if (transaction.incomingCatId) {
    transaction.measure(
        NAMES.CLIENT_APPLICATION + '/' + transaction.incomingCatId + "/all",
        null,
        transaction.catResponseTime
      )
  }
  transaction._setApdex(NAMES.APDEX + '/' + partial, duration, keyApdexInMillis)
  transaction._setApdex(NAMES.APDEX, duration, keyApdexInMillis)
}

module.exports = recordWeb
