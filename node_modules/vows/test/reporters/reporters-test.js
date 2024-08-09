var fs = require('fs');
var path = require('path');
var vows = require('../../lib/vows');
var assert = require('assert');

var reporterPath = path.join(__dirname, '..', '..', 'lib', 'vows', 'reporters')
var reporters = fs.readdirSync(reporterPath).reduce(function (acc, name) {
  acc[name] = require(path.join(reporterPath, name));
  return acc;
}, {})

vows.describe('vows/reporters').addBatch(
  Object.keys(reporters).reduce(function (acc, name) {
    acc[name] = {
      topic: reporters[name],
      'should have the setStream() method': function (reporter) {
        assert.isFunction(reporter.setStream);
      }
    };

    return acc;
  }, {})
).export(module);