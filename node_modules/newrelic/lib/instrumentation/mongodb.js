'use strict'

var ParsedStatement = require('../db/parsed-statement')
var shimmer = require('../shimmer')
var logger = require('../logger').child({component: 'mongodb'})
var MONGODB = require('../metrics/names').MONGODB

var MONGO_SEGMENT_RE = /^Datastore\/(?:statement|operation)\/MongoDB\//

// legacy endpoint enumerations
var DB_OPS = [
  'addUser',
  'authenticate',
  'collection',
  'collectionNames',
  'collections',
  'command',
  'createCollection',
  'createIndex',
  'cursorInfo',
  'dereference',
  'dropCollection',
  'dropDatabase',
  'dropIndex',
  'ensureIndex',
  'eval',
  'executeDbAdminCommand',
  'indexInformation',
  'logout',
  'open',
  'reIndex',
  'removeUser',
  'renameCollection',
  'stats',
  '_executeInsertCommand',
  '_executeQueryCommand'
]

var COLLECTION_OPS = [
  'aggregate',
  'bulkWrite',
  'count',
  'createIndex',
  'deleteMany',
  'deleteOne',
  'distinct',
  'drop',
  'dropAllIndexes',
  'dropIndex',
  'ensureIndex',
  'findAndModify',
  'findAndRemove',
  'findOne',
  'findOneAndDelete',
  'findOneAndReplace',
  'findOneAndUpdate',
  'geoHaystackSearch',
  'geoNear',
  'group',
  'indexes',
  'indexExists',
  'indexInformation',
  'insert',
  'insertMany',
  'insertOne',
  'isCapped',
  'mapReduce',
  'options',
  'parallelCollectionScan',
  'reIndex',
  'remove',
  'rename',
  'replaceOne',
  'save',
  'stats',
  'update',
  'updateMany',
  'updateOne'
]

var GRID_OPS = [
  'put',
  'get',
  'delete'
]

var CURSOR_OPS = [
  'nextObject',
  'next',
  'toArray',
  'count',
  'explain'
]

module.exports = initialize

