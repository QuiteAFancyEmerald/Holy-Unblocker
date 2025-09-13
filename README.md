<img align="center" src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/github_banner.png"></img>

<img align="left" width="40px" src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/logo_github.png"></img>

# Holy Unblocker LTS (v6.x.x)

![GitHub Actions Status](https://github.com/QuiteAFancyEmerald/Holy-Unblocker/workflows/CI-Production/badge.svg)
![GitHub Actions Status](https://github.com/QuiteAFancyEmerald/Holy-Unblocker/workflows/CI-Win/badge.svg)
[![Docker Image Version](https://img.shields.io/docker/v/quiteafancyemerald/holy-unblocker.svg)](https://hub.docker.com/r/quiteafancyemerald/holy-unblocker)
[![Docker Pulls](https://img.shields.io/docker/pulls/quiteafancyemerald/holy-unblocker.svg)](https://hub.docker.com/r/quiteafancyemerald/holy-unblocker)

Holy Unblocker LTS is an experimental web proxy service that can bypass web filters or "blockers" regardless of whether the method of censorship is client-side or network-based. This includes the ability to bypass content blockers from governments, chrome extensions, localized client firewalls, and network-related filters. The project even allows the ability to browse Tor/Onion sites in any browser (even Chromium) all through a website!

## You can support Holy Unblocker by starring the repository!

This project serves mostly as a proof of concept for the ideal clientless solution to bypassing censorship. A good use case of this project would be if you ever needed a clientless solution to use Tor or leave minimal traces of device activity. Simply host this project on any domain and have an alternative solution to a VPN without needing to download anything on said device. Being a secure web proxy service, it supports numerous sites while being updated frequently and concentrating on being easy to self-host. Holy Unblocker LTS works with a large number of sites, including YouTube, Discord, GeForce NOW and more!
Also has a good amount of locally hosted games featured on the site.

### Over 30M+ users since 2020. Thank you so much for the support I could have never imagined how massive the web proxy community has become.

#### Current Branch: Latest

<details><summary>Branch Types</summary>

- Latest (master; built for FOSS and SEO)
- Beta (pending changes; changes that may break things)
- Production (v4, v5, v6; stable version of Holy Unblocker LTS. Changes for self hosting in production settings; max filtering evasion and request handling)
</details>

#### Considering switching branches for self-hosting to a production branch!

View the <a href="#deploy-holy-unblocker">self-deployment options</a> if you wish to self host this project. Can't deploy using any of the free options? Check out Railway or look into cheap, paid VPS hosting solutions. If you don't wish to self-host join the discord for more official instance links that are restocked frequently.

**Be sure to join Titanium Network's Discord for more official site links:** <a href="https://discord.gg/unblock">https://discord.gg/unblock</a>

<br>

> [!CAUTION]
> If you are going to self-host Holy Unblocker LTS please switch to the PRODUCTION branch for filter evasion features. The master branch is intended for development work and a highly readable source for developers. You can select a production branch (v6.x_production) via the branches dropdown.

> [!TIP]
> Holy Unblocker LTS is optimized for self-hosting to provide you with maximum privacy control! Fork this repository and consider starring. You can self-host using either free or paid deployment options, or set it up on a dedicated instance (VPS) for enhanced performance.

| **Supported Sites**        | **Features**                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Youtube                    | Built-in variety of open source web proxies with both a focus on speed and/or security                                                |
| Reddit                     | Features Source Randomization and DOM Masquerading to circumvent major filters effectively along with randomizations to proxy globals |
| Discord                    | Tab title + icon customization using the Settings Menu for improved browsing history stealth                                          |
| Instagram                  | Adblocking support across all websites while surfing and low latency DNS on official servers                                          |
| Reddit.com                 | SOCKS5 and Onion routing support with Tor within the Settings Menu. Use Tor/Onion sites in any browser!                               |
| GeForce NOW                | Game library with moderately decent titles and open-source emulation projects                                                         |
| Spotify                    | Bypass regional proxy blocks by swapping regions or enabling Tor                                                                      |
| And essentially all sites! | Built for intensive production loads and ease of setup                                                                                |

<img src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/preview/hu-v6.4.3-preview.png"></img>
<img src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/preview/hu-v6.3.0-preview-settings.png"></img>

## Deploy Holy Unblocker

### Free Deployments

[![Deploy to Koyeb](https://binbashbanana.github.io/deploy-buttons/buttons/remade/koyeb.svg)](https://app.koyeb.com/deploy?name=holy-unblocker&type=git&repository=QuiteAFancyEmerald%2FHoly-Unblocker&branch=v6.3_production&builder=buildpack&env%5B%5D=&ports=8080%3Bhttp%3B%2F)
[![Deploy to Oracle Cloud](https://binbashbanana.github.io/deploy-buttons/buttons/remade/oraclecloud.svg)](https://cloud.oracle.com/resourcemanager/stacks/create?zipUrl=https://github.com/BinBashBanana/deploy-buttons/archive/refs/heads/main.zip)

<details><summary>Alternative Free Sources</summary>

[![Deploy to Cyclic](https://binbashbanana.github.io/deploy-buttons/buttons/remade/cyclic.svg)](https://app.cyclic.sh/api/app/deploy/shuttlenetwork/shuttle)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/QuiteAFancyEmerald/Holy-Unblocker)
[![Deploy to Fly.io](https://img.shields.io/badge/Deploy%20to-Fly.io-blue?logo=fly.io)](https://fly.io/launch?repo=https://github.com/QuiteAFancyEmerald/Holy-Unblocker)

</details>

### Production Paid/Free Options (Requires Payment Info)

[![Deploy to Azure](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/azure.svg)](https://deploy.azure.com/?repository=https://github.com/QuiteAFancyEmerald/Holy-Unblocker)
[![Deploy to IBM Cloud](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/ibmcloud.svg)](https://cloud.ibm.com/devops/setup/deploy?repository=https://github.com/QuiteAFancyEmerald/Holy-Unblocker)
[![Deploy to Amplify Console](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/amplifyconsole.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/QuiteAFancyEmerald/Holy-Unblocker)
[![Run on Google Cloud](https://raw.githubusercontent.com/BinBashBanana/deploy-buttons/master/buttons/remade/googlecloud.svg)](https://deploy.cloud.run/?git_repo=https://github.com/QuiteAFancyEmerald/Holy-Unblocker)

#### What happened to Replit/Heroku Deployment?

Replit is no longer free and Heroku has a set policy against web proxies. Try GitHub Codespaces or Gitpod instead for development on the cloud OR Koyeb for free hosting.

### GitHub Codespaces

<details><summary>Setup Instructions</summary>

- Fork (and star!) this repository to your GitHub account
- Head to the official <a href="https://github.com/codespaces">Codespaces</a> website (ensure you have a GitHub account already made)
- Select **New Codespaces** and look for _[USERNAME]/Holy-Unblocker_ on your account
- Ensure the branch is set to `master` and the dev container configuration is set to **Holy Unblocker LTS**
- Select **Create Codespace** and allow the container to setup
- Type `npm run fresh-install` and `npm start` in the terminal
- Click "Make public" on the application popup, then access the deployed website via the ports tab.

</details>

## Table of contents:

- [Setup](#how-to-setup)
  - [Terminal](#terminal)
  - [Project Configuration](#configuration)
    - [Server Configuration](#server-configuration-setup)
    - [TOR Routing](#toronion-routing-setup)
    - [Proxy](#proxy-configuration)
    - [Client Navigation](#client-navigation-configuration)
    - [Games Management](#games-management)
  - [Structure](#structure)
    - [Structure Information](#structure-information)
    - [Static Files](#details-of-views)
    - [Scripts](#scripts-located-in-viewsassetsjs)
  - [Future Additions](#future-additions)
  - [Beginner's Explanation](#vauge-explanation-for-beginners-with-external-proxies-and-hosting)
    - [Hosting Providers](#list-of-some-good-hosting-options)
    - [Domain Setup](#freenomdomain-steps)
    - [Cloudflare Setup](#cloudflare-steps)
    - [Workspace Configurations](#workspace-configurations)
  - [Detailed FAQ](#detailed-faq)
  - [More Information](#more-information)

## How to Setup

#### It is highly recommended you switch branches via your IDE to a production released branch. Often the master branch contains unstable or WIP changes.

#### Example: v6.x_production instead of master

### Terminal

Either use the button above to deploy to the deployment options above or type the commands below on a dedicated server

Please ensure you are using Node 20.x please:

```bash
git clone https://github.com/QuiteAFancyEmerald/Holy-Unblocker.git

cd Holy-Unblocker

# Edit config.js and set production to true if you want to use pm2 (Allows for easier VPS hosting)
npm run fresh-install
npm start

# Or on subsequent uses...
npm restart

# For killing any production processes made with pm2
npm run kill

# For clearing respective Rammerhead cache
npm run clean

# If you encounter any build errors...
npm run build

# If you encounter any service errors...
npm run test
```

This website is hosted locally with Scramjet, Ultraviolet (Wisp, Bare-Mux, EpoxyTransport, CurlTransport) and Rammerhead built-in.

You will need Node.js 20.x and Git installed; below is an example for Debian/Ubuntu setup.

<details>

```
sudo apt update
sudo apt upgrade
sudo apt install curl git nginx

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20

git clone https://github.com/QuiteAFancyEmerald/Holy-Unblocker.git
cd Holy-Unblocker

npm run fresh-install

# Then edit config.json to change production to true to automatically use pm2

npm start

# Then setup a reverse proxy using NGINX; use the link below for the NGINX guide. You can edit the file in /etc/nginx

sudo systemctl restart nginx

# For Tor look it up if you need it setup
```

</details>

Resources for self-hosting:

- https://github.com/nvm-sh/nvm
- https://docs.titaniumnetwork.org/guides/nginx/
- https://docs.titaniumnetwork.org/guides/vps-hosting/
- https://docs.titaniumnetwork.org/guides/dns-setup/

### Configuration

#### Server Configuration Setup

The default PORT for the proxy when started is `http://localhost:8080`. You can change the PORT and other production metrics if needed in `./ecosystem.config.js`. 

Every other localized changes for source randomization, auto-minify, etc. are located in `./config.json`.

**config.json**
- `minifyScripts`: Automatically minify respective static assets upon starting the server.
- `randomizeIdentifiers`: Enable experimental proxy global randomization for Ultraviolet. This reduces the chances of UV being detected by any extension based filters.
- `production`: Utilize a pre-configured production setup for server hosting. Automatically has cache control, session jobs for Rammerhead and source rewrites setup.
- `disguiseFiles`: Enable DOM masquerading which obfuscates real the real content fetches for HU LTS. This is done through disguising requests, decompressing and then reconstructing the DOM tree.
- `usingSEO`: Enable Source Randomization which randomizes the source by swapping chunks of data specified in `./src/data.json`. Highly useful for masking keywords that will automatically flag or block Holy Unblocker LTS as well as preventing source blocks.

#### Tor/Onion/SOCKS5 Routing Setup

You need to setup Tor (no GUI need/GUI is alright) in order for the Onion Routing setting to work!

Simply host Tor using this guide: https://tb-manual.torproject.org/installation/

Alternative Guide (for CLI): https://community.torproject.org/onion-services/setup/install/

If you are hosting Holy Unblocker LTS on a VPS utilizing Ubuntu consider attaching Tor to systemctl for easier production management. Once Tor is up and running on either Linux or Windows it will work automatically with Holy Unblocker LTS when enabled by the user via the Settings menu.

If you wish to use a custom HTTP/HTTPS/SOCKS5 proxy to route all traffic through for Scramjet and Ultraviolet this is handled in `./views/assets/js/register-sw.js.` Modify `proxyUrl` with the respective protocol and address. This is done via the proxy option for Wisp. You can change the cases as needed.

```js
  proxyUrl = {
    tor: 'socks5h://localhost:9050',
    eu: 'socks5h://localhost:7000',
    usWest: 'socks5h://localhost:7001',
    usEast: 'socks5h://localhost:7002',
    jp: 'socks5h://localhost:7003',
  }
```

#### Proxy Configuration

The primary location for tweaking any web proxy related settings assigned via the Settings menu is `./views/assets/js/register-sw.js`. Here you can modify the provided transport options set locally via a cookie, swap out SOCKS5 proxies, change Onion routing ports, specify a blacklist, and more.

- `stockSW`: The default service worker configuration file for Ultraviolet. For Holy Unblocker however adblocking is automatically enabled so this is not used by default.
- `blacklistSW`: A modified version of Ultraviolet that allows for blacklisting domains and adblocking.
- `proxyUrl`: Specifies a SOCKS5/HTTPS/HTTP protocol URL defaulting to the default Tor proxy port. This can be swapped out with any valid port or SOCK5s proxy. This is done via the proxy option for both epoxy and libcurl.
- `transports`: Specifies any provided ports to be swapped via Bare-Mux and utilize Wisp.
- `wispUrl`: Modify the pathname or url handling for Wisp
- `defaultMode`: Specify the default transport used globally (can be swapped by the users still via the Settings menu)
- `ScramjetController`: This constructor allows you to swap out the prefix used for Scramjet dynamically and specify file locations. Note you may need to edit `./views/scram/scramjet.sw` when changing file names.

#### Client Navigation Configuration

The primary location for any client side navigation scripts is `./views/assets/js/common.js`. This file is primary used for Omnibox (Search Engine) functionality, swapping proxy options and linking games.

- `getDomain`: This constant is used for specifying any subdomains to remove when appending a URL into the omnibox.
- `goFrame`: This specifies the stealth frame used for Holy Unblocker LTS
- `sx`: This constant specifies the search engine you want to be proxied whenever a user types something in that isn't a URL
- `search/uvUrl/sjUrl`: These functions specify and parse the queries used for submitted URLs
- `RammerheadEncode:` This constant is a dependency for Rammerhead parsing and querying
- `urlHandler/asyncUrlHandler`: Used to set functions for the goProx object.
- `goProx`: This constant allows for the mapping of URL handling for specific proxies, games or links that need to fall under a web proxy.

```js
const goProx = Object.freeze({
  ultraviolet: urlHandler(uvUrl),

  scramjet: urlHandler(sjUrl),

  rammerhead: asyncUrlHandler(
    async (url) => location.origin + (await RammerheadEncode(search(url)))
  ),

  // `location.protocol + "//" + getDomain()` more like `location.origin`

  examplepath: urlHandler(location.protocol + `//c.${getDomain()}/example/`),

  examplesubdomain: urlHandler(location.protocol + '//c.' + getDomain()),

  example: urlHandler(sjUrl('https://example.com')),
});
```

- `prSet`: Attaches event listeners using goProx for any buttons or inputs needed

```js
// prSet function code here....

prSet('pr-uv', 'ultraviolet');
prSet('pr-sj', 'scramjet');
prSet('pr-rh', 'rammerhead');
prSet('pr-yt', 'youtube');
prSet('pr-example', 'example');
```

- `huLinks/navLists`: Automatically takes paths stated in `./views/assets/json` and appends them depending on the page and usage. This is used for hiding links that would lead to filter blocks and create an easier system for adding games.

#### Games Management

As stated above all game links that need to be appended to a page (including images and descriptions) are managed via the nav files in`./views/assets/json`. 

Download the latest release <a href="https://github.com/QuiteAFancyEmerald/Holy-Unblocker/blob/master/views/GAMES.md">here</a> and extract it within a folder called `/views/archive`.

- `views/archive/g`: Contains any local or external HTML5/web games.
- `views/archive/gfiles/flash`: Contains Ruffle (an Adobe Flash emulator) and a collection of flash games linked to an external CDN.
- `views/archive/gfiles/rarch`: Contains webretro which is a project that ports RetroArch to WASM. Supports many systems like GBA, N64, etc; ROMS are NOT INCLUDED.

## Structure

<details><summary>Web Pages</summary>

### Structure Information

- `/views/`: The physical site base of Holy Unblocker goes here where static assets are served.
- `/src/`: For future implementation of obfuscation and keyword removing features.

#### Details of `/views/`

- `/dist/` is used for minfied files. Created on build.
- `/pages/` is used for the HTML for the site.
- `/assets/` is used for storing various CSS, JS, image, and JSON files.
- `/scram/` contains the respective local Scramjet implementation. Some files are overridden by the node module.
- `/uv/` contains the UV implementation.

#### Scripts located in `/views/assets/js/`

- `card.js` adds a fancy visual effect to the box cards displayed on the welcome screen.
- `common.js` is used on all pages and allows most site features to function such as autocomplete.
- `csel.js` manages the settings menu, omnibox function and other additional features.
- `loader.js` is used as an asset for DOM masquerading.
- `register-sw.js` creates and manages service workers that allow Ultraviolet to function, and also uses bare transport.

</details>

## Future Additions

<a href="https://github.com/QuiteAFancyEmerald/Holy-Unblocker/blob/master/TODO.md">This</a> is our nonexhaustive todo list for Holy Unblocker LTS v6.x.x and above. Release for production will be v7.x.x and above.

## Vague Explanation for Beginners With External Proxies and Hosting

You will first want to host your proxies locally or externally.

#### List of some good hosting options:

- <a href="https://crunchbits.com/">Crunchbits</a> ( Current Hosting Provider)
- <a href="https://greencloudvps.com">Greencloud</a> (Paid)
- <a href="https://www.oracle.com/cloud">Oracle Cloud</a> (Free, Paid, Dedicated)
- <a href="https://azure.microsoft.com">Azure</a> (Free and Paid)

Out of the list of hosting providers Dedipath and Azure rank first as a preference. You may also self-host.

After you have selected a decent VPS, use Cloudflare for the DNS records for both the site and the subdomains for the proxies.

This is an example of DNS records. Self-hosting will require `A records` preferably.
<img src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/dnssetup.png" width="500"></img>

- `@` and `www.example.com` are being used for Holy Unblocker LTS.
- `a.example.com` is being used for other instances like Libreddit, Invidious or web ported games depending on what the site maintainer needs.

As stated previously, Holy Unblocker is hosted locally with Scramjet, Ultraviolet and Rammerhead out of the box. No need for external instances.

#### Domain Steps

- If you prefer to obtain premium domains (TLDs) then use <a href="https://porkbun.com">Porkbun</a>, which offers domains for amazing prices. Literally a `.org` domain normally costs around $5 first year.

#### Cloudflare Steps

- Use Cloudflare (make an account), add your site and then add your various DNS targets to Cloudflare. Make sure you add Cloudflare's Nameservers which will be given later when you are adding your site.

Make sure they are CNAME although A records also work and try to follow this structure:

**Type | Name | Target**

`A | @ | VPS IP GOES HERE`  
`A | www | VPS IP GOES HERE`  
`A | a | VPS IP GOES HERE`

Make sure HTTPS is forced and have SSL set to Flexible (if you don't use LetsEncrypt). Otherwise you can have SSL set to Full.

#### Workspace Configurations

Preferably if you have your own device use Visual Studio Code. Pretty much the best option you can get but obviously this is an opinion. Also make sure you have <a href="https://nodejs.org/">Node.JS</a> installed on your machine.

Not going to go too in depth with this part but first fork this repository. The clone it locally through a Terminal of some sort depending on what OS you are on. Make sure you navigate to the folder you want to set this up in.

```
git clone https://github.com/QuiteAFancyEmerald/Holy-Unblocker.git

cd Holy-Unblocker

npm run fresh-install

# If you wish to start the project

npm start

# For testing endpoints and errors

npm run test
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

<details>
<summary>Quick FAQ</summary>

#### Where can I find the games for this repo? (404 errors, etc.)

Due to piracy concerns, size, etc. this has been moved over <a href="https://github.com/QuiteAFancyEmerald/HU-Archive">here</a>. EmuLibrary is not featured in the public version.

**Why is the site I am on not working correctly or having CAPTCHA errors?**

Captcha support is spotty on all of the current proxies sadly. It is primarily supported by Scramjet. Therefore some sites may not work with any of the sites.

**I am getting 502 errors. What do I do?**

When this happens you may either switch sites to fix the error or wait a bit. Sometimes clearing your cache can help.

If you still have any questions feel free to ask them in the discord linked here.

</details>

### Why are official domains now numbered? Is this project maintained again?

Yes, this project is active again for LTS support! However, the approach is now much simpler to ensure functionality: domain restocks as needed and a highly maintained source. More than ever, this project serves as a proof of concept for the brave souls willing to innovate in the web proxy service space.

<details><summary>Former Closing Message (Original - 2022)</summary>

This isn’t the greatest announcement sorry. After lots of thought and severe hesitation I’m shutting down Holy Unblocker and leaving TN. It's just been something that I’ve been super conflicted with for months hence the lack of updates and the massive gaps that happened last year. I just didn’t want to throw away a project that I passionately enjoyed and spent time on while making amazing friends and meeting epic devs here. I could go on forever for who these people are but ima like leave it here. They know who they are :D

The main change of thought is that I’m finally just putting an end right now due to 1) the lack of motivation 2) the community is NOT the greatest at time and not the nicest at times (have to put that out here) 3) the future doesn’t look so good for HU/TN as a project.

Some things I’ll be keeping secret since there are more reasons to this choice unless otherwise for those who don’t find this enough information. Good friends here will know that I’ve been super stressed about this choice for months now. Also regardless a good motivator for this choice is the fact that I’ll be graduating soon.

It’s possible that I may continue/come back for this in the future or keep it on GitHub only. I leave this here because even now I am still doubting myself about this change. But for now I’d check out other proxy sites like Incognito (Duce DOES a ton of updates frequently and he is the creator/developer of Ultraviolet so give him some love) :yayy_hopi:

Check out his Patreon also! For current HU patrons you will not be billed next month and the HU Patreon will be archived so head over to Duce’s patron so he can purchase more domains for Incognito.

With love <3
Emerald :HuTaoHype:

</details>

## More Information

This project is maintained by the Holy Unblocker LTS team and is an official flagship Titanium Network web proxy site.

- <a href="https://github.com/titaniumnetwork-dev/">https://github.com/titaniumnetwork-dev/</a>
- <a href="https://titaniumnetwork.org/">https://titaniumnetwork.org/</a>

View the official website for more detail and credits.

### Web Proxy Sources:

This project currently uses Scramjet and Ultraviolet as web proxies adhering to the Wisp protocol. Bare-Mux is utilized for swapping transport systems to be utilized with Wisp. The included transport systems are EpoxyTransport and libcurl-transport. Rammerhead is also provided as an additional web proxy option.

- <a href="https://github.com/MercuryWorkshop/scramjet">Scramjet</a>
- <a href="https://github.com/titaniumnetwork-dev/Ultraviolet">Ultraviolet</a>
- <a href="https://github.com/MercuryWorkshop/wisp-server-node">Wisp-Server-Node</a>
- <a href="https://github.com/MercuryWorkshop/wisp-server-python">Wisp-Server-Python</a>
- <a href="https://github.com/MercuryWorkshop/EpoxyTransport">EpoxyTransport</a>
- <a href="https://github.com/MercuryWorkshop/CurlTransport">libcurl-transport</a>
- <a href="https://github.com/MercuryWorkshop/bare-mux">Bare-Mux</a>
- <a href="https://github.com/binary-person/rammerhead">Rammerhead</a>
- <a href="https://gist.github.com/BinBashBanana/a1fd7345e2d86e69d5a532f16cbdbdaa">DetectorDetector</a>

### Other Dependencies:

- <a href="https://github.com/tsparticles/tsparticles">tsparticles</a>
- <a href="https://github.com/fastify/fastify">fastify</a>
- <a href="https://github.com/fastify/fastify-helmet">@fastify/helmet</a>
- <a href="https://github.com/fastify/fastify-static">@fastify/static</a>
- <a href="https://github.com/DerpmanDev/modal">Modal</a>
- <a href="https://github.com/BinBashBanana/webretro">webretro</a>
- <a href="https://ruffle.rs/">Ruffle</a>
- <a href="https://github.com/michalsnik/aos">AOS</a>
- <a href="https://github.com/nordtheme">Nord Theme</a>
- <a href="https://fontawesome.com/">Font Awesome</a>

### Notable Mentions:

- <a href="https://crunchbits.com/">Crunchbits</a> (Hosting Provider)
