var vows = require('./'),
    assert = require('assert');

vows.describe('basic-formulation').addBatch({
    "An invocation with no query string": {
        topic: function() {
            request.get("http://localhost:8080/something", this.callback);
        },

        "does not fail": function(error, response, body) {
            assert.notEqual(true, error);
        },

        "receives a response": {
            "with status 200": function(error, response, body) {
                assert.equal(200, response.statusCode);
            }
        }
    }
}).export(module);