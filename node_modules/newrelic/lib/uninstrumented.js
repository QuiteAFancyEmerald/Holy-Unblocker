'use strict'

var path = require('path')
var logger = require('./logger')
var NAMES = require('./metrics/names')
var INSTRUMENTATIONS = require('./instrumentations')()

module.exports = {
  check: check,
  createMetrics: createMetrics
}


// Special case since we do some hackish stuff in lib/shimmer.js to make pg.js
// work
INSTRUMENTATIONS.push('pg.js')

// Static variable holding list of un-instrumented modules for use in the future
var uninstrumented = []

// Log a helpful message about un-instrumented modules
function logUninstrumented() {
  if (uninstrumented.length > 0) {
    var message =
      'The newrelic module must be the first module required.\n' +
      'The following modules were required before newrelic and are not being ' +
      'instrumented:'

    uninstrumented.forEach(function buildMessage(module) {
      message += '\n\t' + module.name + ': ' + module.filename
    })

    logger.warn(message)
  }
}

// Create Supportability/Uninstrumented/<module> metrics
//
// @param metrics Agent metrics aggregator
function createMetrics(metrics) {
  if (uninstrumented.length > 0) {
    metrics.getOrCreateMetric(NAMES.SUPPORTABILITY.UNINSTRUMENTED).incrementCallCount()
  }

  uninstrumented.forEach(function addMetrics(module) {
    metrics.getOrCreateMetric(
      NAMES.SUPPORTABILITY.UNINSTRUMENTED + '/' + module.name
    ).incrementCallCount()
  })
}

// Determine module name from filename of module's main script
//
// Heuristic: take the first path name that isn't 'index.js' or 'lib'.
//
// @param filename Filename of module's main script
// @return Name of module
function moduleNameFromFilename(filename) {
  var name = path.basename(filename, '.js')
  if (name !== 'index') return name

  var paths = filename.split(path.sep).slice(0, -1)
  for (var i = paths.length - 1; i >= 0; i--) {
    if (paths[i] !== 'lib') return paths[i]
  }
}

// Check for any instrument-able modules that have already been loaded. This does
// not check core modules as we don't have access to the core module loader
// cache. But, users probably are missing instrumentation for other modules if
// they are missing instrumentation for core modules.
function check() {
  for (var filename in require.cache) {
    if (!Object.hasOwnProperty.call(require.cache, filename)) {
      continue
    }
    var name = moduleNameFromFilename(filename)

    if (INSTRUMENTATIONS.indexOf(name) !== -1) {
      uninstrumented.push({name: name, filename: filename})
    }
  }

  logUninstrumented()
}
