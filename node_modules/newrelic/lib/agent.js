'use strict'

var util = require('util')
var EventEmitter = require('events').EventEmitter
var Reservoir = require('./reservoir.js')
var logger = require('./logger.js')
var sampler = require('./sampler.js')
var NAMES = require('./metrics/names.js')
var CollectorAPI = require('./collector/api.js')
var ErrorAggregator = require('./errors/aggregator')
var Metrics = require('./metrics')
var MetricNormalizer = require('./metrics/normalizer.js')
var TxSegmentNormalizer = require('./metrics/normalizer/tx_segment.js')
var MetricMapper = require('./metrics/mapper.js')
var TraceAggregator = require('./transaction/trace/aggregator.js')
var hashes = require('./util/hashes')
var uninstrumented = require('./uninstrumented.js')
var QueryTracer = require('./db/tracer')

/*
 *
 * CONSTANTS
 *
 */

var STATES = [
  'stopped',      // start state
  'starting',     // handshaking with NR
  'connected',    // connected to collector
  'disconnected', // disconnected from collector
  'started',      // up and running
  'stopping',     // shutting down
  'errored'       // stopped due to error
]

// just to make clear what's going on
var TO_MILLIS = 1e3
var FROM_MILLIS = 1e-3

// Check for already loaded modules and warn about them. This must be executed
// only once, at the first require of this file, or else we have problems in
// unit tests.
uninstrumented.check()

/**
 * There's a lot of stuff in this constructor, due to Agent acting as the
 * orchestrator for New Relic within instrumented applications.
 *
 * This constructor can throw if, for some reason, the configuration isn't
 * available. Don't try to recover here, because without configuration the
 * agent can't be brought up to a useful state.
 */
function Agent(config) {
  EventEmitter.call(this)

  if (!config) throw new Error("Agent must be created with a configuration!")

  // The agent base attributes which last throughout its lifetime.
  this._state = 'stopped'
  this.config = config
  this.environment = require('./environment')
  this.version = this.config.version
  this.collector = new CollectorAPI(this)

  // Reset the agent to add all the sub-objects it needs. These object are the
  // ones that get re-created if the agent is told to restart from the collector.
  this.events = null
  this.customEvents = null
  this.errors = null
  this.mapper = null
  this.metricNameNormalizer = null
  this.metrics = null
  this.transactionNameNormalizer = null
  this.urlNormalizer = null
  this.txSegmentNormalizer = null
  this.userNormalizer = null
  this.reset()

  // Transaction tracing.
  this.tracer = this._setupTracer()
  this.traces = new TraceAggregator(this.config)

  // Query tracing.
  this.queries = new QueryTracer(this.config)

  // Set up all the configuration events the agent needs to listen for.
  var self = this
  this.config.on('apdex_t', this._apdexTChange.bind(this))
  this.config.on('data_report_period', this._harvesterIntervalChange.bind(this))
  this.config.on('agent_enabled', this._enabledChange.bind(this))
  this.config.on('change', this._configChange.bind(this))
  this.config.on('metric_name_rules', function updateMetricNameNormalizer() {
    self.metricNameNormalizer.load.apply(self.metricNameNormalizer, arguments)
  })
  this.config.on('transaction_name_rules', function updateTransactionNameNormalizer() {
    self.transactionNameNormalizer.load.apply(self.transactionNameNormalizer, arguments)
  })
  this.config.on('url_rules', function updateUrlNormalizer() {
    self.urlNormalizer.load.apply(self.urlNormalizer, arguments)
  })
  this.config.on('transaction_segment_terms', function updateSegmentNormalizer() {
    self.txSegmentNormalizer.load.apply(self.txSegmentNormalizer, arguments)
  })

  // Entity tracking metrics.
  this.totalActiveSegments = 0
  this.segmentsCreatedInHarvest = 0
  this.segmentsClearedInHarvest = 0
  this.activeTransactions = 0

  // Hidden class optimizations.
  this.harvesterHandle = null

  // Finally, add listeners for the agent's own events.
  this.on('transactionFinished', this._transactionFinished.bind(this))
}
util.inherits(Agent, EventEmitter)

