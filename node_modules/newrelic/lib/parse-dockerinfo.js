'use strict'

var logger = require('./logger.js').child({component: 'dockerinfo'})
var NAMES = require('./metrics/names.js')
module.exports = parseDockerInfo

function parseDockerInfo(agent, data) {
  if (!agent.config.utilization || !agent.config.utilization.detect_docker) return null
  var cpuCgroup = parseCgroupIds(data).cpu
  // if we can't parse the cgroups, or if the cpu is not in a cgroup
  var dockerError = agent.metrics.getOrCreateMetric(NAMES.UTILIZATION.DOCKER_ERROR)
  if (!cpuCgroup) {
    logger.debug('Could not parse cgroup data from: ' + data)
    dockerError.incrementCallCount()
    return null
  }

  // if cpu isn't in a cgroup
  if (cpuCgroup === '/') return null

  var patterns = [
    /^\/docker\/([0-9a-f]+)$/, // docker native driver w/out systemd
    /^\/system\.slice\/docker-([0-9a-f]+)\.scope$/, // with systemd
    /^\/lxc\/([0-9a-f]+)$/ // docker lxc driver
  ]
  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i]
    var matches = cpuCgroup.match(pattern)
    if (matches) {
      var id = matches[1]
      if (id.length !== 64) {
        dockerError.incrementCallCount()
        logger.debug('Encountered a malformed docker id: ', id)
        return null
      }
      return id
    }
  }

  logger.debug('Unable to recognise cgroup format')

  return null
}

function parseCgroupIds(cgroupInfo) {
  var cgroupIds = {}
  cgroupInfo.split('\n').forEach(function parseCgroupInfo(line) {
    var parts = line.split(':')
    if (parts.length !== 3) return
    var subsystems = parts[1]
    var cgroupId = parts[2]
    subsystems.split(',').forEach(function assignGroupIds(subsystem) {
      cgroupIds[subsystem] = cgroupId
    })
  })
  return cgroupIds
}
