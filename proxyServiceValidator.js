// This file is solely used for the automatically run GitHub job, which checks to
// see if all HU LTS code is working properly (at least on an Ubuntu machine).

const axios = require('axios');
const puppeteer = require('puppeteer');

const testEndpoint = async (url) => {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    console.error(`Error while testing ${url}:`, error.message);
    return false;
  }
};

const testGeneratedUrl = async (url, headers) => {
  try {
    console.log(`Testing generated URL: ${url}`);

    const response = await axios.get(url, { headers });
    console.log(`Response status for ${url}: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.error(`Error while testing generated URL ${url}:`, error.message);
    return false;
  }
};

const testServerResponse = async () => {
  const endpoints = [
    'http://localhost:8080/',
    'http://localhost:8080/test-404',
    'http://localhost:8080/browsing',
    'http://localhost:8080/rammerhead',
    'http://localhost:8080/ultraviolet',
    'http://localhost:8080/documentation',
    'http://localhost:8080/questions',
    'http://localhost:8080/s',
    'http://localhost:8080/credits',
    'http://localhost:8080/bookmarklets',
    'http://localhost:8080/terms',
    'http://localhost:8080/games',
    'http://localhost:8080/web-games',
    'http://localhost:8080/emulators',
    'http://localhost:8080/flash-games',
    'http://localhost:8080/retro-games',
    'http://localhost:8080/youtube',
    'http://localhost:8080/apps',
    'http://localhost:8080/flash',
    'http://localhost:8080/webretro',
    'http://localhost:8080/vibe-os',
    'http://localhost:8080/assets/js/particlesjs/particles.js',
    'http://localhost:8080/assets/js/bareTransport.js',
    'http://localhost:8080/assets/js/card.js',
    'http://localhost:8080/assets/js/common-16451543478.js',
    'http://localhost:8080/assets/js/csel.js',
    'http://localhost:8080/assets/js/register-sw.js',
    'http://localhost:8080/assets/json/emu-nav.json',
    'http://localhost:8080/assets/json/blacklist.json',
    'http://localhost:8080/assets/json/emulib-nav.json',
    'http://localhost:8080/assets/json/flash-nav.json',
    'http://localhost:8080/assets/json/h5-nav.json',
    'http://localhost:8080/assets/json/links.json',
    'http://localhost:8080/baremux/index.js',
    'http://localhost:8080/baremux/worker.js',
    'http://localhost:8080/epoxy/index.mjs',
    'http://localhost:8080/uv/uv.bundle.js',
    'http://localhost:8080/uv/sw.js',
    'http://localhost:8080/uv/uv.config.js',
    'http://localhost:8080/uv/workerware.js',
    'http://localhost:8080/uv/WWError.js',
  ];

  const results = await Promise.all(endpoints.map(testEndpoint));
  const allPassed = results.every((result) => result);

  if (allPassed) {
    console.log('All endpoints responded with status code 200. Test passed.');
    await testCommonJSOnPage();
  } else {
    console.error(
      'One or more endpoints failed to respond with status code 200. Test failed.'
    );
    process.exitCode = 1;
  }
};

const testCommonJSOnPage = async () => {
  const browser = await puppeteer.launch({
    args: [
      '--enable-features=NetworkService',
      '--enable-features=ServiceWorker',
      '--enable-features=InsecureOrigins',
    ],
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  try {
    const getHeaders = async () => {
      const headers = {};

      headers['User-Agent'] = await page.evaluate(() => navigator.userAgent);
      headers['Referer'] = await page.evaluate(() => window.location.href);

      return headers;
    };

    const testRammerhead = async () => {
      await page.goto('http://localhost:8080/rammerhead');

      const testResults = await page.evaluate(async () => {
        const results = {};

        await new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });

        // Locate the omnibox element on the Rammerhead page.
        let omnibox = document.getElementById('pr-rh');
        omnibox = omnibox && omnibox.querySelector('input[type=text]');

        if (omnibox) {
          try {
            // Send an artificial input to the omnibox. The omnibox will create
            // a proxy URL and leave it as the input value in response.
            const urlPath = 'example.com';
            omnibox.value = urlPath;
            const generateInput = async () => {
              await omnibox.dispatchEvent(
                new KeyboardEvent('keydown', { code: 'Validator Test' })
              );
            };
            /* Keep trying to send a signal every 5 seconds until it works.
             * Implemented to account for a condition where the document has
             * finished loading, but the event handler for DOMContentLoaded has
             * not finished executing its script to listen for artificial inputs.
             */
            await generateInput();
            const inputInterval = setInterval(generateInput, 5000);

            // Wait up to 40 seconds for the omnibox to finish updating.
            const loadUrl = new Promise((resolve) => {
                if (omnibox.value !== urlPath) {
                  clearInterval(inputInterval);
                  resolve(omnibox.value);
                } else
                  omnibox.addEventListener('change', () => {
                    clearInterval(inputInterval);
                    resolve(omnibox.value);
                  });
              }),
              timeout = new Promise((resolve) => {
                setTimeout(() => {
                  clearInterval(inputInterval);
                  resolve(omnibox.value);
                }, 40000);
              }),
              // Record the proxy URL that the omnibox left here.
              generatedUrl = await Promise.race([loadUrl, timeout]);
            console.log('Generated Rammerhead URL:', generatedUrl);
            results.rammerhead =
              generatedUrl !== urlPath ? generatedUrl : 'failure';
          } catch (e) {
            results.rammerhead = 'failure: ' + e.message;
          }
        } else {
          results.omnibox = 'not defined';
        }

        return results;
      });

      console.log('Rammerhead test results:', testResults);

      const headers = await getHeaders();
      const rammerheadTestPassed =
        testResults.rammerhead !== 'failure' &&
        (await testGeneratedUrl(testResults.rammerhead, headers));

      console.log(
        `Rammerhead test result: ${
          rammerheadTestPassed ? 'success' : 'failure'
        }`
      );

      return rammerheadTestPassed;
    };

    /*

                                                     xx   
  xx                                            xx    
   xxx                                        xx      
     xxx                                     xx       
       xxx                                  xx        
         xxx                              xx          
            xx                           xx           
             xx                         xx            
                                       xx             
                                      xx              
                                                      
                                                      
                                                      
                                                      
               x                    x                 
                                                      
                                                      
                                                      
                                                      
                                                      
                                                      
                        xxxxxxxxxxxxxxx               
             xxxxxxxxxxxx              xxxxx          
          xxxx                              xxx       
       xxx                                    xxx     
     xxx                                        xx    
    xx                                           xx   
   xx                                             xx  
 xxx                                               x  
 xx                                                 x 
xx                                                  xx

*/

    const testUltraviolet = async () => {
      await page.goto('http://localhost:8080/ultraviolet');

      const testResults = await page.evaluate(async () => {
        const results = [{}, {}];

        await new Promise((resolve) => {
          const waitForDocument = () =>
            document.readyState === 'complete'
              ? resolve()
              : window.addEventListener('load', resolve);

          // Wait until a service worker is registered before continuing.
          // Also make sure the document is loaded.
          const waitForWorker = async () =>
            setTimeout(async () => {
              (await navigator.serviceWorker.getRegistrations()).length >= 1
                ? waitForDocument()
                : waitForWorker();
            }, 1000);

          waitForWorker();
        });

        // Locate the omnibox element on the Ultraviolet page.
        let omnibox = document.getElementById('pr-uv');
        omnibox = omnibox && omnibox.querySelector('input[type=text]');

        if (omnibox) {
          // For the hacky URL test, use the URL page's EXACT title.
          const website = {
            path: 'example.com',
            title: 'Example Domain',
          };

          try {
            // Send an artificial input to the omnibox. The omnibox will create
            // a proxy URL and leave it as the input value in response.
            omnibox.value = website.path;
            const generateInput = async () => {
              await omnibox.dispatchEvent(
                new KeyboardEvent('keydown', { code: 'Validator Test' })
              );
            };
            /* Keep trying to send a signal every 5 seconds until it works.
             * Implemented to account for a condition where the document has
             * finished loading, but the event handler for DOMContentLoaded has
             * not finished executing its script to listen for artificial inputs.
             */
            await generateInput();
            const inputInterval = setInterval(generateInput, 5000);

            // Wait up to 40 seconds for the omnibox to finish updating.
            const loadUrl = new Promise((resolve) => {
                if (omnibox.value !== website.path) {
                  clearInterval(inputInterval);
                  resolve(omnibox.value);
                } else
                  omnibox.addEventListener('change', () => {
                    clearInterval(inputInterval);
                    resolve(omnibox.value);
                  });
              }),
              timeout = new Promise((resolve) => {
                setTimeout(() => {
                  clearInterval(inputInterval);
                  resolve(omnibox.value);
                }, 40000);
              }),
              // Record the proxy URL that the omnibox left here.
              generatedUrl = await Promise.race([loadUrl, timeout]);
            console.log('Generated Ultraviolet URL:', generatedUrl);
            results[0].ultraviolet =
              generatedUrl !== website.path ? generatedUrl : 'failure';

            // Test to see if the document title for example.com has loaded,
            // by appending an IFrame to the document and grabbing its content.
            const testGeneratedUrlHacky = async (url) => {
              const exampleIFrame = document.createElement('iframe');
              const waitForDocument = new Promise((resolve) => {
                document.documentElement.appendChild(exampleIFrame);
                exampleIFrame.addEventListener('load', () => {
                  resolve(
                    exampleIFrame.contentWindow.document.title === website.title
                  );
                });
              });

              // Give 10 seconds for the IFrame to load before manually checking.
              const timeout = new Promise((resolve) => {
                setTimeout(() => {
                  resolve(
                    exampleIFrame.contentWindow.document.title === website.title
                  );
                }, 10000);
              });

              exampleIFrame.src = url;
              exampleIFrame.style.display = 'none';
              return await Promise.race([waitForDocument, timeout]);
            };

            results[1].uvTestPassed =
              results[0].ultraviolet !== 'failure' &&
              (await testGeneratedUrlHacky(results[0].ultraviolet));
          } catch (e) {
            results[0].ultraviolet = 'failure: ' + e.message;
          }
        } else {
          results[0].omnibox = 'not defined';
        }

        return results;
      });

      console.log('Ultraviolet test results:', testResults[0]);

      if (
        testResults[0].ultraviolet &&
        testResults[0].ultraviolet !== 'failure'
      ) {
        const uvTestPassed = testResults[1].uvTestPassed;
        console.log(
          `Ultraviolet test result: ${uvTestPassed ? 'success' : 'failure'}`
        );
        return uvTestPassed;
      } else {
        console.log(`Ultraviolet test result: failure`);
        return false;
      }
    };

    // Run tests for Rammerhead and Ultraviolet.
    const rammerheadPassed = await testRammerhead();
    const ultravioletPassed = await testUltraviolet();

    if (rammerheadPassed && ultravioletPassed) {
      console.log('Both tests passed.');
      process.exitCode = 0;
    } else {
      console.error('Tests failed.');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Error in testCommonJSOnPage:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
};

testServerResponse();