/**
 * The agent is meant to only exist once per application, but the singleton is
 * managed by index.js. An agent will be created even if the agent's disabled by
 * the configuration.
 *
 * @config {boolean} agent_enabled Whether to start up the agent.
 *
 * @param {Function} callback Continuation and error handler.
 */
Agent.prototype.start = function start(callback) {
  if (!callback) throw new TypeError("callback required!")

  var agent = this

  this.setState('starting')

  if (this.config.agent_enabled !== true) {
    logger.warn("The New Relic Node.js agent is disabled by its configuration. " +
                "Not starting!")

    this.setState('stopped')
    return process.nextTick(callback)
  }

  if (!(this.config.license_key)) {
    logger.error("A valid account license key cannot be found. " +
                 "Has a license key been specified in the agent configuration " +
                 "file or via the NEW_RELIC_LICENSE_KEY environment variable?")

    this.setState('errored')
    return process.nextTick(function cb_nextTick() {
      callback(new Error("Not starting without license key!"))
    })
  }

  sampler.start(agent)

  logger.info("Starting New Relic for Node.js connection process.")

  this.collector.connect(function cb_connect(error, config) {
    if (error) {
      agent.setState('errored')
      return callback(error, config)
    }

    if (agent.collector.isConnected() && !agent.config.no_immediate_harvest) {
      // harvest immediately for quicker data display, but after at least 1
      // second or the collector will throw away the data.
      setTimeout(function one_sec_delayed_harvest() {
        agent.harvest(function cb_harvest(error) {
          agent._startHarvester(agent.config.data_report_period)

          agent.setState('started')
          callback(error, config)
        })
      }, 1000)
    } else {
      process.nextTick(function cb_nextTick() {
        callback(null, config)
      })
    }
  })
}

/**
 * Any memory claimed by the agent will be retained after stopping.
 *
 * FIXME: make it possible to dispose of the agent, as well as do a
 * "hard" restart. This requires working with shimmer to strip the
 * current instrumentation and patch to the module loader.
 */
Agent.prototype.stop = function stop(callback) {
  if (!callback) throw new TypeError("callback required!")

  var agent = this

  this.setState('stopping')
  this._stopHarvester()
  sampler.stop()

  if (this.collector.isConnected()) {
    this.collector.shutdown(function cb_shutdown(error) {
      if (error) {
        agent.setState('errored')
        logger.warn(error, "Got error shutting down connection to New Relic:")
      } else {
        agent.setState('stopped')
        logger.info("Stopped New Relic for Node.js.")
      }

      callback(error)
    })
  } else {
    process.nextTick(callback)
  }
}

/**
 * Builds all of the sub-properties of the agent that rely on configurations.
 */
Agent.prototype.reset = function reset() {
  // Insights events.
  if (!this.events) {
    this.events = new Reservoir()
  }
  this.events.setLimit(this.config.transaction_events.max_samples_per_minute)
  if (!this.customEvents) {
    this.customEvents = new Reservoir()
  }
  this.customEvents.setLimit(this.config.custom_insights_events.max_samples_stored)

  // Error tracing.
  if (!this.errors) {
    this.errors = new ErrorAggregator(this.config)
  }
  this.errors.reconfigure(this.config)

  // Metrics.
  this.mapper = new MetricMapper()
  this.metricNameNormalizer = new MetricNormalizer(this.config, 'metric name')
  this.metrics = new Metrics(this.config.apdex_t, this.mapper, this.metricNameNormalizer)

  // Transaction naming.
  this.transactionNameNormalizer = new MetricNormalizer(this.config, 'transaction name')
  this.urlNormalizer = new MetricNormalizer(this.config, 'URL')

  // Segment term based tx renaming for MGI mitigation.
  this.txSegmentNormalizer = new TxSegmentNormalizer()

  // User naming and ignoring rules.
  this.userNormalizer = new MetricNormalizer(this.config, 'user')
  this.userNormalizer.loadFromConfig()

  // Supportability.
  if (this.config.debug.internal_metrics) {
    this.config.debug.supportability = new Metrics(
      this.config.apdex_t,
      this.mapper,
      this.metricNameNormalizer
    )
  }
}

