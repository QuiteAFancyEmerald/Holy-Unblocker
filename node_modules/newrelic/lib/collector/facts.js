'use strict'

var fetchSystemInfo = require('../system-info')
var parse_labels = require('../util/label-parser')

module.exports = facts

function facts(agent, callback) {
  fetchSystemInfo(agent, function cb_fetchSystemInfo(systemInfo) {
    var hostname = agent.config.getHostnameSafe()
    var results = {
      utilization: {
        metadata_version: 2,
        logical_processors: systemInfo.logicalProcessors,
        total_ram_mib: systemInfo.memory,
        hostname: hostname
      },
      pid: process.pid,
      host: hostname,
      display_host: agent.config.getDisplayHost() || hostname,
      language: 'nodejs',
      app_name: agent.config.applications(),
      agent_version: agent.version,
      environment: agent.environment,
      settings: agent.config.publicSettings(),
      high_security: agent.config.high_security,
      labels: parse_labels(agent.config.labels)
    }

    // TODO:  After reconfiguring agent startup to wait for the server to start
    //        or for the first transaction, add the `port` for the server too.
    // NOTE: The concat is necessary to prevent sort from happening in-place.
    results.identifier = [
      'nodejs',
      results.host,
      results.app_name.concat([]).sort().join(',')
    ].join(':')

    if (systemInfo.aws || systemInfo.docker) {
      results.utilization.vendors = {}
      if (systemInfo.aws) {
        results.utilization.vendors.aws = systemInfo.aws
      }
      if (systemInfo.docker) {
        results.utilization.vendors.docker = systemInfo.docker
      }
    }
    if (systemInfo.config) {
      results.utilization.config = systemInfo.config
    }
    return callback(results)
  })
}
