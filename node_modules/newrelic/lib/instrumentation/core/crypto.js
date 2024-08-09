'use strict'

var wrap = require('../../shimmer').wrapMethod

module.exports = initialize

function initialize(agent, crypto) {
  wrap(
    crypto,
    'crypto',
    [
      'pbkdf2',
      'randomBytes',
      'pseudoRandomBytes',
      'randomFill'
    ],
    wrapCryptoMethod
  )

  function wrapCryptoMethod(fn, method) {
    return agent.tracer.wrapFunctionLast('crypto.' + method, null, wrappedCrypto)

    function wrappedCrypto() {
      return fn.apply(this, arguments)
    }
  }
}
