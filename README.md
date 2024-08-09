# Alloy Proxy

A node.js proxy that features URL encoding, and amazing compatablity!

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/titaniumnetwork-dev/alloyproxy/)

# How to install and use:

`git clone https://github.com/titaniumnetwork-dev/alloyproxy.git`

`cd alloyproxy`

`npm install`

`npm start`

The default place for the proxy when its started is `http://localhost:8080` but feel free to change it in config.json!

# How the proxy works:

The proxy works by using node-fetch (Basically Window.fetch ported to Node-js). 
Basically what the app is doing is node-fetch is sending the request to the server then
the app sends the response back to the server with the modifactions made to the attributes and elements.

When a attribute is rewritten, depending on the contents inside. It will turn:

`href="/assets/js/main.js"` into `href="/fetch/websiteURL/assets/js/main.js"`.

A porition of its rewriting is in client-side JS so `Element.setAttribute`, `window.fetch()`, XMLHttpRequest, and more are rewritten.

# Implementing your website in Alloyproxy

To implement your website into AlloyProxy. Upload all of your files into the `public` folder then your done. Avoid having the directory `alloy`
Since that might mess up script injection stuff.

# Things not to do

We recommend NOT to delete the `alloy` folder. It contains script injection and error pages. And don't tamper with any rewriting that adds script injection since script injection makes websites such as Discord and Youtube work more properly.

# Extra information:

If your gonna have an external website redirect to this proxy. Then we recommend you have the value base64 encoded and redirected to `/alloy?url=` then value.

# Deploying to Heroku:

If your gonna be hosting this on something like Heroku. You need to make sure SSL mode is turned off so this will work.

# Known websites that work

- Google Search

- Discord

- LittleBigSnake

- Surviv.io

- Youtube

- Y8

- 1v1.LOL

- Old Reddit

and plenty more!

# Known issues that need to be fixed

- Better POST body parsing instead of using body-parser.

- Cookie header rewriting

# Updates to come in the future

- Full URL encoding / encryption mode

- Websocket proxing