/**
 * On agent startup, an interval timer is started that calls this method once
 * a minute, which in turn invokes the pieces of the harvest cycle. It calls
 * the various collector API methods in order, bailing out if one of them fails,
 * to ensure that the agents don't pummel the collector if it's already
 * struggling.
 */
Agent.prototype.harvest = function harvest(callback) {
  if (!callback) throw new TypeError("callback required!")

  var agent = this
  var harvestSteps = [
    '_sendMetrics',
    '_sendErrors',
    '_sendTrace',
    '_sendEvents',
    '_sendCustomEvents',
    '_sendQueries',
    '_sendErrorEvents'
  ]

  logger.trace({
    segmentTotal: this.totalActiveSegments,
    harvestCreated: this.segmentsCreatedInHarvest,
    harvestCleared: this.segmentsClearedInHarvest,
    activeTransactions: this.activeTransactions
  }, 'Entity stats on harvest')

  this.segmentsCreatedInHarvest = 0
  this.segmentsClearedInHarvest = 0

  if (!this.collector.isConnected()) {
    return process.nextTick(function cb_nextTick() {
      callback(new Error("Not connected to New Relic!"))
    })
  }
  runHarvestStep(0)

  function runHarvestStep(n) {
    agent[harvestSteps[n++]](next)

    function next(error) {
      if (error || n >= harvestSteps.length) return callback(error)
      runHarvestStep(n)
    }
  }
}

/**
 * Public interface for passing configuration data from the collector
 * on to the configuration, in an effort to keep them at least somewhat
 * decoupled.
 *
 * @param {object} configuration New config JSON from the collector.
 */
Agent.prototype.reconfigure = function reconfigure(configuration) {
  if (!configuration) throw new TypeError("must pass configuration")

  this.config.onConnect(configuration)
}

/**
 * Make it easier to determine what state the agent thinks it's in (needed
 * for a few tests, but fragile).
 *
 * FIXME: remove the need for this
 *
 * @param {string} newState The new state of the agent.
 */
Agent.prototype.setState = function setState(newState) {
  if (STATES.indexOf(newState) === -1) {
    throw new TypeError("Invalid state " + newState)
  }
  logger.debug("Agent state changed from %s to %s.", this._state, newState)
  this._state = newState
  this.emit(this._state)
}

/**
 * Server-side configuration value.
 *
 * @param {number} apdexT Apdex tolerating value, in seconds.
 */
Agent.prototype._apdexTChange = function _apdexTChange(apdexT) {
  logger.debug("Apdex tolerating value changed to %s.", apdexT)
  this.metrics.apdexT = apdexT
  if (this.config.debug.supportability) {
    this.config.debug.supportability.apdexT = apdexT
  }
}

/**
 * Server-side configuration value. When run, forces a harvest cycle
 * so as to not cause the agent to go too long without reporting.
 *
 * @param {number} interval Time in seconds between harvest runs.
 */
Agent.prototype._harvesterIntervalChange = _harvesterIntervalChange

function _harvesterIntervalChange(interval, callback) {
  var agent = this

  // only change the setup if the harvester is currently running
  if (this.harvesterHandle) {
    // force a harvest now, to be safe
    this.harvest(function cb_harvest(error) {
      agent._restartHarvester(interval)
      if (callback) callback(error)
    })
  } else if (callback) {
    process.nextTick(callback)
  }
}

/**
 * Restart the harvest cycle timer.
 *
 * @param {number} harvestSeconds How many seconds between harvests.
 */
Agent.prototype._restartHarvester = function _restartHarvester(harvestSeconds) {
  this._stopHarvester()
  this._startHarvester(harvestSeconds)
}

/**
 * Safely stop the harvest cycle timer.
 */
