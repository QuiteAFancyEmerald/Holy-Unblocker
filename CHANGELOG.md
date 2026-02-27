## v1.2.64

- catch websocket errors
- re-enabled http2 by default. see `config.js` for details.

## v1.2.63

- add ability to override proxy settings on server-level basis
- update `testcafe-hammerhead` from `24.5.18` to `31.6.2`

## v1.2.62

- fix throw error on empty files

## v1.2.61

- fix missing cors origin header when port and crossDomainPort are the same

## v1.2.6

- properly fixed window.top issues when window.top isn't hammerhead
- replace unreliable `win.__get$(win, 'location')` with just rewriting the url directly 
- fix worker-hammerhead.js proxy url rewriting port undefined when 443 or 80

## v1.2.51

- add newly added classes to exports in src/index.js

## v1.2.5

- replace broken `keyv-lru-files` with own implementation of JS caching

## v1.2.42

- fix localStorage's getItem referencing parent in iframes

## v1.2.41

- handle removeStaleSessions of .get() returning undefined from corrupted session files

## v1.2.4

- fix crashes from corrupted sessions

## v1.2.3

- fix memory usage issues when downloading huge files
- fix iframing cross-origin proxy

## v1.2.2

- add disk cache option for processed JS files. fixes huge server memory usage and enables workers to share the same cache
- update `testcafe-hammerhead` to `v24.5.18`. fixes huge server slowdowns as brotli compression level is now adjusted to a much more reasonable value

## v1.2.11

- fix huge spikes of memory usage by replacing localStorage system with a custom one
- more fixes for iframing

## v1.2.01

- avoid using unstable API `fs.cpSync` in build.js

## v1.2.0

- added multithreading support

## v1.1.34

- convert hooks to stackable rewrite system

## v1.1.33

- delete hooks only after all fix function calls

## v1.1.32

- fix localStorage communication between windows by forcing them to read/write from realLocalStorage on every (get/set)Item call 

## v1.1.31

- add argument for ignoring files in `addStaticFilesToProxy`
- fix parseProxyUrl().proxy.port for 443 and 80 urls

## v1.1.3

- add option to restrict IP to session

## v1.1.21

- fix rewriting only non-websocket server headers
- fix errors when calling focus()/click()... to a closed iframe
- don't strip headers (hook onto res.writeHead) if connection is a websocket

## v1.1.2

- build to rammerhead.js and rammerhead.min.js
- fix same-domain iframes
- add jsdoc definitions for rammerhead store classes
- fix http proxy setting not deleting correctly

## v1.1.1

- fix uncatchable connection crash errors
- avoid shuffling percent encodings
- prevent forwarding localStorage endpoint to site by referrer
- fix (un)shuffle for location.hash and location.search

## v1.1.0

- add url encoding
- handle ECONNRESET manually
- bring back MemoryStore class for module exports
- add server option to disable localStorage syncing
- fix `RammerheadSessionFileCache` not saving cache to disk correctly

## v1.0.8

- handle websocket EPIPE error
- replace hammerhead's connection reset guard with a non-crashing rammerhead's reset guard
- add missing element attr getter unrewrite
- fix url rewriting for ports 80 and 443

## v1.0.7

- disable http2 support (for proxy to destination sites) because error handling is too complicated to handle
- removed server headers `report-to` (to avoid proxy url leak) and `cross-origin-embedder-policy` (which fixes reCAPTCHA v3)

## v1.0.61

- fix logger.error undefined (caused by not fully updating arguments for httpResponse.badRequest)

## v1.0.6

- expose more utils for npm package
- show password box if needed for html demo

## v1.0.5

- expose more modules for npm package
- add support for .env files
- add `deleteUnused` config option
- fix default 3 day session delete

## v1.0.43

- revert "revert fix for fix npm package"

## v1.0.42

- add entrypoint index.js for rammerhead package
- add package-lock.json to source control

## v1.0.41

- update demo link
- fix npm package

## v1.0.4

- add support for environment variable `DEVELOPMENT`
- fix crash when fetching /deletesession with a non-existent session id

## v1.0.3

- fix stability issues with websocket

## v1.0.2

- update `testcafe-hammerhead` to `v24.5.13`

## v1.0.1

- removed multi worker and rate limiting support to defer the complexity to other more suitable platforms like Docker. See [this commit](https://github.com/binary-person/rammerhead/tree/31ac3d23f30487f0dcd14323dc029f4ceb3b235a) if you wish to see the original attempt at this.
- removed unused session cleanup (as traversing the session list forces the cache into memory)
- lots of cleanup

## v1.0.0

- Initial commit
