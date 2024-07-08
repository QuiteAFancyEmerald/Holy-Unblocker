const axios = require('axios');

async function testServerResponse() {
    try {
        const response = await axios.get('http://localhost:8080/');
        if (response.status === 400) {
            console.log('Server responded with status code 400. Test passed.');
            process.exit(0); // Exit with success
        } else {
            console.error(`Expected status code 400 but received ${response.status}. Test failed.`);
            process.exit(1); // Exit with failure
        }
    } catch (error) {
        console.error('Error while testing server response:', error.message);
        process.exit(1); // Exit with failure
    }
}

testServerResponse();