Agent.prototype._stopHarvester = function _stopHarvester() {
  if (this.harvesterHandle) clearInterval(this.harvesterHandle)
  this.harvesterHandle = undefined
}

/**
 * Safely start the harvest cycle timer, and ensure that the harvest
 * cycle won't keep an application from exiting if nothing else is
 * happening to keep it up.
 *
 * @param {number} harvestSeconds How many seconds between harvests.
 */
Agent.prototype._startHarvester = function _startHarvester(harvestSeconds) {
  var agent = this

  function onError(error) {
    if (error) {
      logger.info(error, "Error on submission to New Relic (data held for redelivery):")
    }
  }

  function harvester() {
    agent.harvest(onError)
  }

  this.harvesterHandle = setInterval(harvester, harvestSeconds * TO_MILLIS)
  // timer.unref is 0.9+
  if (this.harvesterHandle.unref) this.harvesterHandle.unref()
}

/**
 * `agent_enabled` changed. This will generally only happen because of a high
 * security mode mismatch between the agent and the collector. This only
 * expects to have to stop the agent. No provisions have been made, nor
 * testing have been done to make sure it is safe to start the agent back up.
 */
Agent.prototype._enabledChange = function _enabledChange() {
  if (this.config.agent_enabled === false) {
    logger.warn('agent_enabled has been changed to false, stopping the agent.')
    this.stop(function nop() {})
  }
}

/**
 * Report new settings to collector after a configuration has changed. This
 * always occurs after handling a response from a connect call.
 */
Agent.prototype._configChange = function _configChange() {
  this.collector.reportSettings()
}

/**
 * To develop the current transaction tracer, I created a tracing tracer that
 * tracks when transactions, segments and function calls are proxied. This is
 * used by the tests, but can also be dumped and logged, and is useful for
 * figuring out where in the execution chain tracing is breaking down.
 *
 * @param object config Agent configuration.
 *
 * @returns Tracer Either a debugging or production transaction tracer.
 */
Agent.prototype._setupTracer = function _setupTracer() {
  var Tracer = require('./transaction/tracer')
  return new Tracer(this)
}

/**
 * The pieces of supportability metrics are scattered all over the place -- only
 * send supportability metrics if they're explicitly enabled in the
 * configuration.
 *
 * @param {Function} callback Gets any delivery errors.
 */
Agent.prototype._sendMetrics = function _sendMetrics(callback) {
  var agent = this

  if (this.collector.isConnected()) {
    if (this.errors.getTotalErrorCount() > 0) {
      var count = this.errors.getTotalErrorCount()
      this.metrics.getOrCreateMetric(NAMES.ERRORS.ALL).incrementCallCount(count)

      count = this.errors.getWebTransactionsErrorCount()
      this.metrics.getOrCreateMetric(NAMES.ERRORS.WEB).incrementCallCount(count)

      count = this.errors.getBackgroundTransactionsErrorCount()
      this.metrics.getOrCreateMetric(NAMES.ERRORS.OTHER).incrementCallCount(count)
    }

    if (this.config.debug.supportability) {
      this.metrics.merge(this.config.debug.supportability)
    }

    // Send uninstrumented supportability metrics every harvest cycle
    uninstrumented.createMetrics(this.metrics)

    this._processCustomEvents()
    this._processErrorEvents()

    // wait to check until all the standard stuff has been added
    if (this.metrics.toJSON().length < 1) {
      logger.debug("No metrics to send.")
      return process.nextTick(callback)
    }

    var metrics = this.metrics
    var beginSeconds = metrics.started * FROM_MILLIS
    var endSeconds = Date.now() * FROM_MILLIS
    var payload = [this.config.run_id, beginSeconds, endSeconds, metrics]


    // reset now to avoid losing metrics that come in after delivery starts
    this.metrics = new Metrics(
      this.config.apdex_t,
      this.mapper,
      this.metricNameNormalizer
    )

    this.collector.metricData(payload, function cb_metricData(error, rules) {
      if (error) agent.metrics.merge(metrics)
      if (rules) agent.mapper.load(rules)

      callback(error)
    })
  } else {
    process.nextTick(function cb_nextTick() {
      callback(new Error("not connected to New Relic (metrics will be held)"))
    })
  }
}

