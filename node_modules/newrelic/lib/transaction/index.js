'use strict'

var urltils = require('../util/urltils.js')
var Metrics = require('../metrics')
var Timer = require('../timer.js')
var Trace = require('./trace')
var NAMES = require('../metrics/names.js')
var hashes = require('../util/hashes')
var util = require('util')
var url = require('url')
var NameState = require('./name-state.js')
var logger = require('../logger').child({component: 'transaction'})

/*
 *
 * CONSTANTS
 *
 */
var FROM_MILLIS = 1e-3
/**
 * Bundle together the metrics and the trace segment for a single agent
 * transaction.
 *
 * @param {Object} agent The agent.
 */
function Transaction(agent) {
  if (!agent) throw new Error('every transaction must be bound to the agent')

  this.traceFlag = false
  if (agent.config.logging.diagnostics) {
    this.traceStacks = []
  } else {
    this.traceStacks = null
  }

  this.agent = agent
  this.metrics = new Metrics(
    agent.config.apdex_t,
    agent.mapper,
    agent.metricNameNormalizer
  )

  agent.activeTransactions++

  this.numSegments = 0

  // This number needs to be unique so the previous method of picking 1337 then
  // incrementing it no longer works. 1e17 should always result in a whole
  // number, but just in case we floor it so we don't end up with decimals. Then
  // we make it hex because other agents use a hex based transaction id.
  this.id = Math.floor((Math.random() * 1e17)).toString(16)

  this.trace = new Trace(this)
  this.exceptions = []
  this.userErrors = []
  this.timer = new Timer()
  this.timer.begin()

  this._recorders = []
  this._intrinsicAttributes = {}
  this._partialName = null

  // hidden class optimization
  this.bgSegment = null
  this.catResponseTime = 0
  this.error = null
  this.forceIgnore = null
  this.forceName = null
  this.ignore = false
  this.incomingCatId = null
  this.name = null
  this.nameState = new NameState(null, null, null, null)
  this.pathHashes = []
  this.queueTime = 0
  this.referringPathHash = null
  this.referringTransactionGuid = null
  this.invalidIncomingExternalTransaction = false
  this.statusCode = null
  this.syntheticsHeader = null
  this.syntheticsData = null
  this.url = null
  this.parsedUrl = null
  this.verb = null
  this.webSegment = null

  this.probe('Transaction created', {id: this.id})
}

Transaction.prototype.probe = function probe(action, extra) {
  if (this.traceStacks) {
    this.traceStacks.push({
      stack: (new Error(action)).stack.split('\n'),
      extra: extra
    })
  }
}

/**
 * Add a clear API method for determining whether a transaction is web or
 * background.
 *
 * @returns {boolean} Whether this transaction has a URL.
 */
Transaction.prototype.isWeb = function isWeb() {
  return this.url ? true : false
}

/**
 * @return {bool} Is this transaction still alive?
 */
Transaction.prototype.isActive = function isActive() {
  return this.timer.isActive()
}

/**
 * Close out the current transaction and its associated trace. Remove any
 * instances of this transaction annotated onto the call stack.
 */
Transaction.prototype.end = function end(done) {
  if (!this.timer.isActive()) return
  if (this.traceFlag) {
    logger.warn(
      {segment: {name: this.name, stacks: this.traceStacks}},
      'Flagged transaction ended.'
    )
  }

  var transaction = this

  transaction.trace.end()
  process.nextTick(function nextTickedEnd() {
    // recorders must be run before the trace is collected
    if (!transaction.ignore) {
      transaction.record()
    }

    transaction.agent.emit('transactionFinished', transaction)
    if (typeof done === 'function') {
      done(transaction)
    }
  })

  transaction.timer.end()
}

/**
 * For web transactions, this represents the time from when the request was received
 * to when response was sent.  For background transactions, it is equal to duration
 * of the transaction trace (until last segment ended).
 */
Transaction.prototype.getResponseTimeInMillis = function getResponseTimeInMillis() {
  if (this.isWeb()) {
    return this.timer.getDurationInMillis()
  }
  return this.trace.getDurationInMillis()
}

