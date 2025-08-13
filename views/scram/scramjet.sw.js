importScripts('{{route}}{{/scram/scramjet.all.js}}');
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
  await scramjet.loadConfig();
  if (scramjet.route(event)) {
    return scramjet.fetch(event);
  }
  if (event.clientId && event.request.url) return fetch(event.request);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});

let playgroundData;
self.addEventListener('message', (event) => {
  if (event.data.type === 'playgroundData') {
    playgroundData = event.data;
  } else if (event.data.type === 'requestAC') {
	// Set up a message channel from common.js to process autocomplete search results.
    const requestPort = event.ports[0];
    requestPort.addEventListener('message', async (event) => {
      const response = await scramjet.fetch(event.data);

      // This contains some duplicate code from common.js, since Response objects
      // cannot be passed through service workers and must be preprocessed.
      const responseType = response.headers.get('content-type');
      let responseJSON = {};
      if (responseType && responseType.indexOf('application/json') !== -1)
        responseJSON = await response.json();
      else
        try {
          responseJSON = await response.text();
          try {
            responseJSON = JSON.parse(responseJSON);
          } catch (e) {
            responseJSON = JSON.parse(
              responseJSON.replace(/^[^[{]*|[^\]}]*$/g, '')
            );
          }
        } catch (e) {
          // responseJSON will be an empty object if everything was invalid.
        }

      // Return the processed data.
      requestPort.postMessage({
        responseJSON: responseJSON,
        searchType: event.data.type,
      });
    });
    requestPort.start();
  }
});
