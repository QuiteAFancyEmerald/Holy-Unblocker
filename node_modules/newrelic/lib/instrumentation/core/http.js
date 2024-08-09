'use strict'

var shimmer = require('../../shimmer.js')
var logger = require('../../logger').child({component: 'http'})
var recordWeb = require('../../metrics/recorders/http.js')
var hashes = require('../../util/hashes.js')
var cat = require('../../util/cat.js')
var instrumentOutbound = require('../../transaction/tracer/instrumentation/outbound.js')
var util = require('util')
var url = require('url')
var semver = require('semver')
var copy = require('../../util/copy')

var NAMES = require('../../metrics/names.js')

/*
 *
 * CONSTANTS
 *
 */
var NR_CONNECTION_PROP = '__NR__connection'
var DEFAULT_HOST = 'localhost'
var DEFAULT_PORT = 80
var REQUEST_HEADER = 'x-request-start'
var QUEUE_HEADER = 'x-queue-start'
var NEWRELIC_ID_HEADER = 'x-newrelic-id'
var NEWRELIC_APP_DATA_HEADER = 'x-newrelic-app-data'
var NEWRELIC_TRANSACTION_HEADER = 'x-newrelic-transaction'
var NEWRELIC_SYNTHETICS_HEADER = 'x-newrelic-synthetics'
var CONTENT_LENGTH_REGEX = /^Content-Length$/i


// For incoming requests this instrumentation functions by wrapping
// `http.createServer` and `http.Server#addListener`. The former merely sets the
// agent dispatcher to 'http' and the latter wraps any event handlers bound to
// `request`.
//
// The `request` event listener wrapper creates a transaction proxy which will
// start a new transaction whenever a new request comes in. It also scans the
// headers of the incoming request looking for CAT and synthetics headers.

