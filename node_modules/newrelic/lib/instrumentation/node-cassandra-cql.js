'use strict'

var shimmer = require('../shimmer')
var record = require('../metrics/recorders/cassandra.js')
var CASSANDRA = require('../metrics/names').CASSANDRA

var INSTRUMENTED_OPERATIONS = [
  'execute',
  'executeAsPrepared',
  'executeBatch'
]

module.exports = function initialize(agent, cassandracql) {
  var tracer = agent.tracer

  INSTRUMENTED_OPERATIONS.forEach(function cb_forEach(operation) {
    shimmer.wrapMethod(
      cassandracql && cassandracql.Client && cassandracql.Client.prototype,
      'node-cassandra-cql.Client.prototype',
      operation,
      function wrapOperation(original) {
        return tracer.wrapFunction(
          CASSANDRA.OPERATION + operation,
          record,
          original,
          wrapper
        )
      }
    )

    function wrapper(segment, args, bind) {
      var position = args.length - 1
      var last = args[position]

      // capture connection info for datastore instance metric
      segment.port = this.port
      segment.host = this.host

      if (typeof last === 'function') {
        args[position] = bind(last, true, true)
      } else if (Array.isArray(last) && typeof last[last.length - 1] === 'function') {
        last[last.length - 1] = tracer.bindFunction(
          bind(last[last.length - 1], true, true)
        )
      } else { // let's shove a callback in there for fun
        args.push(bind(null, null))
      }

      return args
    }
  })
}
