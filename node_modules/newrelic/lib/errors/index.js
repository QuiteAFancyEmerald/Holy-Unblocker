'use strict'

var urltils = require('../util/urltils')
var NAMES = require('../metrics/names')
var util = require('util')

module.exports.createError = createError
module.exports.createEvent = createEvent

/**
 * Given either or both of a transaction and an exception, generate an error
 * trace in the JSON format expected by the collector. Since this will be
 * used by both the HTTP instrumentation, which uses HTTP status codes to
 * determine whether a transaction is in error, and the domain-based error
 * handler, which traps actual instances of Error, try to set sensible
 * defaults for everything.
 *
 * @param {Transaction} transaction      The agent transaction, presumably
 *                                       coming out of the instrumentation.
 * @param {Error}       exception        Something trapped by an error listener.
 * @param {object}      customParameters Any custom parameters associated with
 *                                       the request (optional).
 */
function createError(transaction, exception, customParameters, config) {
  var name = 'Unknown'
  var message = ''
  var type = 'Error'
  var params = {
    request_uri: '',
    userAttributes: {},
    agentAttributes: {},
    intrinsics: {}
  }

  // String errors do not provide us with as much information to provide to the
  // user, but it is a common pattern.
  if (typeof exception === 'string') {
    message = exception
  } else if (
      exception !== null &&
      typeof exception === 'object' &&
      exception.message &&
      !config.high_security
    ) {
    message = exception.message

    if (exception.name) {
      type = exception.name
    } else if (exception.constructor && exception.constructor.name) {
      type = exception.constructor.name
    }
  } else if (transaction && transaction.statusCode &&
             urltils.isError(config, transaction.statusCode)) {
    message = 'HttpError ' + transaction.statusCode
  }

  if (transaction) {
    // transaction.getName is expensive due to running normalizers and ignore
    // rules if a name hasn't been assigned yet. Also has the side effect of
    // changing the transaction's url property or ignore status.
    var txName = transaction.getName()
    if (txName) {
      name = txName
    }

    if (transaction.isWeb()) {
      params.request_uri = transaction.getScrubbedUrl()
    }

    // Copy all of the parameters off of the transaction.
    params.agentAttributes = transaction.trace.parameters
    params.intrinsics = transaction.getIntrinsicAttributes()

    // Custom params aren't filtered by capture_params or ignore_params, just by
    // high security mode.
    if (!config.high_security) {
      urltils.overwriteParameters(config, transaction.trace.custom, params.userAttributes)
    }
  }
  // This will strip out any ignored params or not include the custom params if
  // capture params is disabled.
  if (!config.high_security && customParameters) {
    urltils.overwriteParameters(config, customParameters, params.userAttributes)
  }


  var stack = exception && exception.stack
  if (stack) {
    params.stack_trace = ('' + stack).split(/[\n\r]/g)
    if (config.high_security) {
      params.stack_trace[0] = exception.name + ': <redacted>'
    }
  }

  var res = [0, name, message, type, params]
  if (transaction) {
    Object.defineProperty(res, 'transaction', {
      value: transaction.id
    })
  }
  return res
}

/**
 * Creates a structure for error event that is sent to the collector.
 * The error parameter is an output of the createError() function for a given exception.
 */
function createEvent(transaction, error, timestamp, config) {
  var message = error[2]
  var errorClass = error[3]
  var paramsFromError = error[4]

  var intrinsicAttributes = _getErrorEventIntrinsicAttrs(
    transaction,
    errorClass,
    message,
    timestamp,
    config
  )

  // the error structure created by createError() already performs filtering of custom
  // and agent attributes, so it is ok to just copy them
  var userAttributes = util._extend({}, paramsFromError.userAttributes)
  var agentAttributes = util._extend({}, paramsFromError.agentAttributes)

  var errorEvent = [
    intrinsicAttributes,
    userAttributes,
    agentAttributes
  ]

  return errorEvent
}

function _getErrorEventIntrinsicAttrs(transaction, errorClass, message, timestamp, conf) {
  // the server expects seconds instead of milliseconds
  if (timestamp) timestamp = timestamp / 1000

  var attributes = {
    type: "TransactionError",
    "error.class": errorClass,
    "error.message": conf.high_security ? '' : message,
    timestamp: timestamp
  }

  if (transaction) {
    attributes.transactionName = transaction.name
    attributes.duration = transaction.timer.getDurationInMillis() / 1000

    var metric = transaction.metrics.getMetric(NAMES.QUEUETIME)
    if (metric) {
      attributes.queueDuration = metric.total
    }

    metric = transaction.metrics.getMetric(NAMES.EXTERNAL.ALL)
    if (metric) {
      attributes.externalDuration = metric.total
      attributes.externalCallCount = metric.callCount
    }

    metric = transaction.metrics.getMetric(NAMES.DB.ALL)
    if (metric) {
      attributes.databaseDuration = metric.total
      attributes.databaseCallCount = metric.callCount
    }

    if (transaction.syntheticsData) {
      attributes["nr.syntheticsResourceId"] = transaction.syntheticsData.resourceId
      attributes["nr.syntheticsJobId"] = transaction.syntheticsData.jobId
      attributes["nr.syntheticsMonitorId"] = transaction.syntheticsData.monitorId
    }

    attributes['nr.transactionGuid'] = transaction.id
    attributes['nr.referringTransactionGuid'] = transaction.referringTransactionGuid

    if (transaction.port) {
      attributes.port = transaction.port
    }
  } else {
    attributes.transactionName = 'Unknown'
  }

  return attributes
}
