// Note: make sure you use Alloy before any other Express middleware that sends responses to client or handles POST data.

const Alloy = require('alloyproxy'),
    http = require('http'),
    express = require('express'),
    app = express();
    
const server = http.createServer(app);   

const Unblocker = new Alloy({
    prefix: '/fetch/',
    request: [],
    response: [],
    injection: true,
});    
 
// The main part of the proxy. 
 
app.use(Unblocker.app);    


// Do your stuff here! :3

// WebSocket handler.

Unblocker.ws(server);    


server.listen('8080')