/**
 * This function takes the custom events reservoir, gets stats on it for
 * metric purposes, then instantiates a new custom events reservoir. This is
 * so the stats are consistent with what actually gets pushed by the later
 * call to _sendCustomEvents.
 */
Agent.prototype._processCustomEvents = function _processCustomEvents() {
  this.customEventsPool = this.customEvents.toArray()

  // Create the metrics so they are at least set to 0
  var dropped = this.metrics.getOrCreateMetric(NAMES.CUSTOM_EVENTS.DROPPED)
  var seen = this.metrics.getOrCreateMetric(NAMES.CUSTOM_EVENTS.SEEN)
  var sent = this.metrics.getOrCreateMetric(NAMES.CUSTOM_EVENTS.SENT)

  // Bail out if there are no events
  if (this.customEventsPool.length === 0) {
    return
  }

  if (this.config.custom_insights_events.enabled) {
    // Record their values
    var diff = this.customEvents.overflow()
    dropped.incrementCallCount(diff)
    seen.incrementCallCount(this.customEvents.seen)
    sent.incrementCallCount(this.customEvents.seen - diff)

    // Log any warnings about dropping events
    if (diff) {
      logger.warn('Dropped %s custom events out of %s.', diff, this.customEvents.seen)
    }

    // Create a new reservoir now (instead of at send time) so metrics match
    // what we actually send.
    this.customEvents = new Reservoir(
      this.config.custom_insights_events.max_samples_stored
    )
  } else if (this.customEventsPool.length > 0) {
    // We have events and custom events are disabled. Clear everything out so we
    // don't hold onto memory that we shouldn't. Only time this could happen is
    // if the server sent down settings disabling custom events in the middle of
    // a harvest cycle.
    this.customEventsPool = []
    this.customEvents = new Reservoir(
      this.config.custom_insights_events.max_samples_stored
    )
  }
}

/**
 * This function takes the error events reservoir, gets stats on it for
 * metric purposes, then instantiates a new error events reservoir. This is
 * so the stats are consistent with what actually gets pushed by the later
 * call to _sendErrorEvents.
 */
Agent.prototype._processErrorEvents = function _processErrorEvents() {
  var events = this.errors.getEvents()

  this._lastErrorEvents = [
    this.errors.getEventsLimit(),
    this.errors.getEventsSeen(),
    events
  ]

  // Create the metrics so they are at least set to 0
  var seen = this.metrics.getOrCreateMetric(NAMES.TRANSACTION_ERROR.SEEN)
  var sent = this.metrics.getOrCreateMetric(NAMES.TRANSACTION_ERROR.SENT)

  // Bail out if there are no events
  if (events.length === 0) {
    return
  }

  if (this.config.error_collector.capture_events) {
    // Record their values
    var diff = this.errors.events.overflow()
    seen.incrementCallCount(this.errors.events.seen)
    sent.incrementCallCount(this.errors.events.seen - diff)

    // Log any warnings about dropping events
    if (diff) {
      logger.warn('Dropped %s error events out of %s.', diff, this.errors.events.seen)
    }

    // clear the reservoir now (instead of at send time) so metrics match
    // what we actually send.
    this.errors.clearEvents()
  } else if (events.length > 0) {
    // We have events and error events are disabled. Clear everything out so we
    // don't hold onto memory that we shouldn't. Only time this could happen is
    // if the server sent down settings disabling error events in the middle of
    // a harvest cycle.
    this._lastErrorEvents = []
    this.errors.clearEvents()
  }
}

/**
 * The error tracer doesn't know about the agent, and the connection
 * doesn't know about the error tracer. Only the agent knows about both.
 *
 * @param {Function} callback Gets any delivery errors.
 */
