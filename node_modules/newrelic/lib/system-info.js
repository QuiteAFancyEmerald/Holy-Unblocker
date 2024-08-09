'use strict'

var exec = require('child_process').exec
var fetchAWSInfo = require('./aws-info')
var fs = require('fs')
var logger = require('./logger.js').child({component: 'system-info'})
var os = require('os')
var parseCpuInfo = require('./parse-proc-cpuinfo')
var parseDockerInfo = require('./parse-dockerinfo')
var parseMemInfo = require('./parse-proc-meminfo')
var platform = os.platform()

module.exports = fetchSystemInfo

function isInteger(i) {
  return i === parseInt(i, 10)
}

function fetchSystemInfo(agent, callback) {
  var config = agent.config
  var systemInfo = {
    processorArch: os.arch()
  }

  var utilizationConfig = {}
  if (config.utilization) {
    var configProcessors = config.utilization.logical_processors
    var configRam = config.utilization.total_ram_mib
    var configHostname = config.utilization.billing_hostname

    if (configProcessors) {
      var parsedConfigProcessors = parseFloat(configProcessors, 10)
      if (!isNaN(parsedConfigProcessors) && isInteger(parsedConfigProcessors)) {
        utilizationConfig.logical_processors = parsedConfigProcessors
      } else {
        logger.info(
          '%s supplied in config for utilization.logical_processors, expected a number',
          configProcessors
        )
      }
    }

    if (configRam) {
      var parsedConfigRam = parseFloat(configRam, 10)
      if (!isNaN(parsedConfigRam) && isInteger(parsedConfigRam)) {
        utilizationConfig.total_ram_mib = parsedConfigRam
      } else {
        logger.info(
          '%s supplied in config for utilization.total_ram_mib, expected a number',
          configRam
        )
      }
    }

    if (configHostname) {
      if (typeof configHostname === 'string') {
        utilizationConfig.hostname = configHostname
      } else {
        logger.info(
          '%s supplied in config for utilization.Hostname, expected a string',
          configHostname
        )
      }
    }

    if (Object.keys(utilizationConfig).length > 0) {
      systemInfo.config = utilizationConfig
    }
  }

  var tasksDone = 0
  var numTasks = 5
  function finishedResponse() {
    if (++tasksDone === numTasks) return callback(systemInfo)
  }

  module.exports._getProcessorStats(function getProcessCB(processorStats) {
    systemInfo.packages = processorStats.packages
    systemInfo.logicalProcessors = processorStats.logical
    systemInfo.cores = processorStats.cores
    finishedResponse()
  })
  module.exports._getMemoryStats(function getMemCB(memory) {
    systemInfo.memory = memory
    finishedResponse()
  })
  getKernelVersion(function getVersionCB(kernelVersion) {
    systemInfo.kernelVersion = kernelVersion
    finishedResponse()
  })
  module.exports._getDockerContainerId(agent, function getContainerId(containerId) {
    if (containerId) {
      systemInfo.docker = {
        id: containerId
      }
    }
    finishedResponse()
  })
  fetchAWSInfo(agent, function getAWSInfo(aws) {
    systemInfo.aws = aws
    finishedResponse()
  })
}

// placed on module for mocking purposes in tests
module.exports._getProcessorStats = function getProcessorStats(callback) {
  var processorStats = {
    logical: null,
    cores: null,
    packages: null
  }

  if (platform.match(/darwin/i)) {
    getSysctlValue(['hw.packages'], function getPackages(packages) {
      getSysctlValue(['hw.physicalcpu_max', 'hw.physicalcpu'],
      function getCores(cores) {
        getSysctlValue(['hw.logicalcpu_max', 'hw.logicalcpu', 'hw.ncpu'],
        function getLogicalCpu(logical) {
          processorStats.logical = parseFloat(logical, 10)
          processorStats.cores = parseFloat(cores, 10)
          processorStats.packages = parseFloat(packages, 10)

          for (var key in processorStats) {
            if (!processorStats[key] || !isInteger(processorStats[key])) {
              processorStats[key] = null
            }
          }

          callback(processorStats)
        })
      })
    })
  } else if (platform.match(/bsd/i)) {
    getSysctlValue(['hw.ncpu'], function getLogicalCpu(logical) {
      processorStats.logical = logical
      callback(processorStats)
    })
  } else if (platform.match(/linux/i)) {
    readProc('/proc/cpuinfo', function parseProc(data) {
      callback(parseCpuInfo(data))
    })
  } else {
    logger.debug('Unknown platform: ' + platform + ', could not retrieve processor info')
    callback(processorStats)
  }
}

// placed on module for mocking purposes in tests
module.exports._getMemoryStats = function getMemoryStats(callback) {
  if (platform.match(/darwin/i)) {
    getSysctlValue(['hw.memsize'], function getMem(memory) {
      callback(parseInt(memory, 10) / (1024 * 1024))
    })
  } else if (platform.match(/bsd/i)) {
    getSysctlValue(['hw.realmem'], function getMem(memory) {
      callback(parseInt(memory, 10) / (1024 * 1024))
    })
  } else if (platform.match(/linux/i)) {
    readProc('/proc/meminfo', function parseProc(data) {
      callback(parseMemInfo(data))
    })
  } else {
    logger.debug('Unknown platform: ' + platform + ', could not retrieve memory info')
    callback(null)
  }
}

function getKernelVersion(callback) {
  if (platform.match(/darwin/i)) {
    getSysctlValue(['kern.version'], function getMem(version) {
      callback(version)
    })
  } else if (platform.match(/bsd/i)) {
    getSysctlValue(['kern.version'], function getMem(version) {
      callback(version)
    })
  } else if (platform.match(/linux/i)) {
    readProc('/proc/version', function parseProc(data) {
      callback(data)
    })
  } else {
    logger.debug('Unknown platform' + platform + ', could not read kernel version')
    callback(null)
  }
}

module.exports._getDockerContainerId = function getDockerContainerId(agent, callback) {
  if (!platform.match(/linux/i)) {
    logger.debug('Platform is not a flavor of linux, omitting docker info')
    callback(null)
  } else {
    readProc('/proc/self/cgroup', function getCGroup(data) {
      if (!data) callback(null)
      else callback(parseDockerInfo(agent, data))
    })
  }
}

function getSysctlValue(names, callback) {
  if (!names) return callback(null)
  var returned = false
  var ran = 0
  names.forEach(function sysctlName(name) {
    exec('sysctl -n ' + name, respond)

    function respond(err, stdout, stderr) {
      if (returned) return
      if (err) {
        logger.debug('Error when trying to run: sysctl -n ' + name + ': %s', err.message)
        callback(null)
        returned = true
      } else if (!stderr) {
        callback(stdout)
        returned = true
      }
      if (++ran === names.length && !returned) {
        logger.debug('No sysctl info found for names: ' + names.toString())
        callback(null)
      }
    }
  })
}

function readProc(path, callback) {
  fs.readFile(path, function readProcFile(err, data) {
    if (err) {
      logger.error('Error when trying to read ' + path, err)
      callback(null)
    } else {
      callback(data.toString())
    }
  })
}
