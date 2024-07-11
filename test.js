const axios = require("axios");
const puppeteer = require("puppeteer");

async function testEndpoint(url) {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    console.error(`Error while testing ${url}:`, error.message);
    return false;
  }
}

async function testGeneratedUrl(url, headers) {
  try {
    console.log(`Testing generated URL: ${url}`);

    const response = await axios.get(url, { headers });
    console.log(`Response status for ${url}: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.error(`Error while testing generated URL ${url}:`, error.message);
    return false;
  }
}

async function testServerResponse() {
  const endpoints = [
    "http://localhost:8080/",
    "http://localhost:8080/?pathtonowhere",
    "http://localhost:8080/?browse",
    "http://localhost:8080/?rh",
    "http://localhost:8080/?q",
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
}

async function testCommonJSOnPage() {
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
    async function getHeaders() {
      const headers = {};

      headers["User-Agent"] = await page.evaluate(() => navigator.userAgent);
      headers["Referer"] = await page.evaluate(() => window.location.href);

      return headers;
    }

    async function testRammerhead() {
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
    }

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



    async function testUltraviolet() {
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
          try {
//          For the hacky URL test, keep this as example.com.
            const generatedUrl = window.goProx.ultraviolet(
              "example.com",
              false
            );
            console.log("Generated Ultraviolet URL:", generatedUrl);
            results[0].ultraviolet = generatedUrl ? generatedUrl : "failure";

//          Test to see if the document title for example.com has loaded,
//          by appending an IFrame to the document and grabbing its content.
            const testGeneratedUrlHacky = async (url) => {
              let result = false;
              const exampleIFrame = document.createElement("iframe");
              const waitForDocument = new Promise(resolve => exampleIFrame.addEventListener("load", () => {
                result = exampleIFrame.contentWindow.document.title === "Example Domain";
                resolve();
              }));
              exampleIFrame.src = url;
              exampleIFrame.style.display = "none";
              document.documentElement.appendChild(exampleIFrame);
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
    }

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
}

testServerResponse();
