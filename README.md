# Holy Unblocker <img align="left" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/views/assets/img/Icon.png"></img>

#### Titanium Network is sponsored by:

<img src="https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic/blob/master/views/assets/img/nodeclusters.png?raw" width="500px"></img>

Holy Unblocker, a website that can be used to bypass web filters; both extension and firewall. This is the public source code for Holy Unblocker, a rather fancy website with some cool dynamic backgrounds while also focusing with detail put into the design, mechanics and features overall like custom Tab Cloaks with more to come in the future. 

Works with a large number of sites including YouTube, Discord and more! Be sure to read below for information if the official site is blocked or for obtaining more links.

YouTube has specialized support with the ablity to view steams, comments, bypass restricted mode, and have full quality on videos.

Be sure to check the various branches as I update Holy Unblocker often with open access to yet to be released versions.

Also has a good amount of locally hosted games featured on the site.

#### Supports
- Youtube.com
- Discord.com
- Google.com
- Reddit.com
- Bing.com
- And more!

Be sure to join Titanium Network's Discord for more official site links: https://discord.gg/unblock

Simply do `%proxy hu` for more Holy Unblocker links on the Titanium Network Discord server.

Official Site: https://www.holyubofficial.net

Site Documentation: <a href="https://www.holyubofficial.net/?in">Documentation</a>

<img src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/views/assets/img/hbpreview.png?raw"></img>

<a href="https://heroku.com/deploy?template=https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic" title="Deploy to Heroku"><img alt="Deploy to Heroku" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/views/assets/img/heroku.svg?raw" width="140" height="30"><img></a>
&nbsp;
<a href="https://azuredeploy.net/" title="Deploy to Azure"><img alt="Deploy to Azure" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/views/assets/img/azure.svg?raw" width="140" height="30"><img></a>
&nbsp;
<a href="https://repl.it/github/QuiteAFancyEmerald/HolyUnblockerPublic" title="Run on Repl.it"><img alt="Run on Repl.it" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/views/assets/img/replit.svg?raw" width="140" height="30"><img></a>
&nbsp;
<a href="https://glitch.com/edit/#!/import/github/QuiteAFancyEmerald/HolyUnblockerPublic" title="Remix on Glitch"><img alt="Remix on glitch" src="https://raw.githubusercontent.com/QuiteAFancyEmerald/HolyUnblockerPublic/master/views/assets/img/glitch.svg?raw" width="140" height="30"><img></a>

## Table of contents:

