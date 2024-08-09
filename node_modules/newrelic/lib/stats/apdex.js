'use strict'

/*
 *
 * CONSTANTS
 *
 */
var FROM_MILLIS = 1e-3


function ApdexStats(apdexT) {
  if (!apdexT && apdexT !== 0) {
    throw new Error('Apdex summary must be created with apdexT.')
  }
  this.apdexT = apdexT

  this.satisfying = 0
  this.tolerating = 0
  this.frustrating = 0
}

ApdexStats.prototype.recordValue = function recordValue(time, overrideApdex) {
  var apdexT = overrideApdex || this.apdexT
  if (time <= apdexT) {
    ++this.satisfying
  } else if (time <= 4 * apdexT) {
    ++this.tolerating
  } else {
    ++this.frustrating
  }
}

ApdexStats.prototype.recordValueInMillis =
function recordValueInMillis(timeInMillis, overrideApdex) {
  this.recordValue(timeInMillis * FROM_MILLIS, overrideApdex * FROM_MILLIS)
}

/**
 * Used by the error handler to indicate that a user was frustrated by a page
 * error.
 */
ApdexStats.prototype.incrementFrustrating = function incrementFrustrating() {
  ++this.frustrating
}

/**
 * When merging apdex stastics, the apdex tolerating value isn't brought along
 * for the ride.
 *
 * @param {ApdexStats} other The existing apdex stats being merged in.
 */
ApdexStats.prototype.merge = function merge(other) {
  this.satisfying += other.satisfying
  this.tolerating += other.tolerating
  this.frustrating += other.frustrating
}

/**
 * This feels dirty: ApdexStats override the ordinary statistics serialization
 * format by putting satisfying, tolerating and frustrating values in the
 * first three fields in the array and setting the next two to the apdex (used
 * by calculations inside RPM), followed by 0.
 *
 * @returns {Array} A six-value array where only the first three values are
 *                  significant: satisfying, tolerating, and frustrating
 *                  load times, respectively.
 */
ApdexStats.prototype.toJSON = function toJSON() {
  return [
    this.satisfying,
    this.tolerating,
    this.frustrating,
    this.apdexT,
    this.apdexT,
    0
  ]
}

module.exports = ApdexStats
