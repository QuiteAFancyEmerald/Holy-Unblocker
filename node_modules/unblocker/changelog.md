# Unblocker

## Changelog

# v2.0.0
* BREAKING: bumped minimum node.js version from 4.3 to 6 due to dependency requirements
* Fixed bug with attempting to decompress empty responses (#105)
* Updated dependencies

### v1.2.0 - 2017-05-15
* Added support for specifying the HTTP/HTTPS Agent (#102)

### v1.1.4 - 2016-07-22
* Fixed bug with %-encoded cookies

### v1.1.3 - 2016-07-21
* Fixed bug in short html responses
* More tests
* dependency bumps

### v1.1.2
* removing nodeumblocker.com notice

### v1.1.1
* dependency bumps
* notice about nodeunblocker.com

### v1.1.0 - 2016-02-22
* Removed `through` dependency in favor of Node's built in `Transform` stream - should be slightly faster / lower memory usage
* Removed support for Node.js < 4.3

### v1.0.12 - 2016-02-22
* unpublished due to issues with node.js v0.12

### v1.0.11 - 2016-02-22
* Fixed bugs with urls that get rewritten twice (due to string concatenation in proxied JS) - #74

### v1.0.10 - 2016-02-21
* Fixed bugs with urls that get slashes merged - #66
* Updated dependencies

### v1.0.9 - 2016-02-08
* Updated dependencies
* Automated npm publishing via Travis CI.
* No functional changes

### v1.0.8 - 2015-10-21
* Updated dependencies
* CI improvements

### v1.0.7 - 2015-10-21
* Strip Content Security Policy (CSP) headers
* Strip HTTP Public-Key-Pinning (HPKP) headers
* Fixed bug with html snippets that lack a charset - #54
* Fixed bug with protocol-relative redirects (//) - #52, #49
* Bumped minimum node.js version to v0.12 - #45

### v1.0.6 - 2015-07-22
* Documentation improvements

### v1.0.4 - 2015-07-04
* Improved documentation
* Request no compression if client cannot accept gzip.

### v1.0.3 - 2015-07-03
* Fixed two bugs with copying cookies between protocols & subdomains 

### v1.0.2 - 2015-07-03
* Simplifications and small performance enhancements in url-prefixer.

### v1.0.1 - 2015-07-03
* Request gzip only, better handling of deflate responses if received (fixes issue 12)

### v1.0.0 - 2015-07-02
* Refactored unblocker into an express-compatible library with nodeunblocker.com code moved to examples folder
* Added a middleware API and updated most internal logic to use the API
* Added support for hosting the proxy at / rather than just at /proxy/
* Rewrote cookie handling to no longer require a redis server

### v0.14.0 - 2015-06-29
* Added charset encoding tests
* Switched from iconv to iconv-lite: faster and no compilation needed (this is especially helpful for running on Windows)
* Bumped node.js requirement to 0.12
* Added [dotenv](https://www.npmjs.com/package/dotenv) for local development

### v0.13.1 - 2014-6-25
* remove strict-transport-security header
* tweaks to play nice on nodejitsu servers

### v0.12.0 - 2013-12-12
* Replaced server.js with [Gatling](https://github.com/nfriedly/node-gatling)
* Removed memwatch

### v0.11.3 - 2013-12-4
* Updated design to be mobile-friendly

### v0.11.1 - 2013-12-4
* Tweaked Redis client and blocklist to not keep server open after unit tests

### v0.11.0 - 2013-12-3
* Seperated app and server more cleanly
* Additional JSHint checks
* Added [memwatch](https://github.com/lloyd/node-memwatch)

### v0.10.1
* Replaced built-in monitoring code with (optional) New Relic support
* Split proxying and server code into two files.

### v0.9.4 - 2013-12-2
* Fixed a bug when attempting to parse cookies on invalid urls

### v0.9.3 - 2013-12-2
* Added JSHint to the test suite
* JSBeautify'd code
* Moved static content and code to it's own directory and file
* Added a test for static content

### v0.9.2 - 2013-11-31
* Added unit tests for url prefixing on streams that get split in various locations
* Fixed bugs these tests revealed
* Fixed bug with links pointing to / not getting rewritten
* Added backpressure support to streams

### v0.9.1 - 2013-11-31
* Unit tests for Google Analytics
* Google Analytics bug fix

### v0.9.0 - 2013-11-31
* Set up Continous Deployment
* Default proxied traffic to SSL if url is nodeunblocker.com
* Updated to Node.js v0.10-style streams
* Split encoding, url prefixing, ROBOTS meta tag, and Google Analytics into individual files (and streams)
* Unit tests for UrlPrefixStream.
* Added a performance test
* Increased the HTTP Agent's maximum number of Open Connections - issue https://github.com/nfriedly/node-unblocker/issues/17

### v0.8.2 - 2013-11-26
* Added tests
* Fixed a few bugs with creating proxied links.

### v0.8.0 - 2012-4-29
* Added support for more charsets via Iconv. (Issues #10 & #11)
** This may have broken compatibility with Windows, more investigation to come. https://github.com/nfriedly/node-unblocker/zipball/v0.7.1 is pure JS and known to be Windows-compatible.

### v0.7.1 - 2012-3-6
* Added GA tracking and and noindex/nofollow meta tags to proxied pages
* Improved status page to show cluster-wide statistics (Issue #4)
* Fixed issue #7 to better track concurrent requests

### v0.6.0 - 2012-2-24
* Added support for node.js 0.6's native clustering
* Removed simple-session library and replaced it with [connect's](https://github.com/senchalabs/connect/) session library backed by a redis store

### v0.5.0 - 2012-2-24
* Reworked fileserver to serve index.html from memory and use compression when avaliable
* Added some windows support (although it doesn't bind to localhost)

### v0.4.1 - 2012-2-23
* Fixed issue #2 for relative path bug when the domain name didn't have a / following it
* Removed compress library dependency in favor of the native zlib library that shipped in node 0.6
* Several small tweaks to support running on Heroku servers

### v0.4 - 2011-4-4
* Added keyword and domain blocklists
* Pulled out configuration into a separate file
* Set up live demo at nodeunblocker.com
* Added "military" theme

### v0.3 - 2011-03-29
* Added support for remote HTTPS servers.
* Created a simple-session library. (The ones I tried were all tied to bigger projects and/or didn't work well)
* Added basic cookie support via sessions.
* Urls that are relative to the root of the site are now processed in both html and css.
* Now only buffers last few characters if a chunk appears to end in the middle of a url.
	
### v0.2 - 2011-03-28
* Added redirect support 
* Added gzip support
* improved filters

### v0.1 - 2011-03-26
* Initial release; basic passthrough and url-fixing functionality
