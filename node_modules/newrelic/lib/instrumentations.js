'use strict'

// Return a new copy of this array every time we're called
module.exports = function instrumentations() {
  return [
    'connect',
    'bluebird',
    'director',
    'express',
    'generic-pool',
    'hapi',
    'memcached',
    'mongodb',
    'mysql',
    'node-cassandra-cql',
    'cassandra-driver',
    'pg',
    'q',
    'redis',
    'ioredis',
    'restify',
    'oracle',
    'when'
  ]
}