function wrapListener(agent, listener) {
  if (!listener) {
    logger.debug('No request listener defined, not wrapping.')
    return listener
  }

  var tracer = agent.tracer
  var serverPort = null

  return tracer.transactionProxy(function wrappedHandler(request, response) {
    var transaction = tracer.getTransaction()
    if (!transaction) return listener.apply(this, arguments)

    transaction.nameState.setPrefix(NAMES.NODEJS.PREFIX)

    var collectedRequestHeaders = [
      'accept',
      'contentLength',
      'contentType',
      'referer',
      'host'
    ]

    if (request) {
      for (var i = 0; i < collectedRequestHeaders.length; i++) {
        var headerKey = collectedRequestHeaders[i]
        var header = request.headers[headerKey.toLowerCase()]
        if (header !== undefined) {
          // If any more processing of the headers is required consider refactoring this.
          if (headerKey === 'referer') {
            var queryParamIndex = header.indexOf('?')
            if (queryParamIndex !== -1) {
              header = header.substring(0, queryParamIndex)
            }
          }

          var attributeName = 'request.headers.' + headerKey
          transaction.addAgentAttribute(attributeName, header)
        }
      }

      if (request.method !== undefined) {
        transaction.addAgentAttribute('request.method', request.method)
      }
      if (request.headers['user-agent'] !== undefined) {
          transaction.addAgentAttribute('request.headers.userAgent',
              request.headers['user-agent'])
      }
    }

    // Create the transaction segment using the request URL for now. Once a
    // better name can be determined this segment will be renamed to that.
    var segment = tracer.createSegment(request.url, recordWeb)
    segment.start()

    if (agent.config.feature_flag.custom_instrumentation) {
      transaction.webSegment = segment
    }

    /* Needed for Connect and Express middleware that monkeypatch request
     * and response via listeners.
     */
    tracer.bindEmitter(request, segment)
    tracer.bindEmitter(response, segment)

    // the error tracer needs a URL for tracing, even though naming overwrites
    transaction.parsedUrl = url.parse(request.url, true)
    transaction.url = transaction.parsedUrl.pathname
    transaction.verb = request.method

    // URL is sent as an agent attribute with transaction events
    if (agent.config.feature_flag.send_request_uri_attribute) {
      transaction.addAgentAttribute('request_uri', transaction.url)
    }

    // store the port on which this transaction runs
    if (this.address instanceof Function) {
      var address = this.address()
      if (address) {
        serverPort = address.port
      }
    }
    transaction.port = serverPort

    // need to set any config-driven names early for RUM
    logger.trace({url: request.url, transaction: transaction.id},
      'Applying user naming rules for RUM.')
    transaction.applyUserNamingRules(request.url)

    /**
     * Calculate Queue Time
     *
     * Queue time is provided by certain providers by stamping the request
     * header with the time the request arrived at the router.
     *
     * Units for queue time are
     */
    var qtime = request.headers[REQUEST_HEADER] || request.headers[QUEUE_HEADER]
    if (qtime) {
      var split = qtime.split('=')
      if (split.length > 1) {
        qtime = split[1]
      }

      var start = parseFloat(qtime)

      if (isNaN(start)) {
        logger.warn('Queue time header parsed as NaN (' + qtime + ')')
      } else {
        // nano seconds
        if (start > 1e18) start = start / 1e6
        // micro seconds
        else if (start > 1e15) start = start / 1e3
        // seconds
        else if (start < 1e12) start = start * 1e3

        transaction.queueTime = Date.now() - start
      }
    }
    if (agent.config.feature_flag.cat) {
      var encKey = agent.config.encoding_key
      var incomingCatId = request.headers[NEWRELIC_ID_HEADER]
      var obfTransaction = request.headers[NEWRELIC_TRANSACTION_HEADER]
      var synthHeader = request.headers[NEWRELIC_SYNTHETICS_HEADER]
      if (encKey) {
        cat.handleCatHeaders(incomingCatId, obfTransaction, encKey, transaction)
        if (transaction.incomingCatId) {
          logger.trace('Got inbound request CAT headers in transaction %s',
            transaction.id)
        }
        if (synthHeader && agent.config.trusted_account_ids) {
          handleSyntheticsHeader(
            synthHeader,
            encKey,
            agent.config.trusted_account_ids,
            transaction
          )
        }
      }
    }

    function instrumentedFinish() {
      // Remove listeners so this doesn't get called twice.
      response.removeListener('finish', instrumentedFinish)
      request.removeListener('aborted', instrumentedFinish)

      // Naming must happen before the segment and transaction are ended,
      // because metrics recording depends on naming's side effects.
      transaction.setName(transaction.parsedUrl, response.statusCode)

      if (response) {
        if (response.statusCode !== undefined) {
          var statusCode = response.statusCode
          if (typeof statusCode.toString === 'function') {
            var responseCode = statusCode.toString()
            if (typeof responseCode === 'string') {
              transaction.addAgentAttribute('httpResponseCode', responseCode)
            }
          }

          var responseStatus = parseInt(statusCode, 10)
          if (!isNaN(responseStatus)) {
            transaction.addAgentAttribute('response.status', responseStatus)
          }
        }
        if (response.statusMessage !== undefined) {
          transaction.addAgentAttribute('httpResponseMessage', response.statusMessage)
        }

        var contentLength = response.getHeader('content-length')
        if (contentLength) {
          transaction.addAgentAttribute(
            'response.headers.contentLength',
            parseInt(contentLength, 10)
          )
        }

        var contentType = response.getHeader('content-type')
        if (contentType) {
          transaction.addAgentAttribute(
            'response.headers.contentType',
            contentType
          )
        }
      }
      // This should be the last thing called before the web segment finishes.
      segment.markAsWeb(transaction.parsedUrl)
      segment.end()
      transaction.end()
    }
    response.once('finish', instrumentedFinish)
    request.once('aborted', instrumentedFinish)

    return tracer.bindFunction(listener, segment).apply(this, arguments)
  })
}

