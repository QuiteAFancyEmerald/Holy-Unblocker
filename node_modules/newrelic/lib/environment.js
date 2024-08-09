'use strict'

var path = require('path')
var fs = require('fs')
var os = require('os')
var logger = require('../lib/logger').child({component: 'environment'})
var stringifySync = require('./util/safe-json').stringifySync


var exists = fs.existsSync || path.existsSync

// As of 1.7.0 you can no longer dynamically link v8
// https://github.com/nodejs/io.js/commit/d726a177ed
var remapping = {
  node_install_npm: "npm installed?",
  node_install_waf: "WAF build system installed?",
  node_use_openssl: "OpenSSL support?",
  node_shared_openssl: "Dynamically linked to OpenSSL?",
  node_shared_v8: "Dynamically linked to V8?",
  node_shared_zlib: "Dynamically linked to Zlib?",
  node_use_dtrace: "DTrace support?",
  node_use_etw: "Event Tracing for Windows (ETW) support?"
}

var settings = {}

/**
 * Fetches the setting of the given name, defaulting to an empty array.
 *
 * @param {string} name - The name of the setting to look for.
 *
 * @return {Array.<string>} An array of values matching that name.
 */
function getSetting(name) {
  return settings[name] || []
}

/**
 * Add a setting to the module's shared settings object.
 *
 * @param {string} name   - The name of the setting value being added.
 * @param {string} value  - The value to add or the setting.
 */
function addSetting(name, value) {
  if (!settings[name]) {
    settings[name] = [value]
  } else if (settings[name].indexOf(value) === -1) {
    settings[name].push(value)
  }
}

/**
 * Remove settings with the given name.
 *
 * @param {string} name - The name of the setting to remove.
 */
function clearSetting(name) {
  delete settings[name]
}

/**
 * Build up a list of top-level packages available to an application relative to
 * the provided root.
 *
 * @param {string}  root        - Path to start listing packages from.
 * @param {Array}   [packages]  - Array to append found packages to.
 *
 * @return {Array} List of packages.
 */
function listPackages(root, packages) {
  if (!packages) {
    packages = []
  }

  try {
    fs.readdirSync(root).forEach(function forEachReadDirSync(dir) {
      // Skip npm's binary directory where it stores executables.
      if (dir === '.bin') {
        return
      }

      var version = null
      try {
        var pck = path.resolve(root, dir, 'package.json')
        version = JSON.parse(fs.readFileSync(pck)).version
      } catch (e) {
        logger.debug('Could not load %s for environment scan', pck || dir)
      }

      packages.push([dir, version || '<unknown>'])
    })
  } catch (e) {
    logger.trace(e, 'Failed to list packages in %s', root)
  }

  return packages
}

/**
 * Build up a list of dependencies from a given node_module root.
 *
 * @param {string}  root        - Path to start listing dependencies from.
 * @param {Array}   [children]  - Array to append found dependencies to.
 *
 * @return {Array} List of dependencies.
 */
function listDependencies(root, children) {
  if (!children) {
    children = []
  }

  try {
    fs.readdirSync(root).forEach(function forEachReadDirSync(entry) {
      var candidate = path.resolve(root, entry, 'node_modules')

      // Performing this exists check is cheaper than unwinding the stack for
      // all the failed read attempts.
      if (exists(candidate)) {
        listPackages(candidate, children)
        listDependencies(candidate, children)
      }
    })
  } catch (e) {
    logger.trace(e, 'Failed to list dependencies in %s', root)
  }

  return children
}

/**
 * Build up a list of packages, starting from the current directory.
 *
 * @param {string} start - Root directory to start generation from.
 *
 * @return {Object} Two lists, of packages and dependencies, with the
 *  appropriate names.
 */
function getLocalPackages(start) {
  var packages = []
  var dependencies = []
  var candidate = start

  while (candidate) {
    var root = path.resolve(candidate, 'node_modules')
    listPackages(root, packages)
    listDependencies(root, dependencies)

    var last = candidate
    candidate = path.dirname(candidate)
    if (last === candidate) break
  }

  return {packages: packages, dependencies: dependencies}
}

/**
 * Generic method for getting packages and dependencies relative to a
 * provided root directory.
 *
 * @param {string} root - Where to start looking -- doesn't add node_modules.
 *
 * @return {Object} Two lists, of packages and dependencies, with the
 *  appropriate names.
 */
function getPackages(root) {
  var packages = []
  var dependencies = []

  listPackages(root, packages)
  listDependencies(root, dependencies)

  return {packages: packages, dependencies: dependencies}
}

/**
 * Generate a list of globally-installed packages, if available / accessible
 * via the environment.
 *
 * @return {Object} Two lists, of packages and dependencies, with the
 *  appropriate names.
 */
function getGlobalPackages() {
  if (process.config && process.config.variables) {
    var prefix = process.config.variables.node_prefix
    if (prefix) {
      var root = path.resolve(prefix, 'lib', 'node_modules')
      return getPackages(root)
    }
  }

  return {packages: [], dependencies: []}
}

/**
 * Take a list of packages and reduce it to a list of pairs serialized
 * to JSON (to simplify things on the collector end) where each
 * package appears at most once, with all the versions joined into a
 * comma-delimited list.
 *
 * @return {Array.<String>[]} Sorted list of [name, version] pairs.
 */
function flattenVersions(packages) {
  var info = Object.create(null)
  packages.forEach(function cb_forEach(pair) {
    var p = pair[0]
    var v = pair[1]


    if (info[p]) {
      if (info[p].indexOf(v) < 0) info[p].push(v)
    } else {
      info[p] = [v]
    }
  })

  return Object.keys(info)
    .map(function cb_map(key) {
      return [key, info[key].join(', ')]
    })
    .sort()
    .map(function cb_map(pair) {
      return stringifySync(pair)
    })
}

