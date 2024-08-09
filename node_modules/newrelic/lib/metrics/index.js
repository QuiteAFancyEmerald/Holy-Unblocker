'use strict'

var Stats = require('../stats')
var ApdexStats = require('../stats/apdex.js')
var NAMES = require('./names')


/*
 *
 * CONSTANTS
 *
 */
var FROM_MILLIS = 1e-3

/**
 * A metric is a set of aggregated data (summary statistics) associated with a
 * metric name. Some metrics belong to scopes, which are typically the name of
 * a transaction or a background task. This class is a collection of mappings
 * from names (or scopes and names) to data, as well as functions for
 * manipulating those data directly. It also can produce a serialized
 * representation suitable for stringifying into JSON and sending to the
 * collector.
 *
 * There are several metrics collections in existence at any given time. Each
 * agent has one metrics collection, which is created at the beginning of each
 * harvest cycle. Each new transaction also gets its own metrics collection,
 * which is merged into the agent's metrics when the transaction is finalized.
 * This allows each set of metrics to be added to the harvest cycle atomically,
 * which guarantees that each transaction will not have its metrics split
 * across multiple harvest cycles. If delivery to the collector fails, the
 * metrics collection associated with the failed delivery can be merged back
 * into the metrics collection for the ongoing harvest cycle.  Finally, if so
 * configured, the agent will have an internal set of supportability metrics
 * that can be used to report information about the operation of the agent.
 *
 * Metrics can be remapped, which is a process by which they are assigned a
 * short, numerical ID by New Relic. This can shrink the serialized JSON
 * considerably. The mapping from transaction name (and scope) happens only
 * at serialization time, which allows the mappings from name to ID to happen
 * on the fly.
 *
 * @param {Number} apdexT The apdex-tolerating value, for use in creating apdex
 *                        statistics.
 * @param {MetricMapper} mapper The mapper that turns metric names into IDs.
 */
function Metrics(apdexT, mapper, normalizer) {
  if (apdexT === undefined || apdexT === null || apdexT === '') {
    throw new Error("metrics must be created with apdexT")
  }
  if (!mapper) throw new Error("metrics must be created with a mapper")
  if (!normalizer) throw new Error("metrics must be created with a name normalizer")

  this.started = Date.now()
  this.apdexT = apdexT
  this.mapper = mapper
  this.normalizer = normalizer
  this.unscoped = {} // {name : stats}
  this.scoped = {} // {scope : {name : stats}}
}

/**
 * This is the preferred way for interacting with metrics. Set the duration
 * (and optionally the amount of that duration that was exclusive to that
 * particular metric and not any child operations to that metric) of an
 * operation. If there are no data for the name (and optional scope) existing,
 * the collection will create a set of data before recording the measurement.
 *
 * @param {string} name The name of the metric.
 * @param {string} scope (Optional) The scope to which the metric belongs.
 * @param {Number} duration The duration of the related operation, in milliseconds.
 * @param {Number} exclusive (Optional) The portion of the operation specific to this
 *                           metric.
 * @return {Stats} The aggregated data related to this metric.
 */
Metrics.prototype.measureMilliseconds = measureMilliseconds

function measureMilliseconds(name, scope, duration, exclusive) {
  var stats = this.getOrCreateMetric(name, scope)
  stats.recordValueInMillis(duration, exclusive)
  return stats
}

/**
 * Set the size of an operation. If there are no data for the name existing,
 * the collection will create a set of data before recording the measurement.
 *
 * @param {string} name The name of the metric.
 * @param {Number} size The size of the related operation, in bytes.
 * @return {Stats} The aggregated data related to this metric.
 */
Metrics.prototype.measureBytes = function measureBytes(name, size) {
  var stats = this.getOrCreateMetric(name)
  stats.recordValueInBytes(size)
  return stats
}

/**
 * Look up the mapping from a name (and optionally a scope) to a set of metric
 * data for that name, creating the data if they don't already exist.
 *
 * @param {string} name The name of the requested metric.
 * @param {string} scope (Optional) The scope to which the metric is bound.
 * @return {Stats} The aggregated data for that name.
 */
Metrics.prototype.getOrCreateMetric = function getOrCreateMetric(name, scope) {
  if (!name) throw new Error('Metrics must be named')

  var resolved = this._resolve(scope)
  if (!resolved[name]) resolved[name] = new Stats()
  return resolved[name]
}

/**
 * Look up the mapping from a name (and optionally a scope) to a set of metric
 * apdex data for that name, creating the data if they don't already exist.
 *
 * @param {string} name          The name of the requested metric.
 * @param {string} scope         The scope to which the metric is bound
 *                               (optional).
 * @param {number} overrideApdex A custom apdexT for this metric, in
 *                               milliseconds. This will be the same for
 *                               a given run, because key transaction metrics
 *                               are set at connect time via server-side
 *                               configuration.
 *
 * @return {ApdexStats} The aggregated data for that name.
 */
Metrics.prototype.getOrCreateApdexMetric = getOrCreateApdexMetric