// FLAG: cat this wont be used unless cat is enabled, see below where we
// actually do the shimmer stuff if you'd like to verify.
function wrapWriteHead(agent, writeHead) {
  return function wrappedWriteHead() {
    var transaction = agent.tracer.getTransaction()
    if (!transaction) {
      logger.trace('No transaction - not adding response CAT headers')
      return writeHead.apply(this, arguments)
    }
    // FLAG: synthetics
    if (agent.config.feature_flag.synthetics && transaction.syntheticsHeader) {
      this.setHeader(NEWRELIC_SYNTHETICS_HEADER, transaction.syntheticsHeader)
    }

    if (!transaction.incomingCatId) {
      logger.trace('No incoming CAT ID - not adding response CAT headers')
      return writeHead.apply(this, arguments)
    }

    if (!agent.config.trusted_account_ids) {
      logger.trace('No account IDs defined in config.trusted_account_ids - ' +
        'not adding response CAT headers')
      return writeHead.apply(this, arguments)
    }

    var accountId = transaction.incomingCatId.split('#')[0]
    accountId = parseInt(accountId, 10)
    if (agent.config.trusted_account_ids.indexOf(accountId) === -1) {
      logger.trace('Request from untrusted CAT header account id: %s - ' +
        'not adding response CAT headers', accountId)
      return writeHead.apply(this, arguments)
    }

    // Not sure this could ever happen, but should guard against it anyway
    // otherwise exception we blow up the user's app.
    if (!agent.config.cross_process_id || !agent.config.encoding_key) {
      logger.trace(
        'Managed to have agent.config.trusted_account_ids but not cross_process_id ' +
          '(%s) or encoding_key (%s) - not adding response CAT headers',
        agent.config.cross_process_id,
        agent.config.encoding_key
      )
      return writeHead.apply(this, arguments)
    }

    // -1 means no content length header was sent. We should only send this
    // value in the appData if the header is set.
    var contentLength = -1
    var new_headers = arguments[arguments.length - 1]

    if (typeof new_headers === 'object') {
      for (var header in new_headers) {  // jshint ignore: line
        if (CONTENT_LENGTH_REGEX.test(header)) {
          contentLength = new_headers[header]
          break
        }
      }
    }

    if (contentLength === -1 && this._headers) {
      // JSHint complains about ownProperty stuff, but since we are looking
      // for a specific name that doesn't matter so I'm disabling it.
      // Outbound headers can be capitalized in any way, use regex instead
      // of direct lookup.
      for (var userHeader in this._headers) {  // jshint ignore: line
        if (CONTENT_LENGTH_REGEX.test(userHeader)) {
          contentLength = this._headers[userHeader]
          break
        }
      }
    }
    // Stored on the tx so we can push a metric with this time instead of
    // actual duration.
    transaction.catResponseTime = transaction.timer.getDurationInMillis()

    var appData
    var txName = transaction.name || transaction.nameState.getName() || ''

    try {
      if (txName) {
        txName = NAMES.WEB.RESPONSE_TIME + '/' + txName
      }

      appData = JSON.stringify([
        agent.config.cross_process_id, // cross_process_id
        txName, // transaction name
        transaction.queueTime / 1000, // queue time (s)
        transaction.catResponseTime / 1000, // response time (s)
        contentLength, // content length (if content-length header is also being sent)
        transaction.id, // TransactionGuid
        false // force a transaction trace to be recorded
      ])
    } catch (err) {
      logger.trace(err, 'Failed to serialize transaction: %s - ' +
          'not adding CAT response headers',
        txName)
      return writeHead.apply(this, arguments)
    }

    var encKey = agent.config.encoding_key
    var obfAppData = hashes.obfuscateNameUsingKey(appData, encKey)
    this.setHeader(NEWRELIC_APP_DATA_HEADER, obfAppData)
    logger.trace('Added outbound response CAT headers in transaction %s', transaction.id)

    return writeHead.apply(this, arguments)
  }
}

function wrapRequest(agent, request) {
  // TODO: early return in the !transaction || internalOnly case
  return function wrappedRequest(options) {
    var tracer = agent.tracer
    var transaction = tracer.getTransaction()
    var outboundHeaders = {}
    var args = tracer.slice(arguments)
    var context = this

    // don't pollute metrics and calls with NR connections
    var internalOnly = options && options[NR_CONNECTION_PROP]

    if (internalOnly) options[NR_CONNECTION_PROP] = undefined

    if (transaction && !internalOnly && agent.config.encoding_key) {
      // FLAG: synthetics
      if (agent.config.feature_flag.synthetics && transaction.syntheticsHeader) {
        outboundHeaders[NEWRELIC_SYNTHETICS_HEADER] = transaction.syntheticsHeader
      }

      // FLAG: cat
      if (agent.config.feature_flag.cat) {
        if (agent.config.obfuscatedId) {
          outboundHeaders[NEWRELIC_ID_HEADER] = agent.config.obfuscatedId
        }

        var pathHash = hashes.calculatePathHash(
          agent.config.applications()[0],
          transaction.name || transaction.nameState.getName() || '',
          transaction.referringPathHash
        )
        transaction.pushPathHash(pathHash)
        var txData = [
          transaction.id,
          false,
          transaction.tripId || transaction.id,
          pathHash
        ]
        try {
          txData = JSON.stringify(txData)
          var txHeader = hashes.obfuscateNameUsingKey(txData, agent.config.encoding_key)
          outboundHeaders[NEWRELIC_TRANSACTION_HEADER] = txHeader
          logger.trace('Added outbound request CAT headers in transaction %s',
            transaction.id)
        } catch (err) {
          logger.trace(err, 'Failed to serialize outbound response header')
        }
      }
    }

    if (transaction && !internalOnly) {
      if (typeof options === 'string') {
        options = url.parse(options)
      } else {
        options = copy.shallow(options)
      }

      if (util.isArray(options.headers)) {
        options.headers = options.headers.slice()
        Array.prototype.push.apply(options.headers,
          Object.keys(outboundHeaders).map(function getHeaderTuples(key) {
            return [key, outboundHeaders[key]]
          })
        )
      } else {
        options.headers = [options.headers, outboundHeaders]
          .reduce(function add(acc, val) {
            return copy.shallow(val, acc)
          }, {})
      }
      args[0] = options

      // hostname & port logic pulled directly from node's 0.10 lib/http.js
      var hostname = options.hostname || options.host || DEFAULT_HOST
      var port = options.port || options.defaultPort || DEFAULT_PORT
      return instrumentOutbound(agent, hostname, port, function makeRequest() {
        return request.apply(context, args)
      })
    }

    return request.apply(context, args)
  }
}

