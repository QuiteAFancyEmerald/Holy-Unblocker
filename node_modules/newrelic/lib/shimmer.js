'use strict'

var path = require('path')
var fs = require('fs')
var logger = require('./logger').child({component: 'shimmer'})
var INSTRUMENTATION = require('./instrumentations')()

/*
 *
 * CONSTANTS
 *
 */

var CORE_INSTRUMENTATION = {
  child_process: 'child_process.js',
  crypto: 'crypto.js',
  domain: 'domain.js',
  inspector: 'inspector.js',
  dns: 'dns.js',
  fs: 'fs.js',
  http: 'http.js',
  https: 'http.js',
  net: 'net.js',
  timers: 'timers.js',
  zlib: 'zlib.js'
}

/**
 * Unwrapping is only likely to be used by test code, and is a fairly drastic
 * maneuver, but it should be pretty safe if there's a desire to reboot the
 * agent in flight.
 *
 * All of the wrapped methods are tracked in this variable and used by unwrapAll
 * below.
 */
var instrumented = []

/**
 * All instrumentation files must export the same interface: a single
 * initialization function that takes the agent and the module to be
 * instrumented.
 */
function instrument(agent, shortName, fileName, nodule, moduleName) {
  var fullPath = path.resolve(fileName)
  if (!fs.existsSync(fileName)) {
    return logger.warn(
      'Tried to load instrumentation from %s, but file does not exist',
      fullPath
    )
  }
  try {
    require(fileName)(agent, nodule, moduleName)
  } catch (error) {
    logger.warn(
      error,
      'Failed to instrument module %s using %s',
      path.basename(shortName, '.js'),
      fullPath
    )
  }
}

function _postLoad(agent, nodule, name) {
  var instrumentation
  var base = path.basename(name)

  // to allow for instrumenting both 'pg' and 'pg.js'.
  if (name === 'pg.js') {
    instrumentation = 'pg'
  } if (name === 'mysql2') {
    // mysql2 (https://github.com/sidorares/node-mysql2) is a drop in replacement for
    // mysql which conforms to the existing mysql API. If we see mysql2, treat it as
    // mysql
    instrumentation = 'mysql'
  } else {
    instrumentation = base
  }

  // necessary to prevent instrument() from causing an infinite loop
  if (INSTRUMENTATION.indexOf(instrumentation) !== -1) {
    logger.trace('Instrumenting %s.', base)
    var filename = path.join(__dirname, 'instrumentation', instrumentation + '.js')
    instrument(agent, base, filename, nodule)
  }

  return nodule
}

