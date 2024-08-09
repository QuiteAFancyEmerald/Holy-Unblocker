'use strict'

var util = require('util')
var hashes = require('./hashes')
var logger = require('../logger').child({component: 'cat'})

module.exports.handleCatHeaders = handleCatHeaders
module.exports.parsedHeadersToTrans = parsedHeadersToTrans

function handleCatHeaders(incomingCatId, obfTransaction, encKey, transaction) {
  var parsedCatId = null
  if (incomingCatId) {
    parsedCatId = hashes.deobfuscateNameUsingKey(
      incomingCatId,
      encKey
    )
  }

  var externalTrans = null
  if (obfTransaction) {
    try {
      externalTrans = JSON.parse(
        hashes.deobfuscateNameUsingKey(obfTransaction, encKey)
      )
    } catch (e) {
      logger.trace(
        'Got an unparsable CAT header x-newrelic-transaction: %s',
        obfTransaction
      )
    }
  }

  parsedHeadersToTrans(parsedCatId, externalTrans, transaction)
}

function parsedHeadersToTrans(parsedCatId, externalTrans, transaction) {
  if (typeof parsedCatId === 'string') {
    transaction.incomingCatId = parsedCatId
  }

  if (util.isArray(externalTrans)) {
    transaction.referringTransactionGuid = externalTrans[0]
    if (typeof externalTrans[2] === 'string') {
      transaction.tripId = externalTrans[2]
    } else if (externalTrans[2]) {
      transaction.invalidIncomingExternalTransaction = true
    }

    if (_isValidReferringHash(externalTrans[3])) {
      transaction.referringPathHash = externalTrans[3]
    } else if (externalTrans[3]) {
      transaction.invalidIncomingExternalTransaction = true
    }
  }
}

function _isValidReferringHash(hash) {
  return (typeof hash === 'string')
}