function wrapLegacyRequest(agent, request) {
  return function wrappedLegacyRequest(method, path, headers) {
    var makeRequest = request.bind(this, method, path, headers)

    if (agent.tracer.getTransaction()) {
      return instrumentOutbound(agent, this.host, this.port, makeRequest)
    }

    return makeRequest()
  }
}

function wrapLegacyClient(agent, proto) {
  shimmer.wrapMethod(
    proto,
    'http.Client.prototype',
    'request',
    wrapLegacyRequest.bind(null, agent)
  )
}

module.exports = function initialize(agent, http, moduleName) {
  // FIXME: will this ever not be called?
  shimmer.wrapMethod(http, 'http', 'createServer', function cb_wrapMethod(createServer) {
    return function setDispatcher(requestListener) { // eslint-disable-line no-unused-vars
      agent.environment.setDispatcher('http')
      return createServer.apply(this, arguments)
    }
  })

  /**
   * It's not a great idea to monkeypatch EventEmitter methods given how hot
   * they are, but this method is simple and works with all versions of
   * node supported by the module.
   */
  shimmer.wrapMethod(
    http && http.Server && http.Server.prototype,
    'http.Server.prototype',
    ['on', 'addListener'],
    function cb_wrapMethod(addListener) {
      return function cls_wrapMethod(type, listener) {
        if (type === 'request' && listener instanceof Function) {
          return addListener.call(this, type, wrapListener(agent, listener))
        }

        return addListener.apply(this, arguments)
      }
    }
  )


  // FLAG: cat
  if (agent.config.feature_flag.cat) {
    shimmer.wrapMethod(http && http.ServerResponse && http.ServerResponse.prototype,
                       'http.ServerResponse.prototype',
                       'writeHead',
                       wrapWriteHead.bind(null, agent))
  }

  var agentProto = http && http.Agent && http.Agent.prototype

  // As of node 0.8, http.request() is the right way to originate outbound
  // requests.
  // TODO: Remove this check when deprecating Node <0.8.
  if (agentProto && agentProto.request) {
    // Node 0.11+ always uses an Agent.
    shimmer.wrapMethod(
      agentProto,
      'http.Agent.prototype',
      'request',
      wrapRequest.bind(null, agent)
    )
  } else if (moduleName !== 'https' || semver.satisfies(process.version, '<=0.10.x')) {
    shimmer.wrapMethod(
      http,
      'http',
      'request',
      wrapRequest.bind(null, agent)
    )

    if (semver.satisfies(process.version, '>=8')) {
      shimmer.wrapMethod(
        http,
        'http',
        'get',
        wrapRequest.bind(null, agent)
      )
    }
  }

  // Agent#createConnection was added in 0.11.
  // TODO: Remove this check when deprecating Node 0.10
  if (agentProto && agentProto.createConnection) {
    shimmer.wrapMethod(
      agentProto,
      'http.Agent.prototype',
      'createConnection',
      function wrapCreateConnection(original) {
        return function wrappedCreateConnection() {
          if (!agent.getTransaction()) {
            return original.apply(this, arguments)
          }

          var segment = agent.tracer.createSegment('http.Agent#createConnection')

          var args = agent.tracer.slice(arguments)
          if (typeof args[1] === 'function') {
            args[1] = agent.tracer.bindFunction(args[1], segment, true)
          }

          var sock = agent.tracer.bindFunction(original, segment, true)
            .apply(this, args)
          return sock
        }
      }
    )
  }

  // http.Client is deprecated, but still in use
  var DeprecatedClient, deprecatedCreateClient
  function clearGetters() {
    if (DeprecatedClient) {
      delete http.Client
      http.Client = DeprecatedClient
    }
    if (deprecatedCreateClient) {
      delete http.createClient
      http.createClient = deprecatedCreateClient
    }
  }

  DeprecatedClient = shimmer.wrapDeprecated(
    http,
    'http',
    'Client',
    {
      get: function get() {
        var example = new DeprecatedClient(80, 'localhost')
        wrapLegacyClient(agent, example.constructor.prototype)
        clearGetters()

        return DeprecatedClient
      },
      set: function set(NewClient) {
        DeprecatedClient = NewClient
      }
    }
  )

  deprecatedCreateClient = shimmer.wrapDeprecated(
    http,
    'http',
    'createClient',
    {
      get: function get() {
        var example = deprecatedCreateClient(80, 'localhost')
        wrapLegacyClient(agent, example.constructor.prototype)
        clearGetters()

        return deprecatedCreateClient
      },
      set: function set(newCreateClient) {
        deprecatedCreateClient = newCreateClient
      }
    }
  )
}