- [Setup](#how-to-install)
	- [Structure](#structure)
		- [Structure Information](#structure)
	    - [Static Files](#details-of-views)
	    - [Proxy Scripts](#scripts-located-in-expr)
	- [Future Additions](#future-additions)
	- [Beginner's Explanation](#vauge-explanation-for-beginners-with-external-proxies-and-hosting)
	  - [Hosting Providers](#list-of-some-good-hosting-options)
	  - [Heroku Setup](#heroku-steps)
	  - [Domain Setup](#freenomdomain-steps)
	  - [Cloudflare Setup](#cloudflare-steps)
	  - [Workspace Configurations](#workspace-configurations)
	- [Detailed FAQ](#detailed-faq)
	- [More Information](#more-information)

## How to Setup

Either use the button above to deploy to Heroku or do the below:

```
git clone https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic.git

cd HolyUnblockerPublic

npm install

npm start
```

The default place for the proxy when its started is `http://localhost:8080` but you can change it if needed in config.json

This website has been hosted locally on Alloy Proxy. More more information go to the Alloy Proxy repository below.


## Structure
- `index.html` : The official homepage of the site.
- `surf.html` : Web Proxies page, page offers to be redirected to any proxies you would like to add. In this case Alloy, Womginx, Powermouse and Via Unblocker.
- `alloy.html` : Official Alloy Proxy page which features Alloy hosted locally but can be configured to redirect to an external instance.
- `womginx.html` : Womginx Proxy page. Script links to a subdomain for Womginx, a highly fast proxy with captcha support.
- `pmprox.html` : Powermouse Proxy pagge. Script links to a subdomain for Powermouse, a flexible secondary proxy compared to Alloy with support for Discord.
- `pydodge.html` : Via Unblocker page. Links to a subdomain with PyDodge or Via, a proxy which successes Node Unblocker
- `youtube.html` : An proxied version of Youtube running off of the locally hosted Alloy Proxy.
- `discordhub.html` : Hub for the Discord proxy and its links using a mixture of Alloy, Womginx and Ocean Proxy.
- `gtools.html` : Games page, help from @BinBashBanana and @kinglalu.
- `flash.html` : Games page for flash games, credits given to @BinBashBanana and Titanium Network for its assets.
- `emulators.html` : Emulator navigation page, hosted locally on Holy Unblocker.
- `bookmarklets.html` : Bookmarklets page to be worked on more in the future.
- `icons.html` : Information regarding Settings Menu page. Added this in for standard users.
- `info.html` : Official Documentation page. To be worked on.
- `terms.html` : Terms of Services, AUP and Privacy Policy page.

#### Deprecated
I left all of these just in case you would like to setup the site differently as surf.js can be used instead.

- `ythub.html` : Page linking proxied Youtube.
- `ytmobile.html` : Page linking to a proxied YouTube for mobile users.
- `discordprox.html` : Links to a discord proxied through Alloy.
- `gba.html` : Locally hosted Gameboy Emulator.
- `chatbox.html` : Links to an externally hosted Chatbox.
- `krunker.html` : An iframe version of Krunker with keyword changes. Can be removed if not needed.

### Structure Information
- `/views/` : The physical site base of Holy Unblocker goes here where static assets are served.
- `/src/` : For future implementation of obfuscation and keyword removing features.

#### Details of `/views/`
- `/pages/` is used for important pages for the site.
- `/expr/` is used for important proxy scripts.
- `/archive/` is used for game related assets and pages.
-  `/assets/` is used for various assets for CSS, JS and Bootstrap.
- `/vibeOS/` is used for vibeOS, an in-browser OS enviroment.

#### Scripts located in `/expr`
- `surf.js` is used for proxy navigation; both Stealth mode and Classic mode.
- `h5-nav.js` is used for navigation on the games page, Stealth mode only.
- `surf-dev.js` is used for proxy navigation on the official sites.
- `load.js` is used for initializing the surf script. Must be located in the `<head>` tag. To be removed.

## Future Additions
- Expand the game library.
- Go through various parity changes.
- Cleanup the source a bit.
- Add more locally hosted proxies possibly.

## Vauge Explanation for Beginners With External Proxies and Hosting
You will first want to host your proxies locally or externally. 

#### List of some good hosting options:
- <a href="https://dedipath.com">Dedipath</a> (Paid and Dedicated)
- <a href="https://heroku.com">Heroku</a> (Free)
- <a href="https://nodeclusters.com">NodeClusters</a> (Paid)
- <a href="https://glitch.com">Glitch</a> (Free)
- <a href="https://repl.it">Repl.it</a> (Free)
- <a href="https://azure.microsoft.com/en-us/">Azure</a> (Free and Paid)

Out of the list of hosting providers Heroku and Dedipath rank first as a preference. You may also self-host. Currently at this time Dedipath is used to host the official Holy Unblocker sites.

After you have selected a decent VPS, use Cloudflare for the DNS records for both the site and the subdomains for the proxies.

This is an example of DNS records involving Heroku. Self-hosting will require `A records` preferably.
<img src="https://cdn.discordapp.com/attachments/725506757291671663/756659513179766844/unknown.png" width="500" height="154"></img>

- `a.deepsoil.ml` is being used for Node Unblocker.
- `p.deepsoil.ml` is being used for Powermouse.
- `pd.deepsoil.ml` is being used for PyDodge B.
- `cdn.deepsoil.ml` is being used for a private Alloy host on the official sites.

Update, the new configuration is (for the official sites):

- `a.example.com` is being used for Womginx.
- `d.example.com` is being used for Ocean proxy, to be removed.
- `c.example.com` is being used for Powermouse and the Chatbox.
- `cdna.example.com` is being used for an older version of Alloy with YouTube support and Via which is hosted on the official sites.
- `cdn.example.com` is being used for a private Alloy instance and Via which is hosted on the official sites.

As stated previously, Holy Unblocker is hosted locally with Alloy.

#### Heroku Steps
So use Heroku to host. I personally favor it as a free choice.

- First obtain a card; (Prepaid, Debit, and Credit Cards work). You need this to add custom domains to your Heroku instance.

Make sure you connect your Heroku app to your GitHub and enable automatic deploys. Will make things easier. :) 

#### Freenom/Domain Steps
For beginners, Freenom is a good provider for obtaining domains for free. However the catch is that you can only use properly "Freenom" domains for free being .cf, .ml, .gq, ga and .tk. However these can be blocked rather easily.

- Get some Freenom domains then add them to your Heroku instance (Personal > [App Name] > Settings > Domains)
Add a domain for both `www.youdomainhere.cf` and `yourdomainhere.cf` with .cf being interchangeable with other Freedom domain names.
- If you prefer to obtain premium domains (TLDs) then use <a href="https://porkbun.com">Porkbun</a>, which offers domains for amazing prices. Literally a `.net` domain normally costs around $10. On Porkbun for the first year it costs $3 so its definitely a deal.

#### Cloudflare Steps
- Use Cloudflare (make an account), add your site (Freenom Domain or Domain) and then add your various DNS targets to Cloudflare. Make sure you add Cloudflare's Nameservers which will be specified more when you are adding your site. 

Lastly for targets make sure they are either a CNAME, AAAA or A records and try to follow this structure:

**Type | Name | Target**

`CNAME | @ | yourherokudnstargethere.herokudns.com` or `CNAME | @ | example.com`

`CNAME | www | yourherokutargethere.herokudns.com ` or `CNAME | www | example.com`

**Below are if you want external proxies also with your site:**

`CNAME | a | yourwomginxinstance.herokudns.com` or `CNAME | a | example.com`

`CNAME | c | yourpowermouseinstancehere.herokudns.com` or `CNAME | c | example.com`

(You get the idea.)

Make sure HTTPS is forced and have SSL set to Flexible for Heroku. Otherwise you can have SSL set to Full. Use LetsEncrypt for SSL certificates or Cloudflare.

#### Workspace Configurations 
Preferably if you have your own device use Visual Studio Code. Pretty much the best option you can get but obviously this is an opinion. Also make sure you have <a href="https://nodejs.org/">Node.JS</a> installed on your machine.

Not going to go too in depth with this part but first fork this repository. Then clone it locally through a terminal of some sort depending on what OS you are on. Make sure you navigate to the folder you want to set this up in.

```
git clone https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic.git

cd HolyUnblockerPublic

npm install
```

Now simply add the folder you cloned in VSC. Then run `npm install`. I recommend that if you are releasing this publically on GitHub that you add a `.gitignore` in your root directory with the following exclusions:

`node_modules`

Now you have your following workspace environment setup. To deploy the following workspace you just created you will need to look up depending on your hosting provider.

For an online IDE that you can use on your school computer and/or chromebook use GitPod. Basically the equivalent of Visual Studio Code but with in-browser support.
- Make an account: `https://gitpod.io/`
- Fork this repo and enter in this URL to setup your workspace: `https://gitpod.io#https://github.com/YourNameHere/HolyUnblockerPublic/`

Use the same steps above by running `npm install` in your repository and adding a `.gitignore` in your root directory specifying to exclude `node_modules`.

## Detailed FAQ
A detailed FAQ with common issues and solutions can be found <a href="https://holyubofficial.net/?faq">here</a> or on any official HU site on the FAQ page.

**Why is the site I am on not working correctly or having CAPTCHA errors?**

Captcha support is currently not available on some of the older proxies sadly. Therefore some sites may not work with any of the sites. Read below for issues with links on sites.

However Womginx has captcha support now!

**Why are some page links not working or leading to 404 pages?**

This is an issue with the latest release of Alloy proxy but it may also occur with other proxies.

In this case manually entering the URL of the page you would like to view can solve this or try navigating using the home button. (Reddit, Twitter) The next release of Alloy may fix this also.

**When using YouTube on any of the proxy sites, why does the page not load fully or the video is just white?**

There are two methods for fixing this:

- Reloading the page normally when the error above happens should load the video.
- Or right-clicking the page and doing Reload Frame if you are using some form of Stealth Mode.

**When using Discord under Alloy or Powermouse, why does the page stay gray/white or the QR code not load?**

Once again do the same steps above:
- Reloading the page normally when the error above happens should load the video
- Or right-clicking the page and doing Reload Frame if you are using some form of Stealth Mode.

Make sure you are also doing the steps correctly. Simply view link above for extended Discord proxy information/steps.

Note that this is for the older discord proxy steps with Alloy and Powermouse. Womginx now support logging in normally!

**I am getting 502 errors. What do I do?**

When this happens you may either switch sites to fix the error or wait a bit. Sometimes clearing your cache can help.

If you still have any questions feel free to ask them in the discord linked here.


## More Information
This project uses Alloy Proxy, Node Unblocker, Powermouse and PyDodge which are linked below. 

View the official website for more detail and credits.

- https://github.com/titaniumnetwork-dev/
- https://github.com/titaniumnetwork-dev/alloyproxy
- https://github.com/nfriedly/node-unblocker
- https://github.com/vibedivide/powermouse
- https://github.com/BinBashBanana/PyDodge
- https://github.com/juchi/gameboy.js
- https://nodeclusters.com
- https://titaniumnetwork.org/
- https://github.com/vibedivide/vibeOS
- https://github.com/binary-person/womginx

This project is maintained by QuiteAFancyEmerald and collaborative with Titanium Network.

Thanks.
