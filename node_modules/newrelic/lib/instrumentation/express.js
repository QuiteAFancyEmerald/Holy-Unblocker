'use strict'

var shimmer = require('../shimmer.js')
var urltils = require('../util/urltils.js')
var logger = require('../logger.js').child({component: 'express'})
var record = require('../metrics/recorders/generic.js')
var middlewareRecorder = require('../metrics/recorders/express.js')
var NAMES = require('../metrics/names.js')

var express2 = require('./express/express-2.js')
var ensurePartialName = require('./express/common.js').ensurePartialName

var VIEW = NAMES.VIEW
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


function generateMiddlewarePath(routerStack, layer) {
  var res = ''
  for (var i = 0; i < routerStack.length; ++i) {
    appendToPath(routerStack[i].path)
  }

  if (layer && layer.handle && layer.handle.__NR_path) {
    appendToPath(layer.handle.__NR_path)
    if (res[res.length - 1] === '/') {
      res = res.substr(0, res.length - 1)
    }
  }

  return res || '/'

  function appendToPath(path) {
    if (!path) return

    var resTrailingSlash = res[res.length - 1] === '/'
    if (path[0] === '/') {
      path = path.substr(1)
    }

    if (resTrailingSlash) {
      res += path
    } else {
      res += '/' + path
    }
  }
}


var transactionInfoById = {}
function onTransactionFinished(transaction) {
  delete transactionInfoById[transaction.id]
}

