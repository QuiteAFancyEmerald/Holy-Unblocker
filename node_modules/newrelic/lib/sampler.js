'use strict'

var NAMES = require('./metrics/names')
var logger = require('./logger').child({component: 'sampler'})
var Timer = require('./timer')
var os = require('os')

/*
 *
 * CONSTANTS
 *
 */
var MILLIS = 1e3
var MICROS = 1e6
var NANOS = 1e9
var CPUS = os.cpus().length
var SAMPLE_INTERVAL = 15 * MILLIS

var samplers = []

function Sampler(sampler, interval) {
  this.id = setInterval(sampler, interval)
  // timer.unref only in 0.9+
  if (this.id.unref) this.id.unref()
}

Sampler.prototype.stop = function stop() {
  clearInterval(this.id)
}

function recordQueueTime(agent, timer) {
  timer.end()
  agent.metrics.measureMilliseconds(NAMES.EVENTS.WAIT, null, timer.getDurationInMillis())
}

function sampleMemory(agent) {
  return function memorySampler() {
    try {
      var mem = process.memoryUsage()
      agent.metrics.measureBytes(NAMES.MEMORY.PHYSICAL, mem.rss)
      agent.metrics.measureBytes(NAMES.MEMORY.USED_HEAP, mem.heapUsed)
      agent.metrics.measureBytes(NAMES.MEMORY.MAX_HEAP, mem.heapTotal)
      agent.metrics.measureBytes(NAMES.MEMORY.FREE_HEAP, mem.heapTotal - mem.heapUsed)
      agent.metrics.measureBytes(NAMES.MEMORY.USED_NONHEAP, mem.rss - mem.heapTotal)
      logger.trace('Recorded memory:', mem)
    } catch (e) {
      logger.debug('Could not record memory usage', e)
    }
  }
}

function checkEvents(agent) {
  return function eventSampler() {
    var timer = new Timer()
    timer.begin()
    setTimeout(recordQueueTime.bind(null, agent, timer), 0)
  }
}

function getCpuSample(lastSample) {
  try {
    return process.cpuUsage(lastSample)
  } catch (e) {
    logger.debug('Could not record cpu usage', e)
    return null
  }
}

function generateCPUMetricRecorder(agent) {
  var lastSampleTime
  // userTime and sysTime are in seconds
  return function recordCPUMetrics(userTime, sysTime) {
    var elapsedUptime
    if (!lastSampleTime) {
      elapsedUptime = process.uptime()
    } else {
      elapsedUptime = (Date.now() - lastSampleTime) / MILLIS
    }

    var totalCpuTime = CPUS * elapsedUptime

    lastSampleTime = Date.now()

    var userUtil = userTime / totalCpuTime
    var sysUtil  = sysTime / totalCpuTime

    recordValue(agent, NAMES.CPU.USER_TIME, userTime)
    recordValue(agent, NAMES.CPU.SYSTEM_TIME, sysTime)
    recordValue(agent, NAMES.CPU.USER_UTILIZATION, userUtil)
    recordValue(agent, NAMES.CPU.SYSTEM_UTILIZATION, sysUtil)
  }
}

function sampleCpu(agent) {
  var lastSample
  var recordCPU = generateCPUMetricRecorder(agent)
  return function cpuSampler() {
    var cpuSample = getCpuSample(lastSample)
    lastSample = getCpuSample()

    if (lastSample == null) {
      return
    }

    recordCPU(cpuSample.user / MICROS, cpuSample.system / MICROS)
  }
}

function sampleCpuNative(agent, nativeMetrics) {
  var recordCPU = generateCPUMetricRecorder(agent)
  nativeMetrics.on('usage', function collectResourceUsage(usage) {
    recordCPU(usage.diff.ru_utime / MILLIS, usage.diff.ru_stime / MILLIS)
  })

  return function cpuSampler() {
    // NOOP?
  }
}

function sampleLoop(agent, nativeMetrics) {
  return function loopSampler() {
    var loopMetrics = nativeMetrics.getLoopMetrics()

    // convert from microseconds to seconds
    loopMetrics.usage.min = loopMetrics.usage.min / MICROS
    loopMetrics.usage.max = loopMetrics.usage.max / MICROS
    loopMetrics.usage.total = loopMetrics.usage.total / MICROS
    loopMetrics.usage.sumOfSquares = loopMetrics.usage.sumOfSquares / (MICROS * MICROS)

    recordCompleteMetric(agent, NAMES.LOOP.USAGE, loopMetrics.usage)
  }
}

