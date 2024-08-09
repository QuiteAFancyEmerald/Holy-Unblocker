'use strict'

var NODEJS = {
  PREFIX: 'Nodejs/'
}

var ALL = 'all'

var ERRORS = {
  PREFIX: 'Errors/',
  ALL: 'Errors/' + ALL,
  WEB: 'Errors/allWeb',
  OTHER: 'Errors/allOther'
}

var EVENTS = {
  WAIT: 'Events/wait'
}

var MEMORY = {
  PHYSICAL: 'Memory/Physical',
  FREE_HEAP: 'Memory/Heap/Free',
  USED_HEAP: 'Memory/Heap/Used',
  MAX_HEAP: 'Memory/Heap/Max',
  USED_NONHEAP: 'Memory/NonHeap/Used'
}

var CPU = {
  SYSTEM_TIME: 'CPU/System Time',
  SYSTEM_UTILIZATION: 'CPU/System/Utilization',
  USER_TIME: 'CPU/User Time',
  USER_UTILIZATION: 'CPU/User/Utilization'
}

var GC = {
  PREFIX: 'GC/',
  PAUSE_TIME: 'GC/System/Pauses'
}

var VIEW = {
  PREFIX: 'View/',
  RENDER: '/Rendering'
}

var LOOP = {
  PREFIX: NODEJS.PREFIX + 'EventLoop/',
  USAGE: NODEJS.PREFIX + 'EventLoop/CPU/Usage'
}

var DB = {
  PREFIX: 'Datastore/',
  STATEMENT: 'Datastore/statement',
  OPERATION: 'Datastore/operation',
  INSTANCE: 'Datastore/instance',
  ALL: 'Datastore/' + ALL,
  WEB: 'allWeb',
  OTHER: 'allOther'
}

var EXTERNAL = {
  PREFIX: 'External/',
  ALL: 'External/' + ALL,
  WEB: 'External/allWeb',
  OTHER: 'External/allOther',
  APP: 'ExternalApp/',
  TRANSACTION: 'ExternalTransaction/'
}

var FUNCTION = {
  PREFIX: 'Function/'
}

var MIDDLEWARE = {
  PREFIX: NODEJS.PREFIX + 'Middleware/'
}

var FS = {
  PREFIX: 'Filesystem/'
}

var MEMCACHE = {
  PREFIX: 'Memcache',
  OPERATION: DB.OPERATION + '/Memcache/',
  INSTANCE: DB.INSTANCE + '/Memcache/',
  ALL: DB.PREFIX + 'Memcache/' + ALL
}

var MONGODB = {
  PREFIX: 'MongoDB',
  STATEMENT: DB.STATEMENT + '/MongoDB/',
  OPERATION: DB.OPERATION + '/MongoDB/',
  INSTANCE: DB.INSTANCE + '/MongoDB/'
}

var MYSQL = {
  PREFIX: 'MySQL',
  STATEMENT: DB.STATEMENT + '/MySQL/',
  OPERATION: DB.OPERATION + '/MySQL/',
  INSTANCE: DB.INSTANCE + '/MySQL/'
}

var REDIS = {
  PREFIX: 'Redis',
  OPERATION: DB.OPERATION + '/Redis/',
  INSTANCE: DB.INSTANCE + '/Redis/',
  ALL: DB.PREFIX + 'Redis/' + ALL
}

var POSTGRES = {
  PREFIX: 'Postgres',
  STATEMENT: DB.STATEMENT + '/Postgres/',
  OPERATION: DB.OPERATION + '/Postgres/',
  INSTANCE: DB.INSTANCE + '/Postgres/'
}

var CASSANDRA = {
  PREFIX: 'Cassandra',
  OPERATION: DB.OPERATION + '/Cassandra/',
  STATEMENT: DB.STATEMENT + '/Cassandra/',
  INSTANCE: DB.INSTANCE + '/Cassandra/',
  ALL: DB.PREFIX + 'Cassandra/' + ALL

}

