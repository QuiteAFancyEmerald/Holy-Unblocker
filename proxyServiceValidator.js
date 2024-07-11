const axios = require("axios");
const puppeteer = require("puppeteer");

const testEndpoint = async url => {
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
    "http://localhost:8080/",
    "http://localhost:8080/?pathtonowhere",
    "http://localhost:8080/?browse",
    "http://localhost:8080/?rh",
    "http://localhost:8080/?q",
    "http://localhost:8080/?documentation",
    "http://localhost:8080/?faq",
    "http://localhost:8080/?s",
    "http://localhost:8080/?credits",
    "http://localhost:8080/?x",
    "http://localhost:8080/?terms",
    "http://localhost:8080/?g",
    "http://localhost:8080/?h",
    "http://localhost:8080/?el",
    "http://localhost:8080/?f",
    "http://localhost:8080/?m",
    "http://localhost:8080/?y",
    "http://localhost:8080/?apps",
    "http://localhost:8080/?fg",
    "http://localhost:8080/?eg",
    "http://localhost:8080/?vos",
    "http://localhost:8080/assets/js/common-16451543478.js",
    "http://localhost:8080/assets/js/links-1644738239.js",
    "http://localhost:8080/assets/js/csel.js",
    "http://localhost:8080/assets/js/particlesjs/particles.js",
    "http://localhost:8080/baremux/bare.cjs",
    "http://localhost:8080/epoxy/index.js",
    "http://localhost:8080/uv/uv.bundle.js",
    "http://localhost:8080/uv/uv.config.js",
    "http://localhost:8080/assets/js/register-sw.js",
    "http://localhost:8080/assets/js/prset.js",
    "http://localhost:8080/assets/js/gnav/emu-nav.js",
    "http://localhost:8080/assets/js/gnav/h5-nav-1644738239.js",
    "http://localhost:8080/assets/js/gnav/flash-nav.js",
    "http://localhost:8080/assets/js/card.js",
    "http://localhost:8080/assets/js/gnav/emulib-nav.js",
    "http://localhost:8080/uv/sw.js",
    "http://localhost:8080/uv/uv.config.js"
  ];

  const results = await Promise.all(endpoints.map(testEndpoint));
  const allPassed = results.every((result) => result);

  if (allPassed) {
    console.log("All endpoints responded with status code 200. Test passed.");
    await testCommonJSOnPage();
  } else {
    console.error(
      "One or more endpoints failed to respond with status code 200. Test failed."
    );
    process.exit(1);
  }
};

const testCommonJSOnPage = async () => {
  const browser = await puppeteer.launch({
    args: [
      "--enable-features=NetworkService",
      "--enable-features=ServiceWorker",
      "--enable-features=InsecureOrigins",
    ],
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  try {
    const getHeaders = async () => {
      const headers = {};

      headers["User-Agent"] = await page.evaluate(() => navigator.userAgent);
      headers["Referer"] = await page.evaluate(() => window.location.href);

      return headers;
    };

    const testRammerhead = async () => {
      await page.goto("http://localhost:8080/?rh");

      const testResults = await page.evaluate(async () => {
        const results = {};

        await new Promise((resolve) => {
          if (document.readyState === "complete") {
            resolve();
          } else {
            window.addEventListener("load", resolve);
          }
        });

        if (window.goProx) {
          try {
            const rammerheadUrl = await window.goProx.rammerhead(
              "example.com",
              false
            );
            console.log("Generated Rammerhead URL:", rammerheadUrl);
            results.rammerhead = rammerheadUrl ? rammerheadUrl : "failure";
          } catch (e) {
            results.rammerhead = "failure: " + e.message;
          }
        } else {
          results.goProx = "not defined";
        }

        return results;
      });

      console.log("Rammerhead test results:", testResults);

      const headers = await getHeaders();
      const rammerheadTestPassed =
        testResults.rammerhead !== "failure" &&
        (await testGeneratedUrl(testResults.rammerhead, headers));

      console.log(
        `Rammerhead test result: ${
          rammerheadTestPassed ? "success" : "failure"
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
      await page.goto("http://localhost:8080/?q");

      const testResults = await page.evaluate(async () => {
        const results = [{}, {}];

        await new Promise((resolve) => {

          const waitForDocument = () => document.readyState === "complete"
          ? resolve()
          : window.addEventListener("load", resolve);

//        Wait until a service worker is registered before continuing.
//        Also make sure the document is loaded.
          const waitForWorker = async () => setTimeout(async () => {
          (await navigator.serviceWorker.getRegistrations()).length >= 1
            ? waitForDocument()
            : waitForWorker()
          }, 1000);

          waitForWorker();
        });

        if (window.goProx && window.goProx.ultraviolet) {
//          For the hacky URL test, use the URL page's EXACT title.
          const website = {
            path: "example.com",
            title: "Example Domain"
          };

          try {
            const generatedUrl = window.goProx.ultraviolet(
              website.path,
              false
            );
            console.log("Generated Ultraviolet URL:", generatedUrl);
            results[0].ultraviolet = generatedUrl ? generatedUrl : "failure";

//          Test to see if the document title for example.com has loaded,
//          by appending an IFrame to the document and grabbing its content.
            const testGeneratedUrlHacky = async (url) => {
              let result = false;
              const exampleIFrame = document.createElement("iframe");
              const waitForDocument = new Promise(resolve => {
                document.documentElement.appendChild(exampleIFrame);
                exampleIFrame.addEventListener("load", () => {
                result = exampleIFrame.contentWindow.document.title === website.title;
                resolve();
              });
            });
              exampleIFrame.src = url;
              exampleIFrame.style.display = "none";
              await waitForDocument;
              return result;
            };

            results[1].uvTestPassed = await testGeneratedUrlHacky(results[0].ultraviolet);
          } catch (e) {
            results[0].ultraviolet = "failure: " + e.message;
          }
        } else {
          results[0].goProx = "not defined";
        }

        return results;
      });

      console.log("Ultraviolet test results:", testResults[0]);

      if (testResults[0].ultraviolet && testResults[0].ultraviolet !== "failure") {
        const uvTestPassed = testResults[1].uvTestPassed;
        console.log(
          `Ultraviolet test result: ${uvTestPassed ? "success" : "failure"}`
        );
        return uvTestPassed;
      } else {
        console.log(`Ultraviolet test result: failure`);
        return false;
      }
    };

    // Run tests for Rammerhead and Ultraviolet
    const rammerheadPassed = await testRammerhead();
    const ultravioletPassed = await testUltraviolet();

    if (rammerheadPassed && ultravioletPassed) {
      console.log("Both tests passed.");
      process.exit(0);
    } else {
      console.error("Tests failed.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error in testCommonJSOnPage:", error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
};

testServerResponse();
