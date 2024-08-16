This will be our nonexhaustive todo list for Holy Unblocker LTS v6.x.x and above. Release for production will be v8.x.x and above.

## Code Cleanup

- [ ] Remove all current obfuscation in the source code. It needs to be dynamically obfuscated if anything, or not obfuscated at all. This option will be a config option on the server side before rendering with Express for a performance focus. Meta elements will have an additonal attribute indicating if they should be moved. This is to ensure a SEO source can be served by config or a source focused on pure censorship evasion.
- [ ] Optimize the stylesheets and the HTML layout. Add more proper commenting and redivide the code so that it's less hard on the eyes.
- [ ] Optimize the JS. This time it won't be in one line and will be somewhat thoroughly commented.
- [ ] Restructure navigation scripts to ensure updated proxy functionality is sanitized and effective
- [x] Particles.js automatically adjusting per display size - done
- [x] Fix routes.mjs throwing with incorrect paths - done
- [x] Create test script - done
- [x] XSS and fingerprinting protection (may need updates) - done
- [x] Update games navigation JS and page/change to JSON object system - done
- [ ] Ensure all the original submodules get added back to HU-Archive
- [x] Mobile support - (welcome screen only, partial/needs work)
- [ ] SEO overhaul adapted from the v3 SEO Guide format - partial
- [x] Fastify routes modified to ensure perfect SEO. This means absolute paths such as /example instead of ?z - done
- [ ] Randomize the \_\_uv$config global, and optionally randomize the UV prefix and URL encoding via cookies

## Proxy/Site Functionality

- [x] Ensure Ultraviolet is updated to support bare-mux and wisp - done
- [x] Add Rammerhead support - done
- [x] Fix slow Ultraviolet speeds despite being local; something on the backend?? - done
- [x] Fix Ultraviolet on Firefox - (partial/needs work)
- [ ] Adapt Applications page to use either Rammerhead or UV (for Reddit, YouTube, Discord)
- [x] libcurl, epoxy and all that fun stuff - done
- [x] socks5/tor routing option that can be configured (enabled) via either a cookie or pathname as a settings meny option - done
- [ ] Update games page content to 10000 games
- [ ] Update Applications page to reflect modern fast links (use examples from the modern web proxy base)
- [ ] Update settings menu again to make more room for more features
- [x] Update csel.js (after Setting menu redesign) to support custom transports, icon swap, routing - done
- [x] Update csel.js to support network based adblocking (partial/needs work)
- [ ] Add a "website self-destruct" button to the settings menu
- [ ] Flesh out and rework the UV / bare client error page - partial. function implementation done however styles not
- [x] Update sw.js to support workerware (https://github.com/MercuryWorkshop/workerware)-- This is not done however we have our own middleware system implemented for adblocking, etc. 
- [ ] Omnibox autoupdate script (for the Google/Bing style auto suggest feature)
- [ ] Games library will feature 10000 items; 5000 flash games and 5000 other game types
- [ ] Attach proxyvalidatorscript to a status page > have this be served via Fastify, etc. etc; config option disabled as it will cause issues potentially unless if we refactor it slightly.
- [ ] Improve adblocking functions on site using AnuraOS standards

## Site Redesign

- [x] Landing Cards - done
- [x] Change fonts to cleaner look
- [ ] Add more AOS interactions on scroll or hover
- [ ] Add subtle noise to background elements
- [ ] Update colors + add themes
- [ ] Toggle elements
- [ ] Other card options
- [ ] Radial blur elements
- [ ] Code standard examples
- [ ] Horizontal/general movement on scroll with AOS
- [ ] Showcase dev dependencies
- [ ] Update icons
- [x] Landing Page - (partial/needs work)
- [x] Settings Menu - (partial/needs work)
- [ ] More Dropdown Menu
- [ ] Web Proxies page
- [ ] Application page
- [ ] Hosting page
- [ ] Resources page
- [ ] Games Library page
- [ ] Emulators Library page
- [ ] Emu Library page
- [ ] Web Games page
- [ ] Flash Games page
- [ ] Documentation on-site + Getting Started information updated (Tor, etc.)
- [ ] FAQ page
- [ ] Credits page
- [ ] TOS page
- [x] Footer Design - (partial/needs work)
- [x] Header Design - (partial/needs work)

## Community Requests

- [ ] Add [Quake WASM](https://github.com/GMH-Code/Quake-WASM)
- [ ] Celeste WASM
- [ ] Doom WASM

## Changelog

- Added wisp support
- Fixed AD config setting being opt-out; ads are not implemented in the project however
- Added Rammerhead support (locally)
- Drastically updated visuals across the service and refactored stylesheets
- Bumped games page functionality
- Updated randomization scripts to ES6 syntax and implemented the alternative to RegEx string replacement
- Helmet for express implemented into backend
- Improved component handling via templates.mjs along with deletion of obsolete files that previously handled this standard in a poor format
- Fixed oddly slow speeds with Ultraviolet (as well as a general version bump to support epoxy-tls and bare-mux)
- Implemented testing scripts for an improved GitHub actions workflow by doing a quick test on proxy + site functionality
- Greatly optimized client-side scripts across the site with a new standard, and generally reworked to no longer leave global variables
- Changes to server.mjs with path logic and error handling
- Updated standards for common scripts
- libcurl and bare-as-module support added
- Deleted 5 JS scripts and moved lots of data into JSON files. Big reorganization. Games menu core scripts now nested inside of common.js utilizing a JSON system
- Massive updates to the Settings menu visually and functionality wise; added Bare-Mux support for swapping transports to work with Ultraviolet, default icons and selective adblocking + Tor on any proxy instances
- CSS Has been partially restructured for mobile support, and is now properly arranged into clearly labeled sections (for the most part)
- Incorporated makeshift domain blacklisting functionality into Ultraviolet, currently used for blocking ads if ads are disabled in settings
- Fleshed out the SEO with more descriptions and better labeling
- Switched to Fastify for serving content from the backend; a separate Express backend file is kept in case it's still needed
- Rammerhead is now locally built into the HU LTS repository
- Simplified the HU LTS setup process and added more default npm commands
