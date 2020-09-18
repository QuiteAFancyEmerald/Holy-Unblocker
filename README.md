# Holy Unblocker
A website that can be used to bypass web filters; both extension and firewall. This is the public source code for Holy Unblocker.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic/)

<a href="https://azuredeploy.net/" title="Deploy to Azure"><img alt="Deploy to Azure" src="https://sys32.dev/assets/src/media/azure.svg" width="140" height="30"><img></a>
&nbsp;
<a href="https://repl.it/github/QuiteAFancyEmerald/HolyUnblockerPublic/" title="Run on Repl.it"><img alt="Run on Repl.it" src="https://sys32.dev/assets/src/media/replit.svg" width="140" height="30"><img></a>
&nbsp;
<a href="https://glitch.com/edit/#!/import/github/QuiteAFancyEmerald/HolyUnblockerPublic/" title="Remix on glitch"><img alt="Remix on glitch" src="https://sys32.dev/assets/src/media/glitch.svg" width="140" height="30"><img></a>

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
- `z.html` : Surf Freely page, page offers to be redirected to either Alloy or Node.
- `a.html` : Alloy Proxy page, configured as recommended with Alloy Proxy.
- `b.html` : Links to a subdomain for Node Unblocker. I left it in just in case you would like to setup the site differently.
- `p.html` : Links to a subdomain for Powermouse. I left it in just in case you would like to setup the site differently.
- `g.html` : Games page, credits given to OlyB and Titanium Network for its assets.
- `i.html` : Information regarding Settings Menu page. Added this in for standard users.
- `t.html` : Terms of Services, AUP and Privacy Policy page.
- `k.html` : An iframe version of Krunker. Can be removed if not needed.
- `yt.html` : An iframe of Youtube running off of the locally hosted Alloy Proxy.

## Future Additions
- Cookie Authorization
- Filters

This project uses Alloy Proxy and Node Unblocker, linked below. Credits also given to Titanium Network and all its developers as this project would not be possible without them. View the official website for more detail. :)

- https://github.com/titaniumnetwork-dev/
- https://github.com/titaniumnetwork-dev/alloyproxy
- https://github.com/nfriedly/node-unblocker
