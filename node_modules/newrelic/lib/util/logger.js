'use strict'

var stringifySync = require('./safe-json').stringifySync
var util = require('util')
var Readable = require('readable-stream')
var os = require('os')

module.exports = Logger

var LEVELS = {
  'trace': 10,
  'debug': 20,
  'info': 30,
  'warn': 40,
  'error': 50,
  'fatal': 60
}

util.inherits(Logger, Readable)

function Logger(options, extra) {
  if (!(this instanceof Logger)) {
    return new Logger(options, extra)
  }

  Readable.call(this)
  var passedInLevel = this.coerce(options.level)
  this.options = {
    _level: passedInLevel,
    enabled: options.enabled === undefined ? true : options.enabled
  }
  this.name = options.name
  this.hostname = options.hostname || os.hostname()
  this.extra = extra || {}
  this.buffer = ''
  this.reading = false
  if (options.stream) {
    this.pipe(options.stream)
  }
}

var loggingFunctions = {}

Object.keys(LEVELS).forEach(function buildLevel(_level) {
  function log(extra) {
    var level = Logger.prototype.coerce(LEVELS[_level])
    if (!this.options.enabled) return false
    if (level < this.options._level) return false

    var has_extra = typeof extra === 'object'
    var args = Array.prototype.slice.call(arguments, has_extra ? 1 : 0)
    return this.write(level, args, has_extra ? extra : null)
  }

  loggingFunctions[_level] = function checkLevel() {
    log.apply(this, arguments)
  }

  var seenMessages = {}
  loggingFunctions[_level + 'Once'] = function logOnce(key) {
    if (typeof key !== 'string') {
      this.debug('Attempted to key on a non-string in ' + _level + 'Once: ' + key)
      return
    }

    var level = Logger.prototype.coerce(LEVELS[_level])
    if (!this.options.enabled) return false
    if (level < this.options._level) return false

    if (seenMessages[key] !== true) {
      var args = Array.prototype.slice.call(arguments, 1)
      var writeSuccessful = log.apply(this, args)

      if (writeSuccessful) {
        seenMessages[key] = true
      }
    }
  }

  var seenPerInterval = {}
  loggingFunctions[_level + 'OncePer'] = function logOncePer(key, interval) {
    if (typeof key !== 'string') {
      this.debug('Attempted to key on a non-string in ' + _level + 'Once: ' + key)
      return
    }

    var level = Logger.prototype.coerce(LEVELS[_level])
    if (!this.options.enabled) return false
    if (level < this.options._level) return false

    if (seenPerInterval[key] !== true) {
      var args = Array.prototype.slice.call(arguments, 2)
      var writeSuccessful = log.apply(this, args)

      if (writeSuccessful) {
        seenPerInterval[key] = true

        var clearSeen = setTimeout(function clearKey() {
          delete seenPerInterval[key]
        }, interval)

        if (clearSeen.unref !== undefined) {
          clearSeen.unref()
        }
      }
    }
  }
})

util._extend(Logger.prototype, loggingFunctions)

Logger.prototype.coerce = function coerce(value) {
  if (!isNaN(parseInt(value, 10)) && isFinite(value)) {
    // value is numeric
    if (value < 10) value = 10
    if (value > 60) value = 60

    return value
  }
  return LEVELS[value] || 50
}

Logger.prototype.child = function child(extra) {
  var childLogger = Object.create(loggingFunctions)

  childLogger.extra = util._extend({}, this.extra)
  util._extend(childLogger.extra, extra)

  var parent = this
  childLogger.options = parent.options

  childLogger.write = function write(level, args, extra) {
    extra = getPropertiesToLog(extra)
    var selfExtra = util._extend({}, this.extra)

    extra = util._extend(selfExtra, extra)
    return parent.write(level, args, extra)
  }

  childLogger.setEnabled = Logger.prototype.setEnabled
  childLogger.child = Logger.prototype.child

  return childLogger
}

Logger.prototype.level = function level(lvl) {
  this.options._level = this.coerce(lvl)
}

Logger.prototype.setEnabled = function setEnabled(enabled) {
  if (typeof enabled === 'boolean') {
    this.options.enabled = enabled
  }
}

Logger.prototype._read = function _read() {
  if (this.buffer.length !== 0) {
    this.reading = this.push(this.buffer)
    this.buffer = ''
  } else {
    this.reading = true
  }
}

/**
 * For performance reasons we do not support %j because we will have
 * already converted the objects to strings.
 * Returns a boolean representing the status of the write
 * (success/failure)
 */
Logger.prototype.write = function write(level, args, extra) {
  for (var i = 0, l = args.length; i < l; ++i) {
    if (typeof args[i] === 'function') {
      args[i] = args[i].valueOf()
    } else if (typeof args[i] === 'object') {
      args[i] = stringifySync(args[i])
    }
  }

  var entry = new Entry(this, level, util.format.apply(util, args))

  util._extend(entry, this.extra)
  util._extend(entry, getPropertiesToLog(extra))

  if (this.reading) {
    this.reading = this.push(stringifySync(entry) + '\n')
  } else {
    this.buffer += stringifySync(entry) + '\n'
  }
  return true
}

function Entry(logger, level, msg) {
  this.v = 0
  this.level = level
  this.name = logger.name
  this.hostname = logger.hostname
  this.pid = process.pid
  this.time = new Date().toISOString()
  this.msg = msg
}

function getPropertiesToLog(extra) {
  var obj = util._extend({}, extra)
  // Error properties (message, stack) are not enumerable, so getting them directly
  if (extra instanceof Error) {
    var names = Object.getOwnPropertyNames(extra)
    if (names) {
      for (var i = 0; i < names.length; i++) {
        obj[names[i]] = extra[names[i]]
      }
    }
  }
  return obj
}
