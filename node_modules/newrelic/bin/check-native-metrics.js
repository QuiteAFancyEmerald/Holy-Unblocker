'use strict'
/* eslint-disable no-console */

// Check the escape hatch before doing anything else.
if (process.env.NEW_RELIC_SKIP_NATIVE_METRICS) {
  console.log(
    'Skipping install of @newrelic/native-metrics, NEW_RELIC_SKIP_NATIVE_METRICS is set.'
  )
  process.exit(0)
}


var cp = require('child_process')


// NOTE This script is in javascript instead of bash because we want it to work
// on Windows and bash scripts don't work there.

// TODO Remove this script and put @newrelic/native-metrics back as an optional
// dependency when we drop support for Node v0.8.

cp.exec('npm --version', function npmVersionCB(err, npmVersionStr) {
  if (err) {
    console.log(
      'Skipping install of @newrelic/native-metrics, could not determine NPM version.'
    )
    return
  }

  var npmVersion = (npmVersionStr || '').split('.').map(function versionMap(a) {
    return parseInt(a, 10)
  })

  if (npmVersion.length >= 3 && npmVersion[0] >= 2) {
    cp.exec('node --version', function nodeVersionCB(err, nodeVersionStr) {
      if (err) {
        console.log(
          'Skipping install of @newrelic/native-metrics, could not determine ' +
          'Node version.'
        )
      }

      var nodeVersion = (nodeVersionStr || '').substr(1).split('.')
        .map(function versionMap(a) {
          return parseInt(a, 10)
        }
      )

      if (nodeVersion.length >= 3 && nodeVersion[0] !== 5) {
        console.log(
          'Installing @newrelic/native-metrics with npm ' + npmVersionStr.trim() +
          ' on Node ' + nodeVersionStr.trim() + '. This may take a moment.'
        )
        cp.exec('npm install @newrelic/native-metrics', function installCB(err) {
          if (err) {
            console.log('Failed to install @newrelic/native-metrics')
            console.log(err)
          }
        })
      } else {
        console.log(
          'Skipping install of @newrelic/native-metrics due to unsupported ' +
          'version of Node. See the New Relic documentation for details on ' +
          'compatibility and requirements for this feature.'
        )
      }
    })
  } else {
    console.log(
      'Skipping install of @newrelic/native-metrics due to unsupported version ' +
      'of NPM. See the New Relic documentation for details on compatibility and ' +
      'requirements for this feature.'
    )
  }
})