module.exports = function initialize(agent, express) {
  var tracer = agent.tracer

  var registered =
    agent.listeners('transactionFinished')
    .indexOf(onTransactionFinished) !== -1

  if (!registered) {
    agent.on('transactionFinished', onTransactionFinished)
  }

  function setDispatcher(app) {
    return function wrappedCreateServer() {
      agent.environment.setDispatcher('express')
      agent.environment.setFramework('express')

      return app.apply(this, arguments)
    }
  }

  /**
   * This needs to be kept up to date with Express to ensure that it's using
   * the same logic to decide where the callback is hiding.
   */
  function wrapRender(version, render) {
    /* jshint maxparams:5 */ // follow Express as closely as possible
    return function cls_wrapRender(view, options, cb, parent, sub) {
      logger.trace("Rendering Express %d view %s.", version, view)
      if (!tracer.getTransaction()) {
        logger.trace(
          'Express %d view %s rendered outside transaction, not measuring.',
          version,
          view
        )
        return render.apply(this, arguments)
      }

      var name = VIEW.PREFIX + view + VIEW.RENDER
      var segment = tracer.createSegment(name, record)
      var wrapped


      if (typeof options === 'function') {
        cb = options
        options = null
      }

      if (cb === null || cb === undefined) {
        /* CAUTION: Need this to generate a metric, but adding a callback
         * changes Express's control flow.
         */
        wrapped = tracer.bindFunction(function syntheticCallback(err, rendered) {
          if (err) {
            segment.end()
            logger.trace(err,
                         "Express %d rendering for metric %s failed for transaction %s:",
                         version,
                         name,
                         segment.transaction.id)

            return this.req.next(err)
          }

          segment.end()
          var returned = this.send(rendered)

          logger.trace("Rendered Express %d view with metric %s for transaction %s.",
                       version,
                       name,
                       segment.transaction.id)

          return returned
        }.bind(this))
      } else {
        wrapped = tracer.bindFunction(function renderWrapper() {
          segment.end()
          var returned = cb.apply(this, arguments)

          return returned
        }, segment)
      }

      return render.call(this, view, options, wrapped, parent, sub)
    }
  }


  // wrap express.Router.process_params() in order to get to the Layer class, which
  // we need to wrap
  function wrapProcessParams(version, process_params) {
    return function cls_wrapProcessParams(layer) {
      var transaction = tracer.getTransaction()
      if (!transaction) {
        logger.trace(
          'Express %d router called outside transaction (wrapProcessParams).',
          version
        )
        return process_params.apply(this, arguments)
      }

      // process_params is the first place (I think) where we have access to a Layer
      // instance.  Layer is basically the interface for (req, res, next) - could be
      // a container for actual route handler, or an instance of Router, or an instance
      // of an Express sub-app.
      // Layers are called in the order they are defined.  The method
      // Layer.handle_request(req, res, next) is the method called in the chain.
      // If we wrap it, we know exactly when each handler in the chain is called. Based on
      // that we can build the path from nested route handlers.
      if (layer) {
        if (layer.constructor) {
          var layerProto = layer.constructor.prototype
          if (
            layerProto.handle_request &&
            !shimmer.isWrapped(layerProto.handle_request)
          ) {
            shimmer.wrapMethod(layerProto,
                              'express.Layer',
                              'handle_request',
                              wrapLayerHandleRequest)
          }
          if (
            layerProto.handle_error &&
            !shimmer.isWrapped(layerProto.handle_error)
          ) {
            shimmer.wrapMethod(layerProto,
                              'express.Layer',
                              'handle_error',
                              wrapLayerHandleError)
          }
        }
      }

      function wrapLayerHandleError(handleError) {
        return function wrappedLayerHandleError(error, req, res, next) {
          var parent = tracer.segment
          var segment = null
          if (!parent) {
            return handleError.apply(this, arguments)
          }

          var transaction = parent.transaction

          if (!transaction.isActive()) {
            return handleError.apply(this, arguments)
          }

          var transactionInfo = getTransactionInfo(transaction)

          if (agent.config.feature_flag.express_segments) {
            var handlerName = (this.handle.name || 'anonymous')
            if (this.handle.length === 4) {
              var prefix = NAMES.EXPRESS.ERROR_HANDLER
              segment = tracer.createSegment(prefix + handlerName, record)

              logger.trace(
                'Creating segment for middleware %s. Transaction id: %s, name: %s',
                segment.name,
                transaction.id,
                transaction.nameState.getName()

              )

              if (segment) {
                segment.start()
              }
            }

            transactionInfo.lastMiddlewareSegment = segment
          }

          if (next) {
            arguments[3] = endErrorHandlerRecorder
          }

          this.__NR_parent = parent

          handleError.apply(this, arguments)

          function endErrorHandlerRecorder() {
            segment && segment.end()
            return tracer.bindFunction(next, parent).apply(this, arguments)
          }
        }
      }

      function wrapLayerHandleRequest(handleRequest) {
        return function wrappedLayerHandleRequest(req, res, next) {
          var segment = null
          var parent = tracer.getSegment()
          if (!parent) {
            return handleRequest.apply(this, arguments)
          }

          var transaction = parent.transaction
          var transactionInfo = getTransactionInfo(transaction)

          if (!transaction.isActive()) {
            return handleRequest.apply(this, arguments)
          }

          var isErrorHandler = (this.handle.length === 4)
          var isMountedApp = (this.name === 'mounted_app' ||
                              (this.handle != null && this.handle.lazyrouter != null))
          var isRouter = (this.handle[ORIGINAL] != null && this.handle[ORIGINAL].stack) ||
                          this.handle.stack != null
          var isRoute = (this.route != null)
          var stack = (this.handle &&
                        (this.handle[ORIGINAL] && this.handle[ORIGINAL].stack) ||
                          this.handle.stack) ||
                      (this.route && this.route.stack)

          var routerStack = transactionInfo.routerStack
          if (agent.config.feature_flag.express_segments) {
            var parentSegment
            if (routerStack.length > 0) {
              parentSegment = routerStack[routerStack.length - 1].segment
            }

            if (!isErrorHandler) {
              var segmentName
              var recorder

              if (isMountedApp) {
                segmentName = NAMES.EXPRESS.PREFIX + 'Mounted App: ' +
                  this.handle.__NR_path
              } else if (isRouter) {
                segmentName = NAMES.EXPRESS.PREFIX + 'Router: '
                if (this.handle.__NR_path) {
                  segmentName += this.handle.__NR_path
                } else {
                  segmentName += '/'
                }
              } else if (isRoute) {
                segmentName = NAMES.EXPRESS.PREFIX + 'Route Path: ' +
                  this.handle.__NR_path
              } else {
                var middlewareName = (this.handle.name || 'anonymous')
                segmentName = NAMES.EXPRESS.MIDDLEWARE + middlewareName
                var middlewarePath = generateMiddlewarePath(routerStack, this)
                recorder = middlewareRecorder.bind(null, middlewarePath)
              }

              segment = tracer.createSegment(segmentName, recorder, parentSegment)

              logger.trace(
                'Creating segment for middleware %s. Transaction id: %s, name: %s',
                segment.name,
                transaction.id,
                transaction.nameState.getName()
              )
            }
          }
          // END FEATURE FLAG

          if (isRouter || isRoute) {
            routerStack.push({
              length: stack.length,
              path: this.handle.__NR_path,
              segment: segment
            })
          } else if (isMountedApp) {
            routerStack.push({
              length: null,
              path: this.handle.__NR_path,
              segment: segment
            })
          } else {
            transactionInfo.lastMiddlewareSegment = segment
          }

          // call cleanup before next middleware function in order to restore
          // transaction.partialName
          if (next) {
            arguments[2] = cleanup
          }

          this.__NR_parent = parent

          return tracer.bindFunction(handleRequest, segment || parent, !!segment)
            .apply(this, arguments)

          function cleanup() {
            var parentRouter
            if (!transactionInfo.responded && routerStack.length > 0) {
              parentRouter = routerStack[routerStack.length - 1]
              if (isMountedApp || isRouter || isRoute) {
                routerStack.pop()
              }
            }

            parentRouter && parentRouter.segment && parentRouter.segment.touch()
            segment && segment.end()
            return tracer.bindFunction(next, parent).apply(this, arguments)
          }
        }
      }

      return process_params.apply(this, arguments)
    }
  }

  /**
   * Problem:
   *
   * 1. Express determines whether middleware functions are error handlers by
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
  function wrapHandle(__NR_handle, path) {
    var name = ''
    var arglist

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

    // All closure scope variables used in templates must be passed
    // in as formal arguments to the wrapped function constructor

    /* eslint-disable func-names */
    /* eslint-disable no-undef */
    var routerTemplate = function() {
      return wrappedHandle.call(layer, path, __NR_handle, [].slice.call(arguments))
    }
    /* eslint-enable no-undef */
    /* eslint-enable func-names */

    // I am a bad person and this makes me feel bad.
    // We use eval because we need to insert the function with a specific
    // name to allow for lookup.
    /* eslint-disable no-new-func */
    var wrapped = new Function(
      'tracer', '__NR_handle', 'wrappedHandle', 'path', 'layer',
      'return function ' + name + arglist + routerTemplate.toString().substring(11)
    )(tracer, __NR_handle, wrappedHandle, path, this)
    /* eslint-enable no-new-func */

    wrapped[ORIGINAL] = __NR_handle

    // pull the attributes from the original handle up to the wrapped one
    var handleKeys = Object.keys(__NR_handle)
    for (var i = 0; i < handleKeys.length; i++) {
      var key = handleKeys[i]
      wrapped[key] = __NR_handle[key]
    }

    wrapped.__NR_path = path
    return wrapped
  }

  function wrapMiddlewareStack(route, original) {
    return function cls_wrapMiddlewareStack() {
      /* We allow `use` to go through the arguments so it can reject bad things
       * for us so we don't have to also do argument type checking.
       */

      var app = original.apply(this, arguments)
      var path = typeof arguments[0] === 'string' ? arguments[0] : '/'
      if (arguments[0] instanceof RegExp) {
        path = arguments[0].toString()
      }

      /* Express adds routes to the same stack as middleware. We need to wrap
       * that adder too but we only want to wrap the middleware that are
       * added, not the Router.
       */
      // wrap most recently added unwrapped handler
      var i = this.stack.length
      var top
      /* eslint-disable no-cond-assign */
      while (top = this.stack[--i]) {
        if (!top.handle || typeof top.handle !== 'function' || top.handle[ORIGINAL]) {
          break
        }

        top.handle = wrapHandle.call(top, top.handle, path)
      }
      /* eslint-enable no-cond-assign */

      return app
    }
  }

  function wrappedHandle(path, handle, args) {
    var transaction = agent.tracer.getTransaction()

    if (!transaction) {
      logger.trace(
        'Express %d handle for path %s called outside transaction (wrappedHandle).',
        version,
        path
      )
      return handle.apply(this, args)
    }

    var isErrorHandler = handle.length === 4
    var transactionInfo = getTransactionInfo(transaction)

    var req = args[0]
    var isRouter = this.handle[ORIGINAL] != null && this.handle[ORIGINAL].stack ||
                   this.handle.stack != null
    var isRoute = this.route != null

    if (req && (isRoute || isRouter)) {
      if (req.params) {
        // Express 4.3.0 changed where params live. On newer versions of Express
        // params should be populated, on older it shouldn't be.
        urltils.copyParameters(
          transaction.agent.config,
          req.params,
          transaction.webSegment.parameters
        )
      }
    }

    if (!transactionInfo.error || transactionInfo.errorHandled) {
      ensurePartialName(transaction)
      transaction.nameState.appendPath(path)
    }

    // Update the namestate if we have a callback that we can unwind with.
    var last = args.length - 1
    var cb = args[last]

    if (cb instanceof Function) {
      if (isErrorHandler && transactionInfo.error) {
        transactionInfo.errorHandled = true
      }

      args[last] = function wrappedHandleCallback(err) {
        // if an error is passed to the next function, we do not want
        // to mutate the name path so the transaction will be named
        // after the location the error was generated.
        if (err && err !== 'route') {
          transactionInfo.error = err
        } else if (!transactionInfo.responded) {
          transaction.nameState.popPath(path)
        }
        return cb.apply(this, arguments)
      }
    }

    // wrap res.end to mark the transaction as responded
    var res = args[1]

    if (res && res.end && !res.end[ORIGINAL]) {
      var oldEnd = res.end

      res.end = function wrappedEnd() {
        // end the current middleware segment
        if (transactionInfo.lastMiddlewareSegment) {
          transactionInfo.lastMiddlewareSegment.end()
        }

        // end all router segments
        var routerStack = transactionInfo.routerStack
        if (routerStack.length > 0) {
          for (var i = (routerStack.length - 1); i >= 0; i--) {
            if (routerStack[i].segment) {
              routerStack[i].segment.end()
            }
          }
        }
        transactionInfo.responded = true

        var err = transactionInfo.error
        var errHandled = transactionInfo.errorHandled
        var isHttpError = urltils.isError(agent.config, this.statusCode)
        // report error if it was not handled by an error handler, or when
        // the status code is an HTTP error (more useful to report the actual error
        // than a generic HTTP status error)
        if (err && (!errHandled || isHttpError)) {
          agent.errors.add(transaction, err)
        }

        logger.trace(
          'res.end called, transaction id: %s, name: %s.',
          transaction.id,
          transaction.nameState.getName()
        )

        return oldEnd.apply(res, arguments)
      }

      res.end[ORIGINAL] = oldEnd
    }


    return handle.apply(this, args)
  }

  function wrapParamware(param) {
    return function wrappedParam(paramName, fn) {
      if (fn instanceof Function && typeof paramName === 'string') {
        return param.call(this, paramName, paramwareWrapper)
      }
      return param.apply(this, arguments)

      /* eslint-disable no-unused-vars */
      function paramwareWrapper(req, res, next, value, name) {
        /* eslint-enable no-unused-vars */
        // Make sure we are correct about which parameter is the callback and
        // that we have a transaction which is currently active!
        var transaction = tracer.getTransaction()
        if (!(next instanceof Function && transaction)) {
          return fn.apply(this, arguments)
        }

        // Create the param handler segment.
        transaction.nameState.appendPath('[param handler :' + paramName + ']')
        var transactionInfo = getTransactionInfo(transaction)
        var middlewarePath = generateMiddlewarePath(transactionInfo.routerStack, this)
        var recorder = middlewareRecorder.bind(null, middlewarePath)
        var segmentName = NAMES.EXPRESS.PREFIX + 'Param Handler: ' + paramName
        var segment = tracer.createSegment(segmentName, recorder)

        // Out of an excess of caution, make sure the segment was actually
        // created. In theory since we have an active transaction this should
        // not fail, but I don't trust anything anymore.
        if (!segment) {
          return fn.apply(this, arguments)
        }
        transactionInfo.lastMiddlewareSegment = segment

        // Wrap next with some cleanup.
        var args = tracer.slice(arguments)
        args[2] = tracer.bindFunction(function wrappedNext() {
          segment.touch()
          transaction.nameState.popPath()
          return next.apply(this, arguments)
        }, segment)

        // Call the paramware.
        segment.start()
        return tracer.bindFunction(fn, segment).apply(this, args)
      }
    }
  }

  function getTransactionInfo(transaction) {
    if (!transactionInfoById[transaction.id]) {
      transactionInfoById[transaction.id] = {
        // since Layer.handleRequest isn't scoped to a transaction we need to
        // track the transaction state outside in these maps.

        // routerStacks is transaction.id -> a stack of the last seen routers
        // and their segments. this is for reconstructing the call tree while
        // we traverse using next
        routerStack: [],

        // if a handler responds asynchronously and calls next synchronously,
        // which is the usual case, we will incorrectly name the segment as a
        // middleware rather than a responder.  this tracks whether a response
        // has gone out for the transaction yet.
        responded: false,

        // we don't want to send errors that a user is handling themselves, so
        // we stash the errors we see for a transaction till we know they
        // aren't handling it themselves
        error: null,

        // if we see an error handler in the middleware tree we consider the
        // error handled
        errorHandled: false,

        // when res.end() is called from a middleware handler, we need to end
        // the middleware segment that contains it
        lastMiddlewareSegment: null
      }
    }
    return transactionInfoById[transaction.id]
  }

  /**
   * Major versions of express have very different factoring,
   * even though the core instrumentation is the same.
   */
  var version = express && express.version && express.version[0]

  /* TJ decided he didn't want to deal with the hassle of updating a
   * version field. Thanks, TJ!
   */
  if (!version && express && express.application &&
      express.application.init && express.response &&
      express.response.render && express.Router &&
      express.Router.prototype.matchRequest) {
    version = '3'
  } else if (!version && express && express.application &&
           express.application.init && express.response &&
           express.response.render && express.Router &&
           express.Router.process_params && express.application.del) {
    version = '4'
  } else if (!version && express && express.application &&
             !express.application.del) {
    version = '5'
  }

  switch (version) {
    case '2':
      /* Express 2 doesn't directly expose its Router constructor, so create an
       * app and grab the constructor off it. Do it before instrumenting
       * createServer so the agent doesn't automatically set the dispatcher
       * to Express.
       */
      var oneoff = express.createServer()
      var Router = oneoff.routes.constructor


      shimmer.wrapMethod(express,
                         'express',
                         'createServer',
                         setDispatcher)

      /* Express 2 squirts its functionality directly onto http.ServerResponse,
       * leaving no clean way to wrap its functionality without pulling in the
       * http module ourselves.
       */
      var http = require('http')
      shimmer.wrapMethod(http.ServerResponse.prototype,
                         'http.ServerResponse.prototype',
                         'render',
                         wrapRender.bind(null, 2))

      shimmer.wrapMethod(Router.prototype,
                         'Router.prototype',
                         '_match',
                         express2.wrapMatchRequest.bind(null, tracer, 2))
      break

    case '3':
      shimmer.wrapMethod(express.application,
                         'express.application',
                         'init',
                         setDispatcher)

      shimmer.wrapMethod(express.response,
                         'express.response',
                         'render',
                         wrapRender.bind(null, 3))

      shimmer.wrapMethod(express.Router.prototype,
                         'express.Router.prototype',
                         'matchRequest',
                         express2.wrapMatchRequest.bind(null, tracer, 3))

      shimmer.wrapMethod(express.Router,
                         'express.Router',
                         'param',
                         wrapParamware)
      break

    case '4':
      shimmer.wrapMethod(express.application,
                         'express.application',
                         'init',
                         setDispatcher)

      shimmer.wrapMethod(express.response,
                         'express.response',
                         'render',
                         wrapRender.bind(null, 4))

      shimmer.wrapMethod(express.Router,
                         'express.Router',
                         'process_params',
                         wrapProcessParams.bind(null, 4))

      shimmer.wrapMethod(express.Router,
                         'express.Router',
                         'use',
                         wrapMiddlewareStack.bind(null, false))

      shimmer.wrapMethod(express.Router,
                         'express.Router',
                         'route',
                         wrapMiddlewareStack.bind(null, true))

      shimmer.wrapMethod(express.Router,
                         'express.Router',
                         'param',
                         wrapParamware)

      break
    case '5':
      // FLAG: express5 instrumentation
      if (agent.config.feature_flag.express5) {
        shimmer.wrapMethod(express.application,
                          'express.application',
                          'init',
                          setDispatcher)

        shimmer.wrapMethod(express.response,
                          'express.response',
                          'render',
                          wrapRender.bind(null, 5))

        shimmer.wrapMethod(express.Router.prototype,
                          'express.Router.prototype',
                          'process_params',
                          wrapProcessParams.bind(null, 5))

        shimmer.wrapMethod(express.Router.prototype,
                          'express.Router.prototype',
                          'use',
                          wrapMiddlewareStack.bind(null, false))

        shimmer.wrapMethod(express.Router.prototype,
                          'express.Router.prototype',
                          'route',
                          wrapMiddlewareStack.bind(null, true))

        shimmer.wrapMethod(express.Router,
                           'express.Router',
                           'param',
                           wrapParamware)
      }
      break
    default:
      logger.warn("Unrecognized version %s of Express detected; not instrumenting",
                  version)
  }
}
