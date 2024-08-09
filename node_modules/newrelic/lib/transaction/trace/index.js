'use strict'

var codec = require('../../util/codec')
var copy = require('../../util/copy')
var Segment = require('./segment')
var NAMES = require('../../metrics/names.js')

/*
 *
 * CONSTANTS
 *
 */
var FROM_MILLIS = 1e-3

/**
 * A Trace holds the root of the Segment graph and produces the final
 * serialization of the transaction trace.
 *
 * @param {Transaction} transaction The transaction bound to the trace.
 */
function Trace(transaction) {
  if (!transaction) throw new Error('All traces must be associated with a transaction.')

  this.transaction = transaction

  this.root = new Segment(transaction, 'ROOT')
  this.root.start()

  this.custom = {}
  this.intrinsics = {}
  this.segmentsSeen = 0
  this.totalTimeCache = null

  // hidden class optimization
  this.parameters = {}

  // sending displayName if set by user
  var displayName = transaction.agent.config.getDisplayHost()
  var hostName = transaction.agent.config.getHostnameSafe()
  if (displayName !== hostName) {
    this.parameters['host.displayName'] = displayName
  }
  this.domain = null
}

/**
 * End and close the current trace. Triggers metric recording for trace
 * segments that support recording.
 */
Trace.prototype.end = function end() {
  var segments = [this.root]

  while (segments.length) {
    var segment = segments.pop()
    if (segment.timer.softEnd()) {
      segment._updateRootTimer()
      // timer.softEnd() returns true if the timer was ended prematurely, so
      // in that case we can name the segment as truncated
      segment.name = NAMES.TRUNCATED.PREFIX + segment.name
    }
    segments = segments.concat(segment.getChildren())
  }
}

/**
 * Add a child to the list of segments.
 *
 * @param {string} childName Name for the new segment.
 * @returns {Segment} Newly-created Segment.
 */
Trace.prototype.add = function add(childName, callback) {
  return this.root.add(childName, callback)
}

/**
 * Explicitly set a trace's runtime instead of using it as a stopwatch.
 * (As a byproduct, stops the timer.)
 *
 * @param {int} duration Duration of this particular trace.
 * @param {int} startTimeInMillis (optional) Start of this trace.
 */
Trace.prototype.setDurationInMillis = setDurationInMillis

function setDurationInMillis(duration, startTimeInMillis) {
  this.root.setDurationInMillis(duration, startTimeInMillis)
}

/**
 * @return {integer} The amount of time the trace took, in milliseconds.
 */
Trace.prototype.getDurationInMillis = function getDurationInMillis() {
  return this.root.getDurationInMillis()
}

/**
 * Trace parameters are used as agent attributes
 */
Trace.prototype.addParameter = function addParameter(key, value) {
  this.parameters[key] = value
}

/**
 * The duration of the transaction trace tree that only this level accounts
 * for.
 *
 * @return {integer} The amount of time the trace took, minus any child
 *                   traces, in milliseconds.
 */
Trace.prototype.getExclusiveDurationInMillis = function getExclusiveDurationInMillis() {
  return this.root.getExclusiveDurationInMillis()
}


/**
 * The duration of all segments in a transaction trace.  The root is not
 * accounted for, since it doesn't represent a unit of work.
 *
 * @return {integer} The sum of durations for all segments in a trace in
 *                   milliseconds
 */
Trace.prototype.getTotalTimeDurationInMillis = function getTotalTimeDurationInMillis() {
  if (this.totalTimeCache !== null) return this.totalTimeCache
  if (this.root.children.length === 0) return 0
  var segments = this.root.getChildren()
  var totalTimeInMillis = 0

  while (segments.length !== 0) {
    var segment = segments.pop()
    totalTimeInMillis += segment.getExclusiveDurationInMillis()
    segments = segments.concat(segment.getChildren())
  }

  if (!this.transaction.isActive()) this.totalTimeCache = totalTimeInMillis
  return totalTimeInMillis
}

/**
 * The serializer is asynchronous, so serialization is as well.
 *
 * The transaction trace sent to the collector is a nested set of arrays. The
 * outermost array has the following fields, in order:
 *
 * 0: start time of the trace, in milliseconds
 * 1: duration, in milliseconds
 * 2: the path, or root metric name
 * 3: the URL (fragment) for this trace
 * 4: an array of segment arrays, deflated and then base64 encoded
 * 5: FIXME: the guid for this transaction, used to correlate across
 *    transactions (for now, to correlate with RUM sessions)
 * 6: reserved for future use, specified to be null for now
 * 7: FIXME: RUM2 force persist flag
 *
 * In addition, there is a "root node" (not the same as the first child, which
 * is a node with the special name ROOT and contents otherwise identical to the
 * top-level segment of the actual trace) with the following fields:
 *
 * 0: start time IN SECONDS
 * 1: a dictionary containing request parameters
 * 2: a dictionary containing custom parameters (currently not user-modifiable)
 * 3: the transaction trace segments (including the aforementioned root node)
 * 4: FIXME: a dictionary containing "parameter groups" with special information
 *    related to this trace
 *
 * @param {Function} callback Called after serialization with either
 *                            an error (in the first parameter) or
 *                            the serialized transaction trace.
 */
Trace.prototype.generateJSON = function generateJSON(callback) {
  var attributes = {
    agentAttributes: copy.shallow(this.parameters),
    userAttributes: this.custom,
    intrinsics: this.intrinsics
  }
  delete attributes.agentAttributes.request_uri

  var rootNode = [
    this.root.timer.start * FROM_MILLIS,
    {}, // moved to agentAttributes
    {
      // hint to RPM for how to display this trace's segments
      nr_flatten_leading: false
    }, // moved to userAttributes
    this.root.toJSON(),
    attributes,
    []  // FIXME: parameter groups
  ]

  var trace = this
  if (!this.transaction.agent.config.simple_compression) {
    codec.encode(rootNode, respond)
  } else {
    process.nextTick(respond.bind(null, null, rootNode))
  }

  function respond(err, data) {
    if (err) {
      return callback(err, null, null)
    }

    var syntheticsResourceId = null
    // FLAG: synthetics not feature flagged here, but this will only get set if
    // the flag is on.
    if (trace.transaction.syntheticsData) {
      syntheticsResourceId = trace.transaction.syntheticsData.resourceId
    }

    var json = [
      trace.root.timer.start, // start
      trace.transaction.getResponseTimeInMillis(), // response time
      trace.transaction.name, // path
      trace.transaction.url,  // uri
      data,                   // encodedCompressedData
      '',                     // guid
      null,                   // reserved for future use
      false,                  // forcePersist
      null,                   // xraySessionId
      syntheticsResourceId    // synthetics resource id
    ]

    return callback(null, json, trace)
  }
}

module.exports = Trace
