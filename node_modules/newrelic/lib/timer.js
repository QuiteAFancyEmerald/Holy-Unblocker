'use strict'

/**

 * Explicit enumeration of the states a transaction can be in:
 *
 * PENDING upon instantiation (implicitly, no start time set)
 * RUNNING while timer is running (implicitly, start time is set but no stop
 *   time is set).
 * STOPPED timer has been completed (implicitly, start time and stop time
 *   are set, but the timer has not yet been harvested).
 * DEAD timer has been harvested and can only have its duration read.
 */
var PENDING = 1
var RUNNING = 2
var STOPPED = 3


function hrToMillis(hr) {
  // process.hrTime gives you [second, nanosecond] duration pairs
  return (hr[0] * 1e3) + (hr[1] / 1e6)
}

/**
 * A mildly tricky timer that tracks its own state and allows its duration
 * to be set manually.
 */
function Timer() {
  this.state = PENDING
  this.touched = false
  this.duration = null
  this.hrDuration = null
  this.hrstart = null
  this.durationInMillis = null
}

/**
 * Start measuring time elapsed.
 *
 * Uses process.hrtime if available, Date.now() otherwise.
 */
Timer.prototype.begin = function begin() {
  if (this.state > PENDING) return

  this.start = Date.now()
  // need to put a guard on this for compatibility with Node < 0.8
  if (process.hrtime) this.hrstart = process.hrtime()
  this.state = RUNNING
}

/**
 * End measurement.
 */
Timer.prototype.end = function end() {
  if (this.state > RUNNING) return
  if (this.state === PENDING) this.begin()
  if (process.hrtime) this.hrDuration = process.hrtime(this.hrstart)
  this.touched = true
  this.duration = Date.now() - this.start
  this.state = STOPPED
}

/**
 * Update the duration of the timer without ending it..
 */
Timer.prototype.touch = function touch() {
  this.touched = true
  if (this.state > RUNNING) return
  if (this.state === PENDING) this.begin()

  if (process.hrtime) this.hrDuration = process.hrtime(this.hrstart)
  this.duration = Date.now() - this.start
}

/**
 * End the segment if it is still running, if touched use that time instead of
 * "now". Returns a boolean indicating whether the end time changed.
 */
Timer.prototype.softEnd = function softEnd() {
  if (this.state > RUNNING) return false
  if (this.state === PENDING) this.begin()

  this.state = STOPPED

  if (this.touched) return false
  if (process.hrtime) this.hrDuration = process.hrtime(this.hrstart)
  this.touched = true
  this.duration = Date.now() - this.start
  return true
}

/**
 * @return {bool} Is this timer currently running?
 */
Timer.prototype.isRunning = function isRunning() {
  return this.state === RUNNING
}

/**
 * @return {bool} Is this timer still alive?
 */
Timer.prototype.isActive = function isActive() {
  return this.state < STOPPED
}

/**
 * @return {bool} Has the timer been touched or ended?
 */
Timer.prototype.hasEnd = function hasEnd() {
  return !!this.hrDuration
}

/*
 * Sets duration and stops the timer, since the passed-in duration will take precendence
 * over the measured duration.
 * @param {number} duration The duration the timer should report.
 */
Timer.prototype.overwriteDurationInMillis = overwriteDurationInMillis
function overwriteDurationInMillis(duration) {
  this.touched = true
  this.durationInMillis = duration
  this.state = STOPPED
}

/**
 * When testing, it's convenient to be able to control time. Stops the timer
 * as a byproduct.
 *
 * @param {number} duration How long the timer ran.
 * @param {number} start When the timer started running (optional).
 */
Timer.prototype.setDurationInMillis = function setDurationInMillis(duration, start) {
  if (this.state > RUNNING) return
  if (this.state === PENDING)
  if (!start && start !== 0) this.begin()

  this.state = STOPPED
  this.durationInMillis = duration

  // this assignment is incorrect, process.hrtime doesn't time from epoch, which
  // is the assumption being made here.  since hrstart isn't used
  // anywhere except to calculate duration, and we are setting duration
  // this is fine.
  this.hrstart = [Math.floor(start / 1e3), start % 1e3 * 1e6]
  this.start = start
}

/**
 * Returns how long the timer has been running (if it's still running) or
 * how long it ran (if it's been ended or touched).
 */
Timer.prototype.getDurationInMillis = function getDurationInMillis() {
  if (this.state === PENDING) return 0

  // only set by setDurationInMillis
  if (this.durationInMillis !== null && this.durationInMillis >= 0) {
    return this.durationInMillis
  }

  // prioritize .end() and .touch()
  if (this.hrDuration) {
    return hrToMillis(this.hrDuration)
  }

  if (this.duration) {
    return this.duration
  }

  if (process.hrtime) {
    return hrToMillis(process.hrtime(this.hrstart))
  }

  return Date.now() - this.start
}

/**
 * Get a single object containing the interval this timer was active.
 *
 * @return {Array} 2-tuple of start time in milliseconds, end time in
 *                 milliseconds.
 */
Timer.prototype.toRange = function toRange() {
  return [this.start, this.start + this.getDurationInMillis()]
}

/**
 * Abstract away the nonsense related to having both an
 * hrtime start time and a regular one, and always return
 * milliseconds since start.
 *
 * @param {Timer} other The point relative to which this timer started.
 * @return {number} The offset in (floating-point) milliseconds.
 */
Timer.prototype.startedRelativeTo = function startedRelativeTo(other) {
  if (this.hrstart && other.hrstart && process.hrtime) {
    var s = this.hrstart[0] - other.hrstart[0]
    var ns = this.hrstart[1] - other.hrstart[1]


    return hrToMillis([s, ns])
  }

  return this.start - other.start
}

/**
 * Returns true if this timer ends after the other.
 */
Timer.prototype.endsAfter = function compare(other) {
  return (this.getDurationInMillis() + this.start) >
    (other.getDurationInMillis() + other.start)
}


module.exports = Timer
