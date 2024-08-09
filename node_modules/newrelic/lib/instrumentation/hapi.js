'use strict'

var shimmer = require('../shimmer.js')
var urltils = require('../util/urltils.js')
var logger = require('../logger.js').child({component: 'hapi'})
var record = require('../metrics/recorders/generic.js')
var NAMES = require('../metrics/names.js')
var VIEW = NAMES.VIEW


function nameFromRequest(segment, request) {
  if (!segment) return logger.error("No New Relic context to set Hapi route name on.")
  if (!request) return logger.debug("No Hapi request to use for naming.")

  var transaction = segment.transaction
  var path = request.route && request.route.path


  if (!path) return logger.debug({request: request}, "No path found on Hapi route.")

  urltils.copyParameters(transaction.agent.config, request.params, segment.parameters)

  transaction.nameState.setName(NAMES.HAPI.PREFIX, transaction.verb, 
      NAMES.ACTION_DELIMITER, path)
}

function setDispatcher(agent) {
  agent.environment.setDispatcher('hapi')
  agent.environment.setFramework('hapi')
}

module.exports = function initialize(agent, hapi) {
  if (!agent) return logger.error("Hapi instrumentation bootstrapped without agent")
  if (!hapi) return logger.error("Hapi instrumentation applied without module")

  var tracer = agent.tracer

  function wrapRender(render) {
    return function wrappedRender(filename, context, options, callback) {
      var wrapped = callback

      // FIXME: this is going to be the most recent segment, which may not be right
      var segment = tracer.getSegment()
      if (segment && callback) {
        wrapped = tracer.bindFunction(function cb_bindFunction() {
          segment.end()

          return callback.apply(this, arguments)
        })
      }

      return render.call(this, filename, context, options, wrapped)
    }
  }

  function wrapStart(start) {
    return function wrappedStart() {
      setDispatcher(agent)

      /* The patched module loader doesn't access the filesystem itself, so
       * lazily apply the patch to Views.prototype.render only once a Views
       * object has been assigned as the view manager.
       */
      if (this._views) {
        logger.debug('Hapi view manager set; instrumenting render.')
        var proto = this._views.constructor.prototype
        shimmer.wrapMethod(proto, 'hapi.Views.prototype', 'render', wrapRender)
      }

      return start.apply(this, arguments)
    }
  }

  function wrapViews(views) {
    return function wrappedViews() {
      var returned = views.apply(this, arguments)

      /* The patched module loader doesn't access the filesystem itself, so
       * lazily apply the patch to Views.prototype.render only once a Views
       * object has been assigned as the view manager.
       */
      if (this._views) {
        var proto = this._views.constructor.prototype
        shimmer.wrapMethod(proto, 'hapi.Views.prototype', 'render', wrapRender)
      } else {
        logger.warn('Hapi view manager set without manager actually being created.')
      }

      return returned
    }
  }

  function wrapReplyView(reply) {
    reply.view = tracer.wrapFunction(VIEW.PREFIX, record, reply.view, wrapper)

    function wrapper(segment, args) {
      segment.name = VIEW.PREFIX + args[0] + VIEW.RENDER
      return args
    }
  }

  function wrapHandler(handler) {
    return function cls_wrapHandler(request, reply) {
      if (!tracer.getTransaction()) {
        logger.trace("Hapi route handler called outside transaction.")
        return handler.apply(this, arguments)
      }

      nameFromRequest(tracer.getSegment(), request)
      if (reply && reply.view) wrapReplyView(reply)

      return handler.apply(this, arguments)
    }
  }

  /**
   * Compare the before and after state of the router and apply the route wrapper
   * to the new routes.
   *
   * @param  {object} before - State of the router before the new routes were added.
   * @param  {object} after - State of the router after the new routes were added.
   * @param  {string} vhost - If the user is letting hapi route its vhosts, use
   *                          it in logging for debugging.
   * @param  {function} visit  - Function used to wrap up the new routes.
   */
  function tableVisitor(before, after, vhost, visit) {
    if (!vhost) vhost = '*'

    if (after) {
      Object.keys(after).forEach(function cb_forEach(method) {
        var beforeHandlers = before && before[method]
        var afterHandlers = after[method]
        // hapi 8 nested routes a little deeper.
        if (afterHandlers.routes) {
          afterHandlers = afterHandlers.routes
        }
        for (var i = 0; i < afterHandlers.length; i++) {
          var route = afterHandlers[i]
          logger.debug('Instrumented hapi route [host %s] %s %s',
                       vhost, method, route.path)
          if (!beforeHandlers || beforeHandlers.indexOf(route) === -1) {
            // hapi@6.9.0 started nesting the route handler 1 layer deeper
            if (route.route) {
              route = route.route
            }

            if (route.settings && route.settings.handler) {
              route.settings.handler = visit(route.settings.handler)
            } else {
              logger.warn(
                'Could not find handler to instrument for hapi route [host %s] %s %s',
                vhost,
                method,
                route.path
              )
            }
          }
        }
      })
    }
  }

  /**
   * This is pretty slow but only happens at route add time so optimizing it
   * is of limited benefit. It is also moderately complex so lets go through
   * what it does:
   *
   * 1. Gather the state of the router into `before*` variables.
   * 2. Apply the new route(s) that are being added (which could be an array of
   *    routes, and cover a number of different methods).
   * 3. Get the new state of the router.
   * 4. Pass it all to the table vistor which applies the route wrapper to all
   *    the of individual routes that were just added.
   */
  function wrapRoute(_route) {
    return function wrappedRoute(configs, env) {
      var server = this

      var router = server._router
      if (!router) return logger.warn("no router found on hapi server")

      var vhosts = router.vhosts
      var beforeHosts = {}
      if (vhosts) {
        logger.debug("capturing vhosts on hapi router")

        Object.keys(vhosts).forEach(function cb_forEach(host) {
          beforeHosts[host] = {}
          Object.keys(vhosts[host]).forEach(function cb_forEach(method) {
            var routes = vhosts[host][method]
            // hapi 8 nested routes a little deeper.
            if (routes && routes.routes) {
              routes = routes.routes
            }
            beforeHosts[host][method] = routes.slice()
          })
        })
      }

      var symbol
      if (typeof router.table === 'function') {
      // hapi 2: router.table -> router.routes & router.table is a function
        symbol = 'routes'
      } else {
      // hapi 1: when vhosts aren't used, router.table contains the routes
        symbol = 'table'
      }

      var table = router[symbol]
      var beforeTable = {}
      if (table) {
        Object.keys(table).forEach(function cb_forEach(method) {
          // hapi 8 nested routes a little deeper.
          var routes = table[method]
          if (routes.routes) {
            routes = routes.routes
          }
          beforeTable[method] = routes.slice()
        })
      }

      var returned = _route.call(this, configs, env)

      vhosts = router.vhosts
      if (vhosts) {
        Object.keys(vhosts).forEach(function cb_forEach(host) {
          tableVisitor(beforeHosts[host], vhosts[host], host, wrapHandler)
        })
      }

      // Object could have been switched out, make sure to get a fresh one.
      table = router[symbol]
      if (table) tableVisitor(beforeTable, table, undefined, wrapHandler)

      return returned
    }
  }

  function wrapCreateServer(createServer) {
    return function createServerWrapper() {
      var server = createServer.apply(this, arguments)
      shimServerPrototype(
        server.constructor.prototype,
        'hapi.Server.constructor.prototype'
      )
      // Now that we have instrumented the server prototype, un-instrument
      // createServer as it serves no purpose.
      shimmer.unwrapMethod(hapi, 'hapi', 'createServer')
      return server
    }
  }

  function shimServerPrototype(proto, name) {
    shimmer.wrapMethod(proto, name, 'start', wrapStart)
    shimmer.wrapMethod(proto, name, 'views', wrapViews)
    shimmer.wrapMethod(proto, name, '_route', wrapRoute)
  }

  function wrapConnection(connection) {
    return function wrappedConnection() {
      setDispatcher(agent)
      // Server.prototype returns a connection object
      var plugin = connection.apply(this, arguments)

      // Defensive against the possiblity that there isn't a connection for some
      // reason.
      if (plugin && plugin.connections && plugin.connections.length > 0) {
        shimmer.wrapMethod(
          plugin.connections[0].constructor.prototype,
          'hapi.Connection.constructor.prototype',
          '_route',
          wrapRoute
        )

        shimmer.wrapMethod(
          plugin.connections[0].server._replier.constructor.prototype,
          'hapi.Connection.server._replier.constructor.prototype',
          'interface',
          wrapInterface
        )

        // Unwrap connection now that we've managed to patch the prototype
        shimmer.unwrapMethod(
          hapi.Server.prototype,
          'hapi.Server.prototype',
          'connection'
        )
      }

      return plugin
    }
  }

  function wrapInterface(replier) {
    return function wrappedInterface() {
      var reply = replier.apply(this, arguments)
      shimmer.wrapMethod(
        reply,
        'hapi.Reply',
        'response',
        wrapResponse
      )
      return reply
    }
  }

  function wrapResponse(response) {
    return function wrappedResponse() {
      var segment = agent.tracer.getSegment()
      if (segment) segment.touch()
      return response.apply(this, arguments)
    }
  }

  var proto = hapi && hapi.Server && hapi.Server.prototype
  if (proto && proto.start && proto.views && proto._route) { // Hapi 1 - 7.1.1
    shimServerPrototype(proto, 'hapi.Server.prototype')
  } else if (proto && Object.keys(proto).length === 0) { // Hapi 7.2 - 7.5.2
    // This gets removed on first invocation as it is just used to patch a
    // deeper prototype.
    shimmer.wrapMethod(hapi, 'hapi', 'createServer', wrapCreateServer)
  } else if (proto && proto.start && proto.route && proto.connection) { // Hapi 8+
    shimmer.wrapMethod(proto, 'hapi.Server.prototype', 'connection', wrapConnection)
  } else { // Some unknown future or hacked up version
    logger.warn('hapi Server constructor not found; can\'t instrument')
  }
}
