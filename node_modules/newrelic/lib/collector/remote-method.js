'use strict'

var util = require('util')
var url = require('url')
var http = require('http')
var https = require('https')
var zlib = require('zlib')
var logger = require('../logger').child({component: 'remote_method_invoke'})
var parse = require('./parse-response')
var safeJSON = require('../util/safe-json')
var Sink = require('../util/stream-sink')
var agents = require('./http-agents')
var certificates = require('./ssl/certificates')

/*
 *
 * CONSTANTS
 *
 */
var PROTOCOL_VERSION = 14
var RUN_ID_NAME = 'run_id'
var RAW_METHOD_PATH = '/agent_listener/invoke_raw_method'
  // see job/collector-master/javadoc/com/nr/servlet/AgentListener.html on NR Jenkins
var USER_AGENT_FORMAT = "NewRelic-NodeAgent/%s (nodejs %s %s-%s)"
var ENCODING_HEADER = 'CONTENT-ENCODING'
var CONTENT_TYPE_HEADER = 'Content-Type'
var DEFAULT_ENCODING = 'identity'
var DEFAULT_CONTENT_TYPE = 'application/json'
var COMPRESSED_CONTENT_TYPE = 'application/octet-stream'


function RemoteMethod(name, config) {
  if (!name) {
    throw new TypeError("Must include name of method to invoke on collector.")
  }

  this.name = name
  this._config = config
}

RemoteMethod.prototype.serialize = function serialize(payload, callback) {
  try {
    var res = safeJSON.stringifySync(payload)
  } catch (error) {
    logger.error(error, "Unable to serialize payload for method %s.", this.name)
    return process.nextTick(function cb_nextTick() {
      return callback(error)
    })
  }
  return callback(null, res)
}

/**
 * The primary operation on RemoteMethod objects. If you're calling anything on
 * RemoteMethod objects aside from invoke (and you're not writing test code),
 * you're doing it wrong.
 *
 * @param object   payload    Serializable payload.
 * @param Function callback   What to do next. Gets passed any error.
 */
RemoteMethod.prototype.invoke = function call(payload, callback) {
  if (!payload) payload = []

  this.serialize(payload, function cb_serialize(err, serialized) {
    if (err) return callback(err)
    this._post(serialized, callback)
  }.bind(this))
}

/**
 * Take a serialized payload and create a response wrapper for it before
 * invoking the method on the collector.
 *
 * @param string   methodName Name of method to invoke on collector.
 * @param string   data       Serialized payload.
 * @param Function callback   What to do next. Gets passed any error.
 */
RemoteMethod.prototype._post = function _post(data, callback) {
  var method = this

  // set up standard response handling
  function onResponse(response) {
    response.on('end', function handle_end() {
      logger.debug(
        "Finished receiving data back from the collector for %s.",
        method.name
      )
    })

    response.setEncoding('utf8')
    response.pipe(new Sink(parse(method.name, response, callback)))
  }

  var options = {
    port: this._config.port,
    host: this._config.host,
    compressed: this._shouldCompress(data),
    path: this._path(),
    onError: callback,
    onResponse: onResponse
  }

  if (options.compressed) {
    logger.trace({data: data}, "Sending %s on collector API with (COMPRESSED)", this.name)

    var useGzip = this._config.compressed_content_encoding === 'gzip'
    var compressor = useGzip ? zlib.gzip : zlib.deflate
    compressor(data, function cb_compressor(err, compressed) {
      if (err) {
        logger.warn(err, "Error compressing JSON for delivery. Not sending.")
        return callback(err)
      }

      options.body = compressed
      method._safeRequest(options)
    })
  } else {
    logger.debug({data: data}, "Calling %s on collector API", this.name)

    options.body = data
    this._safeRequest(options)
  }
}

/**
 * http.request does its own DNS lookup, and if it fails, will cause
 * dns.lookup to throw asynchronously instead of passing the error to
 * the callback (which is obviously awesome). To prevent New Relic from
 * crashing people's applications, verify that lookup works and bail out
 * early if not.
 *
 * Also, ensure that all the necessary parameters are set before
 * actually making the request. Useful to put here to simplify test code
 * that calls _request directly.
 *
 * @param object options A dictionary of request parameters.
 */
RemoteMethod.prototype._safeRequest = function _safeRequest(options) {
  if (!options) throw new Error("Must include options to make request!")
  if (!options.host) throw new Error("Must include collector hostname!")
  if (!options.port) throw new Error("Must include collector port!")
  if (!options.onError) throw new Error("Must include error handler!")
  if (!options.onResponse) throw new Error("Must include response handler!")
  if (!options.body) throw new Error("Must include body to send to collector!")
  if (!options.path) throw new Error("Must include URL to request!")

  var protocol = this._config.ssl ? 'https' : 'http'
  var logconfig = this._config.logging
  var audit_log = this._config.audit_log
  var logevent = util.format({
    body: Buffer.isBuffer(options.body) ? 'Buffer ' + options.body.length : options.body
  }, "Posting to %s://%s:%s%s",
    protocol,
    options.host,
    options.port,
    options.path
  )
  // if trace level is not explicity enabled
  // check to see if the audit log is enabled
  if ((typeof logconfig !== 'undefined') && logconfig.level !== 'trace') {
    if (audit_log.enabled &&
          // if the filter property is empty, then always log the event
          // otherwise check to see if the filter includes this method
          (audit_log.endpoints.length > 0 ?
           audit_log.endpoints.indexOf(this.name) > -1 : true)) {
      logger.info(logevent)
    }
  } else {
    logger.trace(logevent)
  }


  this._request(options)
}