function initialize(agent, mongodb) {
  if (!mongodb) return
  var tracer = agent.tracer
  var moduleNameToWrapFunction = {
    'GridStore': wrapGrid,
    'OrderedBulkOperation': wrapQuery,
    'UnorderedBulkOperation': wrapQuery,
    'CommandCursor': wrapQuery,
    'AggregationCursor': wrapQuery,
    'Cursor': wrapQuery,
    'Collection': wrapQuery,
    'Db': wrapDb
  }

  function instrumentModules(err, instrumentations) {
    if (err) {
      logger.trace('Unable to instrument mongo using the apm api due to error: %s', err)
      // fallback to legacy instrumentation?
      return
    }
    instrumentations.forEach(instrumentModule)
  }

  function applyInstrumentation(objectName, object, instrumentation) {
    var methods = instrumentation.methods
    var methodOptions = instrumentation.options
    if (methodOptions.callback) {
      for (var j = 0; j < methods.length; j++) {
        var method = methods[j]

        var wrapFunction
        if (method === 'each') {
          wrapFunction = wrapEach
        } else {
          wrapFunction = moduleNameToWrapFunction[objectName]
        }

        if (wrapFunction) {
          shimmer.wrapMethod(
            object.prototype,
            'mongodb.' + objectName + '.' + method,
            method,
            wrapFunction
          )
        } else {
          logger.trace('No wrapping method found for %s', objectName)
        }
      }
    }
  }

  function instrumentModule(module) {
    var object = module.obj
    var instrumentations = module.instrumentations
    for (var i = 0; i < instrumentations.length; i++) {
      applyInstrumentation(module.name, object, instrumentations[i])
    }
  }

  // instrument using the apm api
  if (mongodb.instrument) {
    var instrumenter = mongodb.instrument({}, instrumentModules)
    instrumenter.on('started', function onMongoEventStarted(evnt) {
      // This assumes that this `started` event is fired _after_ our wrapper
      // starts and creates the segment. We perform a check of the segment name
      // out of an excess of caution.
      var segment = tracer.getSegment()
      var connId = evnt.connectionId
      if (connId && segment && MONGO_SEGMENT_RE.test(segment.name)) {
        logger.trace('Adding db instance attributes to segment %j', segment.name)
        // Mongo sticks the path to the domain socket in the "host" slot, but we
        // want it in the "port", so if we have a domain socket we need to change
        // the order of our parameters.
        if (connId.domainSocket) {
          segment.captureDBInstanceAttributes('localhost', connId.host, evnt.databaseName)
        } else {
          segment.captureDBInstanceAttributes(connId.host, connId.port, evnt.databaseName)
        }
      } else {
        logger.trace(
          'Not adding db instance metric attributes to segment %j',
          segment && segment.name
        )
      }
    })
    return
  }

  // fallback to legacy enumerations
  if (mongodb.Cursor && mongodb.Cursor.prototype) {
    // should wrapup stream aswell
    shimmer.wrapMethod(
      mongodb.Cursor.prototype,
      'mongodb.Cursor.prototype',
      CURSOR_OPS,
      wrapQuery
    )

    shimmer.wrapMethod(
      mongodb.Cursor.prototype,
      'mongodb.Cursor.prototype',
      'each',
      wrapEach
    )
  }

  if (mongodb.Collection && mongodb.Collection.prototype) {
    shimmer.wrapMethod(
      mongodb.Collection.prototype,
      'mongodb.Cursor.prototype',
      COLLECTION_OPS,
      wrapQuery
    )
  }

  if (mongodb.Grid && mongodb.Grid.prototype) {
    shimmer.wrapMethod(
      mongodb.Grid.prototype,
      'mongodb.Grid.prototype',
      GRID_OPS,
      wrapGrid
    )
  }

  if (mongodb.Db && mongodb.Db.prototype) {
    for (var i = 0, l = DB_OPS.length; i < l; ++i) {
      shimmer.wrapMethod(
        mongodb.Db.prototype,
        'mongodb.Db.prototype',
        DB_OPS[i],
        wrapDb
      )
    }

    shimmer.wrapMethod(mongodb.Db, 'mongodb.Db', 'connect', wrapDb)
  }

  function wrapOp(original, name, wrapper) {
    return function wrapped() {
      var args = tracer.slice(arguments)
      var last = args.length - 1
      var callback = typeof args[last] === 'function' ? args[last] : null
      var transaction = tracer.getTransaction()
      var collection = this.collectionName || 'unknown'

      if (this.collection && this.collection.collectionName) {
        collection = this.collection.collectionName
      } else if (this.s && this.s.name) {
        collection = this.s.name || collection
      } else if (this.ns) {
        collection = this.ns.split(/\./)[1] || collection
      }

      if (!callback) {
        logger.trace(
          'Not tracing MongoDB %s.%s(); no callback.',
          collection,
          name
        )

        return original.apply(this, args)
      } else if (!transaction) {
        logger.trace(
          'Not tracing MongoDB %s.%s(); no New Relic transaction.',
          collection,
          name
        )

        return original.apply(this, args)
      } else if (inMongoSegment(tracer)) {
        logger.trace(
          'Not tracing MongoDB %s.%s(); Already in a mongo segment',
           collection,
           name
        )

        return original.apply(this, args)
      }

      return wrapper.call(this, args, last, collection)
    }
  }

  function wrapQuery(original, opName) {
    return wrapOp(original, opName, function wrappedQuery(args, last, collection) {
      var segment = addMongoStatement(tracer, collection, opName)
      var callback = args[last]

      logger.trace(
        'Tracing MongoDB %s.%s().',
        collection,
        opName
      )

      // capture configuration information if available
      captureInstanceAttributes(segment, this)

      args[last] = tracer.wrapCallback(callback, segment, function wrappedCallback() {
        segment.touch()
        logger.trace('Tracing MongoDB %s.%s() ended.', collection, opName)
        return callback.apply(this, arguments)
      })

      return tracer.bindFunction(original, segment).apply(this, args)
    })
  }

  function wrapEach(original, opName) {
    return wrapOp(original, opName, function wrappedEach(args, last, collectionName) {
      var segment = addMongoStatement(tracer, collectionName, opName)
      var callbackBatch = null
      var callback = args[last]
      var collection = this

      logger.trace('Tracing MongoDB %s.%s().', collection, opName)

      // capture configuration information if available
      captureInstanceAttributes(segment, this)

      args[args.length - 1] = wrappedCallback

      return tracer.bindFunction(original, segment).apply(this, args)

      function wrappedCallback(err, item) {
        segment.touch()

        if (err || item === null) {
          logger.trace('Tracing MongoDB %s.%s(%s) ended.', collection, opName)
        }

        if (!callbackBatch) {
          callbackBatch = tracer.wrapCallback(
            callback,
            segment,
            function wrapBatch() {
              if (!collection.items || !collection.items.length) {
                callbackBatch = null
              }
              return callback.apply(this, arguments)
            }
          )
        }

        return callbackBatch.apply(this, arguments)
      }
    })
  }

  function wrapGrid(original, opName) {
    return wrapOp(original, opName, function wrappedGridOp(args, last) {
      var name = MONGODB.OPERATION + 'GridFS-' + opName
      var callback = args[last]
      var grid = this

      // TODO: should look into adding a recorder for this
      return tracer.addSegment(name, null, null, false, segmentWrapper)

      function segmentWrapper(segment) {
        args[last] = tracer.wrapCallback(callback, segment, nrCallbackWrap)

        return original.apply(grid, args)

        function nrCallbackWrap() {
          segment.touch()
          logger.trace('Tracing MongoDB Grid.%s() ended.', opName)
          return callback.apply(this, arguments)
        }
      }
    })
  }

  function wrapDb(original, opName) {
    return wrapOp(original, opName, function wrappedGridOp(args, last) {
      var name = MONGODB.OPERATION + opName
      var callback = args[last]
      var db = this

      // TODO: should look into adding a recorder for this

      return tracer.addSegment(name, null, null, false, segmentWrapper)

      function segmentWrapper(segment) {
        args[last] = tracer.wrapCallback(callback, segment, nrCallbackWrap)
        return tracer.bindFunction(original, segment).apply(db, args)

        function nrCallbackWrap() {
          segment.touch()
          logger.trace('Tracing MongoDB %s() ended.', opName)
          return callback.apply(this, arguments)
        }
      }
    })
  }
}


