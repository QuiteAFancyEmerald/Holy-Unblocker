'use strict'

var logger = require('../logger').child({component: 'query_tracer'})
var obfuscate = require('../util/sql/obfuscate')
var Stats = require('../stats')
var util = require('util')
var crypto = require('crypto')
var encode = require('../util/codec.js').encode
var path = require('path')

var NR_ROOT = path.resolve(__dirname, '..')

module.exports = QueryTracer

function QueryTracer(config) {
  if (!(this instanceof QueryTracer)) {
    return new QueryTracer(config)
  }
  this.samples = {}
  this.config = config
}

QueryTracer.prototype.removeShortest = function removeShortest() {
  var keys = Object.keys(this.samples)
  var shortest


  for (var i = 0, len = keys.length; i < len; ++i) {
    var sample = this.samples[keys[i]].trace
    if (!shortest || shortest.duration > sample.duration) {
      shortest = sample
    }
  }

  delete this.samples[shortest.normalized]
}

QueryTracer.prototype.merge = function merge(tracer) {
  var keys = Object.keys(tracer.samples)

  for (var i = 0, len = keys.length; i < len; ++i) {
    if (this.samples[keys[i]]) {
      this.samples[keys[i]].merge(tracer.samples[keys[i]])
    } else {
      this.samples[keys[i]] = tracer.samples[keys[i]]
    }
  }
}

QueryTracer.prototype.addQuery = function addQuery(segment, type, query, trace) {
  var duration = segment.getDurationInMillis()

  if (duration < this.config.transaction_tracer.explain_threshold) return

  var slowQuery = new SlowQuery(segment, type, query, trace)

  switch (this.config.transaction_tracer.record_sql) {
    case 'raw':
      logger.info('recording raw sql')
      segment.parameters.sql = slowQuery.query
      break
    case 'obfuscated':
      logger.info('recording obfuscated sql')
      segment.parameters.sql_obfuscated = slowQuery.obfuscated
      break
    default:
      logger.info(
        'not collecting slow-query because transaction_tracer.record_sql was set to %s',
        this.config.transaction_tracer.record_sql
      )
      return
  }
  segment.parameters.backtrace = slowQuery.trace

  if (!this.config.slow_sql.enabled) return

  if (this.samples[slowQuery.normalized]) {
    return this.samples[slowQuery.normalized].aggregate(slowQuery)
  }

  this.samples[slowQuery.normalized] = new QuerySample(this, slowQuery)

  if (Object.keys(this.samples).length > this.config.slow_sql.max_samples) {
    this.removeShortest()
  }
}

QueryTracer.prototype.prepareJSON = function prepareJSON(done) {
  var keys = Object.keys(this.samples)
  var remaining = keys.length
  var data = []

  if (!remaining) return done(null, data)

  for (var i = 0; i < keys.length; ++i) {
    this.samples[keys[i]].prepareJSON(collect)
  }

  function collect(err, json) {
    if (err) {
      done(err)
      // turn callback into a noop so it can't be called more than once
      done = noop
      return
    }

    data.push(json)
    if (!--remaining) done(null, data)
  }

  function noop() {}
}

function QuerySample(tracer, slowQuery) {
  Stats.call(this)
  this.tracer = tracer
  this.trace = slowQuery
  this.aggregate(slowQuery)
}

util.inherits(QuerySample, Stats)

QuerySample.prototype.aggregate = function aggregate(slowQuery) {
  this.recordValue(slowQuery.duration)
  if (this.trace && this.trace.duration >= slowQuery.duration) return
  this.trace = slowQuery
}

QuerySample.prototype.merge = function merge(sample) {
  Stats.prototype.merge.call(this, sample)
  if (this.trace.duration < sample.trace.duration) {
    this.trace = sample.trace
  }
}

QuerySample.prototype.prepareJSON = function prepareJSON(done) {
  var transaction = this.trace.segment.transaction
  var sample = this
  var trace = sample.trace

  var params = sample.getParams()
  if (!this.tracer.config.simple_compression) {
    encode(params, respond)
  } else {
    process.nextTick(respond.bind(null, null, params))
  }

  function respond(err, data) {
    if (err) return done(err)

    done(null, [
      transaction.name,
      transaction.url || '<unknown>',
      trace.id,
      getQuery(sample.tracer.config, trace),
      trace.metric,
      sample.callCount,
      sample.total,
      sample.min,
      sample.max,
      data
    ])
  }
}

QuerySample.prototype.getParams = function getParams() {
  var segmentParams = this.trace.segment.parameters
  var params = {
    backtrace: this.trace.trace,
  }

  if (segmentParams.host) {
    params.host = segmentParams.host
  }

  if (segmentParams.port_path_or_id) {
    params.port_path_or_id = segmentParams.port_path_or_id
  }

  if (segmentParams.database_name) {
    params.database_name = segmentParams.database_name
  }

  return params
}

function SlowQuery(segment, type, query, trace) {
  this.obfuscated = obfuscate(query, type)
  this.normalized = this.obfuscated.replace(/\?\s*,\s*|\s*/g, '')
  this.id = normalizedHash(this.normalized)
  this.segment = segment
  this.query = query
  this.metric = segment.name
  this.trace = formatTrace(trace)
  this.duration = segment.getDurationInMillis()
}

function normalizedHash(value) {
  return parseInt(crypto.createHash('md5').update(value).digest('hex').slice(-4), 16)
}

function formatTrace(trace) {
  // remove error message and instrumentation frames from stack trace
  return trace ? trace.stack.split('\n').slice(1).filter(notNR).join('\n') : ''
}

function notNR(frame) {
  return frame.indexOf(NR_ROOT) === -1
}

function getQuery(config, trace) {
  switch (config.transaction_tracer.record_sql) {
    case 'raw':
      return trace.query
    case 'obfuscated':
      return trace.obfuscated
    default:
      return '?'
  }
}
