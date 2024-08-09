'use strict'

var logger = require('../logger.js').child({component: 'name-state'})
var arrayUtil = require('../util/arrays')


/**
 * Manages transaction names using a stack of paths.
 *
 * @constructor
 */
function NameState(prefix, verb, delimiter, path) {
  this.setName(prefix, verb, delimiter, path)
}

NameState.prototype.setName = function setName(prefix, verb, delimiter, path) {
  this.setPrefix(prefix)
  this.verb = verb
  this.delimiter = delimiter
  this.pathStack = path ? [path] : []
  logger.trace('setName called on name state, path stack now %j', this.pathStack)
}

/**
 * Sets the metric prefix (i.e. Expressjs).
 */
NameState.prototype.setPrefix = function setPrefix(prefix) {
  if (prefix === null) {
    this.prefix = null
    return
  }
  this.prefix = (prefix[prefix.length - 1] === '/') ?
    prefix.substring(0, prefix.length - 1) : prefix
}

/**
 * Sets the HTTP verb (i.e. GET/POST/PUT)
 */
NameState.prototype.setVerb = function setVerb(verb) {
  this.verb = verb
}

/**
 * Sets the delimiter character used to separate the http verb from the path.
 */
NameState.prototype.setDelimiter = function setDelimiter(delimiter) {
  this.delimiter = delimiter
}

/**
 * Pushes a new path element onto the naming stack.
 */
NameState.prototype.appendPath = function appendPath(path) {
  if (path) {
    var strPath = path instanceof RegExp ? path.source : String(path)
    this.pathStack.push(strPath)
    logger.trace('Appended %s to path stack', strPath)
  }
}

/**
 * Pushes a new path element onto the naming stack if the stack is
 * empty.
 */
NameState.prototype.appendPathIfEmpty = function appendPathIfEmpty(path) {
  if (path && this.pathStack.length === 0) {
    var strPath = path instanceof RegExp ? path.source : String(path)
    this.pathStack.push(strPath)
    logger.trace('Appended %s to path stack', strPath)
  }
}

/**
 * Pops the last element off the name stack.
 *
 * If `path` is provided, the stack is popped back to the first element matching
 * `path`. If no element matches, the stack is left unchanged.
 *
 * @param {string} [path] - Optional. A path piece to pop back to.
 */
NameState.prototype.popPath = function popPath(path) {
  if (this.pathStack.length === 0) {
    return
  }

  if (path) {
    var idx = arrayUtil.findLastIndex(this.pathStack, function pathMatch(a) {
      return a === path
    })
    if (idx !== -1) {
      this.pathStack.splice(idx)
    }
  } else {
    this.pathStack.pop()
  }
}

NameState.prototype.getName = function getName() {
  if (this.pathStack.length === 0) return null // nameState initialized but never set

  var path = this.pathStack.join('/').replace(/[/]{2,}/g, '/')
  if (path && path[0] !== '/') {
    path = '/' + path
  } // path now looks like /one/two/three

  return _getName(this, path)
}

NameState.prototype.getNameNotFound = function getNameNotFound() {
  return _getName(this, '(not found)')
}

NameState.prototype.reset = function reset() {
  logger.trace('Reset called on name state, path stack was %j', this.pathStack)
  this.prefix = null
  this.verb = null
  this.delimiter = null
  this.pathStack = []
}

function _getName(nameState, path) {
  var verb = nameState.verb ? '/' + nameState.verb : ''
  return (nameState.prefix || '') + verb + (nameState.delimiter || '') + path
}

module.exports = NameState
