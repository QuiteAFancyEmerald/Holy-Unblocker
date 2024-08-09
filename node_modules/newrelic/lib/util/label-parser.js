'use strict'

module.exports = parse
module.exports.fromString = fromString
module.exports.fromMap = fromMap


// this creates a copy of trim that can be used with map
var trim = Function.prototype.call.bind(String.prototype.trim)
var logger = require('../logger').child({component: 'label-parser'})
var stringifySync = require('./safe-json').stringifySync

function parse(labels) {
  var results

  if (!labels) {
    return []
  } else if (typeof labels === 'string') {
    results = fromString(labels)
  } else if (labels) {
    results = fromMap(labels)
  }

  results.warnings.forEach(function logWarnings(messaage) {
    logger.warn(messaage)
  })

  return results.labels
}

function fromString(raw) {
  var map = {}

  if (!raw) {
    return {labels: [], warnings: []}
  }

  var pairs = raw.split(';').map(trim)
  var parts


  while (!pairs[pairs.length - 1]) {
    pairs.pop()
  }

  while (!pairs[0]) {
    pairs.shift()
  }

  for (var i = 0, l = pairs.length; i < l; ++i) {
    parts = pairs[i].split(':').map(trim)

    if (parts.length !== 2) {
      return warn('Could not create a Label pair from ' + parts[i])
    } else if (!parts[0]) {
      return warn('Label key can not be empty')
    } else if (!parts[1]) {
      return warn('Label value can not be empty')
    }

    map[parts[0]] = parts[1]
  }

  return fromMap(map)

  function warn(message) {
    return {labels: [], warnings: [
      'Invalid Label String: ' + raw,
       message
    ]}
  }
}

function fromMap(map) {
  var warnings = []
  var labels = []

  Object.keys(map).forEach(function processKeys(key) {
    var type = truncate(key, 255)

    if (!map[key] || typeof map[key] !== 'string') {
      return warnings.push(
        'Label value for ' + type +
        'should be a string with a length between 1 and 255 characters'
      )
    }

    var value = truncate(map[key], 255)

    if (type !== key) {
      warnings.push('Label key too long: ' + type)
    }

    if (value !== map[key]) {
      warnings.push('Label value too long: ' + value)
    }

    labels.push({label_type: type, label_value: value})
  })

  if (labels.length > 64) {
    warnings.push('Too many Labels, list truncated to 64')
    labels = labels.slice(0, 64)
  }

  if (warnings.length) {
    warnings.unshift('Partially Invalid Label Setting: ' + stringifySync(map))
  }

  return {labels: labels, warnings: warnings}
}

function truncate(str, max) {
  var len = 0
  var chr
  for (var i = 0, l = str.length; i < l; ++i) {
    chr = str.charCodeAt(i)
    if (chr >= 0xD800 && chr <= 0xDBFF && i !== l) {
      i += 1
    }

    if (++len === max) {
      break
    }
  }

  return str.slice(0, i + 1)
}
