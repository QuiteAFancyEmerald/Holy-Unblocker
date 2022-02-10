var express = require('express')
  , path = require('path');

var app = express();
var port = process.env.PORT || 3000;

app.all('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ping', function (req, res) {
  res.send('pong');
})

app.get('/manifest.webapp', function(req, res){
	res.header('Content-Type', 'application/x-web-app-manifest+json');
	res.sendfile('manifest.webapp');
});

app.use(express.static(path.join(__dirname, '')));

app.listen(port, function(){
  console.log("Express server listening on port " + port);
});
