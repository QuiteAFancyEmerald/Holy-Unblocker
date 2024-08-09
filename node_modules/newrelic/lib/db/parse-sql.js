'use strict'

var logger = require('../logger').child({component: 'parse_sql'})
var StatementMatcher = require('./statement-matcher')
var ParsedStatement = require('./parsed-statement')
var stringifySync = require('../util/safe-json').stringifySync


var OPERATIONS = [
  new StatementMatcher('select', /^\s*select[\S\s]*from[\s\[]+([^\]\s,)(;]*).*/gi),
  new StatementMatcher('update', /^\s*update\s+([^\s,;]*).*/gi),
  new StatementMatcher('insert', /^\s*insert(?:\s+ignore)?\s+into\s+([^\s(,;]*).*/gi),
  new StatementMatcher('delete', /^\s*delete\s+from\s+([^\s,(;]*).*/gi)
]
var COMMENT_PATTERN = /\/\\*.*?\\*\//

// This must be called syncronously after the initial db call for backtraces to
// work correctly

module.exports = function parseSql(type, sql) {
  // Sometimes we get an object here from MySQL. We have been unable to
  // reproduce it, so we'll just log what that object is and return a statement
  // type of `other`.
  if (typeof sql === 'object' && sql.sql !== undefined) sql = sql.sql
  if (typeof sql !== 'string') {
    logger.trace(
      'parseSQL got an a non-string sql that looks like: %s',
      stringifySync(sql)
    )
    return new ParsedStatement(type, 'other', null, sql)
  }

  sql = sql.replace(COMMENT_PATTERN, '').trim()


  var parsedStatement

  for (var i = 0, l = OPERATIONS.length; i < l; i++) {
    parsedStatement = OPERATIONS[i].getParsedStatement(type, sql)
    if (parsedStatement) {
      return parsedStatement
    }
  }

  return new ParsedStatement(type, 'other', null, sql)
}
