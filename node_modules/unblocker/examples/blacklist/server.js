const http = require('http');
const express = require('express');
const unblocker = require('unblocker');

const blacklist = require('./blacklist.js');

const app = express();

app.use(unblocker({
  requestMiddleware: [
    blacklist({
      blockedDomains: ['example.com'],
      message: 'The requested url is not permitted.',
    }),
  ]
}));

app.get('/', (req, res) => res.redirect('/proxy/https://en.wikipedia.org/wiki/Main_Page'));

app.listen(8080);

console.log('app listening on port 8080. Test at http://localhost:8080/')