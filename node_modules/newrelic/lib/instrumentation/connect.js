'use strict'

var shimmer = require('../shimmer')
var logger = require('../logger').child({component: 'connect'})


/*
 *
 * CONSTANTS
 *
 */

var ORIGINAL = '__NR_original'
var RESERVED = [ // http://es5.github.io/#x7.6.1.2
  // always (how would these even get here?)
  'class', 'enum', 'extends', 'super', 'const', 'export', 'import',
  // strict
  'implements', 'let', 'private', 'public', 'yield', 'interface',
  'package', 'protected', 'static'
]

/**
 * ES5 strict mode disallows some identifiers that are allowed in non-strict
 * code. Mangle function names that are on that list of keywords so they're
 * non-objectionable in strict mode (which is currently enabled everywhere
 * inside the agent, as well as at many customer sites).
 *
 * If you really need to crawl your Express apps middleware stack, change
 * your test to use name.indexOf('whatever') === 0 as the predicate instead
 * of name === 'whatever'. It's a little slower, but you shouldn't be doing
 * that anyway.
 *
 * @param {string} name The candidate function name
 *
 * @returns {string} A safe (potentially mangled) function name.
 */
function mangle(name) {
  var parts = name.split(' ')
  name = parts[parts.length - 1]

  if (RESERVED.indexOf(name) !== -1) return name + '_'

  return name
}

module.exports = function initialize(agent, connect) {
  var tracer = agent.tracer

  var interceptor = {
    route: '',
    handle: function sentinel(error, req, res, next) {
      if (error) {
        var transaction = agent.tracer.getTransaction()
        agent.errors.add(transaction, error)
      }

      return next(error)
    }
  }

  /**
   * Problem:
   *
   * 1. Connect determines whether middleware functions are error handlers by
   *    testing their arity. Not cool.
   * 2. Downstream Express users rely upon being able to iterate over their
   *    middleware stack to find specific middleware functions. Sorta less
   *    uncool, but still a pain.
   *
   * Solution:
   *
   * Use eval. This once. For this one specific purpose. Not anywhere else for
   * any reason.
   */
  function wrapHandle(__NR_handle) {
    // jshint -W061
    var arglist
    var name = ''


    // reiterated: testing function arity is stupid
    switch (__NR_handle.length) {
      case 2:
        arglist = '(req, res)'
        break

      case 3:
        arglist = '(req, res, next)'
        break

      // don't break other error handlers
      case 4:
        arglist = '(err, req, res, next)'
        break

      default:
        arglist = '()'
    }

    if (__NR_handle.name) name = mangle(__NR_handle.name)

    // leave this function anonymous
    // it's connect madness
    /* eslint-disable func-names */
    var template = function() {
      var args = tracer.slice(arguments)
      var last = args.length - 1


      if (typeof args[last] === 'function') {
        args[last] = tracer.bindFunction(args[last])
      }

      __NR_handle.apply(this, args)
    }
    /* eslint-enable func-names */

    // I am a bad person and this makes me feel bad.
    // We use eval because we need to insert the function with a specific name to
    // allow for lookup.
    /* eslint-disable no-eval */
    var wrapped = eval(
      '(function(){return function ' + name + arglist +
      template.toString().substring(11) + '}())'
    )
    /* eslint-enable no-eval */
    wrapped[ORIGINAL] = __NR_handle

    return wrapped
  }

  function wrapUse(use) {
    return function cls_wrapUse() {
      if (!this.stack) return use.apply(this, arguments)

      this.stack = this.stack.filter(function cb_filter(m) {
        return m !== interceptor
      })

      /* We allow `use` to go through the arguments so it can reject bad things
       * for us so we don't have to also do argument type checking.
       */
      var app = use.apply(this, arguments)

      // wrap most recently added unwrapped handler
      var top = this.stack.pop()
      if (top) {
          if (top.handle &&
              typeof top.handle === 'function' &&
              !top.handle[ORIGINAL]) {
            top.handle = wrapHandle(top.handle)
          }
          this.stack.push(top)
      }

      /* Give the error tracer a better chance of intercepting errors by
       * putting it before the first error handler (a middleware that takes 4
       * parameters, in Connects world). Error handlers tend to be placed
       * towards the end of the middleware chain and sometimes don't pass
       * errors along. Don't just put the interceptor at the beginning because
       * we want to allow as many middleware functions to execute as possible
       * before the interceptor is run, to increase error coverage.
       *
       * NOTE: This is heuristic, and works because interceptor propagates
       *       errors instead of terminating the middleware chain.
       *       Ignores routes.
       */
      var spliced = false
      for (var i = 0; i < this.stack.length; i++) {
        var middleware = this.stack[i]
        // Check to see if it is an error handler middleware
        if (middleware &&
            middleware.handle &&
            middleware.handle.length === 4) {
          this.stack.splice(i, 0, interceptor)
          spliced = true
          break
        }
      }
      if (!spliced) this.stack.push(interceptor)

      // don't break chaining
      return app
    }
  }

  /**
   * Connect 1 and 2 are very different animals, but like Express, it mostly
   * comes down to factoring.
   */
  var version = connect && connect.version && connect.version[0]
  switch (version) {
    case '1':
      shimmer.wrapMethod(connect && connect.HTTPServer && connect.HTTPServer.prototype,
                         'connect.HTTPServer.prototype',
                         'use',
                         wrapUse)
      break

    case '2':
      shimmer.wrapMethod(connect && connect.proto,
                         'connect.proto',
                         'use',
                         wrapUse)
      break

    default:
      logger.debug("Unrecognized version %s of Connect detected; not instrumenting.",
                   version)
  }
}
