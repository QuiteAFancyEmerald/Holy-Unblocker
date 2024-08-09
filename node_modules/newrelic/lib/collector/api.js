'use strict'

var logger = require('../logger').child({component: 'collector_api'})
var facts = require('./facts.js')
var RemoteMethod = require('./remote-method.js')


/*
 *
 * CONSTANTS
 *
 */

// just to make clear what's going on
var TO_MILLIS = 1e3

// taken directly from Python agent's newrelic.core.application
var BACKOFFS = [
  {interval: 15, warn: false},
  {interval: 15, warn: false},
  {interval: 30, warn: false},
  {interval: 60, warn: true},
  {interval: 120, warn: false},
  {interval: 300, warn: false}
]

var ERRORS = {
  INVALID_LICENSE: 'NewRelic::Agent::LicenseException',
  LIMIT_EXCEEDED: 'NewRelic::Agent::InternalLimitExceeded',
  RESTART: 'NewRelic::Agent::ForceRestartException',
  DISCONNECT: 'NewRelic::Agent::ForceDisconnectException',
  MAINTENANCE: 'NewRelic::Agent::MaintenanceError',
  RUNTIME: 'RuntimeError'
}

var HTTP_REQUEST_TOO_LARGE = 413
var HTTP_UNSUPPORTED_MEDIA_TYPE = 415
var HTTP_SERVER_INTERNAL = 500
var HTTP_LOL_COLLECTOR = 503


function dumpErrors(errors, name) {
  var index = 1

  errors.forEach(function cb_forEach(error) {
    logger.trace(error, "Error %s during %s:", index++, name)

    if (error.laterErrors) {
      error.laterErrors.forEach(function cb_forEach(laterError) {
        logger.trace(laterError, "Error %s during %s:", index++, name)
      })
    }
  })
}

function CollectorAPI(agent) {
  this._agent = agent

  /* RemoteMethods can be reused and have little per-object state, so why not
   * save some GC time?
   */
  this._methods = {
    redirect: new RemoteMethod('get_redirect_host', agent.config),
    handshake: new RemoteMethod('connect', agent.config),
    settings: new RemoteMethod('agent_settings', agent.config),
    errors: new RemoteMethod('error_data', agent.config),
    metrics: new RemoteMethod('metric_data', agent.config),
    traces: new RemoteMethod('transaction_sample_data', agent.config),
    shutdown: new RemoteMethod('shutdown', agent.config),
    events: new RemoteMethod('analytic_event_data', agent.config),
    customEvents: new RemoteMethod('custom_event_data', agent.config),
    queryData: new RemoteMethod('sql_trace_data', agent.config),
    errorEvents: new RemoteMethod('error_event_data', agent.config)
  }
}

CollectorAPI.prototype.connect = function connect(callback) {
  if (!callback) throw new TypeError("callback is required")

  var api = this
  var attempts = 1
  var max = BACKOFFS.length
  var errors = []


  function retry(error, response, body) {
    if (error) errors.push(error)

    if (!error || attempts >= max) {
      dumpErrors(errors, 'connect')
      return callback(error, response, body)
    }

    // failing high-security mode compliance will cause a disconnect
    if (error.class === ERRORS.DISCONNECT) {
      logger.error("The New Relic collector rejected this agent.")
      logger.error(error.message)
    }

    var backoff = BACKOFFS[attempts - 1]
    if (backoff.warn) {
      logger.warn(
        "No connection has been established to New Relic after %s attempts.",
        attempts
      )
    }

    logger.debug(
      "Failed attempting to connect to New Relic, waiting %ss to retry.",
      backoff.interval
    )

    attempts++

    var id = setTimeout(function again() {
      api._login(retry)
    }, backoff.interval * TO_MILLIS)
    
    if (id.unref) {
      id.unref()
    }
  }

  this._login(retry)
}

CollectorAPI.prototype._login = function _login(callback) {
  var methods = this._methods
  var agent = this._agent


  methods.redirect.invoke(null, function cb_invoke(error, collector, body) {
    if (error) return callback(error, collector, body)
    if (!collector) {
      logger.error(
        "Requesting this account's collector from %s failed; trying default.",
        agent.config.host
      )
    } else {
      var parts = collector.split(':')
      if (parts.length > 2) {
        logger.error(
          "Requesting collector from %s returned bogus result '%s'; trying default.",
          agent.config.host,
          collector
        )
      } else {
        logger.debug(
          "Requesting this account's collector from %s returned %s; reconfiguring.",
          agent.config.host,
          collector
        )

        agent.config.host = parts[0]
        if (parts.length > 1) {
          agent.config.port = parts[1]
        }
      }
    }

    facts(agent, function getEnvDict(environmentDict) {
      // The collector really likes arrays.
      // In fact, it kind of insists on them.
      var environment = [environmentDict]

      methods.handshake.invoke(environment, function cb_invoke(error, config, body) {
        if (error) return callback(error, config, body)
        if (!config || !config.agent_run_id) {
          return callback(new Error("No agent run ID received from handshake."), config)
        }

        agent.setState('connected')
        logger.info(
          "Connected to %s:%d with agent run ID %s.",
          agent.config.host,
          agent.config.port,
          config.agent_run_id
        )

        // pass configuration data from the API so automatic reconnect works
        agent.reconfigure(config)

        callback(null, config, body)
      })
    })
  })
}