var shimmer = module.exports = {
  /**
   * If debug isn't false, the agent will retain references to wrapped methods
   * for the entire lifetime of the agent. Some instrumentation depends on
   * wrapping functions on individual objects, and this will cause the agent
   * to retain references to a large number of dead objects.
   */
  debug: false,

  /**
   * Detects if the given function has already been wrapped.
   *
   * @param {function} fn - The function to look for a wrapper on.
   *
   * @return {bool} True if `fn` exists and has an attached original, else false.
   */
  isWrapped: function isWrapped(fn) {
    return !!(fn && fn.__NR_original)
  },

  /**
   * Don't throw, but do log and bail out if wrapping fails.
   *
   * Provide an escape hatch by creating a closure around the original method
   * and object / module wrapped into a helper function that will restore the
   * original function / method. See Sinon for a systematic use of this
   * pattern.
   *
   * @param {object} nodule Class or module containing the function to wrap.
   * @param {object} noduleName Human-readable module / Class name. More
   *                            helpful than you'd think.
   * @param {string} methods One or more names of methods or functions to extract
   *                         and wrap.
   * @param {function} wrapper A generator that, when called, returns a
   *                           wrapped version of the original function.
   */
  wrapMethod: function wrapMethod(nodule, noduleName, methods, wrapper) {
    if (!methods) {
      return logger.warn(new Error(),
                         "Must include a method name to wrap. Called from:")
    }

    if (!noduleName) noduleName = '[unknown]'
    if (!Array.isArray(methods)) methods = [methods]

    methods.forEach(function cb_forEach(method) {
      var fqmn = noduleName + '.' + method

      if (!nodule) return logger.debug("Can't wrap %s from nonexistent object.",
                                       fqmn)
      if (!wrapper) return logger.debug("Can't wrap %s without a wrapper generator.",
                                        fqmn)

      var original = nodule[method]

      if (!original) return logger.trace("%s not defined, so not wrapping.", fqmn)
      if (original.__NR_unwrap) return logger.debug("%s already wrapped by agent.", fqmn)

      var wrapped = wrapper(original, method)
      wrapped.__NR_original = original
      wrapped.__NR_unwrap = function __NR_unwrap() {
        nodule[method] = original
        logger.trace("Removed instrumentation from %s.", fqmn)
      }

      nodule[method] = wrapped
      if (shimmer.debug) instrumented.push(wrapped)
      logger.trace("Instrumented %s.", fqmn)
    })
  },

  /**
   * Sometimes you gotta do some crazy stuff to get the job done. Instead of using
   * regular monkeypatching, wrapDeprecated allows you to pass in a getter and setter
   * and then uses defineProperty to replace the original property with an
   * accessor. Note that responsibility for unwrapping is not handled by this
   * function.
   *
   * @param {object}   nodule     Class or module containing the property to
   *                              wrap.
   * @param {object}   noduleName Human-readable module / Class name. More
   *                              helpful than you'd think.
   * @param {string}   property   The property to replace with the accessor.
   * @param {function} options    Optional getter and setter to use for the accessor.
   *
   * @returns {object} The original value of the property.
   */
  wrapDeprecated: function wrapDeprecated(nodule, noduleName, property, options) {
    if (!property) {
      logger.warn(new Error(), "Must include a function name to wrap. Called from:")
      return
    }

    if (!noduleName) noduleName = '[unknown]'

    var fqmn = noduleName + '.' + property
    if (!nodule) {
      logger.debug("Can't wrap %s from nonexistent object.", fqmn)
      return
    }

    var original = nodule[property]
    if (!original) {
      logger.trace("%s not defined, so not wrapping.", fqmn)
      return
    }

    delete nodule[property]

    var descriptor = {
      configurable: true,
      enumerable: true
    }
    if (options.get) descriptor.get = options.get
    if (options.set) descriptor.set = options.set
    Object.defineProperty(nodule, property, descriptor)
    logger.trace("Instrumented %s.", fqmn)

    if (shimmer.debug) {
      instrumented.push({
        __NR_unwrap: function unwrapDeprecated() {
          delete nodule[property]
          nodule[property] = original
        }
      })
    }

    return original
  },

  unwrapMethod: function unwrapMethod(nodule, noduleName, method) {
    if (!noduleName) noduleName = '[unknown]'
    if (!method) return logger.debug("Must include a method name to unwrap. " +
                                     "Called from: %s", new Error().stack)

    var fqmn = noduleName + '.' + method

    if (!nodule) return logger.debug("Can't unwrap %s from nonexistent object.",
                                     fqmn)
    var wrapped = nodule[method]

    // keep instrumented up to date
    var pos = instrumented.indexOf(wrapped)
    if (pos !== -1) instrumented.splice(pos, 1)

    if (!wrapped) return logger.debug("%s not defined, so not unwrapping.", fqmn)
    if (!wrapped.__NR_unwrap) return logger.debug("%s isn't unwrappable.", fqmn)

    wrapped.__NR_unwrap()
  },

  unwrapAll: function unwrapAll() {
    instrumented.forEach(function cb_forEach(wrapper) {
      wrapper.__NR_unwrap()
    })
    instrumented = []
  },

  /**
   * Patch the module.load function so that we see modules loading and
   * have an opportunity to patch them with instrumentation.
   */
  patchModule: function patchModule(agent) {
    logger.trace("Wrapping module loader.")
    var Module = require('module')

    shimmer.wrapMethod(Module, 'Module', '_load', function cb_wrapMethod(load) {
      return function cls_wrapMethod(file) {
        return _postLoad(agent, load.apply(this, arguments), file)
      }
    })
  },

  unpatchModule: function unpatchModule() {
    logger.trace("Unwrapping to previous module loader.")
    var Module = require('module')

    shimmer.unwrapMethod(Module, 'Module', '_load')
  },

  bootstrapInstrumentation: function bootstrapInstrumentation(agent) {
    var globalsFilepath = path.join(__dirname, 'instrumentation', 'core', 'globals.js')
    instrument(agent, 'globals', globalsFilepath, global)

    Object.keys(CORE_INSTRUMENTATION).forEach(function cb_forEach(mojule) {
      var filename = CORE_INSTRUMENTATION[mojule]
      var filepath = path.join(__dirname, 'instrumentation/core', filename)
      var uninstrumented

      try {
        uninstrumented = require(mojule)
      } catch (err) {
        logger.trace(
          'Could not load core module %s got error %s',
          mojule,
          err
        )
      }

      instrument(agent, filename, filepath, uninstrumented, mojule)
    })
  },

  /**
   * NOT FOR USE IN PRODUCTION CODE
   *
   * If an instrumented module has a dependency on another instrumented module,
   * and multiple tests are being run in a single test suite with their own
   * setup and teardown between tests, it's possible transitive dependencies
   * will be unwrapped in the module cache in-place (which needs to happen to
   * prevent stale closures from channeling instrumentation data to incorrect
   * agents, but which means the transitive dependencies won't get re-wrapped
   * the next time the parent module is required).
   *
   * Since this only applies in test code, it's not worth the drastic
   * monkeypatching to Module necessary to walk the list of child modules and
   * re-wrap them.
   *
   * Use this to re-apply any applicable instrumentation.
   */
  reinstrument: function reinstrument(agent, modulePath) {
    return _postLoad(agent, require(modulePath), modulePath)
  }
}
