'use strict'

var shimmer = require('../shimmer')
var logger = require('../logger.js').child({component: 'director'})
var NAMES = require('../metrics/names.js')

function nameTransaction(segment, partialName, res) {
  if (!segment) return logger.error("No New Relic context to set Director route name on.")
  if (!partialName) return logger.error("No partialName to use for naming.")
  if (res.finished) return // no need to update transaction name if response has ended

  var transaction = segment.transaction
  var nameState = transaction.nameState

  if (res.__NR_directored) { // not first route
    nameState.pathStack.pop() // replace latest path name, preserving the last path name
  }
  nameState.appendPath(partialName)

  nameState.setVerb(transaction.verb)
  nameState.setDelimiter(NAMES.ACTION_DELIMITER) 
  res.__NR_directored = true
}

module.exports = function initialize(agent, director) {
  var tracer = agent.tracer

  shimmer.wrapMethod(
    director.Router.prototype,
    'director.Router.prototype',
    'mount',
    function wrapMount(mount) {
      return function wrappedMount(routes, path) {
        if (!routes) {
          return mount.call(this, routes, path)
        }

        Object.keys(director.http.methods).forEach(function wrapMethod(methodKey) {
          var method = director.http.methods[methodKey]
          if (routes[method]) { // method exists as attribute
            var route = routes[method] // wrapping associated cb function
            routes[method] = createWrapped(method, path, route)
          }
        })

        function createWrapped(method, path, route) {
          if (route.__NR_original) {
            route = route.__NR_original
          } 

          var wrapped = function wrappedRoute() {
            var transaction = tracer.getTransaction()
            if (!transaction) {
              return route.apply(this, arguments)
            }

            var response = this.res // hang directored attr, and check if res is finished

            var pathName = path.join('/')
            var partialName = pathName
            var segment = tracer.createSegment('Function/' + (route.name || "anonymous"))
            
            nameTransaction(tracer.segment, partialName, response)
            return tracer.bindFunction(route, segment, true).apply(this, arguments)
          }

          wrapped.__NR_original = route
          return wrapped
        }

        return mount.call(this, routes, path)
      }
    }
  )

  shimmer.wrapMethod(
    director.Router.prototype,
    'director.Router.prototype',
    ['on', 'route'],
    function wrapOn(on) {
      return function wrappedOn(method, path, route) {
        // if we are handed unexpected argument types pass them through
        // and let director handle the error case
        if (!route) {
          return on.call(this, method, path, route)
        }

        var partialName = this.scope.join('/') + path

        if (route.__NR_original) {
          route = route.__NR_original
        } 

        var wrapped = function wrappedRoute() {
          var transaction = tracer.getTransaction()
          if (!transaction) {
            return route.apply(this, arguments)
          }

          var response = this.res // hang directored attr, and check if res is finished

          var segment = tracer.createSegment('Function/' + (route.name || "anonymous"))
          nameTransaction(tracer.segment, partialName, response)
          return tracer.bindFunction(route, segment, true).apply(this, arguments)
        }

        wrapped.__NR_original = route

        return on.call(this, method, path, wrapped)
      }
    }
  )
}
