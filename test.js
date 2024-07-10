const axios = require('axios');
const puppeteer = require('puppeteer');

async function testEndpoint(url) {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    console.error(`Error while testing ${url}:`, error.message);
    return false;
  }
}

async function testGeneratedUrl(url) {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    console.error(`Error while testing generated URL ${url}:`, error.message);
    return false;
  }
}

async function testServerResponse() {
  const endpoints = [
    'http://localhost:8080/',
    'http://localhost:8080/?pathtonowhere',
    'http://localhost:8080/?browse',
    'http://localhost:8080/?rh',
    'http://localhost:8080/?q'
  ];

  const results = await Promise.all(endpoints.map(testEndpoint));
  const allPassed = results.every(result => result);

  if (allPassed) {
    console.log('All endpoints responded with status code 200. Test passed.');
    await testCommonJSOnPage();
  } else {
    console.error('One or more endpoints failed to respond with status code 200. Test failed.');
    process.exit(1); // Exit with failure
  }
}

async function testCommonJSOnPage() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Function to test Rammerhead with "?rh"
    async function testRammerhead() {
      await page.goto('http://localhost:8080/?rh');

      const testResults = await page.evaluate(async () => {
        const results = {};

        // Wait for the DOM content to be fully loaded and goProx to be available
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });

        if (window.goProx) {
          // Test rammerhead with google.com
          try {
            const rammerheadUrl = await window.goProx.rammerhead('google.com', false);
            results.rammerhead = rammerheadUrl ? rammerheadUrl : 'failure';
          } catch (e) {
            results.rammerhead = 'failure: ' + e.message;
          }
        } else {
          results.goProx = 'not defined';
        }

        return results;
      });

      console.log('Rammerhead test results:', testResults);

      const rammerheadTestPassed = testResults.rammerhead !== 'failure' && await testGeneratedUrl(testResults.rammerhead);

      console.log(`Rammerhead test result: ${rammerheadTestPassed ? 'success' : 'failure'}`);

      return rammerheadTestPassed;
    }

    // Function to test Ultraviolet with "?q"
    async function testUltraviolet() {
      await page.goto('http://localhost:8080/?q');

      const testResults = await page.evaluate(async () => {
        const results = {};

        // Wait for the DOM content to be fully loaded and goProx to be available
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });

        if (window.goProx) {
          // Test ultraviolet with google.com
          try {
            const uvUrl = window.goProx.ultraviolet('google.com', false);
            results.ultraviolet = uvUrl ? uvUrl : 'failure';
          } catch (e) {
            results.ultraviolet = 'failure: ' + e.message;
          }
        } else {
          results.goProx = 'not defined';
        }

        return results;
      });

      console.log('Ultraviolet test results:', testResults);

      const uvTestPassed = testResults.ultraviolet !== 'failure' && await testGeneratedUrl(testResults.ultraviolet);

      console.log(`Ultraviolet test result: ${uvTestPassed ? 'success' : 'failure'}`);

      return uvTestPassed;
    }

    // Run tests for Rammerhead and Ultraviolet
    const rammerheadPassed = await testRammerhead();
    const ultravioletPassed = await testUltraviolet();

    if (rammerheadPassed && ultravioletPassed) {
      console.log('Both tests passed.');
      process.exit(0); // Exit with success
    } else {
      console.error('Tests failed.');
      process.exit(1); // Exit with failure
    }
  } catch (error) {
    console.error('Error in testCommonJSOnPage:', error.message);
  } finally {
    await browser.close();
  }
}

testServerResponse();
