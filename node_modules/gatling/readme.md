Gatling
=======
A simple node.js script that turns a single-threaded server into a multi-process [cluster]'d server with [domain]s automatic restarting.

Plays nice with Express and similar servers.

[![Build Status](https://travis-ci.org/nfriedly/node-gatling.png?branch=master)](https://travis-ci.org/nfriedly/node-gatling)

Installation
------------

    npm install --save gatlin

Setup
-----

Instead of starting the server, simply export the handler function and then call gatlin with the path to your `server.js` or `app.js`.

(The reason this is needed is that Gatlin runs each request inside a domain. This prevents errors in one request from interfering with any other requests.)

### Express

Just change

 ```js
 app.listen(port)
 ```
 
 to

```js
module.exports = app;
```

### HTTP

Your app should export the function that gets passed to `http.createServer` and not create the server itself.

For example, say your `app.js` looks like this:

```js
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337);
```
    
Change it to this:

```js
module.exports = function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});
```

### `package.json`

Add a `scripts.start` entry like so:

```js
{
  //...
  "scripts": {
    "start": "gatling app.js"
  }
}

Usage
-----

To start your server, run `npm start`. Or, to call gatling directly, run `./node_modules/bin/gatling app.js`

Gatling automatically loads `newrelic` if the `NEW_RELIC_LICENSE_KEY` environment variable is set.
    

API
---

The following command line options are accepted

`-p 1234`, `--port 1234`: defaults to the `PORT` or `VCAP_APP_PORT` (bluemix) environment properties, or 8080 if not set.
`-q`, `--quiet`: silences all non-error output
`--processes 2`: Set the number of worker processes. Defaults to one per CPU core.





Todo: 
-----

* Add support for just requiring the `app.js` and letting it start itself
* more tests
* Improve startup error detection


[cluster]: https://nodejs.org/api/cluster.html
[domain]: https://nodejs.org/api/domain.html
