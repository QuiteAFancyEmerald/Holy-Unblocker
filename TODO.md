This will be our nonexhaustive todo list for revamping the Holy Unblocker project.

## Code Cleanup

  - [ ] Remove the timestamps attached to the end of the JS file names.
  - [ ] Remove all current obfuscation in the source code. It needs to be dynamically obfuscated if anything, or not obfuscated at all. This option will be a config option on the server side before rendering with Express for a performance focus. Meta elements will have an additonal attribute indicating if they should be moved. This is to ensure a SEO source can be served by config or a source focused on pure censorship evasion.
  - [ ] Optimize the stylesheets and the HTML layout. Add more proper commenting and redivide the code so that it's less hard on the eyes.
  - [ ] Optimize the JS. This time it won't be in one line and will be somewhat thoroughly commented.
  - [ ] Restructure navigation scripts to ensure updated proxy functionality is sanitized and effective
  - [x] Particles.js automatically adjusting per display size

## Proxy Functionality
  - [x] Ensure Ultraviolet is updated to support bare-mux and wisp - done
  - [x] Add Rammerhead support - done
  - [ ] Fix slow Ultraviolet speeds despite being local; something on the backend??

## Site Redesign
  - [x] Landing Page - done
  - [ ] Web Proxies page
  - [ ] Application page
  - [ ] Games Libray page
  - [x] Footer Design - done
  - [ ] Header Design