/**
 * There are a bunch of settings generated at build time that are useful to
 * know for troubleshooting purposes. These settings are only available in 0.7
 * and up.
 *
 * This function works entirely via side effects using the
 * addSetting function.
 */
function remapConfigSettings() {
  if (process.config && process.config.variables) {
    var variables = process.config.variables
    Object.keys(variables).forEach(function cb_forEach(key) {
      if (remapping[key]) {
        var value = variables[key]

        if (value === true || value === 1) value = 'yes'
        if (value === false || value === 0) value = 'no'

        addSetting(remapping[key], value)
      }
    })
  }
}

/**
 * Scrape the list of packages, following the algorithm as described in the
 * node module page:
 *
 * http://nodejs.org/docs/latest/api/modules.html
 *
 * This function works entirely via side effects using the addSetting
 * function.
 */
function findPackages() {
  var local = getLocalPackages(process.cwd())
  var all = getGlobalPackages()
  var other = {packages: [], dependencies: []}


  if (process.env.NODE_PATH) {
    var paths
    if (process.platform === 'win32') { // why. WHY.
      paths = process.env.NODE_PATH.split(';')
    } else {
      paths = process.env.NODE_PATH.split(':')
    }

    paths.forEach(function cb_forEach(nodePath) {
      if (nodePath[0] !== '/') nodePath = path.resolve(process.cwd(), nodePath)
      var nextSet = getPackages(nodePath)
      other.packages.push.apply(other.packages, nextSet.packages)
      other.dependencies.push.apply(other.dependencies, nextSet.dependencies)
    })
  }

  var packages = local.packages
  packages.push.apply(packages, all.packages)
  packages.push.apply(packages, other.packages)

  var dependencies = local.dependencies
  dependencies.push.apply(dependencies, all.dependencies)
  dependencies.push.apply(dependencies, other.dependencies)

  var home
  var homeOld

  if (process.platform === 'win32') {
    if (process.env.USERDIR) {
      home = getPackages(path.resolve(process.env.USERDIR, '.node_modules'))
      homeOld = getPackages(path.resolve(process.env.USERDIR, '.node_libraries'))
    }
  } else if (process.env.HOME) {
    home = getPackages(path.resolve(process.env.HOME, '.node_modules'))
    homeOld = getPackages(path.resolve(process.env.HOME, '.node_libraries'))
  }

  if (home) {
    packages.unshift.apply(packages, home.packages)
    dependencies.unshift.apply(dependencies, home.dependencies)
  }

  if (homeOld) {
    packages.unshift.apply(packages, homeOld.packages)
    dependencies.unshift.apply(dependencies, homeOld.dependencies)
  }

  addSetting('Packages', flattenVersions(packages))
  addSetting('Dependencies', flattenVersions(dependencies))
}

function badOS() {
  var badVersion = false

  if (!process.versions) {
    badVersion = true
  } else {
    var version = process.versions.node.split('.')
    if (version[1] <= 8 && version[2] <= 5) badVersion = true
  }

  return badVersion &&
         os.arch() === 'x64' &&
         os.type() === 'SunOS'
}

/**
 * Settings actually get scraped below.
 */
function gatherEnv() {
  // in 64-bit SmartOS zones, node <= 0.8.5 pukes on os.cpus()
  if (!badOS()) addSetting('Processors', os.cpus().length)

  addSetting('OS', os.type())
  addSetting('OS version', os.release())
  addSetting('Node.js version', process.version)
  addSetting('Architecture', process.arch)

  if ('NODE_ENV' in process.env) {
    addSetting('NODE_ENV', process.env.NODE_ENV)
  }
}

/**
 * Reset settings and gather them, built to minimally refactor this file.
 */
function refresh() {
  // gather persisted settings
  var framework = getSetting('Framework')
  var dispatcher = getSetting('Dispatcher')
  var packages = getSetting('Packages')
  var dependencies = getSetting('Dependencies')

  // clearing and rebuilding a global variable
  settings = {}
  // add persisted settings
  if (framework.length) {
    framework.forEach(function addFrameworks(fw) {
      addSetting('Framework', fw)
    })
  }

  if (dispatcher.length) {
    dispatcher.forEach(function addDispatchers(d) {
      addSetting('Dispatcher', d)
    })
  }

  gatherEnv()
  remapConfigSettings()

  if (packages.length && dependencies.length) {
    settings.Packages = packages
    settings.Dependencies = dependencies
  } else {
    findPackages()
  }
}

// initialize settings
// TODO:  Remove this function call and make all environment loading async. At
//        the moment, removing this causes tests to fail and it is unclear if it
//        is an issue in the tests or in the agent.
refresh()

/**
 * Refreshes settings and returns the settings object.
 */
function toJSON() {
  // TODO:  Do not refresh when JSON-ifying. This takes a _long_ time and blocks
  //        the event loop. Currently, removing this causes a couple of tests to
  //        fail (ironically from timing out).
  refresh()
  var items = []
  Object.keys(settings).forEach(function settingKeysForEach(key) {
    settings[key].forEach(function settingsValuesForEach(setting) {
      items.push([key, setting])
    })
  })

  return items
}

module.exports = {
  setFramework: function setFramework(framework) {
    addSetting('Framework', framework)
  },
  setDispatcher: function setDispatcher(dispatcher) {
    addSetting('Dispatcher', dispatcher)
  },
  clearFramework: function clearFramework() {
    clearSetting('Framework')
  },
  clearDispatcher: function clearDispatcher() {
    clearSetting('Dispatcher')
  },
  listPackages: listPackages,
  toJSON: toJSON,
  get: getSetting,
  refresh: refresh
}