function sampleGc(agent, nativeMetrics) {
  // Hook into the stats event to accumulate total pause time and record per-run
  // pause time metric.
  nativeMetrics.on('gc', function onGCStatsEvent(stats) {
    var duration = stats.duration / NANOS
    recordValue(agent, NAMES.GC.PAUSE_TIME, duration)

    if (stats.type) {
      recordValue(agent, NAMES.GC.PREFIX + stats.type, duration)
    } else {
      logger.debug(stats, 'Unknown GC type %j', stats.typeId)
    }
  })

  return function gcSampler() {
    // NOOP?
  }
}

var sampler = module.exports = {
  state: 'stopped',
  sampleMemory: sampleMemory,
  checkEvents: checkEvents,
  sampleCpu: sampleCpu,
  sampleGc: sampleGc,
  sampleLoop: sampleLoop,
  nativeMetrics: null,

  start: function start(agent) {
    samplers.push(new Sampler(sampleMemory(agent), 5 * MILLIS))
    samplers.push(new Sampler(checkEvents(agent), SAMPLE_INTERVAL))
    var metricFeatureFlag = agent.config.feature_flag.native_metrics

    // This requires a native module which may have failed to build.
    if (!this.nativeMetrics) {
      if (metricFeatureFlag) {
        try {
          this.nativeMetrics = require('@newrelic/native-metrics')({
            timeout: SAMPLE_INTERVAL
          })
        } catch (err) {
          logger.info(
            {error: {message: err.message, stack: err.stack}},
            'Not adding native metric sampler.'
          )
          agent.metrics.getOrCreateMetric(
            NAMES.SUPPORTABILITY.DEPENDENCIES + '/NoNativeMetricsModule'
          ).incrementCallCount()
        }
      } else {
        logger.info('Feature flag for native metrics is false')
      }
    }

    if (this.nativeMetrics) {
      if (!this.nativeMetrics.bound) {
        this.nativeMetrics.bind(SAMPLE_INTERVAL)
      }

      // Add GC events if available.
      if (this.nativeMetrics.gcEnabled) {
        samplers.push(new Sampler(sampleGc(agent, this.nativeMetrics), SAMPLE_INTERVAL))
      }

      // Add loop metrics if available.
      if (this.nativeMetrics.loopEnabled) {
        samplers.push(new Sampler(sampleLoop(agent, this.nativeMetrics), SAMPLE_INTERVAL))
      }
    }

    // Add CPU sampling using the built-in data if available, otherwise pulling
    // from the native module.
    if (process.cpuUsage) { // introduced in 6.1.0
      samplers.push(new Sampler(sampleCpu(agent), SAMPLE_INTERVAL))
    } else if (this.nativeMetrics && this.nativeMetrics.usageEnabled) {
      samplers.push(
        new Sampler(sampleCpuNative(agent, this.nativeMetrics), SAMPLE_INTERVAL)
      )
    } else {
      logger.debug('Not adding CPU metric sampler.')
    }

    sampler.state = 'running'
  },

  stop: function stop() {
    samplers.forEach(function forEachSampler(s) {
      s.stop()
    })
    samplers = []
    sampler.state = 'stopped'
    if (this.nativeMetrics) {
      this.nativeMetrics.unbind()
      this.nativeMetrics.removeAllListeners()

      // Setting this.nativeMetrics to null allows us to config a new
      // nativeMetrics object after the first start call.
      this.nativeMetrics = null
    }
  }
}

function recordValue(agent, metric, value) {
  var stats = agent.metrics.getOrCreateMetric(metric)
  stats.recordValue(value)
  logger.trace('Recorded metric %s: %j', metric, value)
}

function recordCompleteMetric(agent, metricName, metric) {
  var stats = agent.metrics.getOrCreateMetric(metricName)
  stats.merge(metric)
  logger.trace('Recorded metric %s: %j', metricName, metric)
}