/**
 * Send current public agent settings to collector. This should always be
 * invoked after a successful connect response with server-side settings, but
 * will also be invoked on any other config changes.
 *
 * @param {Function} callback The continuation / error handler.
 */
CollectorAPI.prototype.reportSettings = function reportSettings(callback) {
  // The second argument to the callback is always empty data
  this._methods.settings.invoke(
    [this._agent.config.publicSettings()],
    function cb_invoke(error, unused, body) {
      if (error) dumpErrors([error], 'agent_settings')

      if (callback) callback(error, body)
    }
  )
}

/**
 * Send already-formatted error data by calling error_data. For
 * performance reasons, the API methods do no validation, but the
 * collector expects data in an exact format. It expects a JSON array
 * containing the following 2 elements:
 *
 * 1. The agent run ID.
 * 2. An array of one or more errors. See lib/error.js for details.
 *
 * @param {Array}    errors   The encoded errors list.
 * @param {Function} callback The continuation / error handler.
 */
CollectorAPI.prototype.errorData = function errorData(errors, callback) {
  if (!errors) throw new TypeError("must pass errors to send")
  if (!callback) throw new TypeError("callback is required")

  this._runLifecycle(this._methods.errors, errors, callback)
}

/**
 * Send already-formatted metric data by calling metric_data. For
 * performance reasons, the API methods do no validation, but the collector
 * expects data in an exact format format. It expects a JSON array containing
 * the following 4 elements:
 *
 * 1. The agent run ID.
 * 2. The time the metric data started being collected, in seconds since the
 *    epoch.
 * 3. The time the metric data finished being collected, in seconds since the
 *    epoch.
 * 4. An array of 1 or more metric arrays. See lib/metrics.js for details.
 *
 * @param {Array}    metrics  The encoded metrics list.
 * @param {Function} callback The continuation / error handler.
 */
CollectorAPI.prototype.metricData = function metricData(metrics, callback) {
  if (!metrics) throw new TypeError("must pass metrics to send")
  if (!callback) throw new TypeError("callback is required")

  this._runLifecycle(this._methods.metrics, metrics, callback)
}

CollectorAPI.prototype.analyticsEvents = function analyticsEvents(events, callback) {
  if (!events) throw new TypeError("must pass events to send")
  if (!callback) throw new TypeError("callback is required")
  this._runLifecycle(this._methods.events, events, callback)
}

CollectorAPI.prototype.customEvents = function customEvents(events, callback) {
  if (!events) throw new TypeError("must pass events to send")
  if (!callback) throw new TypeError("callback is required")
  this._runLifecycle(this._methods.customEvents, events, callback)
}

/**
 * Send already-formatted slow SQL data by calling
 * sql_trace_data. For performance reasons, the API methods
 * do no validation, but the collector expects data in an exact format
 * format. It expects a JSON array containing the following 2 elements:
 *
 * 1. The agent run ID.
 * 2. The encoded slow SQL data.
 *
 * @param {Array}    queries  The encoded slow SQL data.
 * @param {Function} callback The continuation / error handler.
 */
CollectorAPI.prototype.queryData = function queryData(queries, callback) {
  if (!queries) throw new TypeError("must pass queries to send")
  if (!callback) throw new TypeError("callback is required")
  this._runLifecycle(this._methods.queryData, queries, callback)
}

CollectorAPI.prototype.errorEvents = function errorEvents(events, callback) {
  if (!events) throw new TypeError("must pass queries to send")
  if (!callback) throw new TypeError("callback is required")
  this._runLifecycle(this._methods.errorEvents, events, callback)
}

/**
 * Send already-formatted slow trace data by calling
 * transaction_sample_data. For performance reasons, the API methods
 * do no validation, but the collector expects data in an exact format
 * format. It expects a JSON array containing the following 2 elements:
 *
 * 1. The agent run ID.
 * 2. The encoded slow trace data. This is the most complicated data
 *    format handled by the module, and documenting it is almost beyond the
 *    scope of comments. See lib/transaction/trace.js for details.
 *
 * @param {Array}    trace    The encoded trace data.
 * @param {Function} callback The continuation / error handler.
 */
