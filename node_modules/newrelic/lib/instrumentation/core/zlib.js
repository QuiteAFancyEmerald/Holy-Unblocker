'use strict'

var wrap = require('../../shimmer').wrapMethod

module.exports = initialize

var methods = [
  'deflate',
  'deflateRaw',
  'gzip',
  'gunzip',
  'inflate',
  'inflateRaw',
  'unzip'
]

function initialize(agent, zlib) {
  var noSegment = agent.tracer.wrapFunctionNoSegment.bind(agent.tracer)
  if (zlib.Deflate && zlib.Deflate.prototype) {
    var proto = Object.getPrototypeOf(zlib.Deflate.prototype)
    if (proto._transform) {
      // streams2
      wrap(proto, 'zlib', '_transform', noSegment)
    } else if (proto.write && proto.flush && proto.end) {
      // plain ol' streams
      wrap(proto, 'zlib', ['write', 'flush', 'end'], noSegment)
    }
  }

  wrap(zlib, 'zlib', methods, segment)

  function segment(fn, method) {
    return agent.tracer.wrapFunctionLast('zlib.' + method, null, fn)
  }
}
