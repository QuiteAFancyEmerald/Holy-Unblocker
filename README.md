# Holy Unblocker
A website that can be used to bypass web filters; both extension and firewall. This is the public source code for Holy Unblocker. Works on a large number of sites including YouTube (Full Quality Support), Discord, CoolMathGames and more!

Official Site: https://www.holyubofficial.ml/

Be sure to join Titanium Network's Discord for more official site links: https://discord.com/invite/tgT48PH

<a href="https://heroku.com/deploy?template=https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic" title="Deploy to Heroku"><img alt="Deploy to Heroku" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/public/assets/img/heroku.svg?raw" width="140" height="30"><img></a>
&nbsp;
<a href="https://azuredeploy.net/" title="Deploy to Azure"><img alt="Deploy to Azure" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/public/assets/img/azure.svg?raw" width="140" height="30"><img></a>
&nbsp;
<a href="https://repl.it/github/QuiteAFancyEmerald/HolyUnblockerPublic" title="Run on Repl.it"><img alt="Run on Repl.it" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/public/assets/img/replit.svg?raw" width="140" height="30"><img></a>
&nbsp;
<a href="https://glitch.com/edit/#!/import/github/QuiteAFancyEmerald/HolyUnblockerPublic" title="Remix on Glitch"><img alt="Remix on glitch" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/public/assets/img/glitch.svg?raw" width="140" height="30"><img></a>


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
- `g.html` : Games page, help from @BinBashBanana and @kinglalu.
- `info.html` : WIP Documentation
- `d.html` : Links to a subdomain with proxied discord. May need to refresh.
- `e.html` : Links to a subdomain with PyDodge B. Created by OlyB from a modified Via Proxy.
- `gold.html` : Games page for flash games, credits given to @BinBashBanana and Titanium Network for its assets.
- `i.html` : Information regarding Settings Menu page. Added this in for standard users.
- `t.html` : Terms of Services, AUP and Privacy Policy page.
- `k.html` : An iframe version of Krunker with keyword changes. Can be removed if not needed.
- `yt.html` : An proxied version of Youtube running off of the locally hosted Alloy Proxy.
- `ytold.html` : An iframe of Youtube running off of the locally hosted Alloy Proxy.
### Structure Information
- `/public/` : The physical site base of Holy Unblocker goes here. Do not delete or modify `/utils` as its needed for Alloy.

#### Details of `/public`
- `/expr` is used for important proxy scripts.
- `/archive/` and `/css` is used for game related assets and pages.
-  `/assets/` is used for various assets for CSS, JS and Bootstrap.

#### Scripts located in `/expr`
- `[Proxy Initial]bp.js` is used for future implementation of Cookie Auth and navigation to external proxies. Must be located in the <body> tag.
- `[Proxy Initial]load.js` is used for initializing the bp script(s). Must be located in the `<head>` tag.

#### Details of `auth.js`
- Will be used for the implementation of Cookie Authorization

## Future Additions
- Cookie Authorization
- Filters

## Vauge Explanation for Beginners With External Proxies and Hosting
You will first want to host your proxies locally or externally. 
Somes good hosting options (both free and paid):
- <a href="https://heroku.com">Heroku</a> (Free)
- <a href="https://nodeclusters.com">NodeClusters</a> (Paid)
- <a href="https://glitch.com">Glitch</a> (Free)
- <a href="https://repl.it">Repl.it</a> (Free)
- <a href="https://azure.microsoft.com/en-us/">Azure</a> (Free and Paid)

Out of the list of hosting providers Heroku and NodeClusters rank first as a preference. You may also self-host. 

After you have selected a decent VPS, use Cloudflare for the DNS records for both the site and the subdomains for the proxies.

This is an example of DNS records involving Heroku. Self-hosting will require `A records` preferably.
<img src="https://cdn.discordapp.com/attachments/725506757291671663/756659513179766844/unknown.png" width="500" height="154"></img>

- `a.deepsoil.ml` is being used for Node Unblocker.
- `p.deepsoil.ml` is being used for Powermouse.
- `pd.deepsoil.ml` is being used for PyDodge B.
- `cdn.deepsoil.ml` is being used for a private Alloy host on the official sites.

As stated previously, Holy Unblocker is hosted locally with Alloy.
## More Information
This project uses Alloy Proxy, Node Unblocker and Powermouse which are linked below. Credits also given to Titanium Network and all it's developers as this project would not be possible without them. View the official website for more detail. :)

- https://github.com/titaniumnetwork-dev/
- https://github.com/titaniumnetwork-dev/alloyproxy
- https://github.com/nfriedly/node-unblocker
- https://github.com/vibedivide/powermouse
- https://github.com/BinBashBanana/PyDodge
- https://nodeclusters.com
- https://titaniumnetwork.org/