/**
 * Take the X-NewRelic-Synthetics header and apply any appropriate data to the
 * transaction for later use. This is the gate keeper for attributes being
 * added onto the transaction object for synthetics.
 *
 * @param {string} header - The raw X-NewRelic-Synthetics header
 * @param {string} encKey - Encoding key handed down from the server
 * @param {̄Array} trustedIds - Array of accounts to trust the header from.
 * @param {Transaction} transaction - Where the synthetics data is attached to.
 */
function handleSyntheticsHeader(header, encKey, trustedIds, transaction) {
  var synthData = parseSyntheticsHeader(header, encKey, trustedIds)
  if (!synthData) {
    return
  }

  transaction.syntheticsData = synthData
  transaction.syntheticsHeader = header
}

/**
 * Parse out and verify the the pieces of the X-NewRelic-Synthetics header.
 *
 * @param {string} header - The raw X-NewRelic-Synthetics header
 * @param {string} encKey - Encoding key handed down from the server
 * @param {̄Array} trustedIds - Array of accounts to trust the header from.
 * @return {Object or null} - On successful parse and verification an object of
 *                            synthetics data is returned, otherwise null is
 *                            returned.
 */
function parseSyntheticsHeader(header, encKey, trustedIds) {
  // Eagerly declare this object because we know what it should look like and
  // can use that for header verification.
  var parsedData = {
    version: null,
    accountId: null,
    resourceId: null,
    jobId: null,
    monitorId: null
  }
  var synthData = null
  try {
    synthData = JSON.parse(
      hashes.deobfuscateNameUsingKey(header, encKey)
    )
  } catch (e) {
    logger.trace(e, 'Got unparsable synthetics header: %s', header)
    return
  }

  if (!util.isArray(synthData)) {
    logger.trace(
      'Synthetics data is not an array: %s (%s)',
      synthData,
      typeof synthData
    )
    return
  }


  if (synthData.length < Object.keys(parsedData).length) {
    logger.trace(
      'Synthetics header length is %s, expected at least %s',
      synthData.length,
      Object.keys(parsedData).length
    )
  }

  parsedData.version = synthData[0]
  if (parsedData.version !== 1) {
    logger.trace(
      'Synthetics header version is not 1, got: %s (%s)',
      parsedData.version,
      synthData
    )
    return
  }

  parsedData.accountId = synthData[1]
  if (parsedData.accountId) {
    if (trustedIds.indexOf(parsedData.accountId) === -1) {
      logger.trace(
        'Synthetics header account ID is not in trusted account IDs: %s (%s)',
        parsedData.accountId,
        trustedIds
      )
      return
    }
  } else {
    logger.trace('Synthetics header account ID missing.')
    return
  }

  parsedData.resourceId = synthData[2]
  if (!parsedData.resourceId) {
    logger.trace('Synthetics resource ID is missing.')
    return
  }

  parsedData.jobId = synthData[3]
  if (!parsedData.jobId) {
    logger.trace('Synthetics job ID is missing.')
  }

  parsedData.monitorId = synthData[4]
  if (!parsedData.monitorId) {
    logger.trace('Synthetics monitor ID is missing.')
  }

  return parsedData
}
