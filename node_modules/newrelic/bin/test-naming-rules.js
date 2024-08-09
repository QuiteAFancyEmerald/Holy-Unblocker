#! /usr/bin/env node
'use strict'
/* eslint-disable no-console */

var fs = require('fs')
var path = require('path')
var readline = require('readline')
var url = require('url')
var MetricNormalizer = require('../lib/metrics/normalizer')

var cwd = process.cwd()
var opts = null
if (arrayContainsAny(process.argv, '-h', '-?', '--help')) {
  printHelp()
} else if (process.argv.length === 3) {
  opts = {rules: null, urls: path.resolve(cwd, process.argv[2])}
} else if (process.argv.length === 4) {
  opts = {
    rules: path.resolve(cwd, process.argv[2]),
    urls: path.resolve(cwd, process.argv[3])
  }
} else {
  printHelp()
}

run(opts)

function printHelp() {
  console.log('Usage:')
  console.log('    newrelic-naming-rules (-h|--help|-?)')
  console.log('    newrelic-naming-rules [<rules>] <urls>')
  console.log('')
  console.log('Runs the configured naming rules against the given set of URLs')
  console.log('and prints out the resulting normalized URLs.')
  console.log('')
  console.log('Parameters:')
  console.log(' <rules>')
  console.log('    Optional. A JSON file containing additional rules to apply')
  console.log('    to the URLs. Should be in the form of an array of arrays:')
  console.log('        [["pattern", "replacement"], [/pattern2/, "replacement2"]]')
  console.log('')
  console.log(' <urls>')
  console.log('    A file containing URLs to test against the naming rules.')
  console.log('    Should contain one URL per line, and only contain the path')
  console.log('    without host or protocol:')
  console.log('        /foo/bar')
  console.log('        /foo/biz')
  console.log('        /fiz/bang')
  console.log('')
  console.log(' -h|--help|-?')
  console.log('    Optional. Prints this help message and exits.')

  process.exit(0)
}

function run(opts) {
  var config = require('../lib/config').initialize()
  var runtimeRules = opts.rules ? require(opts.rules) : null
  var appliedRules = []

  // responsible for handling default rules provided by the server
  var defaultNormalizer = loadDefaultNormalizer(config, runtimeRules)

  // rules defined by user in local configuration file
  var userNormalizer = loadUserNormalizer(config, runtimeRules)

  defaultNormalizer.on('appliedRule', onAppliedRule)
  userNormalizer.on('appliedRule', onAppliedRule)

  var urlsFile = fs.createReadStream(opts.urls, {encoding: 'utf-8'})
  var reader = readline.createInterface({input: urlsFile, output: null})
  reader.on('line', function onUrlLine(urlLine) {
    appliedRules = []
    var parsedUrl = url.parse(urlLine)

    var normalized = userNormalizer.normalize(parsedUrl.path)

    if (!normalized.matched) {
      normalized = defaultNormalizer.normalize(parsedUrl.path)
    }

    console.log(parsedUrl.path, ' => ', normalized.value)
    if (appliedRules.length === 0) {
      console.log('no rules matched')
    } else {
      for (var i = 0; i < appliedRules.length; i++) {
        var match = appliedRules[i]
        console.log(' %s: %s => %s (rule %s)', (i+1), match.original, match.normalized, match.rule.pattern)
      }
    }

    console.log('')
  })

  urlsFile.on('end', function onUrlEnd() {
    urlsFile.close()
    reader.close()
  })

  function onAppliedRule(rule, newValue, oldValue) {
    appliedRules.push({
      rule: rule,
      original: oldValue,
      normalized: newValue
    })
  }
}

function loadDefaultNormalizer(config) {
  // Load the normalizer.
  var normalizer = new MetricNormalizer(config, 'URL')

  // Add in the rules the collector would ship down.
  normalizer.load([{
    'match_expression':
      '.*\\.(ace|arj|ini|txt|udl|plist|css|gif|ico|jpe?g|js|png|swf|woff|caf|' +
      'aiff|m4v|mpe?g|mp3|mp4|mov)$',
    'replacement': '/*.\\1',
    'replace_all': false,
    'each_segment': false,
    'ignore': false,
    'terminate_chain': true,
    'eval_order': 1000
  }, {
    'match_expression': '^[0-9][0-9a-f_,.-]*$',
    'replacement': '*',
    'replace_all': false,
    'each_segment': true,
    'ignore': false,
    'terminate_chain': false,
    'eval_order': 1001
  }, {
    'match_expression': '^(.*)/[0-9][0-9a-f_,-]*\\.([0-9a-z][0-9a-z]*)$',
    'replacement': '\\1/.*\\2',
    'replace_all': false,
    'each_segment': false,
    'ignore': false,
    'terminate_chain': false,
    'eval_order': 1002
  }])

  return normalizer
}

function loadUserNormalizer(config, rules) {
  // Load the normalizer.
  var normalizer = new MetricNormalizer(config, 'user')
  normalizer.loadFromConfig()

  if (rules && rules.length) {
    rules.forEach(function forEachRule(rule) {
      // Add the rule like `API#addNamingRule` would.
      normalizer.addSimple(rule[0], '/' + rule[1])
    })
  }

  return normalizer
}

function arrayContainsAny(array) {
  for (var i = 1; i < arguments.length; ++i) {
    if (array.indexOf(arguments[i]) !== -1) {
      return true
    }
  }

  return false
}
