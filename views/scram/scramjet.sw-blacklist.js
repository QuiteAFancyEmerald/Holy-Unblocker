importScripts('{{route}}{{/scram/scramjet.all.js}}');
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

//  Get list of blacklisted domains.
const blacklist = {},
  nativeFunction = Function;
fetch('{{route}}{{/assets/json/blacklist.json}}').then((request) => {
  request.json().then((jsonData) => {
    // Organize each domain by their tld (top level domain) ending.
    jsonData.forEach((domain) => {
      const domainTld = domain.replace(/.+(?=\.\w)/, '');
      if (!blacklist.hasOwnProperty(domainTld)) blacklist[domainTld] = [];

      // Store each entry in an array. Each tld has its own array, which will
      // later be concatenated into a regular expression.
      blacklist[domainTld].push(
        encodeURIComponent(domain.slice(0, -domainTld.length))
          .replace(/([()])/g, '\\$1')
          .replace(/(\*\.)|\./g, (match, firstExpression) =>
            firstExpression ? '(?:.+\\.)?' : '\\' + match
          )
      );
    });

    // Turn each domain list into a regular expression and prevent this
    // from being accidentally modified afterward.
    for (let [domainTld, domainList] of Object.entries(blacklist))
      blacklist[domainTld] = new RegExp(`^(?:${domainList.join('|')})$`);
    Object.freeze(blacklist);
  });
});

async function handleRequest(event) {
  await scramjet.loadConfig();
  if (scramjet.route(event)) {
    // The one and only ghetto domain blacklist.
    try {
      const domain = new URL(
          nativeFunction(`return ${scramjet.config.codec.decode}`)()(
            new URL(event.request.url).pathname.replace(
              scramjet.config.prefix,
              ''
            )
          )
        ).hostname,
        domainTld = domain.replace(/.+(?=\.\w)/, '');

      // If the domain is in the blacklist, return a 406 response code.
      if (
        blacklist.hasOwnProperty(domainTld) &&
        blacklist[domainTld].test(domain.slice(0, -domainTld.length))
      )
        return new Response(new Blob(), { status: 406 });
    } catch (e) {
      // This is the case where it is an invalid fetch request, or the WASM file.
    }

    return scramjet.fetch(event);
  }
  return fetch(event.request);
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
        time: event.data.request.headers.get('Date'),
      });
    });
    requestPort.start();
  }
});
