'use strict'

var promInit = require('./promise')

var STATIC_PROMISE_METHODS = [
  'reject', 'resolve', 'all', 'any', 'some', 'map', 'reduce', 'filter', 'reduceRight'
]

var WHEN_SPEC = {
  name: 'when',
  constructor: 'Promise',
  executor: true,
  $proto: {
    then: ['then', 'done', 'spread', 'finally', 'ensure'],
    catch: ['catch', 'otherwise']
  },
  $static: {
    cast: STATIC_PROMISE_METHODS,
    $copy: STATIC_PROMISE_METHODS.concat([
      '_defer',
      '_handler',
      'race',
      '_traverse',
      '_visitRemaining',
      'settle',
      'iterate',
      'unfold',
      'never'
    ]),
    $passThrough: [
      'enterContext',
      'exitContext',
      'createContext',
      'onFatalRejection',
      'onPotentiallyUnhandledRejectionHandled',
      'onPotentiallyUnhandledRejection'
    ]
  },
  $library: {
    cast: STATIC_PROMISE_METHODS
  }
}

module.exports = function initialize(agent, library) {
  if (!library || !library.Promise) {
    return false
  }

  promInit(agent, library, WHEN_SPEC)
}