/**
 * Generate the request headers and wire up the request. There are many
 * parameters used to make a request:
 *
 * @param string   options.host       Hostname (or proxy hostname) for collector.
 * @param string   options.port       Port (or proxy port) for collector.
 * @param string   options.path       URL path for method being invoked on collector.
 * @param string   options.body       Serialized payload to be sent to collector.
 * @param boolean  options.compressed Whether the payload has been compressed.
 * @param Function options.onError    Error handler for this request (probably the
 *                                    original callback given to .send).
 * @param Function options.onResponse Response handler for this request (created by
 *                                    ._post).
 */
RemoteMethod.prototype._request = function _request(options) {
  var requestOptions = {
    method: this._config.put_for_data_send ? 'PUT' : 'POST',
    setHost: false,         // See below
    host: options.host,     // Set explicitly in the headers
    port: options.port,
    path: options.path,
    headers: this._headers(options.body, options.compressed),
    __NR__connection: true  // Who measures the metrics measurer?
  }
  var request

  var isProxy = !!(
    this._config.proxy ||
    this._config.proxy_port ||
    this._config.proxy_host
  )

  if (isProxy) {
    // proxy
    requestOptions.agent = agents.proxyAgent(this._config)
    request = https.request(requestOptions)

    // FIXME: The agent keeps this connection open when using the proxy.
    // This will prevent the application from shutting down correctly.
    // Explicitly destroy the socket when the response is completed.
    //
    // This goes against keep-alive, but for now letting the application die
    // gracefully is more important.
    request.on('response', function cb_on_response(sock) {
      sock.on('end', function cb_on_end() {
        sock.destroy()
      })
    })
  } else if (this._config.ssl) {
    if (this._config.certificates && this._config.certificates.length > 0) {
      logger.debug(
        'Adding custom certificate to the cert bundle.'
      )
      requestOptions.ca = this._config.certificates.concat(certificates)
    }
    request = https.request(requestOptions)
  } else {
    request = http.request(requestOptions)
  }

  request.on('error', options.onError)
  request.on('response', options.onResponse)

  request.end(options.body)
}

/**
 * See the constants list for the format string (and the URL that explains it).
 */
RemoteMethod.prototype._userAgent = function _userAgent() {
  return util.format(USER_AGENT_FORMAT,
                     this._config.version,
                     process.versions.node,
                     process.platform,
                     process.arch)
}

/**
 * Generate a URL the collector understands.
 *
 * @returns string The URL path to be POSTed to.
 */
RemoteMethod.prototype._path = function _path() {
  var query = {
      marshal_format: 'json',
      protocol_version: PROTOCOL_VERSION,
      license_key: this._config.license_key,
      method: this.name
  }

  if (this._config.run_id) query[RUN_ID_NAME] = this._config.run_id

  var formatted = url.format({
    pathname: RAW_METHOD_PATH,
    query: query
  })

  return formatted
}

/**
 * @param {number}  length      - Length of data to be sent.
 * @param {bool}    compressed  - The compression method used, if any.
 */
RemoteMethod.prototype._headers = function _headers(body, compressed) {
  var agent = this._userAgent()

  var headers = {
    // select the virtual host on the server end
    'Host': this._config.host,
    'User-Agent': agent,
    'Connection': 'Keep-Alive',
    'Content-Length': byteLength(body)
  }

  if (compressed) {
    headers[ENCODING_HEADER] = this._config.compressed_content_encoding
    headers[CONTENT_TYPE_HEADER] = COMPRESSED_CONTENT_TYPE
  } else {
    headers[ENCODING_HEADER] = DEFAULT_ENCODING
    headers[CONTENT_TYPE_HEADER] = DEFAULT_CONTENT_TYPE
  }

  return headers
}

/**
 * FLN pretty much decided on his own recognizance that 64K was a good point
 * at which to compress a server response. There's only a loose consensus that
 * the threshold should probably be much higher than this, if only to keep the
 * load on the collector down.
 *
 * FIXME: come up with a better heuristic
 */
RemoteMethod.prototype._shouldCompress = function _shouldCompress(data) {
  return data && byteLength(data) > 65536
}

function byteLength(data) {
  if (!data) {
    return 0
  }

  if (data instanceof Buffer) {
    return data.length
  }

  return Buffer.byteLength(data, 'utf8')
}

module.exports = RemoteMethod
