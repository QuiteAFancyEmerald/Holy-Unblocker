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

    async function testUltraviolet() {
      await page.goto("http://localhost:8080/?q");

      await page.waitForFunction(() => document.readyState === "complete");

      await page.evaluate(async () => {
        const stockSW = "/uv/sw.js";
        const swAllowedHostnames = ["localhost", "127.0.0.1"];

        async function registerSW() {
          if (!navigator.serviceWorker) {
            if (
              location.protocol !== "https:" &&
              !swAllowedHostnames.includes(location.hostname)
            )
              throw new Error(
                "Service workers cannot be registered without https."
              );

            throw new Error("Your browser doesn't support service workers.");
          }

          await navigator.serviceWorker.register(stockSW);

          let wispUrl =
            (location.protocol === "https:" ? "wss" : "ws") +
            "://" +
            location.host +
            "/wisp/";
          await BareMux.SetTransport("EpxMod.EpoxyClient", { wisp: wispUrl });
        }

        await registerSW();
      });

      const swTestPassed = await testEndpoint(
        "http://localhost:8080/assets/js/register-sw.js"
      );

      console.log(
        `Service Worker registration test result: ${
          swTestPassed ? "success" : "failure"
        }`
      );

      return swTestPassed;
    }

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
