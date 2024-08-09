'use strict'

var shimmer = require('../shimmer')
var logger = require('../logger.js').child({component: 'restify'})
var urltils = require('../util/urltils.js')
var NAMES = require('../metrics/names.js')


function nameFromRoute(segment, route, context) {
  if (!segment) return logger.error("No New Relic context to set Restify route name on.")
  if (!route) return logger.error("No Restify route to use for naming.")

  var transaction = segment.transaction
  var path = (route.spec && (route.spec.path || route.spec.name)) || route.name


  var params = context || route.params
  if (params) {
    urltils.copyParameters(transaction.agent.config, params, segment.parameters)
  }

  if (!path) return logger.warn({route: route}, "No path found on Restify route.")

  // when route is a regexp, route.spec.path will be a regexp
  if (path instanceof RegExp) path = path.source

  transaction.nameState.setName(NAMES.RESTIFY.PREFIX, transaction.verb, 
      NAMES.ACTION_DELIMITER, path)
}

module.exports = function initialize(agent, restify) {
  /* Restify doesn't directly expose its Router constructor. We need to wait
   * until a server is created, and then grab the constructor off of it.
   *
   * Unfortunately, we can't create a server ourselves as doing so causes
   * Restify's req.query extension to override express' req.query extension of
   * IncomingMessage. This is an issue if an app uses express for serving while
   * using Restify only for client-side REST requests.
   */
  shimmer.wrapMethod(
    restify,
    'restify',
    'createServer',
    function cb_wrapMethod(createServer) {
      return function wrappedCreateServer() {
        agent.environment.setDispatcher('restify')
        agent.environment.setFramework('restify')

        var server = createServer.apply(this, arguments)
        var Router = server.router.constructor

        /* Now that we have created a server, we have access to the Router
         * constructor and can instrument it.
         */
        shimmer.wrapMethod(
          Router.prototype,
          'Router.prototype',
          'find',
          function cb_wrapMethod(find) {
            return function wrappedFind(req, res, callback) {
              var tracer = agent.tracer

              if (!tracer.getTransaction()) {
                logger.trace("Restify router invoked outside transaction.")
                return find.apply(this, arguments)
              }

              var wrapped = function wrappedRoute(error, route, context) {
                nameFromRoute(tracer.getSegment(), route, context)
                return callback(error, route, context)
              }

              return find.call(this, req, res, wrapped)
            }
          }
        )

        return server
      }
    }
  )
}