function getOrCreateApdexMetric(name, scope, overrideApdex) {
  if (!name) throw new Error('Metrics must be named')

  var resolved = this._resolve(scope)

  if (!resolved[name]) {
    // Only use the given override to create the metric if this is not the
    // global apdex AND we have a valid value.
    var apdexT = name !== NAMES.APDEX && overrideApdex > 0
      ? (overrideApdex * FROM_MILLIS) : this.apdexT
    resolved[name] = new ApdexStats(apdexT)
  }
  return resolved[name]
}

/**
 * Look up a metric, and don't create it if it doesn't exist. Can create scopes
 * as a byproduct, but this function is only intended for use in testing, so
 * it's not a big deal.
 *
 * @param {string} name Metric name.
 * @param {string} scope (Optional) The scope, if any, to which the metric
 *                       belongs.
 * @return {object} Either a stats aggregate, an apdex stats aggregate, or
 *                  undefined.
 */
Metrics.prototype.getMetric = function getMetric(name, scope) {
  if (!name) throw new Error('Metrics must be named')

  return this._resolve(scope)[name]
}

/**
 * Convert this collection into a representation suitable for serialization
 * by JSON.stringify and delivery to the collector. Hope you like nested
 * arrays!
 *
 * @return {Object} Set of nested arrays containing metric information.
 */
Metrics.prototype.toJSON = function toJSON() {
  return this._toUnscopedData().concat(this._toScopedData())
}

/**
 * Combine two sets of metric data. Intended to be used as described above,
 * either when folding a transaction's metrics into the agent's metrics for
 * later harvest, or one harvest cycle's metrics into the next when a
 * delivery attempt to the collector fails. Among the more performance-
 * critical pieces of code in the agent, so some performance tuning would
 * probably be a good idea.
 *
 * @param {Metrics} other The collection to be folded into this one.
 */
Metrics.prototype.merge = function merge(other) {
  this.started = Math.min(this.started, other.started)

  Object.keys(other.unscoped).forEach(function cb_forEach(name) {
    if (this.unscoped[name]) {
      this.unscoped[name].merge(other.unscoped[name])
    } else {
      this.unscoped[name] = other.unscoped[name]
    }
  }, this)

  Object.keys(other.scoped).forEach(function cb_forEach(scope) {
    Object.keys(other.scoped[scope]).forEach(function cb_forEach(name) {
      if (other.scoped[scope][name]) {
        var resolved = this._resolve(scope)
        if (resolved[name]) {
          resolved[name].merge(other.scoped[scope][name])
        } else {
          resolved[name] = other.scoped[scope][name]
        }
      }
    }, this)
  }, this)
}

/**
 * Look up the metric namespace belonging to a scope, creating it if it doesn't
 * already exist.
 *
 * @param {string} scope (Optional) The scope to look up.
 * @return {object} The namespace associated with the provided scope, or the
 *                  un-scoped metrics if the scope isn't set.
 */
Metrics.prototype._resolve = function _resolve(scope) {
  var resolved

  if (scope) {
    if (!this.scoped[scope]) this.scoped[scope] = {}

    resolved = this.scoped[scope]
  } else {
    resolved = this.unscoped
  }

  return resolved
}

/**
 * Map a metric to its nested-array representation, applying any name -> ID
 * mappings along the way. Split from _getScopedData for performance.
 *
 * @param {string} name The string to look up.
 */
Metrics.prototype._getUnscopedData = function _getUnscopedData(name) {
  if (!this.unscoped[name]) return

  var normalized = this.normalizer.normalize(name)
  if (normalized.ignore || !normalized.value) return

  return [this.mapper.map(normalized.value), this.unscoped[name]]
}

/**
 * Map a metric to its nested-array representation, applying any name -> ID
 * mappings along the way. Split from _getUnscopedData for performance.
 *
 * @param {string} name The string to look up.
 */
Metrics.prototype._getScopedData = function _getScopedData(name, scope) {
  if (!this.scoped[scope][name]) return

  var normalized = this.normalizer.normalize(name)
  if (normalized.ignore || !normalized.value) return

  return [this.mapper.map(normalized.value, scope), this.scoped[scope][name]]
}

/**
 * @return {object} A serializable version of the unscoped metrics. Intended
 *                  for use by toJSON.
 */
Metrics.prototype._toUnscopedData = function _toUnscopedData() {
  var metricData = []

  Object.keys(this.unscoped).forEach(function cb_forEach(name) {
    var data = this._getUnscopedData(name)
    if (data) metricData.push(data)
  }, this)

  return metricData
}

/**
 * @return {object} A serializable version of the scoped metrics. Intended for
 *                  use by toJSON.
 */
Metrics.prototype._toScopedData = function _toScopedData() {
  var metricData = []

  Object.keys(this.scoped).forEach(function cb_forEach(scope) {
    Object.keys(this.scoped[scope]).forEach(function cb_forEach(name) {
      var data = this._getScopedData(name, scope)
      if (data) metricData.push(data)
    }, this)
  }, this)

  return metricData
}

module.exports = Metrics
