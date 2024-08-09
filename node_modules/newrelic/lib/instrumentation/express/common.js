'use strict'

var NAMES = require('../../metrics/names.js')


module.exports.ensurePartialName = ensurePartialName


// Ensures that partialName begins with the express prefix
// http instrumentation will set partialName before passing the request off to express
function ensurePartialName(trans) {
  if (trans.nameState.getName() == null ||
      trans.nameState.prefix !== NAMES.EXPRESS.PREFIX) {
    trans.nameState.setPrefix(NAMES.EXPRESS.PREFIX)
    trans.nameState.setVerb(trans.verb)
    trans.nameState.setDelimiter(NAMES.ACTION_DELIMITER)
  }
}
