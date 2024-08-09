'use strict'

var logger = require('../../logger.js').child({component: 'express'})
var urltils = require('../../util/urltils.js')
var ensurePartialName = require('./common.js').ensurePartialName
var NAMES = require('../../metrics/names.js')


module.exports.wrapMatchRequest = wrapMatchRequest


function wrapMatchRequest(tracer, version, original) {
  return function cls_wrapMatchRequest() {
    if (!tracer.getTransaction()) {
      logger.trace(
        'Express %d router called outside transaction (wrapMatchRequest).',
        version
      )
      return original.apply(this, arguments)
    }
    var route = original.apply(this, arguments)

    nameFromRoute(tracer.getSegment(), route)
    return route
  }
}

function nameFromRoute(segment, route, params, append) {
  if (!segment) return logger.error("No New Relic context to set Express route name on.")
  if (!route) return logger.debug("No Express route to use for naming.")

  params = route.params

  var trans = segment.transaction
  var path = route.path || route.regexp

  if (!path) return logger.debug({route: route}, "No path found on Express route.")

  // when route is a regexp, route.path will be a regexp
  if (path instanceof RegExp) path = path.source

  urltils.copyParameters(trans.agent.config, params, segment.parameters)

  if (append) {
    ensurePartialName(trans)
    trans.nameState.appendPath(path)
  } else {
    trans.nameState.setName(
      NAMES.EXPRESS.PREFIX, 
      trans.verb, 
      NAMES.ACTION_DELIMITER,
      path
    )
  }
}