Agent.prototype._sendErrors = function _sendErrors(callback) {
  var agent = this

  if (this.config.collect_errors && this.config.error_collector.enabled) {
    if (!this.collector.isConnected()) {
      return process.nextTick(function cb_nextTick() {
        callback(new Error("not connected to New Relic (errors will be held)"))
      })
    } else if (this.errors.getTotalErrorCount() < 1) {
      logger.debug("No errors to send.")
      return process.nextTick(callback)
    }

    var errors = this.errors.getErrors()
    var payload = [this.config.run_id, errors]

    // reset now to avoid losing errors that come in after delivery starts
    this.errors.clearErrors()

    this.collector.errorData(payload, function cb_errorData(error) {
      if (error) agent.errors.merge(errors)

      callback(error)
    })
  } else {
    /**
     * Reset the errors object even if collection is disabled due to error
     * counting. Also covers the case where the error collector gets disabled
     * in the middle of a harvest cycle so the agent doesn't continue to hold
     * on to the errors it had collected during the harvest cycle so far.
     */
    this.errors.clearErrors()
    process.nextTick(callback)
  }
}

/**
 * The trace aggregator has its own harvester, which is already
 * asynchronous, due to its need to compress the nested transaction
 * trace data.
 *
 * @param {Function} callback Gets any encoding or delivery errors.
 */
Agent.prototype._sendTrace = function _sendTrace(callback) {
  var agent = this
  if (this.config.collect_traces && this.config.transaction_tracer.enabled) {
    if (!this.collector.isConnected()) {
      return process.nextTick(function cb_nextTick() {
        callback(new Error("not connected to New Relic (slow trace data will be held)"))
      })
    }

    this.traces.harvest(function cb_harvest(error, traces, trace) {
      if (error || !traces || traces.length === 0) return callback(error)

      var payload = [agent.config.run_id, traces]
      agent.collector.transactionSampleData(
        payload,
        function cb_transactionSampleData(error) {
          if (!error) agent.traces.reset(trace)

          callback(error)
        }
      )
    })
  } else {
    process.nextTick(callback)
  }
}

Agent.prototype._sendEvents = function _sendEvents(callback) {
  if (this.config.transaction_events.enabled) {
    var agent = this
    var events = agent.events
    var sample = events.toArray()
    var run_id = agent.config.run_id

    // bail if there are no events
    if (sample.length < 1) {
      return process.nextTick(callback)
    }

    var metrics = {
      reservoir_size: events.limit,
      events_seen: events.seen
    }

    var payload = [
      run_id,
      metrics,
      sample
    ]

    // clear events
    agent.events = new Reservoir(agent.config.transaction_events.max_samples_per_minute)

    // send data to collector
    agent.collector.analyticsEvents(payload, function cb_analyticsEvents(err) {
      if (err && err.statusCode === 413 ) {
        logger.warn('request too large; event data dropped')
      } else if (err) {
        logger.warn('analytics events failed to send; re-sampling')

        // boost the limit if a connection fails
        // and re-aggregate on failure
        var newlimit = agent.config.transaction_events.max_samples_stored
        agent.events.limit = newlimit

        for (var k = 0; k < sample.length; k++) agent.events.add(sample[k])
      } else {
        // if we had to limit events and sample them, emit a warning
        var diff = events.overflow()
        if (diff > 0) logger.warn(
          'analytics event overflow, dropped %d events; ' +
           'try increasing your limit above %d',
          diff, events.limit
        )
      }

      callback(err)
    })
  } else {
    process.nextTick(callback)
  }
}

/**
 * This is separate from _sendEvents because of potential post size problems.
 * _processCustomEvents needs to happen before _sendCustomEvents. In the
 * normal case it will have happened in _sendMetrics but if you are testing
 * this or trying to use it directly for some reason you'll need to call
 * _processCustomEvents first.
 */