Transaction.prototype.applyUserNamingRules = function applyUserNamingRules(requestUrl) {
  // 1. user normalization rules (set in configuration)
  var normalized = this.agent.userNormalizer.normalize(requestUrl)
  if (normalized.ignore) {
    this.ignore = true
  }
  if (normalized.matched) {
    // After applying user naming rule, apply server-side sent rules to
    // further squash possible MGIs
    var serverNormalized = this.agent.urlNormalizer.normalize(normalized.value)
    if (serverNormalized.ignore) {
      this.ignore = true
    }
    if (serverNormalized.matched) {
      // NAMES.NORMALIZED is prepended by the sever rule normalizer
      this._partialName = serverNormalized.value
    } else {
      this._partialName = NAMES.NORMALIZED + normalized.value
    }
  }
}

Transaction.prototype.setPartialName = function setPartialName(name) {
  this._partialName = name
}

/**
 * Sets the name of this transaction, figuring out along the way whether the
 * transaction should be ignored. Should run as late in the transaction's
 * lifetime as possible.
 *
 * Works entirely via side effects.
 *
 * @param {string} requestURL The URL to extract the name from.
 * @param {string} statusCode The HTTP status code from the response.
 */
Transaction.prototype.setName = function setName(requestURL, statusCode) {
  logger.trace({requestURL: requestURL, statusCode: statusCode, transactionId: this.id,
    transactionName: this.name}, 'Setting transaction name')

  this._partialName = this.nameState.getName()
  this.url = urltils.scrub(requestURL)
  this.statusCode = statusCode

  // 1. name set by the api
  if (this.forceName !== null) {
    this._partialName = this.forceName
  }

  // 2. user normalization rules (set in configuration)
  // can override transaction naming from API
  this.applyUserNamingRules(this.url)

  // 3. URL normalization rules (sent by server)
  // Nothing has already set a name for this transaction, so normalize and
  // potentially apply the URL backstop now. Only do so if no user rules
  // matched.
  if (!this._partialName) {
    // avoid polluting root path when 404
    if (statusCode === 404) {
      // '/' prevents UI from showing 'root path'
      this._partialName = this.nameState.getNameNotFound()
    } else {
      var normalized = this.agent.urlNormalizer.normalize(this.url)
      if (normalized.ignore) {
        this.ignore = true
      }
      this._partialName = normalized.value
    }
  }

  // 4. transaction name normalization rules (sent by server)
  var fullName = NAMES.WEB.RESPONSE_TIME + '/' + this._partialName
  normalized = this.agent.transactionNameNormalizer.normalize(fullName)
  if (normalized.ignore) {
    this.ignore = true
  }
  this.name = normalized.value

  // 5. transaction segment term normalizer
  this.name = this.agent.txSegmentNormalizer.normalize(this.name).value

  // Allow the API to explicitly set the ignored status.
  if (this.forceIgnore !== null) {
    this.ignore = this.forceIgnore
  }

  logger.trace({transactionId: this.id, transactionName: this.name},
    'Finished setting transaction name')
}


Transaction.prototype.setBackgroundName = function setBackgroundName(name, group) {
  this._partialName = group + NAMES.ACTION_DELIMITER + name

  var fullName = NAMES.BACKGROUND.RESPONSE_TIME
    + NAMES.ACTION_DELIMITER + this._partialName

  // Transaction normalizers run on the full metric name, not the user facing
  // transaction name.
  var normalized = this.agent.transactionNameNormalizer.normalize(fullName)
  if (normalized.ignore) {
    this.ignore = true
  }
  this.name = normalized.value

  if (this.forceIgnore !== null) {
    this.ignore = this.forceIgnore
  }
}

/**
 * Gets the transaction name safely.
 *
 * Gathering the transaction name for WebTransactions is risky complicated
 * business. OtherTransactions (aka background) are much simpler as they are
 * always fully specified by the user at creation time.
 *
 * This has the potential of causing the normalizers run extra times, which can
 * cause extra performance overhead. Once this is refactored we can make the
 * caching better and eliminate this extra overhead. Be mindful of if/when this
 * is called.
 */