CollectorAPI.prototype.transactionSampleData =
  function transactionSampleData(trace, callback) {
  if (!trace) throw new TypeError("must pass slow trace data to send")
  if (!callback) throw new TypeError("callback is required")

  this._runLifecycle(this._methods.traces, trace, callback)
}


/**
 * Sends no data aside from the message itself. Clears the run ID, which
 * effectively disconnects the agent from the collector.
 *
 * @param Function callback Runs after the run ID has been cleared.
 */
CollectorAPI.prototype.shutdown = function shutdown(callback) {
  if (!callback) throw new TypeError("callback is required")

  var agent = this._agent
  this._methods.shutdown.invoke(null, function closed(error, returned, body) {
    if (error) {
      dumpErrors([error], 'shutdown')
    } else {
      agent.setState('disconnected')
      logger.info(
        "Disconnected from New Relic; clearing run ID %s.",
        agent.config.run_id
      )
      agent.config.run_id = undefined
    }

    callback(error, returned, body)
  })
}

CollectorAPI.prototype._restart = function _restart(callback) {
  var api = this
  this.shutdown(function reconnect() {
    api.connect(callback)
  })
}

CollectorAPI.prototype._runLifecycle = function _runLifecycle(method, body, callback) {
  if (!this.isConnected()) {
    logger.warn("Not connected to New Relic. Not calling.", method.name)
    return callback(new Error("Not connected to collector.", null, null))
  }

  var api = this
  function standardHandler(error, returned, json) {
    if (!error) return callback(error, returned, json)

    dumpErrors([error], method.name)

    if (error.statusCode === HTTP_REQUEST_TOO_LARGE) {
      logger.error(
        error,
        "This call of %s sent New Relic too much data; discarding (%s):",
        method.name,
        HTTP_REQUEST_TOO_LARGE
      )
      return callback(null, returned, json)
    } else if (error.statusCode === HTTP_UNSUPPORTED_MEDIA_TYPE) {
      logger.error(
        error,
        "The New Relic collector couldn't deserialize data; discarding for %s (%s):",
        method.name,
        HTTP_UNSUPPORTED_MEDIA_TYPE
      )
      return callback(null, returned, json)
    } else if (error.statusCode === HTTP_LOL_COLLECTOR) {
      logger.debug(
        error,
        "New Relic is experiencing a spot of bother; please hold on (%s):",
        HTTP_LOL_COLLECTOR
      )
      return callback(error, returned, json)
    } else if (error.statusCode === HTTP_SERVER_INTERNAL) {
      logger.error(
        error,
        "New Relic's servers encountered a severe internal error on %s (%s):",
        method.name,
        HTTP_SERVER_INTERNAL
      )
      return callback(error, returned, json)
    } else if (error.class === ERRORS.INVALID_LICENSE) {
      logger.error(
        error,
        "Your New Relic license key appears to be invalid. Please double-check it:"
      )

      return callback(error, returned, json)
    } else if (error.class === ERRORS.LIMIT_EXCEEDED) {
      logger.error(
        error,
        "New Relic ran into a weird problem with %s. Let support@newrelic.com know:",
        method.name
      )
      return callback(null, returned, json)
    } else if (error.class === ERRORS.RESTART) {
      logger.info(
        error,
        "The New Relic collector requested a connection restart on %s:",
        method.name
      )

      return api._restart(function cb__restart() {
        method.invoke(body, standardHandler)
      })
    } else if (error.class === ERRORS.DISCONNECT) {
      logger.error(error, "The New Relic collector is shutting down this agent:")

      return api._agent.stop(function cb_stop() {
        callback(error, returned, json)
      })
    } else if (error.class === ERRORS.MAINTENANCE) {
      logger.info(
        error,
        "The New Relic server for your account is currently undergoing maintenance. " +
          "Data will be held until it can be submitted (failed on %s):",
        method.name
      )
      return callback(error, returned, json)
    } else if (error.class === ERRORS.RUNTIME) {
      logger.warn(
        error,
        "Calling %s on New Relic failed due to a runtime error. " +
          "Data will be held until it can be submitted:",
        method.name
      )
      return callback(error, returned, json)
    }
    logger.error(
      error,
      "Calling %s on New Relic failed unexpectedly. " +
        "Data will be held until it can be submitted:",
      method.name
    )
    return callback(error, returned, json)
  }

  method.invoke(body, standardHandler)
}

CollectorAPI.prototype.isConnected = function isConnected() {
  return !!this._agent.config.run_id
}

module.exports = CollectorAPI
