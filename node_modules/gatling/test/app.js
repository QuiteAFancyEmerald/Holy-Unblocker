module.exports = function(req, res) {

    var headers = {
        "content-type": "text/plain"
    };

    if (req.path == "/ok") {
        res.writeHead(200, headers);
        res.end('ok');
    } else if (req.path == "/slow") {
        res.writeHead(200, headers);
        setTimeout(function() {
            res.end('slow');
        }, 500);
    } else if (req.path == "/error") {
        throw new Error("omg! error!");
    } else {
        res.writeHead(404, headers);
        res.end('file not found');
    }
};