Transaction.prototype.getName = function getName() {
  // Detect web transactions as they are more complex.
  if (this.isWeb() && !this.name) {
    // Save and restore the partial name, as some instrumentation relies on it
    // not being set to detect if it should set the transaction name.
    var tempPartialName = this._partialName
    this.setName(this.url, this.statusCode)
    this._partialName = tempPartialName
  }
  return this.name
}

/**
 * Returns the full URL of the transaction with query, search, or hash portions
 * removed. This is only applicable for web transactions.
 *
 * Caches to ._scrubbedUrl, pulls in from .parsedUrl if it is available,
 * otherwise it will parse .url, store it on .parsedUrl, then scrub the URL and
 * store it in the cache.
 *
 * Returns a string or undefined.
 */
Transaction.prototype.getScrubbedUrl = function getScrubbedUrl() {
  if (!this.isWeb()) return
  if (this._scrubbedUrl) return this._scrubbedUrl

  // If we don't have a parsedUrl, lets populate it from .url
  if (!this.parsedUrl) {
    // At time of writing .url should always be set by the time we get here
    // because that is what .isWeb() checks against. In the future it may be
    // instead checking a enum or other property so guard ourselves just in
    // case.
    if (!this.url) return
    this.parsedUrl = url.parse(this.url)
  }

  var scrubbedParsedUrl = util._extend({}, this.parsedUrl)
  scrubbedParsedUrl.search = null
  scrubbedParsedUrl.query = null
  scrubbedParsedUrl.href = null
  scrubbedParsedUrl.path = null
  scrubbedParsedUrl.hash = null

  this._scrubbedUrl = url.format(scrubbedParsedUrl)

  return this._scrubbedUrl
}

/**
 * The instrumentation associates metrics with the different kinds of trace
 * segments. The metrics recorders are dependent on the transaction name to
 * collect their scoped metrics, and so must wait for the transaction's
 * name to be finalized before the recording process. Segments are only
 * responsible for their own life cycle, so responsibility for understanding
 * when the transaction name has been finalized is handed off to the trace,
 * which for now defers running these recorders until the trace is ended.
 *
 * @param {Function} recorder The callback which records metrics. Takes a
 *                            single parameter, which is the transaction's
 *                            name.
 */
Transaction.prototype.addRecorder = function addRecorder(recorder) {
  this._recorders.push(recorder)
}

/**
 * Run the metrics recorders for this trace. If the transaction's name /
 * scope hasn't been set yet, the recorder will be passed an undefined name,
 * and should be written to handle this.
 */
Transaction.prototype.record = function record() {
  var name = this.name
  for (var i = 0, l = this._recorders.length; i < l; ++i) {
    this._recorders[i](name)
  }
}

/**
 * Measure the duration of an operation named by a metric, optionally
 * belonging to a scope.
 *
 * @param {string} name The name of the metric to gather.
 * @param {string} scope (optional) Scope to which the metric is bound.
 * @param {number} duration The time taken by the operation, in milliseconds.
 * @param {number} exclusive The time exclusively taken by an operation, and
 *                           not its children.
 */
Transaction.prototype.measure = function measure(name, scope, duration, exclusive) {
  this.metrics.measureMilliseconds(name, scope, duration, exclusive)
}

/**
 * Based on the status code and the duration of a web transaction, either
 * mark the transaction as frustrating, or record its time for apdex purposes.
 *
 * @param {string} name     Metric name.
 * @param {number} duration Duration of the transaction, in milliseconds.
 * @param {number} keyApdex A key transaction apdexT, in milliseconds
 *                          (optional).
 */
Transaction.prototype._setApdex = function _setApdex(name, duration, keyApdexInMillis) {
  var apdexStats = this.metrics.getOrCreateApdexMetric(name, null, keyApdexInMillis)
  if (urltils.isError(this.agent.config, this.statusCode)) {
    apdexStats.incrementFrustrating()
  } else {
    apdexStats.recordValueInMillis(duration, keyApdexInMillis)
  }
}

/**
 * Store first 10 unique path hashes calculated for a transaction.
 *
 * @param {string} pathHash Path hash
 */
