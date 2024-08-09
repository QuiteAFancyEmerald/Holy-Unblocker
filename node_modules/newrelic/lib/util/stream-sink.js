'use strict'

var EventEmitter = require('events').EventEmitter
var util = require('util')


/**
 * Pipe a readable stream into this sink that fulfills the Writable Stream
 * contract and the callback will be fired when the stream has been completely
 * read.
 */
function StreamSink(callback) {
  EventEmitter.call(this)

  this.callback = callback
  this.sink = ''
  this.writable = true

  var sink = this
  this.on('error', function handle_error(error) {
    sink.writable = false
    callback(error)
  })
}
util.inherits(StreamSink, EventEmitter)

StreamSink.prototype.write = function write(string) {
  if (!this.writable) {
    this.emit('error', new Error("Sink no longer writable!"))
    return false
  }

  // Explicitly copy buffer contents so we are sure to release references to
  // the TLS slab buffer region.
  this.sink += string.toString()

  return true
}

StreamSink.prototype.end = function end() {
  this.writable = false

  this.callback(null, this.sink)
}

StreamSink.prototype.destroy = function destroy() {
  this.emit('close')
  this.writable = false

  delete this.sink
}

module.exports = StreamSink
