const http = require('http');
const express = require('express');
const unblocker = require('unblocker');

const userAgent = require('./user-agent.js');

const app = express();

app.use(unblocker({
  requestMiddleware: [
    userAgent('my-cool-user-agent/1.0'),
  ]
}));

app.get('/', (req, res) => res.end('Use the format http://thissite.com/proxy/http://site-i-want.com/ to access the proxy.'));

app.listen(8080);

console.log('app listening on port 8080. Test at http://localhost:8080/proxy/https://duckduckgo.com/?q=what%27s+my+user+agent&atb=v130-1ei&ia=answer')