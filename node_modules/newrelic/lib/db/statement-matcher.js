'use strict'

var ParsedStatement = require('./parsed-statement')


function StatementMatcher(operation, operationPattern) {
  this.operation = operation
  this.operationPattern = operationPattern
}

StatementMatcher.prototype.getParsedStatement = function getParsedStatement(type, sql) {
  this.operationPattern.lastIndex = 0

  var match = new RegExp("^\\s*" + this.operation, "ig").test(sql)
  if (match) {
    var queryMatch = this.operationPattern.exec(sql)
    var model = queryMatch ? queryMatch[1] : 'unknown'

    return new ParsedStatement(type, this.operation, model, sql)
  }
}

module.exports = StatementMatcher
