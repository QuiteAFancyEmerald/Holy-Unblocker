'use strict'

var logger = require('./logger.js').child({component: 'proc-cpuinfo'})
module.exports = parseProcCPUInfo

function parseProcCPUInfo(data) {
  var relevantAttributes = [
    'processor',
    'physical id',
    'cpu cores',
    'core id'
  ]

  var processorStats = {
    logical: null,
    cores: null,
    packages: null
  }

  // seperate the processors
  var splitData = data.split('\n')
    .map(function formatAttribute(attr) {
      return attr.split(':')
        .map(function eliminateExtraWhitespace(s) {
          return s.replace(/\\r|\\t| {2,}/g, '').trim()
        })
    })

  var validData = splitData.filter(function checkForValidAttrs(a) {
    return a.length === 2 && relevantAttributes.indexOf(a[0]) !== -1
  })
  if (validData.length === 0) {
    logger.debug('No applicable cpu attributes found')
    return processorStats
  }

  splitData = collapseMultilineValues(splitData)

  var processors = seperateProcessors(splitData)

  processorStats = countProcessorStats(processors)
  if (!processorStats.cores) {
    if (processorStats.logical === 1) {
      // some older, single-core processors might not list ids,
      // so we'll mark them 1
      processorStats.cores = 1
      processorStats.packages = 1
    } else {
      // there is no way of knowing how many packages
      // or cores there are
      processorStats.cores = null
      processorStats.packages = null
    }
  }
  return processorStats
}

// some values are split up over multiple lines, these won't be broken
// by split(':'), and should be folded into the last seen valid value
function collapseMultilineValues(li) {
  var tmp = []
  var last
  for (var i = 0; i < li.length; ++i) {
    if (li[i].length === 2) {
      // store the last valid entry to append invalid entries to
      last = li[i]
      tmp.push(last)
    } else {
      last[1] += li[i][0]
    }
  }

  return tmp
}

// walk through the processed list of key, value pairs and populate
// objects till you find a collision
function seperateProcessors(processorData) {
  var processors = []
  var processor = {}
  for (var i = 0; i < processorData.length; ++i) {
    var key = processorData[i][0]
    var value = processorData[i][1]
    if (processor[key] !== undefined) {
      processors.push(processor)
      processor = {}
    }
    processor[key] = value
  }
  processors.push(processor)
  return processors
}

function countProcessorStats(processors) {
  var phys = []
  var cores = []

  for (var i = 0; i < processors.length; i++) {
    var processor = processors[i]
    if (processor['physical id'] &&
        processor['cpu cores'] &&
        phys.indexOf(processor['physical id']) === -1) {
      phys.push(processor['physical id'])
      cores.push(processor['cpu cores'])
    }
  }

  return {
    logical: processors.length,
    cores: cores
      .map(function convertToInt(s) {
        return parseInt(s, 10)
      })
      .reduce(function sum(a, b) {
        return a + b
      }, 0),
    packages: phys.length
  }
}
