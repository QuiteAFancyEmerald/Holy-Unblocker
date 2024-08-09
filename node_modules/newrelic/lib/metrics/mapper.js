'use strict'

var logger = require('../logger').child({component: 'mapper'})


/**
 * To tighten up the metrics JSON, the collector will maintain a list of
 * mappings from metric names (which sometimes include scopes as well) to
 * numeric IDs. As the agent sends new metric names to the collector, the
 * collector will return corresponding metric IDs, in the expectation that the
 * agent will uses those IDs instead of the names going forward.
 *
 * @param {Array} raw A list of metric spec -> ID mappings represented as
 *                    2-element arrays: [{name : 'Metric', scope : 'Scope'}, 1]
 */
function MetricMapper(raw) {
  this.unscoped = {}
  this.scoped = {}
  this.length = 0

  this.load(raw)
}

/**
 * Parse the list of metric mappings returned on metric_data responses from the
 * collector. These continue to stream in as the agent runs, so keep adding to
 * the collection rather than resetting.
 *
 * https://hudson.newrelic.com/job/collector-master/javadoc/com/nr/collector/datatypes/MetricData.html
 *
 * @param {Array} raw A list of metric spec -> ID mappings represented as
 *                    2-element arrays: [{name : 'Metric', scope : 'Scope'}, 1]
 */
MetricMapper.prototype.load = function load(raw) {
  if (!(raw && raw.length)) {
    logger.debug("No new metric mappings from server.")
    return
  }

  for (var i = 0; i < raw.length; i++) {
    var spec = raw[i][0]
    var scope = spec.scope
    var name = spec.name
    var id = raw[i][1]
    var resolved


    if (scope) {
      if (!this.scoped[scope]) this.scoped[scope] = {}
      resolved = this.scoped[scope]
    } else {
      resolved = this.unscoped
    }

    if (!resolved[name]) this.length++
    resolved[name] = id
    logger.trace("Metric spec %s has been mapped to ID %s.", spec, id)
  }
  logger.debug("Parsed %d metric ids (%d total).", raw.length, this.length)
}

/**
 * @param {String} name  The metric name.
 * @param {String} scope The scope for the metric, if set.
 *
 * @returns {object} Either a metric spec based on the parameters, or the
 *                   server-sent ID.
 */
MetricMapper.prototype.map = function map(name, scope) {
  if (scope) {
    if (this.scoped[scope] && this.scoped[scope][name]) {
      return this.scoped[scope][name]
    }
    return {name: name, scope: scope}
  }

  if (this.unscoped[name]) {
    return this.unscoped[name]
  }

  return {name: name}
}

module.exports = MetricMapper
