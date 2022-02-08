<img align="left" width="70px" src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/icon.png"></img>
# Holy Unblocker

Holy Unblocker, an official flagship Titanium Network site, can bypass web filters regardless of whether it is an extension or network-based. Being a secure web proxy service, it supports numerous sites while being updated frequently and concentrating on detail with design, mechanics, and features.

Works with a large number of sites, including YouTube, Discord, and more!

Also has a good amount of locally hosted games featured on the site.

**Read below for information if the official site is blocked or for obtaining more links.**

#### Supports
- Youtube.com
- Discord.com
- Google.com
- Reddit.com
- Bing.com
- And more sites!

#### Features:
- Tab customization using the Options menu for improved stealth 
- Considerable variety with the open selection of proxy types 
- Game library with moderately decent titles
- Has frequent support articles for issues relating to the various proxy instances

Note: EmuLibrary is not featured in the public version.

Official Site: <a href="https://holyubofficial.net">https://holyubofficial.net</a>

**Be sure to join Titanium Network's Discord for more official site links:** <a href="https://discord.gg/unblock">https://discord.gg/unblock</a>

Simply do `%proxy hu` in `#proxy-commands` for more Holy Unblocker links on the TN Discord server.

<img src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/preview/hu-v5.0.0-preview.png"></img>

### Deploy Holy Unblocker