Transaction.prototype.pushPathHash = function pushPathHash(pathHash) {
  if (this.pathHashes.length >= 10 || this.pathHashes.indexOf(pathHash) !== -1) return
  this.pathHashes.unshift(pathHash)
}

/**
 * Return whether transaction spawned any outbound requests.
 */
Transaction.prototype.includesOutboundRequests = function includesOutboundRequests() {
  return this.pathHashes.length > 0
}

/**
 * Get unique previous path hashes for a transaction. Does not include
 * current path hash.
 */
Transaction.prototype.alternatePathHashes = function alternatePathHashes() {
  var curHash = hashes.calculatePathHash(
    this.agent.config.applications()[0],
    this.name || this._partialName || this.nameState.getName(),
    this.referringPathHash
  )
  var altHashes = this.pathHashes.slice()
  var curIndex = altHashes.indexOf(curHash)

  if (curIndex !== -1) altHashes.splice(curIndex, 1)

  return altHashes.length === 0 ? null : altHashes.sort().join(',')
}

Transaction.prototype.cleanup = function cleanup() {
  if (this.trace) this.trace.cleanup()
}

/**
 * Associate an exception with the transaction.  When the transaction ends,
 * the exception will be collected along with the transaction details.
 *
 * @param {Error}   exception         The exception to be collected.
 * @param {object}  customParameters  Any custom parameters associated with
 *                                    the request (optional).
 * @param {number}  timestamp         The timestamp for when the exception occurred.
 */
Transaction.prototype.addException = _addException

function _addException(exception, customParameters, timestamp) {
  this.exceptions.push([exception, customParameters, timestamp])
}

/**
 * Associate a user error (reported using the noticeError() API) with the transaction.
 * When the transaction ends, the exception will be collected along with the transaction
 * details.
 *
 * @param {Error}   exception         The exception to be collected.
 * @param {object}  customParameters  Any custom parameters associated with
 *                                    the request (optional).
 * @param {number}  timestamp         The timestamp for when the exception occurred.
 */
Transaction.prototype.addUserError = _addUserError

function _addUserError(exception, customParameters, timestamp) {
  this.userErrors.push([exception, customParameters, timestamp])
}

/**
 * Returns true if an error happened during the transaction or if the transaction itself
 * is considered to be an error.
 */
Transaction.prototype.hasErrors = function _hasErrors() {
  var isErroredTransaction = urltils.isError(this.agent.config, this.statusCode)
  var transactionHasExceptions = this.exceptions.length > 0
  var transactionHasuserErrors = this.userErrors.length > 0
  return (transactionHasExceptions || transactionHasuserErrors || isErroredTransaction)
}

Transaction.prototype.addAgentAttribute = function addAgentAttribute(key, value) {
  if (this.agent.config.ignored_params.indexOf(key) === -1) {
    this.trace.addParameter(key, value)
  }
}

/**
 * Returns agent intrinsic attribute for this transaction.
 */
Transaction.prototype.getIntrinsicAttributes = function getIntrinsicAttributes() {
  if (!this._intrinsicAttributes.totalTime) {
    var config = this.agent.config
    this._intrinsicAttributes.totalTime =
      this.trace.getTotalTimeDurationInMillis() * FROM_MILLIS

    // FLAG: cat
    if (config.feature_flag.cat) {
      this._intrinsicAttributes.path_hash = hashes.calculatePathHash(
        config.applications()[0],
        this.name || this._partialName,
        this.referringPathHash
      )
      this._intrinsicAttributes.trip_id = this.tripId || this.id
      if (this.referringTransactionGuid) {
        this._intrinsicAttributes.referring_transaction_guid =
          this.referringTransactionGuid
      }
      if (config.cross_process_id) {
        this._intrinsicAttributes.client_cross_process_id = config.cross_process_id
      }
    }

    // FLAG: synthetics
    if (config.feature_flag.synthetics) {
      var data = this.syntheticsData

      if (data) {
        this._intrinsicAttributes.synthetics_resource_id = data.resourceId
        this._intrinsicAttributes.synthetics_job_id = data.jobId
        this._intrinsicAttributes.synthetics_monitor_id = data.monitorId
      }
    }
  }
  return util._extend({}, this._intrinsicAttributes)
}

module.exports = Transaction
