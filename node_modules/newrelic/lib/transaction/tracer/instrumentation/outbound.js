'use strict'

var events = require('events')
var recordExternal = require('../../../metrics/recorders/http_external')
var NAMES = require('../../../metrics/names')
var urltils = require('../../../util/urltils')
var hashes = require('../../../util/hashes')
var logger = require('../../../logger').child({component: 'outbound'})
var shimmer = require('../../../shimmer')

var DEFAULT_PORT = 80


module.exports = function instrumentOutbound(agent, hostname, port, makeRequest) {
  if (!hostname) throw new Error('hostname must be defined!')
  if (!port || port < 1) throw new Error('port must be defined!')
  if (port && port !== DEFAULT_PORT) hostname = hostname + ':' + port

  var transaction = agent.tracer.getTransaction()
  var name = NAMES.EXTERNAL.PREFIX + hostname

  return agent.tracer.addSegment(
    name,
    recordExternal(hostname, 'http'),
    null,
    false,
    instrumentRequest
  )

  function instrumentRequest(segment) {
    segment.start()
    var request = makeRequest()
    var parsed = urltils.scrubAndParseParameters(request.path)
    segment.name += parsed.path
    urltils.copyParameters(agent.config, parsed.parameters, segment.parameters)

    // Wrap the emit method. We're doing a special wrapper instead of using
    // `tracer.bindEmitter` because we want to do some logic based on certain
    // events.
    shimmer.wrapMethod(request, 'request.emit', 'emit', function wrapEmit(emit) {
      var boundEmit = agent.tracer.bindFunction(emit, segment)
      return function wrappedRequestEmit(evnt, arg) {
        if (evnt === 'error') {
          segment.end()
          if (handleError(request, arg)) {
            return // FIXME In v2 we should always call emit.
          }
        } else if (evnt === 'response') {
          handleResponse(segment, request, arg)
        }

        return boundEmit.apply(this, arguments)
      }
    })

    return request
  }

  function handleError(req, error) {
    if (listenerCount(req, 'error') > 0) {
      logger.trace(
        error,
        'Not capturing outbound error because user has already handled it.'
      )
      return false
    }

    /* we should be calling request.emit('error', error) here. We currently
     * do not do this because the agent has historically swallowed these
     * errors, re enabling them may cause unexpected errors to buble up in
     * code that depends on this behavior.
     */
    logger.trace(
      error,
      'Captured outbound error on behalf of the user (normally an uncaught exception).'
    )
    agent.errors.add(transaction, error)
    return true
  }

  function handleResponse(segment, req, res) {
    // FLAG: cat
    if (agent.config.feature_flag.cat) {
      pullCatHeaders(
        agent.config,
        segment,
        hostname,
        res.headers['x-newrelic-app-data']
      )
    }

    // Again a custom emit wrapper because we want to watch for the `end` event.
    shimmer.wrapMethod(res, 'response.emit', 'emit', function wrapEmit(emit) {
      var boundEmit = agent.tracer.bindFunction(emit, segment)
      return function wrappedResponseEmit(evnt) {
        if (evnt === 'end') {
          segment.end()
        }
        return boundEmit.apply(this, arguments)
      }
    })
  }
}

function pullCatHeaders(config, segment, host, obfAppData) {
  if (!config.encoding_key) {
    logger.trace('config.encoding_key is not set - not parsing response CAT headers')
    return
  }

  if (!config.trusted_account_ids) {
    logger.trace(
      'config.trusted_account_ids is not set - not parsing response CAT headers'
    )
    return
  }

  // is our downstream request CAT-aware?
  if (!obfAppData) {
    logger.trace('Got no CAT app data in response header x-newrelic-app-data')
  } else {
    var appData = null
    try {
      appData = JSON.parse(hashes.deobfuscateNameUsingKey(obfAppData,
                                                          config.encoding_key))
    } catch (e) {
      logger.warn('Got an unparsable CAT header x-newrelic-app-data: %s', obfAppData)
      return
    }
    // Make sure it is a trusted account
    if (appData.length && typeof appData[0] === 'string') {
      var accountId = appData[0].split('#')[0]
      accountId = parseInt(accountId, 10)
      if (config.trusted_account_ids.indexOf(accountId) === -1) {
        logger.trace('Response from untrusted CAT header account id: %s', accountId)
      } else {
        segment.catId = appData[0]
        segment.catTransaction = appData[1]
        segment.name = NAMES.EXTERNAL.TRANSACTION + host + '/' +
                       segment.catId + '/' + segment.catTransaction
        if (appData.length >= 6) {
          segment.parameters.transaction_guid = appData[5]
        }
        logger.trace('Got inbound response CAT headers in transaction %s',
          segment.transaction.id)
      }
    }
  }
}

function listenerCount(emitter, evnt) {
  if (events.EventEmitter.listenerCount) {
    return events.EventEmitter.listenerCount(emitter, evnt)
  }
  return emitter.listeners(evnt).length
}
