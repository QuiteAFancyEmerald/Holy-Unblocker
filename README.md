# Holy Unblocker
A website that can be used to bypass web filters; both extension and firewall. This is the public source code for Holy Unblocker.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/QuiteAFancyEmerald/HolyUB/)

## How to Install

Either use the button above to deploy to Heroku or do the below:

`git clone https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic.git`

`cd HolyUnblockerPublic`

`npm install`

`npm start`

The default place for the proxy when its started is `http://localhost:8080` but you can change it if needed in config.json

This website has been hosted locally on Alloy Proxy. More more information go to the Alloy Proxy repo below.


## Structure
- `index.html` : The official homepage of the site.
- `z.html` : Surf Freely page, redirected to either Alloy or Node.
- `a.html` : Alloy Proxy page, configured as recommended with Alloy Proxy.
- `b.html` : Links to a subdomain for Node Unblocker. I left it in just in case you would like to setup the site differently.
- `g.html` : Games page, credits given to OlyB and Titanium Network for its assets.
- `k.html` : An iframed version of Krunker. Can be removed if not needed.
- `yt.html` : An iframe of Youtube running off of the locally hosted Alloy Proxy.

## Future Additions
- Cookie Authorization
- Filters

This project uses Alloy Proxy and Node Unblocker, linked below. Credits also given to Titanium Network and all its developers as this project would not be possible without them. View the official website for more detail.

- https://github.com/titaniumnetwork-dev/
- https://github.com/titaniumnetwork-dev/alloyproxy
- https://github.com/nfriedly/node-unblocker