var ORACLE = {
  PREFIX: 'Oracle',
  STATEMENT: DB.STATEMENT + '/Oracle/',
  OPERATION: DB.OPERATION + '/Oracle/',
  INSTANCE: DB.INSTANCE + '/Oracle/'
}

var EXPRESS = {
  PREFIX: 'Expressjs/',
  MIDDLEWARE: MIDDLEWARE.PREFIX + 'Expressjs/',
  ERROR_HANDLER: MIDDLEWARE.PREFIX + 'Expressjs/'
}

var RESTIFY = {
  PREFIX: 'Restify/'
}

var HAPI = {
  PREFIX: 'Hapi/'
}

var SUPPORTABILITY = {
  PREFIX: 'Supportability/',
  UNINSTRUMENTED: 'Supportability/Uninstrumented',
  EVENTS: 'Supportability/Events',
  API: 'Supportability/API',
  UTILIZATION: 'Supportability/utilization',
  DEPENDENCIES: 'Supportability/InstalledDependencies'
}

var UTILIZATION = {
  AWS_ERROR: SUPPORTABILITY.UTILIZATION + '/aws/error',
  DOCKER_ERROR: SUPPORTABILITY.UTILIZATION + '/docker/error'
}


var CUSTOM_EVENTS = {
  PREFIX: SUPPORTABILITY.EVENTS + '/Customer/',
  DROPPED: SUPPORTABILITY.EVENTS + '/Customer/Dropped',
  SEEN: SUPPORTABILITY.EVENTS + '/Customer/Seen',
  SENT: SUPPORTABILITY.EVENTS + '/Customer/Sent',
  TOO_LARGE: SUPPORTABILITY.EVENTS + '/Customer/TooLarge',
  FAILED: SUPPORTABILITY.EVENTS + '/Customer/FailedToSend'
}

var TRANSACTION_ERROR = {
  SEEN: SUPPORTABILITY.EVENTS + '/TransactionError/Seen',
  SENT: SUPPORTABILITY.EVENTS + '/TransactionError/Sent'
}

var WEB = {
  RESPONSE_TIME: 'WebTransaction',
  TOTAL_TIME: 'WebTransactionTotalTime'
}

var BACKGROUND = {
  RESPONSE_TIME: 'OtherTransaction',
  TOTAL_TIME: 'OtherTransactionTotalTime'
}

var TRUNCATED = {
  PREFIX: 'Truncated/'
}

module.exports = {
  ACTION_DELIMITER: '/',
  ALL: ALL,
  APDEX: 'Apdex',
  BACKGROUND: BACKGROUND,
  CASSANDRA: CASSANDRA,
  CLIENT_APPLICATION: 'ClientApplication',
  CONTROLLER: 'Controller',
  CPU: CPU,
  GC: GC,
  CUSTOM: 'Custom',
  CUSTOM_EVENTS: CUSTOM_EVENTS,
  DB: DB,
  ERRORS: ERRORS,
  EVENTS: EVENTS,
  EXPRESS: EXPRESS,
  EXTERNAL: EXTERNAL,
  FS: FS,
  FUNCTION: FUNCTION,
  HAPI: HAPI,
  HTTP: 'HttpDispatcher',
  LOOP: LOOP,
  MEMCACHE: MEMCACHE,
  MEMORY: MEMORY,
  MONGODB: MONGODB,
  MYSQL: MYSQL,
  NORMALIZED: 'NormalizedUri',
  NODEJS: NODEJS,
  ORACLE: ORACLE,
  POSTGRES: POSTGRES,
  QUEUETIME: 'WebFrontend/QueueTime',
  REDIS: REDIS,
  RESTIFY: RESTIFY,
  SUPPORTABILITY: SUPPORTABILITY,
  TRANSACTION_ERROR: TRANSACTION_ERROR,
  TRUNCATED: TRUNCATED,
  URI: 'Uri',
  UTILIZATION: UTILIZATION,
  VIEW: VIEW,
  WEB: WEB
}
