'use strict'

var promInit = require('./promise')

var BLUEBIRD_SPEC = {
  name: 'bluebird',
  constructor: 'Promise',
  $proto: {
    then: ['then', 'done', 'spread', 'all', 'asCallback', 'nodeify', 'finally', 'lastly'],
    catch: ['catch', 'caught', 'error'],

    // _resolveFromResolver is in bluebird 2.x
    // _execute is in bluebird 3.x
    executor: ['_execute', '_resolveFromResolver']
  },
  $static: {
    cast: [
      'resolve', 'fullfilled', 'cast', 'reject', 'rejected', 'fromNode',
      'fromCallback', 'all'
    ]
  }
}

module.exports = function initialize(agent, bluebird) {
  promInit(agent, bluebird, BLUEBIRD_SPEC)
}