[![Deploy to Heroku](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/heroku.svg)](https://heroku.com/deploy/?template=https://github.com/titaniumnetwork-dev/Holy-Unblocker)
[![Run on Replit](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/replit.svg)](https://replit.com/github/titaniumnetwork-dev/Holy-Unblocker)
[![Remix on Glitch](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/glitch.svg)](https://glitch.com/edit/#!/import/github/titaniumnetwork-dev/Holy-Unblocker)
[![Deploy to Azure](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/azure.svg)](https://deploy.azure.com/?repository=https://github.com/titaniumnetwork-dev/Holy-Unblocker)
[![Deploy to IBM Cloud](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/ibmcloud.svg)](https://cloud.ibm.com/devops/setup/deploy?repository=https://github.com/titaniumnetwork-dev/Holy-Unblocker)
[![Deploy to Amplify Console](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/amplifyconsole.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/titaniumnetwork-dev/Holy-Unblocker)
[![Run on Google Cloud](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/googlecloud.svg)](https://deploy.cloud.run/?git_repo=https://github.com/titaniumnetwork-dev/Holy-Unblocker)

## Table of contents:

- [Setup](#how-to-setup)
    - [Structure](#structure)
        - [Structure Information](#structure-information)
        - [Static Files](#details-of-views)
        - [Scripts](#scripts-located-in-viewsassetsjs)
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
git clone https://github.com/titaniumnetwork-dev/Holy-Unblocker.git

cd Holy-Unblocker

npm install

npm start
```

The default place for the proxy when its started is `http://localhost:8080` but you can change it if needed in config.json

This website is hosted locally with Corrosion built-in. More more information go to the Corrosion repository below.


## Structure
- `index.html`: The homepage of the site.
- `404.html`: The 404 page.
- `error.html`: Other errors that are not 404.
- `info.html`: Documentation (This page!)
- `faq.html`: Frequently asked questions page.
- `hidden.html`: Fake "Site not Found" page (unused)
- `frame.html`: Handles any pages under stealth.
- `surf.html`: Web Proxies page, page offers to be redirected to any proxies you would like to add. In this case, Corrosion, Womginx, and Palladium.
- `credits.html`: List of all contributors to the site.
- `bookmarklets.html`: Bookmarklets page, to be worked on more in the future.
- `icons.html`: Information regarding Settings Menu page. Added this in for standard users.
- `terms.html`: Terms of Services, AUP and Privacy Policy page.
- `gtools.html`: Games page, help from @BinBashBanana and @kinglalu.
- `games5.html`: HTML5 game navigation page.
- `emulators.html`: Emulator navigation page, using <a href="https://github.com/BinBashBanana/webretro">webretro</a>.
- `emulibrary.html`: Games page for emulated games (not included in public release)
- `flash.html`: Games page for flash games, credits given to @BinBashBanana and Titanium Network for its assets.
- `corrosion.html`: Corrosion Proxy page which features Corrosion hosted locally but can be configured to redirect to an external instance.
- `womginx.html`: Womginx Proxy page. Script links to a subdomain for Womginx, a highly fast proxy with reCaptcha and discord support.
- `palladium.html`: Palladium Proxy page.
- `youtube.html`: An proxied version of Youtube running off of the locally hosted Corrosion.
- `discord.html`: Hub for the Discord proxy.
- `reddit.html`: Hub for the Reddit proxy.

### Structure Information
- `/views/`: The physical site base of Holy Unblocker goes here where static assets are served.
- `/src/`: For future implementation of obfuscation and keyword removing features.

#### Details of `/views/`
- `/archive/` is used for game pages and vibeOS.
- `/pages/` is used for the HTML for the site.
- `/assets/` is used for various assets for CSS, JS, and images.

#### Scripts located in `/views/assets/js/`
- `common.js` is used on all of the pages for common useful functions.
- `prset.js` is used on the proxy pages for proxy form functionality.
- `header.js` inserts the header into every page using javascript.
- `csel.js` manages the settings menu on the header.
- `footer.js` inserts the footer into every page using javascript.
- `gnav/*.js` are used for navigation on the games pages.

## Future Additions
- Expansive game library
- Various parity changes.

## Vauge Explanation for Beginners With External Proxies and Hosting
You will first want to host your proxies locally or externally. 

#### List of some good hosting options:
- <a href="https://dedipath.com">Dedipath</a> (Paid and Dedicated)
- <a href="https://heroku.com">Heroku</a> (Free)
- <a href="https://nodeclusters.com">NodeClusters</a> (Paid)
- <a href="https://glitch.com">Glitch</a> (Free)
- <a href="https://repl.it">Repl.it</a> (Free)
- <a href="https://azure.microsoft.com">Azure</a> (Free and Paid)

Out of the list of hosting providers Heroku and NodeClusters rank first as a preference. You may also self-host.

After you have selected a decent VPS, use Cloudflare for the DNS records for both the site and the subdomains for the proxies.

This is an example of DNS records involving Heroku. Self-hosting will require `A records` preferably.
<img src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/dnssetup.png" width="500"></img>

- `@` and `www.deepsoil.ml` are being used for the local Corrosion proxy.
- `p.deepsoil.ml` is being used for Palladium.
- `a.deepsoil.ml` is being used for womginx.
- `cdn.deepsoil.ml` is being used for a private Corrosion host on the official sites.

As stated previously, Holy Unblocker is hosted locally with Corrosion.

#### Heroku Steps
So you chose to use Heroku to host. I personally favor it as a free choice.

- First obtain a card; (Prepaid, Debit, and Credit Cards work). You need this to add custom domains to your Heroku instance.

Make sure you connect your Heroku app to your GitHub and enable automatic deploys. Will make things easier. :) 

#### Freenom/Domain Steps
For beginners, Freenom is a good provider for obtaining domains for free. However the catch is that you can only use properly "Freenom" domains for free being .cf, .ml, .gq, ga and .tk. However these can be blocked rather easily.

- Get some Freenom domains then add them to your Heroku instance (Personal > [App Name] > Settings > Domains)
Add a domain for both `www.youdomainhere.cf` and `yourdomainhere.cf` with .cf being interchangeable with other Freenom domain names.
- If you prefer to obtain premium domains (TLDs) then use <a href="https://porkbun.com">Porkbun</a>, which offers domains for amazing prices. Literally a `.net` domain normally costs around $10. On Porkbun for the first year it costs $3 so its definitely a deal.

#### Cloudflare Steps
- Use Cloudflare (make an account), add your site (Freenom Domain or other) and then add your various DNS targets to Cloudflare. Make sure you add Cloudflare's Nameservers which will be given later when you are adding your site. 

Make sure they are CNAME although A records also work and try to follow this structure:

**Type | Name | Target**

`CNAME | @ | your-main-heroku-target-here.herokudns.com`  
`CNAME | www | your-main-heroku-target-here.herokudns.com`

**Below are if you want external proxies also with your site:**

`CNAME | p | your-palladium-instance-here.herokudns.com`  
`CNAME | a | your-womginx-instance-here.herokudns.com`  
`CNAME | pd | your-pydodgeb-instance-here.herokudns.com`

Make sure HTTPS is forced and have SSL set to Flexible for Heroku. Otherwise you can have SSL set to Full.

#### Workspace Configurations 
Preferably if you have your own device use Visual Studio Code. Pretty much the best option you can get but obviously this is an opinion. Also make sure you have <a href="https://nodejs.org/">Node.JS</a> installed on your machine.

Not going to go too in depth with this part but first fork this repository. The clone it locally through a Terminal of some sort depending on what OS you are on. Make sure you navigate to the folder you want to set this up in.

```
git clone https://github.com/titaniumnetwork-dev/Holy-Unblocker.git

cd Holy-Unblocker

npm install
```

Now simply add the folder you cloned this repo in in VSC. Then run `npm install`. I recommend that if you are releasing this publically on GitHub that you add a `.gitignore` in your root directory with the following exclusions:

```
node_modules
```

Now you have your following workspace environment setup. To deploy the following workspace you just created you will need to look up depending on your hosting provider.

For an online IDE that you can use on your school computer and/or chromebook use GitPod. Basically the equivalent of Visual Studio Code but with in-browser support.
- Make an account: `https://gitpod.io/`
- Fork this repo and enter in this URL to setup your workspace: `https://gitpod.io#https://github.com/YourNameHere/Holy-Unblocker/`

Use the same steps above by running `npm install` in your repository and adding a `.gitignore` in your root directory specifying to exclude `node_modules`.

## Detailed FAQ
A detailed FAQ with common issues and solutions can be found <a href="https://holyubofficial.net/?faq">here</a> or on any official HU site on the FAQ page.

<details>
<summary>Quick FAQ</summary>

**Why is the site I am on not working correctly or having CAPTCHA errors?**

Captcha support is currently not available on all of the current proxies sadly. Therefore some sites may not work with any of the sites. Read below for issues with links on sites.

**Why are some page links not working or leading to 404 pages?**

This is an issue with the latest release of Alloy proxy but it may also occur with other proxies.

In this case manually entering the URL of the page you would like to view can solve this or try navigating using the home button. (Reddit, Twitter) The next release of Alloy may fix this also.

**When using YouTube on any of the proxy sites, why does the page not load fully or the video is just white?**

There are two methods for fixing this:

- Reloading the page normally when the error above happens should load the video.
- Or right-clicking the page and doing Reload Frame if you are using some form of Stealth Mode.

**When using Discord under Alloy or SysYa, why does the page stay gray/white or the QR code not load?**

Once again do the same steps above:
- Reloading the page normally when the error above happens should load the video
- Or right-clicking the page and doing Reload Frame if you are using some form of Stealth Mode.

Make sure you are also doing the steps correctly. Simply view link above for extended Discord proxy information/steps.

**I am getting 502 errors. What do I do?**

When this happens you may either switch sites to fix the error or wait a bit. Sometimes clearing your cache can help.

If you still have any questions feel free to ask them in the discord linked here.

</details>

## More Information
This project is maintained by Quite A Fancy Emerald with massive help from BinBashBanana (OlyB) and is an official flagship Titanium Network proxy site.

- <a href="https://github.com/titaniumnetwork-dev/">https://github.com/titaniumnetwork-dev/</a>
- <a href="https://titaniumnetwork.org/">https://titaniumnetwork.org/</a>

View the official website for more detail and credits.

### Proxy Sources:
This project currently uses Corrosion, Womginx, and Palladium, linked below.

- <a href="https://github.com/titaniumnetwork-dev/Corrosion">Corrosion</a>
- <a href="https://github.com/binary-person/womginx">Womginx</a>
- <a href="https://github.com/LudicrousDevelopment/Palladium">Palladium</a>
- <a href="https://github.com/BinBashBanana/PyDodge">PyDodge</a>

### Other:

- <a href="https://github.com/vibedivide/vibeOS">vibeOS</a>
- <a href="https://github.com/BinBashBanana/webretro">webretro</a>
- <a href="https://ruffle.rs/">Ruffle</a>
- <a href="https://github.com/BlaNKtext/webosu">webosu</a>

### Notable Mentions:

- <a href="https://soyoustart.com/">SoYouStart / OVH</a> (Hosting Provider)

Thanks :D
