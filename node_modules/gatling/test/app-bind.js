module.exports = function(req, res) {

    var headers = {
        "content-type": "text/plain"
    };

    res.writeHead(200, headers);
    res.end('ok');
};

// for some versions of express, app.bind is a function that throws if it doesn't like the arguments
module.exports.bind = function() {
    throw new Error("Bah!");
};
