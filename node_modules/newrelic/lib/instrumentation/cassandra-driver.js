'use strict'

var shimmer = require('../shimmer')
var CASSANDRA = require('../metrics/names').CASSANDRA
var parseSql = require('../db/parse-sql')

module.exports = function initialize(agent, cassandra) {
  var tracer = agent.tracer
  var proto = cassandra.Client.prototype

  shimmer.wrapMethod(proto, 'Cassandra.Client.prototype', ['_innerExecute'], wrapExec)
  shimmer.wrapMethod(proto, 'Cassandra.Client.prototype', ['batch'], wrapBatch)

  shimmer.wrapMethod(
    proto,
    'Cassandra.Client.prototype',
    ['connect'],
    tracer.wrapFunctionLast.bind(tracer, CASSANDRA.OPERATION + '/connect', null)
  )

  shimmer.wrapMethod(
    proto,
    'Cassandra.Client.prototype',
    ['shutdown'],
    tracer.wrapFunctionLast.bind(tracer, CASSANDRA.OPERATION + '/shutdown', null)
  )

  function wrapExec(original) {
    return tracer.wrapFunction(
      CASSANDRA.STATEMENT + 'Unknown',
      null,
      original,
      wrappedExec
    )

    function wrappedExec(segment, args, bind) {
      var ps = parseSql(CASSANDRA.PREFIX, args[0])

      var model = (ps.model || 'unknown')
      if (this.keyspace && model.indexOf('.') === -1) model = this.keyspace + '.' + model
      segment.name = CASSANDRA.STATEMENT + model + '/' + ps.operation

      segment.transaction.addRecorder(ps.recordMetrics.bind(ps, segment))
      var last = args.length - 1
      args[last] = bind(args[last])
      return args
    }
  }

  function wrapBatch(original) {
    return tracer.wrapFunction(
      CASSANDRA.STATEMENT + 'Unknown',
      null,
      original,
      wrappedBatch
    )

    function wrappedBatch(segment, args, bind) {
      var sql = (args[0] && args[0][0]) || ''
      if (sql.query) sql = sql.query
      var ps = parseSql(CASSANDRA.PREFIX, sql)

      var model = (ps.model || 'unknown')
      if (this.keyspace && model.indexOf('.') === -1) model = this.keyspace + '.' + model
      segment.name = CASSANDRA.STATEMENT + model + '/' + ps.operation + '/batch'

      segment.transaction.addRecorder(ps.recordMetrics.bind(ps, segment))
      var last = args.length - 1
      args[last] = bind(args[last])
      return args
    }
  }
}
