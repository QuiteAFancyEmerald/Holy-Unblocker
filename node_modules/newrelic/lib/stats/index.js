'use strict'

/*
 *
 * CONSTANTS
 *
 */
var BYTES_PER_MB = 1024 * 1024
var FROM_MILLIS = 1e-3


/**
 * Simple container for tracking running statistics for a metric.
 */
function Stats() {
  this.total = 0
  this.totalExclusive = 0
  this.min = 0
  this.max = 0
  this.sumOfSquares = 0
  this.callCount = 0
}

/**
 * Update the summary statistics with a new value.
 *
 * @param {Number} totalTime Time, in seconds, of the measurement.
 * @param {Number} exclusiveTime Time that was taken by only the
 *                               current measurement (optional).
 */
Stats.prototype.recordValue = function recordValue(totalTime, exclusiveTime) {
  // even if a caller messes up, don't break everything else
  if (totalTime !== 0 && !totalTime) totalTime = 0
  if (exclusiveTime !== 0 && !exclusiveTime) exclusiveTime = totalTime

  if (this.callCount > 0) {
    this.min = Math.min(totalTime, this.min)
  } else {
    this.min = totalTime
  }
  this.max = Math.max(totalTime, this.max)

  this.sumOfSquares += (totalTime * totalTime)
  this.callCount += 1
  this.total += totalTime
  this.totalExclusive += exclusiveTime
}

/**
 * Until the collector accepts statistics in milliseconds, this code is going
 * to have some hinky floating-point values to deal with.
 */
Stats.prototype.recordValueInMillis = recordValueInMillis
function recordValueInMillis(totalTime, exclusiveTime) {
  this.recordValue(
    totalTime * FROM_MILLIS,
    exclusiveTime >= 0 ? exclusiveTime * FROM_MILLIS : null
  )
}

/**
 * Really?
 *
 * FIXME: Really?
 */
Stats.prototype.recordValueInBytes = function recordValueInBytes(bytes, exclusiveBytes) {
  exclusiveBytes = exclusiveBytes || bytes
  this.recordValue(bytes / BYTES_PER_MB, exclusiveBytes / BYTES_PER_MB)
}

Stats.prototype.incrementCallCount = function incrementCallCount(count) {
  if (typeof count === 'undefined') count = 1
  this.callCount += count
}

/**
 * Fold another summary's statistics into this one.
 */
Stats.prototype.merge = function merge(other) {
  if (other.count && !other.callCount) {
    other.callCount = other.count
  }

  if (other.totalExclusive == null) {
    other.totalExclusive = other.total
  }

  if (other.callCount > 0) {
    if (this.callCount > 0) {
      this.min = Math.min(this.min, other.min)
    } else {
      this.min = other.min
    }
  }
  this.max = Math.max(this.max, other.max)

  this.total += other.total
  this.totalExclusive += other.totalExclusive
  this.sumOfSquares += other.sumOfSquares
  this.callCount += other.callCount
}

/**
 * The serializer relies upon this representation, so don't change the
 * values, cardinality, or ordering of this array without ensuring that
 * it matches the version of the "protocol" being sent to the collector.
 *
 * @returns {Array} Number of calls,
 *                  total time in seconds,
 *                  time for this metric alone in seconds,
 *                  shortest individual time in seconds,
 *                  longest individual time in seconds,
 *                  running sum of squares.
 */
Stats.prototype.toJSON = function toJSON() {
  return [
    this.callCount,
    this.total,
    this.totalExclusive,
    this.min,
    this.max,
    this.sumOfSquares
  ]
}

module.exports = Stats