Agent.prototype._sendCustomEvents = function _sendCustomEvents(callback) {
  // Must be enabled and actually have events to send, otherwise bail and nextTick
  if (this.config.custom_insights_events.enabled && this.customEventsPool.length > 0) {
    var agent = this
    var run_id = agent.config.run_id

    var payload = [
      run_id,
      agent.customEventsPool
    ]

    // send data to collector
    agent.collector.customEvents(payload, function cb_customEvents(err) {
      if (err && err.statusCode === 413 ) {
        var tooLarge = agent.metrics.getOrCreateMetric(NAMES.CUSTOM_EVENTS.TOO_LARGE)
        tooLarge.incrementCallCount()
        logger.warn('request too large; custom event data dropped')
      } else if (err) {
        var failed = agent.metrics.getOrCreateMetric(NAMES.CUSTOM_EVENTS.FAILED)
        failed.incrementCallCount()
        logger.warn('custom events failed to send; re-sampling')

        for (var i = 0; i < agent.customEventsPool.length; i++) {
          agent.customEvents.add(agent.customEventsPool[i])
        }
      }

      callback(err)
    })
  } else {
    process.nextTick(callback)
  }
}

Agent.prototype._sendQueries = function _sendQueries(callback) {
  var agent = this
  var queries = this.queries

  this.queries = new QueryTracer(agent.config)

  if (!this.config.slow_sql.enabled) {
    logger.debug('Slow Query is not enabled.')
    return process.nextTick(callback)
  }

  if (Object.keys(queries.samples).length < 1) {
    logger.debug('No queries to send.')
    return process.nextTick(callback)
  }

  queries.prepareJSON(function gotJSON(err, data) {
    if (err) {
      this.queries.merge(queries)
      logger.debug('Error while serializing query data: %s', err.message)
      return callback(err)
    }

    agent.collector.queryData([data], function handleResponse(error) {
      if (error) agent.queries.merge(queries)
      callback(error)
    })
  })
}

Agent.prototype._sendErrorEvents = function _sendErrorEvents(callback) {
  if (this.config.error_collector.capture_events && this._lastErrorEvents &&
        this._lastErrorEvents[2].length > 0) {
    var agent = this
    var eventsLimit = this._lastErrorEvents[0]
    var eventsSeen = this._lastErrorEvents[1]
    var events = this._lastErrorEvents[2]
    var run_id = agent.config.run_id

    if (events.length < 1) {
      return process.nextTick(callback)
    }

    var metrics = {
      reservoir_size: eventsLimit,
      events_seen: eventsSeen
    }

    var payload = [
      run_id,
      metrics,
      events
    ]

    // send data to collector
    agent.collector.errorEvents(payload, function cb_errorEvents(err) {
      if (err && err.statusCode === 413 ) {
        logger.warn('request too large; event data dropped')
      } else if (err) {
        logger.warn('error events failed to send; re-sampling')
        agent.errors.mergeEvents(events)
      }
      callback(err)
    })
  } else {
    process.nextTick(callback)
  }
}

Agent.prototype._addIntrinsicAttrsFromTransaction = _addIntrinsicAttrsFromTransaction

