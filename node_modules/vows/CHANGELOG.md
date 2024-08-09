v0.8.3 / Tue, 15 Oct 2019
========================

  * Update `diff` dependency to fix regexp denial-of-service vulnerability (`Trott`)

v0.8.0 / Tue, 4 Nov 2014
========================
  * [775db8f] [dist] Version bump. 0.8.0 (`indexzero`)
  * [623b375] [dist] Update dependencies to latest. (`indexzero`)
  * [bf8e6aa] [dist] Update contributors on README and package.json. (`indexzero`)
  * [f113849] [doc] Added TravisCI build status. (`indexzero`)
  * [f9f37df] sh instead of js (`Ionică Bizău`)
  * [8db36b9] Code highlight (`Ionică Bizău`)
  * [43e917c] Regenerated package.json (`Ionică Bizău`)
  * [a7764ad] Add tests on context and sub context, synchronous and asynchronous (`Romain`)
  * [03a04db] [fix] Support backwards compatibility for Object reporters in #190. (`indexzero`)
  * [f120d45] Ability to programmatically specify reporter (`Ilya Shaisultanov`)
  * [a9a02d0] Merge pull request #297 from snoble/master (`Charlie Robbins`)
  * [7939c94] [test] fix .travis.yml file needs quote, remove 0.9, add 0.11 (`Swaagie`)
  * [dfdc074] Merge pull request #304 from eventualbuddha/patch-1 (`Martijn Swaagman`)
  * [a5acef5] Typo fix. (`Brian Donovan`)
  * [aa8cd5e] Merge pull request #263 from adamstallard/master (`Jerry Sievert`)
  * [1e8fa11] Make coffeescript register itself if it has a register function. (`Steven H. Noble`)
  * [253ca34] Merge pull request #283 from gabeio/patch-1 (`Maciej Małecki`)
  * [42f23c3] refactor: remove line that was made redundant after the last merge from upstream (`adamstallard`)
  * [ef5e76b] ignore hg files (`adamstallard`)
  * [e6bcc64] update vows package (`adamstallard`)
  * [45e9fdf] Moved tag master to changeset 45104b15b3a8 (from changeset 45e0b0d31984) (`adamstallard`)
  * [ecac185] Moved tag default/master to changeset 45104b15b3a8 (from changeset 5797560897ea) (`adamstallard`)
  * [ce6c2c6] update vows package (`adamstallard`)
  * [383acd6] Merge (`adamstallard`)
  * [c8c2ff0] Backed out changeset: be18031783bf (`adamstallard`)
  * [e86bddd] Backed out changeset: 19f9533f9bae (`adamstallard`)
  * [f031545] Added tag default for changeset 162f542dd244 (`adamstallard`)
  * [eaaf51a] Moved tag master to changeset 45e0b0d31984 (from changeset be18031783bf) (`adamstallard`)
  * [7595734] Moved tag default/master to changeset 45e0b0d31984 (from changeset 5797560897ea) (`adamstallard`)
  * [d6e2872] Added tag master for changeset be18031783bf (`adamstallard`)
  * [e1d3d16] remove accidental commit (`adamstallard`)
  * [ae4a214] Merge from Upstream (`adamstallard`)
  * [2d77a7a] update vows package (`adamstallard`)
  * [1ed1b8c] Added repository field to package.json (`Gabe De`)
  * [d1d02e0] [test] Test on recent versions of node (`Maciej Małecki`)
  * [bc4c239] [fix] Do not use `util.{print,puts}` (`Maciej Małecki`)
  * [a23a1c9] continue to run subtopics even if a parent topic has an error in it (fixes #231) (`adamstallard`)
  * [fb0ec87] Merge pull request #267 from coltrane/glob (`Charlie Robbins`)
  * [eb66421] Set the return value to 'undefined' on an unexpected error (since we always use a callback); improve comments (`adamstallard`)
  * [8e4c8b8] use node-glob instead of wildcard for better pattern support (`J. Lee Coltrane`)
  * [d6604c3] Don't print out extra blank lines in the spec reporter when end of suite fires. (`adamstallard`)
  * [e10dc94] Make the xunit reporter follow the established pattern of using the vows console module and allowing for overriding the stream. (`adamstallard`)
  * [98470cb] revert accidental inclusion of print statement (`adamstallard`)
  * [4acd17e] Check that tests report errors like they should (`adamstallard`)
  * [50a13b5] Handle errors correctly based on suite.options.error and the number of parameters expected by the vow:  When suite.options.error is set to false or a vow expects two or more parameters, get the error as the first argument and don't report it; When suite.options.error is set to true and a vow expects zero or one parameters, report the error and do not run the vow. (`adamstallard`)
  * [26e5941] fix typo in comment (`adamstallard`)
  * [a7843f4] [dist doc] Remove unnecessary Makefile and document that tests should be run with `npm test`. Fixes #241 (`indexzero`)
  * [458eb3e] diff colors were reversed (`Andrew Petersen`)
  * [154b6cd] Add a not include assertion (`Fred Cox`)
  * [4a9dc5d] added nopstream to mimic writing to /dev/null on windows (`Dale Stammen`)
  * [5d087fc] added nullstream.js to mock /dev/null on windows (`Dale Stammen`)
  * [92868a9] support for windows drives other than c: (`Dale Stammen`)
  * [f7d09c5] node can't write to nul. reserved filename in windows. changed to .nul. updated .gitignore (`Dale Stammen`)
  * [4c53be1] fix for issue 248. file starts with a c (`Dale Stammen`)

v0.7.0 / Fri, 16 Nov 2012
=========================
  * [c683d88] [dist] Bump version to 0.7.0 (`Maciej Małecki`)
  * [8776492] use nul for windows equivalent of /dev/null. Added nul to .gitignore (`Dale Stammen`)
  * [48683fb] fixed path handling for wildcards and test module loading with require (`Dale Stammen`)
  * [5085b39] remove console.log statementsif present from start of results (`Dale Stammen`)
  * [7f8d511] remove os.EOL for strerr test. Only removed first result if not json (`Dale Stammen`)
  * [aace8dd] skip over non json results (`Dale Stammen`)
  * [b5438a1] remove --supress-stdout only on win32 (`Dale Stammen`)
  * [d419819] remove windows specific reposne in stdout (`Dale Stammen`)
  * [8ceef77] removed  --supress-stdout from spawn. check for C: in file paths (`Dale Stammen`)
  * [cfe7888] removed console.log (`Dale Stammen`)
  * [70865cc] added wildcard * support to files (`Dale Stammen`)
  * [e85197b] use process.execPath and not ./bin/vows in for cmd in call to exec(). Fix for windows (`Dale Stammen`)
  * [cde6d9b] added ignore .idea (`Dale Stammen`)
  * [304643f] use process.execPath not ./bin/vows. This is consistent with how exec works in vows and works on windows. Use os.EOL to check oh no string so it works on platforms that use \r\n (`Dale Stammen`)
  * [d728652] added cross-platform fixes to support windows (`Dale Stammen`)
  * [f412e4a] [fix] Fix crashes on node v0.9.3 (`Maciej Małecki`)
  * [808a773] Merge pull request #202 from Filirom1/master (`Alexis Sellier`)
  * [d073b06] Do not catch ReferenceError (`Romain`)

v0.6.4 / Thu, 23 Aug 2012
=========================
  * [e797515] [dist] Bump version to 0.6.4 (`Maciej Małecki`)
  * [8dea08d] [dist] Fix `package.json` (`Maciej Małecki`)
  * [fb123cc] fix console require (`Jerry Sievert`)
  * [e5a000b] Merge remote-tracking branch 'execjosh/tap-reporter' into v0.6.4 (`Jerry Sievert`)
  * [bcb82f1] merge in mocha style html coverage reports (`Jerry Sievert`)
  * [0779766] merged in diff support (`Jerry Sievert`)
  * [bfdd005] Merge pull request #220 from trevnorris/master (`Maciej Małecki`)
  * [5564dd5] Merge remote-tracking branch 'cloudhead/master' (`Trevor Norris`)
  * [bfb4bf5] Use plus/minus unicode in error msg (`Trevor Norris`)
  * [1e6eb0f] Epsilon check fix (`Trevor Norris`)
  * [3c0dc3b] Add IEEE float epsilon check (`Trevor Norris`)
  * [bfb8998] Add Mocha credit. (`Reid Burke`)
  * [cbd6123] Add Mocha-style multi-line string diffs. (`Reid Burke`)
  * [aa51288] Add <title> to the HTML coverage report. (`Reid Burke`)
  * [f7afb1b] Better style for directory names in coverage menu. (`Reid Burke`)
  * [526f036] Use Mocha's style for HTML coverage report. (`Reid Burke`)
  * [93dbc61] Summarize coverage data for HTML report. (`Reid Burke`)
  * [abb0d5a] Implement TAP reporter (`execjosh`)

v0.6.3 / Wed, 27 Jun 2012
=========================
  * [f0d2ecc] [dist] Bump version to 0.6.3 (`Maciej Małecki`)
  * [674830d] [bin] Make isolate mode work in node >= 0.7 (`Maciej Małecki`)
  * [075b0eb] [minor] `Math.floor` instead of `Math.ceil` (`Maciej Małecki`)
  * [796ac5d] [bin] Add `--shuffle` option (`Maciej Małecki`)
  * [4347cdd] [fix] Fix unsafe object iterations (`Maciej Małecki`)
  * [a785630] Allow camelCase test filename (`Romain`)
  * [03f60dd] Add `assert.lengthOf` on objects (`Romain`)
  * [38817c1] Exit code should be 1 if asynchronous errors occurs (`Olivier Bazoud`)
  * [3e60864] [refactor] Don't touch `require.extensions` (`Maciej Małecki`)

v0.6.2 / Fri, 24 Feb 2012
=========================
  * [6aa9673] [dist] Version 0.6.2 (`Maciej Małecki`)
  * [6b803ab] [bin] Use `process.execPath` instead of `process.argv[0]` (`Maciej Małecki`)
  * [1d06e90] [api] Write XML coverage report to `coverage.xml` (`Maciej Małecki`)
  * [e0fb4dc] Merge pull request #161 from cliffano/master (`Maciej Małecki`)
  * [9dd9b9e] [bin] Skip dotfiles before `fs.stat()`ing them (`Nathan Hunzaker`)
  * [4342fe9] [ui] Add support for `\n` in context names (`jmreidy`)
  * [bbc8e55] [api] Make `assert.include` fail when given unknown type (`Maciej Małecki`)
  * [fe37eec] [test] Add `.travis.yml` for testing on Travis CI (`Maciej Małecki`)
  * [b2ca904] Add coverage report in xml format. (`Cliffano Subagio`)

v0.6.1 / Mon, 26 Dec 2011
=========================
  * [c84e55c] [dist] Version 0.6.1 (`Maciej Małecki`)
  * [239df60] [test] Test if exception thrown in the topic gets passed down (`Bernardo Heynemann`)
  * [6f84e3b] [api fix] When topic `throw`s, treat exception as a return value (`Maciej Małecki`)
  * [a480a5f] Merge pull request #160 from seebees/nested_context_with_callback (`Charlie Robbins`)
  * [30a9d94] Merge pull request #168 from johnnywengluu/master (`Maciej Małecki`)
  * [722d4d8] Documentation bug fix: Rename *length* to *lengthOf* in a test. (`Johnny Weng Luu`)
  * [08b0650] [reporters/json] fix async error reporting (`Fedor Indutny`)
  * [fbf7f69] [fix] Fix leaking `self` (`Maciej Małecki`)
  * [9853e64] Async topic is passed to vows with topic-less subcontext (`seebees`)

v0.6.0 / Fri, 25 Nov 2011
=========================
  * [82d5541] [dist] Version bump. 0.6.0 (`indexzero`)
  * [3943fec] event order for 'on' (`seebees`)
  * [d9fe353] [minor] Update style from previous commit (`indexzero`)
  * [e92c1e4] Added --no-color option to suppress terminal colors (`Alexander Shtuchkin`)
  * [8788a52] [v0.6 fix] Properly inspect errors (`Maciej Małecki`)
  * [6760a2e] [merge] Manual merge of #135 since the fork no longer exists. Fixes #135 (`indexzero`)
  * [ddd9588] When an uncaught exception is caught in watch mode, print it in the console and continue watch. (`Julien Guimont`)
  * [ddf3cf4] [merge] add support for coffee files when printing out errors. Fixes #140 (`indexzero`)
  * [1448de2] When called outside the vows context where `this.stack` && `source` are undefined it will now no longer crash and burn (`Raynos`)
  * [c92aabc] Expose console so we can re-use it in custom reporters. (`Raynos`)
  * [c67786f] [merge] Manual merge of #95 since the fork no longer exists. Fixes #95 (`indexzero`)
  * [81482b1] Fixed indentation and some missing semicolons requested in #82 (`Ryan Olds`)
  * [f39a4e2] Add support for asynchronous teardowns. (`Daniel Brockman`)
  * [a44ee69] Edited README.md via GitHub (`Jerry Sievert`)
  * [a781c45] events other then success (`seebees`)
  * [d081d49] Buffer not needed and leaking a global. (`Nicolas Morel`)
  * [482d09c] adding a filter to the watch logic, so that only test files are run (`jmreidy`)
  * [f77e4bd] fixing regular expression for specFileExt to use an OR (`jmreidy`)
  * [e7fbdb4] test require should refer to lib/vows, not system vows (`jmreidy`)
  * [907d308] Adding vows support for underscores, in addition to dashes, in spec or test names (`jmreidy`)

v0.5.13 / Wed, 2 Nov 2011
=========================
  * [a5912ba] [dist] Version bump. 0.5.13 (`indexzero`)
  * [0894d94] Merge pull request #146 from mmalecki/fix-output (`Charlie Robbins`)
  * [7290532] [fix] Fix failed assertions output (`Maciej Małecki`)

v0.5.12 / Sat, 22 Oct 2011
==========================
  * [ef4a803] [dist] Version bump. 0.5.12 (`indexzero`)
  * [58f44f0] [dist] Add test script for `npm test` (`indexzero`)
  * [bd14209] [fix minor] Remove unnecessary argument in `exec` callback (`Maciej Małecki`)
  * [00509bd] [test] Test `--supress-stdout` flag (`Maciej Małecki`)
  * [8ce12a5] [test] Add fixtures for supress-stdout test (`Maciej Małecki`)
  * [50052f5] [test v0.6] Make `assert-test.js` v0.6-compatible (`Maciej Małecki`)
  * [fde1216] [refactor minor] Use `JSON.parse` when getting version (`Maciej Małecki`)
  * [cc76162] [refactor minor] Remove unused variables in `vows.addVow.runTest` (`Maciej Małecki`)
  * [006476f] [v0.6] Handle stdout suppressing correctly (`Maciej Małecki`)
  * [87462e6] [api] Rename `assert.length` to `assert.lengthOf` (`Maciej Małecki`)
  * [fd44e08] [fix v0.6] No `error.stack` for nextTick errors (`Maciej Małecki`)
  * [eac4362] [refactor v0.6] Remove/replace `sys` usages (`Maciej Małecki`)
  * [485698d] (doc) add 'authors' section to README (`Alexis Sellier`)

v0.5.11 / Sat, 20 Aug 2011
==========================
  * [3843409] (dist) Version bump. 0.5.11 (`indexzero`)
  * [954386c] (test) Added tests for error pass thru (`indexzero`)
  * [0108f1f] Allow arguments to flow through to callbacks in error conditions. (`Ben Taber`)
  * [3b9acac] add unified coverage maps, and fix issue when using coverage without instrumentation (`Jerry Sievert`)
  * [3a2f697] add unified coverage maps, and fix issue when using coverage without instrumentation (`Jerry Sievert`)
  * [5b2ae84] (fix) Check topic.constructor to reverse regression introduced by instanceof check (`indexzero`)
  * [c7f9e3c] added assert.isNotEmpty and assert.isDefined (`nekaab`)

v0.5.10 / Fri, 12 Aug 2011
==========================
  * [484b5f4] [fix] Update references to `stylize` after refactor (`indexzero`)
  * [f18b45c] (minor) Move .vowsText and .contextText out of reporters/spec into vows/console (`indexzero`)
  * [a813268] (fix) Remove unecessary reference to spec in reporters/dot-matrix.js. Fixes #117 (`indexzero`)
  * [0d8c406] [fix] Dont always append a tailing `\n` to all test output (`indexzero`)
  * [67b7ce7] (minor) Update package.json (`indexzero`)
  * [33aeb64] (dist) Version bump. 0.5.10 (`indexzero`)
  * [889b748] [bin test] Added additional teardown test. Update bin/vows to support absolute path. #83 (`indexzero`)
  * [c8ee815] [style] respect cloudhead's style (`Fedor Indutny`)
  * [dcf5021] [isolate] fixed test fixtures naming (`Fedor Indutny`)
  * [9be20ef] [isolate] allow reporters to output raw data (`Fedor Indutny`)
  * [5c40a46] [isolate] tests (`Fedor Indutny`)
  * [26fc3f7] [isolate] supress-stdout option and true stream usage in reporters (`Fedor Indutny`)
  * [d53c429] [isolate] exec => spawn, stream suite output, fix command line arguments to child process (`Fedor Indutny`)
  * [c2a1d60] [isolate] collect results (`Fedor Indutny`)
  * [b275024] [isolate] implement runner (`Fedor Indutny`)
  * [3543c0e] [isolate] added command line option (`Fedor Indutny`)
  * [76565ef] Merge pull request #102 from seebees/master (`Alexis Sellier`)
  * [661b34f] Merge pull request #107 from ciaranj/provide_collapsable_coverage_boxes (`Alexis Sellier`)
  * [63a15e7] Provide some very rudimentary CSS & JS to collapse the 'covered' source by default and use colours to draw your eye to the areas that need tackling (`ciaranj`)
  * [96a17a2] use instanceof to check if the return value from a topic is an EventEmitter (`seebees`)
  * [3e98285] Test for change (`seebees`)

v0.5.9 / Fri, 22 Jul 2011
=========================
  * [e80e96d] (dist) version bump (`cloudhead`)
  * [76e9175] add /bin folder to package.json (`cloudhead`)
  * [d597378] fix assert.inDelta global vars (`cloudhead`)
  * [9418795] remove `require.paths` dependency (`cloudhead`)
  * [13a52f4] Merge pull request #101 from JerrySievert/master (`Alexis Sellier`)
  * [3d400b8] adds coverage map functionality (`Jerry Sievert`)
  * [bc868fa] (new) added assert.inDelta (`mynyml`)
  * [5b770a4] Merge pull request #93 from joshkehn/master (`Alexis Sellier`)
  * [db608e2] NaN !== Boolean (`Joshua Kehn`)
  * [4144271] Implemented isBoolean and tests to match (`Joshua Kehn`)
  * [3802967] Merged pull request #78 from mynyml/master. (`Alexis Sellier`)
  * [342dbae] added assert.deepInclude (`mynyml`)
  * [27f683a] added assert.deepInclude (`mynyml`)

v0.5.8 / Sat, 12 Mar 2011
=========================
  * [7c9b21d] (dist) version bump (`Alexis Sellier`)
  * [72b9299] (style) ws (`Alexis Sellier`)
  * [381c0a3] Fixed CoffeeScript support on Node 0.3+ (`Janne Hietamäki`)
  * [697ada4] (minor test) cleanup (`Alexis Sellier`)
  * [3291d77] fix vow context when global (`Alexis Sellier`)

v0.5.7 / Sun, 20 Feb 2011
=========================
  * [f700eed] (dist) version bump (`Alexis Sellier`)
  * [7b20446] support for this.callback.call({}, ...) (`Alexis Sellier`)
  * [7874f54] improve async error report (`Alexis Sellier`)
  * [332b522] include test filename in some error reports (`Alexis Sellier`)
  * [1ddf5b1] (api) support for /.test.js$/ filenames (`Alexis Sellier`)
  * [93da10b] (minor) cleanup (`cloudhead`)
  * [402e309] Fixed watch mode. (`Matteo Collina`)

v0.5.6 / Mon, 31 Jan 2011
=========================
  * [0b54a98] (dist) revert to node 0.2.6, version bump to 0.5.6 (`cloudhead`)
  * [430021f] merge improved teardown support (`cloudhead`)
  * [f1ff2c1] preserve 0.2.6 compatibility (`cloudhead`)
  * [d6ba141] added simple xunit support, so vows can be used together with Hudson (`Anders Thøgersen`)
  * [d88924d] (dist) update package.json to include node version (`cloudhead`)
  * [a00c89d] Updated teardown to execute after subcontexts complete (`Jeremiah Wuenschel`)

v0.5.4 / Sat, 29 Jan 2011
=========================
  * [c2633dc] (dist) version bump (`cloudhead`)
  * [4361e42] use 'on' instead of 'addListener' (`cloudhead`)
  * [eb4d50d] support '.' in filenames (`cloudhead`)
  * [3030206] (test) test for multiple arguments in callbacks (`cloudhead`)
  * [1c18b66] remove listeners warning on topics (`cloudhead`)
  * [8fb1a56] support for multiple arguments passed to sub-topics (`cloudhead`)
  * [398443d] (minor) aliased export to exportTo (`cloudhead`)
  * [3b1545a] (bin) update for node 0.2.5 (`cloudhead`)
  * [f0f823d] (bin) fix auto-discover mode (`cloudhead`)

v0.5.3 / Wed, 29 Dec 2010
=========================
  * [3d12553] (dist) version bump (`cloudhead`)
  * [936e18a] fix some error messages (`cloudhead`)
  * [64760fe] (bin) fix exit status (`cloudhead`)

v0.5.2 / Wed, 13 Oct 2010
=========================
  * [349437b] (dist) version bump (`cloudhead`)
  * [61c01d9] tell user if no tests were run. (`cloudhead`)
  * [50077aa] Pass suite reference to batches (`Yurii Rashkovskii`)
  * [213d6cd] Made a change that eliminates the following bug (see http://github.com/cloudhead/vows/issues#issue/16): Sometimes you want to test an object that inherits from EventEmitter. In this case, if you return said testable object as the topic, then the code hangs if the EventEmitter subclass instance that I'm testing doesn't emit "success" or "error." (`bnoguchi`)

v0.5.1 / Tue, 24 Aug 2010
=========================
  * [679e8a6] (dist) version bump (`cloudhead`)
  * [c3ad80d] (new) basic teardown support (`cloudhead`)

v0.5.0 / Tue, 10 Aug 2010
=========================
  * [7cdf94f] (dist) version bump, update package.json (`cloudhead`)
  * [e8cf93e] (minor) naming/style changes (`cloudhead`)
  * [db57e70] Add ability to circumvent `addBatch` (`Travis Swicegood`)
  * [36c5c47] Add ability to run .coffee files (`Travis Swicegood`)
  * [df1e61b] Merge branch 'master' of github.com:cloudhead/vows (`cloudhead`)
  * [ccf6ec0] (doc) fix link (`Alexis Sellier`)

v0.4.6 / Thu, 1 Jul 2010
========================
  * [d78e098] (dist) version bump (`cloudhead`)
  * [a6c51c4] better assert.isNaN check (`cloudhead`)
  * [2b7398e] ability to pass suite options to export method (`cloudhead`)
  * [4fc9097] (new) --no-error (`cloudhead`)
  * [f2eb7b2] more refactoring in addVow (`cloudhead`)
  * [cca54cf] refactor counter updates (`cloudhead`)
  * [c98bcc4] (doc) fix README (`Alexis Sellier`)
  * [726b82f] updated README for site (`cloudhead`)

v0.4.5 / Mon, 28 Jun 2010
=========================
  * [ed576d7] (dist) version bump (`cloudhead`)
  * [5cdc2ba] (api) watch mode can take arguments, fixed a couple edge cases (`cloudhead`)

v0.4.4 / Sun, 27 Jun 2010
=========================
  * [9ea324f] (dist) version bump (`cloudhead`)
  * [e0ffeea] fix --version (`cloudhead`)
  * [afd3aab] handle edge case in this.callback, where a single boolean is returned (`cloudhead`)
  * [30e6688] don't exit until stdout is drained (`cloudhead`)
  * [d1b71d8] (test) add an empty batch to make sure it works (`cloudhead`)
  * [92aafed] improved error message when callback returns uncaught error (`cloudhead`)
  * [93aeaa3] result of this.callback is passed down to nested topics (`cloudhead`)
  * [ae16916] fixed a bug with falsy topics (`cloudhead`)

v0.4.3 / Thu, 24 Jun 2010
=========================
  * [335a8ee] (dist) version bump (`cloudhead`)
  * [7875366] return an appropriate exit code from bin/vows, depending on success of the tests. (`cloudhead`)
  * [4e1da2f] allow this.callback to be used more flexibly (`cloudhead`)

v0.4.2 / Wed, 23 Jun 2010
=========================
  * [3d83502] (dist) version bump (`cloudhead`)
  * [b94c047] fixed watch mode in OS X Terminal (`cloudhead`)
  * [a532f17] rename context.name => context.description, and make context.name be the last level only (`cloudhead`)
  * [cd4a763] remove throw/doesNotThrow message customization, cause it's fucked (`cloudhead`)
  * [6298227] (minor) fixed grammar in assertion message (`cloudhead`)

v0.4.1 / Thu, 17 Jun 2010
=========================
  * [a2f11f0] (dist) version bump (`cloudhead`)
  * [df248d4] include subject in error message (`cloudhead`)
  * [cf3f4e2] use suite's reporter for errors (`cloudhead`)
  * [833a2a0] console.result prints 'dropped' vows (`cloudhead`)
  * [3d1217a] detect un-fired vows on exit, and report error (`cloudhead`)
  * [e1d1ea5] track vows and vow statuses in batches (`cloudhead`)
  * [8917efe] fix indentation in assert.equal error message (`cloudhead`)
  * [31c46cf] (dist) fix Makefile (`cloudhead`)
  * [8ac48b9] rename some internal functions for consistency (`cloudhead`)
  * [0acf40e] update --help command (`cloudhead`)
  * [3f3cc66] silent reporter (`cloudhead`)
  * [692cb71] try to handle async errors more intelligently (`cloudhead`)
  * [7ed9f65] (api) '-m' and '-r' now require a space between pattern (`cloudhead`)
  * [82f6e5e] (new) added more options to bin (`cloudhead`)
  * [75ff4ab] (api) addVows => addBatch (`cloudhead`)
  * [a7f9f30] (test) improve test descriptions (`cloudhead`)
  * [e53338c] (api) don't add space between context descriptions in some cases (`cloudhead`)
  * [1593768] (test) remove other-test.js (`cloudhead`)
  * [f2ff9b5] (test) move assert module tests to its own file (`cloudhead`)
  * [5f415df] output function name in AssertionError, if {expected} is a function (`cloudhead`)

v0.4.0 / Tue, 15 Jun 2010
=========================
  * [0b32f54] (dist) version bump to 0.4.0 (`cloudhead`)
  * [3e0fb87] improve subject appearance in spec.js (`cloudhead`)
  * [29161c7] make sure we only output on exit, if there's a failure (`cloudhead`)
  * [98418c7] set batch.status to 'end' when ended (`cloudhead`)
  * [5a3362f] catch silent async failures on exit (`cloudhead`)
  * [6546552] don't try to exist when tests complete (`cloudhead`)
  * [7edb97a] reset pending vows in Suite#reset (`cloudhead`)
  * [6baca02] nicer output. refactor of formatters (`cloudhead`)

v0.3.5 / Sun, 13 Jun 2010
=========================
  * [4a1a65a] (dist) version bump (`cloudhead`)
  * [f10884d] improved assertion error messages. added tests (`cloudhead`)
  * [72eecd7] (new) added new assertions (`cloudhead`)
  * [1e90188] set styles to false for inspector (`cloudhead`)
  * [47c2d1f] (new) support multiple test suites per file (`cloudhead`)
  * [bb9a5af] abort() function to exit with an error (`cloudhead`)
  * [90e0bae] (api) watch mode is activated with -w (`cloudhead`)
  * [1cdfd1c] don't output contexts for pending vows in watch mode (`cloudhead`)
  * [3416f44] fix spec reporter + pending vow (`cloudhead`)
  * [4b92fa4] (new api) '-m' matches a string, changes -R to -r (`cloudhead`)

v0.3.4 / Wed, 9 Jun 2010
========================
  * [25abf72] (dist) version bump (`cloudhead`)
  * [8052146] fix/improve the cleanup on exit (`cloudhead`)
  * [df83078] print a different cue when running tests in watch mode (`cloudhead`)
  * [c533efa] fix context reporting for dot-matrix (`cloudhead`)
  * [3e67750] remove deprecated 'brief' option (`cloudhead`)
  * [11a1edd] (new) tests can be 'pending' (`cloudhead`)
  * [062450c] handle this.callback called synchronously (`cloudhead`)

v0.3.3 / Tue, 8 Jun 2010
========================
  * [311df5f] (dist) version bump (`cloudhead`)
  * [55a7a92] print contexts in dot-matrix & watch output (`cloudhead`)
  * [06b5563] (doc) updated README (`cloudhead`)

v0.3.2 / Mon, 7 Jun 2010
========================
  * [4079f57] (dist) version bump (`cloudhead`)
  * [cca5d46] move inspect() to vows/console (`cloudhead`)

v0.3.1 / Mon, 7 Jun 2010
========================
  * [fe7ae18] (dist) version bump (`cloudhead`)
  * [a0dacb7] Set default for `options` in run(). (`cloudhead`)
  * [e27bdfc] round time output (`cloudhead`)

v0.3.0 / Sat, 5 Jun 2010
========================
  * [868cd9f] ability to print messages without a nl (`cloudhead`)
  * [b851ffe] only the spec reporter prints subjects (`cloudhead`)
  * [d5b0d34] pattern matching is operational (`cloudhead`)
  * [09e31cf] better remaining vow detection and handling (`cloudhead`)
  * [b3985d8] we don't support vows as functions anymore (`cloudhead`)
  * [a2e15a2] better vow counting (`cloudhead`)
  * [7beb71d] parse vows at run-time, so we can apply a matcher (`cloudhead`)
  * [247015b] use options in run() or default to Suite (`cloudhead`)
  * [ee77415] Suite-level matcher/reporter (`cloudhead`)
  * [aae87c2] no more global module state (`cloudhead`)
  * [f825f7f] tidy up the requires in bin/vows (`cloudhead`)
  * [b9d856e] (dist) lib is lib/vows (`cloudhead`)
  * [2f9bb00] (dist) added bin to package.json (`cloudhead`)
  * [575d1a5] updated Makefile to use test runner (`cloudhead`)
  * [7d93078] (dist) version bump (`cloudhead`)
  * [c3afbbc] revised vows.js header (`cloudhead`)
  * [ec867b6] output fixes (`cloudhead`)
  * [1f2abe5] (new) watch reporter (`cloudhead`)
  * [b9882a5] add print() function to reporters (`cloudhead`)
  * [151b76c] fuck the buffer (`cloudhead`)
  * [1ab43bd] report subject on run() (`cloudhead`)
  * [88b5ade] complete rewrite of bin/vows (`cloudhead`)
  * [af04a10] exported Suites also run automatically when file is run directly (`cloudhead`)
  * [244cd01] reset Suite before running it, instead of after, so we don't upset the exit check (`cloudhead`)
  * [7ce4579] another test, just to test runner (`cloudhead`)
  * [0e3b661] ability to export batch/suite (`cloudhead`)
  * [073e875] ability to reset batch/suite (`cloudhead`)
  * [bd8a4f8] refactor reporters, share more. (`cloudhead`)
  * [8cd49ba] 'reporter' option instead of boolean flags. Also pass subject to Suite. (`cloudhead`)
  * [e2d1951] bye bye addVow (`cloudhead`)
  * [e5855a2] fix dot-matrix reporter not reporting errors (`cloudhead`)
  * [6fe14ec] suite.js init (`cloudhead`)
  * [b9c0329] Complete re-architecturing of vows. (`cloudhead`)
  * [4adab80] dot-matrix is the default reporter (`cloudhead`)
  * [e16cadf] (dist) cleanup Makefile (`cloudhead`)
  * [7200208] moved vows.prepare to extras.js (`cloudhead`)
  * [14278d0] cleaned up project structure a little (`cloudhead`)
  * [fb7d8a9] extracted console utils out of spec/dot-matrix reporters (`cloudhead`)
  * [ba8c46e] (new) dot-matrix reporter (`cloudhead`)

v0.2.5 / Mon, 24 May 2010
=========================
  * [0a53b70] (dist) version bump (`cloudhead`)
  * [ce73ecd] Cleaned up the inner loop a little (`cloudhead`)
  * [9fa313c] Fix incorrect binding in test functions. (`cloudhead`)

v0.2.4 / Sun, 23 May 2010
=========================
  * [b10a30a] (dist) version bump (`cloudhead`)
  * [2f231b1] (doc) updated README with assertion macros (`cloudhead`)
  * [179f854] (new) assert.instanceOf assert.isUndefined (`cloudhead`)
  * [87afe4c] don't complain about return value in topic if old (`cloudhead`)

v0.2.3 / Sat, 22 May 2010
=========================
  * [f867791] (dist) version bump (`cloudhead`)
  * [cb9e66e] (new) added assert.isNull, and made isObject more robust (`cloudhead`)
  * [cf459bc] fixed inspector doing weird shit. (`cloudhead`)

v0.2.2 / Sat, 22 May 2010
=========================
  * [5df28a5] (dist) version bump (`cloudhead`)
  * [c741f7b] (minor doc) typo in README (`cloudhead`)
  * [8092bb3] throw error when this.callback with a return value (`cloudhead`)
  * [70cf79e] (minor) standardized error messages (`cloudhead`)
  * [a214eb8] (new) Support for callback-style async testing (`cloudhead`)
  * [c600238] (doc) new install instructions (`cloudhead`)
  * [473e215] (dist) fixed dependencies (`cloudhead`)
  * [0083f0a] (dist) version bump (`cloudhead`)
  * [94a58be] (dist) updated paths and package.json (`cloudhead`)
  * [03a4171] (new) test for NaN, and added assert.isNaN (`cloudhead`)
  * [3f4bbec] throw Error if missing top-level context (`cloudhead`)
  * [9294ed8] Merge branch 'master' of github.com:cloudhead/vows (`cloudhead`)
  * [748e1ee] added 'install' task (`cloudhead`)
  * [babc2e6] version bump to 0.2.0 (`cloudhead`)

v0.2.0 / Mon, 17 May 2010
=========================
  * [fba631c] (minor) renamed statusText to status (`cloudhead`)
  * [bf80bec] time can equal 0, check more reliably (`cloudhead`)
  * [98c70ad] make console reporter a little more powerful (`cloudhead`)
  * [1606341] use json reporter if --json is passed (`cloudhead`)
  * [8a1d447] overhaul of continuous testing functionality, to use json backend (`cloudhead`)
  * [cc041ee] fix JSON reporter (`cloudhead`)
  * [24e6516] Merge branch 'master' of github.com:cloudhead/vows (`cloudhead`)
  * [a604161] renamed 'printer' -> 'reporter' (`cloudhead`)
  * [dc9a746] Decouple the reporting system. (`cloudhead`)
  * [aba0f57] updated SS (`Alexis Sellier`)
  * [1882f19] (fix) topics getting added multiple times (`cloudhead`)
  * [f59fb55] version bump (`cloudhead`)

v0.1.4 / Sun, 16 May 2010
=========================
  * [f887206] (fix) output the subjects without need for nextTick (`cloudhead`)
  * [1cb886c] (fix) count vows properly, by skipping 'topic' keys (`cloudhead`)
  * [6454351] fixed bug with function returning topics (`cloudhead`)
  * [053d7de] (test) topics returning functions (`cloudhead`)
  * [28f23ca] make sure result doesn't precede title (`cloudhead`)
  * [219ea81] fix lastTopic not being set properly (`cloudhead`)
  * [0cefa91] version bump (`cloudhead`)

v0.1.3 / Wed, 12 May 2010
=========================
  * [e97b946] pass emitted errors if test is expecting it (`cloudhead`)
  * [d79b6d5] fixed assert.include on objects (`cloudhead`)
  * [e43aa0e] added assert.length & assert.isFunction (`cloudhead`)
  * [99eb7de] improved emitter code in describe() (`cloudhead`)
  * [8a4f76d] vows.describe is the default now (`cloudhead`)

v0.1.2 / Tue, 11 May 2010
=========================
  * [06290ee] updated readme/comments to new API (`cloudhead`)
  * [fee2e78] version bump (`cloudhead`)
  * [15648b1] 'end' takes some parameters (`cloudhead`)
  * [a54c076] when passing a function, there is no promise, also print an nl (`cloudhead`)
  * [4fc5b9c] only count vows if passing an object to addVows() (`cloudhead`)
  * [0dd8387] tests. (`cloudhead`)
  * [cb3ab7e] don't require a topic at all (`cloudhead`)
  * [57fa14b] use 'end' as a completion event for test-suites (`cloudhead`)
  * [68e147d] pass the test-suite promises to tryFinish() (`cloudhead`)
  * [bfa2a26] keep track of the number of test suites (`cloudhead`)
  * [8e55f78] merge (`cloudhead`)
  * [f394e79] test for chained vows (`cloudhead`)
  * [b7a65c0] vow counting is sync. emit success when local remaining == 0 (`cloudhead`)
  * [b95d282] API change, ability to run serial test suites (`cloudhead`)
  * [fa51949] allow nested contexts with no topics (`cloudhead`)
  * [0b891d6] topic/subject ref fix (`cloudhead`)
  * [6e49a11] write an error if an EventEmitter hasn't fired (`cloudhead`)
  * [06485b8] added spinning wheel (`cloudhead`)
  * [8260e38] updated READMe (`cloudhead`)
  * [8a03c2a] 'setup' is now called 'topic' (`cloudhead`)
  * [a7b5857] allow non-function subjects (`cloudhead`)
  * [11d2e8f] added isEmpty and typeOf assertion macros (`cloudhead`)

v0.1.1 / Sun, 2 May 2010
========================
  * [abadd5d] updated eyes (`cloudhead`)
  * [1198d46] evaluate everything within an 'environment', which is passed down (`cloudhead`)
  * [531d4bf] refactored escape code printing (`cloudhead`)
  * [c1167bd] package.json (`cloudhead`)
  * [d15c538] rename makefile to Makefile (`cloudhead`)
  * [333a7f2] attempt to detect the name of the test folder (`cloudhead`)
  * [3cfd5a5] explicitly return vows.promise from test runner (`cloudhead`)
  * [b78539e] allow access to Context object, from tests (`cloudhead`)
  * [1348def] describe is an alias of tell (`cloudhead`)
  * [ba08ca3] use typeof instead of instanceof (`cloudhead`)

v0.1.0 / Sat, 1 May 2010
========================
  * [547d478] forgot to remove some test code (`cloudhead`)
  * [5bba9c3] default value for matcher (`cloudhead`)
  * [1a64009] bin/vows, autotesting utility (`cloudhead`)
  * [051bb40] formatting (`cloudhead`)
  * [3db9c6a] the matcher is an option now. -R'match string' (`cloudhead`)
  * [d4d7e3e] the --brief option. Also fixed various buffering problems (`cloudhead`)
  * [6d6c950] changed spacing in test output (`cloudhead`)
  * [8b2afda] don't use a Vow object, just use Object.create() (`cloudhead`)
  * [70ef3a6] whitespace (`cloudhead`)
  * [1d14683] Buffer test output, return EventEmitter. (`cloudhead`)
  * [f6d27ac] Merge branch 'master' of github.com:cloudhead/vows.js (`cloudhead`)
  * [50f76f8] other repos should be submodules (`Matt Lyon`)
  * [1b02c0a] bugfix: only add setup vals to context once (`Matt Lyon`)