var MONGO_RE = new RegExp(
  '^(?:' + MONGODB.STATEMENT + ')|(?:' + MONGODB.OPERATION + ')'
)
function inMongoSegment(tracer) {
  return MONGO_RE.test(tracer.getSegment().name)
}

function addMongoStatement(tracer, collection, opName) {
  var statement = new ParsedStatement(MONGODB.PREFIX, opName, collection)
  var recorder = statement.recordMetrics.bind(statement)
  var name = MONGODB.STATEMENT + collection + '/' + opName

  var segment = tracer.createSegment(name, recorder)
  segment.start()
  return segment
}

function captureInstanceAttributes(segment, obj) {
  if (obj.db && obj.db.serverConfig) {
    logger.trace('Adding datastore instance attributes from obj.db.serverConfig')
    var databaseName = (
      obj.db.serverConfig.db || obj.db.serverConfig.dbInstance || {}
    ).databaseName
    doCapture(obj.db.serverConfig, databaseName)
  } else {
    logger.trace('Could not find datastore instance attributes.')
  }

  function doCapture(conf, database) {
    var host = conf.host
    var port = conf.port

    // If using a domain socket, mongo stores the path as the host name, but we
    // pass it through the port value.
    if (conf.socketOptions && conf.socketOptions.domainSocket) {
      port = host
      host = 'localhost'
    }

    segment.captureDBInstanceAttributes(host, port, database)
  }
}
