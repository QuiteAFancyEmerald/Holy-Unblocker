# Corrosion
Titanium Networks main web proxy.
Successor to [Alloy](https://github.com/titaniumnetwork-dev/alloy)
# Installation:
```
npm i corrosion
```

# Example:
```javascript
const Corrosion = require('corrosion');
const proxy = new Corrosion();
const http = require('http')
http.createServer((req, res) => 
  proxy.request(req, res) // Request Proxy
).on('upgrade', (req, socket, head) => 
  proxy.upgrade(req, socket, head) // WebSocket Proxy
).listen(80);
```
Much more in depth one is in the [demo folder](demo/).

# API:
  
  
## Index
-  `config`
   - `prefix` String - URL Prefix
   - `title` (Boolean / String) - Title used for HTML documents
   - `ws` Boolean - WebSocket rewriting
   - `cookie` Boolean - Request Cookies
   - `codec` String - URL encoding (base64, plain, xor).
   - `requestMiddleware` Array - Array of [middleware](#middleware) functions for proxy request (Server). 
   - `responseMiddleware` Array - Array of [middleware](#middleware) functions for proxy response (Server).
   - `standardMiddleware` Boolean - Use the prebuilt [middleware](#middleware) used by default (Server). 

#### request
  - `request` Request
  - `response` Response

#### upgrade
  - `request` Request
  - `socket` Socket
  - `head` Head

#### bundleScripts
Bundles scripts for client injection. Important when updating proxy.

## Properties
  - [url](#url)
  - [html](#html)
  - [js](#js)
  - [css](#css)
  - [cookies](#cookies)
  - [config](#index)
  - [codec](#codec)
  - [prefix](#url)



## url 

#### wrap
  - `val` String
  - `config` Configuration
    - `base` WHATWG URL
    - `origin` Location origin - Adds a location origin before the proxy url
    - `flags` Array - ['xhr'] => /service/xhr_/https%3A%2F%2Fexample.org/

#### unwrap
  - `val` String
  - `config` Configuration
    - `origin` Location origin - Required if a location origin starts before the proxy url
    - `flags` Boolean - Returns with both the URL and flags found { value: 'https://example.org', flags: ['xhr'], })
    - `leftovers` Boolean - Use any leftovers if any after the encoded proxy url


## Properties
  - `regex` Regex used to determine to rewrite the URL or not.

  - `prefix` URL Prefix

  - `codec` (base64, plain, xor)


## js

#### process
  - `source` JS script
  - `url` URL for heading

#### iterate
  - `ast` JS AST
  - `Callback` Handler initated on AST node

#### createHead
  - `url` URL for heading

#### createCallExperssion 
  - `callee` Acorn.js Node
  - `args` Array

#### createArrayExpression
  - `elements` Array

#### createIdentifier
  - `name` Identifier name
  - `preventRewrite` Prevent further rewrites

#### createLiteral
  - `value` Literal value

## css

#### process
  - `source` CSS
  - `config` Configuration
    - `base` WHATWG URL
    - `origin` Location origin
    - `context` CSS-Tree context

## html

#### process
  - `source` HTML Source 
  - `config` Configuration
    - `document` Determines of its a document or fragment for parsing
    - `base` WHATWG URL
    - `origin` Location origin

#### source
  - `processed` Rewritten HTML
  - `config` Configuration
    - `document` Determines of its a document or fragment for parsing

### Properties
- `map` Map for attribute rewriting


## cookies

#### encode
  - `input` New (Cookie / Cookies)
  - `config` Configuration
    - `url` WHATWG URL
    - `domain` Cookie Domain
    - `secure` Cookie Secure

#### decode
  - `store` Encoded Cookies
  - `config` Configuration
    - `url` WHATWG URL

## codec

#### encode
#### decode
  - `str` String

## middleware

Middleware are functions that will be executed either before request or after response. These can alter the way a request is made or response is sent.

```javascript
function(ctx) {r
  ctx.body; // (Request / Response) Body (Will return null if none)
  ctx.headers; // (Request / Response) Headers
  ctx.url; // WHATWG URL
  ctx.flags; // URL Flags
  ctx.origin; // Request origin
  ctx.method; // Request method
  ctx.rewrite; // Corrosion object
  ctx.statusCode; // Response status (Only available on response)
  ctx.agent; // HTTP agent
  ctx.address; // Address used to make remote request
  ctx.clientSocket; // Node.js Server Socket (Only available on upgrade)
  ctx.clientRequest; // Node.js Server Request
  ctx.clientResponse; // Node.js Server Response
  ctx.remoteResponse; // Node.js Remote Response (Only available on response)
};
```

### Default middleware

- Request
  - requestHeaders

- Response
  - responseHeaders
  - decompress
  - rewriteBody

### Available Middleware

#### address (Request)
  - `arr` Array of IP addresses to use in request

```javascript
const Corrosion = require('corrosion');
const proxy = new Corrosion({
  requestMiddleware: [
    Corrosion.middleware.address([ 
      0.0.0.0, 
      0.0.0.0 
    ]),  
  ],
});
```

### blacklist
  - `arr` Array of hostnames to block clients from seeing
  -  `page` Block page

```javascript
const Corrosion = require('corrosion');
const proxy = new Corrosion({
  requestMiddleware: [
    Corrosion.middleware.blacklist([ 
      'example.org',
      'example.com',
    ], 'Page is blocked'),  
  ],
});
```