function _addIntrinsicAttrsFromTransaction(transaction) {
  var intrinsicAttributes = {
    webDuration: transaction.timer.duration / 1000,
    timestamp: transaction.timer.start,
    name: transaction.name,
    duration: transaction.timer.duration / 1000,
    type: 'Transaction',
    error: transaction.hasErrors()
  }

  var metric = transaction.metrics.getMetric(NAMES.QUEUETIME)
  if (metric) {
    intrinsicAttributes.queueDuration = metric.total
  }

  metric = transaction.metrics.getMetric(NAMES.EXTERNAL.ALL)
  if (metric) {
    intrinsicAttributes.externalDuration = metric.total
    intrinsicAttributes.externalCallCount = metric.callCount
  }

  metric = transaction.metrics.getMetric(NAMES.DB.ALL)
  if (metric) {
    intrinsicAttributes.databaseDuration = metric.total
    intrinsicAttributes.databaseCallCount = metric.callCount
  }

  // FLAG: cat
  if (this.config.feature_flag.cat) {
    if (!transaction.invalidIncomingExternalTransaction &&
         (
           transaction.referringTransactionGuid ||
           transaction.includesOutboundRequests()
         )
       ) {
      intrinsicAttributes['nr.guid'] = transaction.id
      intrinsicAttributes['nr.tripId'] = transaction.tripId || transaction.id
      intrinsicAttributes['nr.pathHash'] = hashes.calculatePathHash(
        this.config.applications()[0],
        transaction.name || transaction.nameState.getName(),
        transaction.referringPathHash
      )
      if (transaction.referringPathHash) {
        intrinsicAttributes['nr.referringPathHash'] = transaction.referringPathHash
      }
      if (transaction.referringTransactionGuid) {
        var refId = transaction.referringTransactionGuid
        intrinsicAttributes['nr.referringTransactionGuid'] = refId
      }
      var alternatePathHashes = transaction.alternatePathHashes()
      if (alternatePathHashes) {
        intrinsicAttributes['nr.alternatePathHashes'] = alternatePathHashes
      }
      if (transaction.webSegment) {
        var apdex = (this.config.web_transactions_apdex[transaction.name] ||
                     this.config.apdex_t)
        var duration = transaction.webSegment.getDurationInMillis() / 1000
        intrinsicAttributes['nr.apdexPerfZone'] = calculateApdexZone(duration, apdex)
      }
    }
  }

  if (transaction.syntheticsData) {
    intrinsicAttributes["nr.syntheticsResourceId"] = transaction.syntheticsData.resourceId
    intrinsicAttributes["nr.syntheticsJobId"] = transaction.syntheticsData.jobId
    intrinsicAttributes["nr.syntheticsMonitorId"] = transaction.syntheticsData.monitorId
  }

  return intrinsicAttributes
}

function calculateApdexZone(duration, apdexT) {
  if (duration <= apdexT) {
    return 'S' // satisfied
  }

  if (duration <= apdexT * 4) {
    return 'T' // tolerating
  }

  return 'F' // frustrated
}

Agent.prototype._addEventFromTransaction = _addEventFromTransaction

function _addEventFromTransaction(transaction) {
  if (!this.config.transaction_events.enabled) return

  var intrinsicAttributes = this._addIntrinsicAttrsFromTransaction(transaction)
  var userAttributes = transaction.trace.custom
  var agentAttributes = transaction.trace.parameters

  var event = [
    intrinsicAttributes,
    userAttributes,
    agentAttributes
  ]

  this.events.add(event)
}

/**
 * Put all the logic for handing finalized transactions off to the tracers and
 * metric collections in one place.
 *
 * @param {Transaction} transaction Newly-finalized transaction.
 */
Agent.prototype._transactionFinished = function _transactionFinished(transaction) {
  // only available when this.config.debug.tracer_tracing is true
  if (transaction.describer) {
    logger.trace({trace_dump: transaction.describer.verbose}, 'Dumped transaction state.')
  }

  // Allow the API to explicitly set the ignored status on bg-tx.
  // This is handled for web-tx when setName is called on the tx.
  if (!transaction.isWeb() && transaction.forceIgnore !== null) {
    transaction.ignore = transaction.forceIgnore
  }

  if (!transaction.ignore) {
    if (transaction.forceIgnore === false) {
      logger.debug("Explicitly not ignoring %s.", transaction.name)
    }
    this.metrics.merge(transaction.metrics)
    this.errors.onTransactionFinished(transaction, this.metrics)
    this.traces.add(transaction)

    var trace = transaction.trace
    trace.intrinsics = transaction.getIntrinsicAttributes()

    this._addEventFromTransaction(transaction)
  } else if (transaction.forceIgnore === true) {
    logger.debug("Explicitly ignoring %s.", transaction.name)
  } else {
    logger.debug("Ignoring %s.", transaction.name)
  }

  this.activeTransactions--
  this.totalActiveSegments -= transaction.numSegments
  this.segmentsClearedInHarvest += transaction.numSegments
}

/**
 * Get the current transaction (if there is one) from the tracer.
 *
 * @returns {Transaction} The current transaction.
 */
Agent.prototype.getTransaction = function getTransaction() {
  return this.tracer.getTransaction()
}

module.exports = Agent
