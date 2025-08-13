importScripts('{{route}}{{/uv/uv.bundle.js}}');
importScripts('{{route}}{{/uv/uv.config.js}}');
importScripts(self['{{__uv$config}}'].sw || '{{route}}{{/uv/uv.sw.js}}');

/*

Workerware does not work yet due to one of the following possibilities:

1. UV or the bare client is not updated to support workerware yet.
2. Workerware is unfinished.
3. We are doofuses and do not know how to use workerware properly.

Going to implement a ghetto domain blacklist for now.

importScripts("./workerware.js");

const ww = new WorkerWare({
  debug: true,
  randomNames: true,
  timing: true
});


ww.use({
  function: event => console.log(event),
  events: ["fetch", "message"]
});

*/

const uv = new UVServiceWorker();

// Get list of blacklisted domains.
const blacklist = {};
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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      if (uv.route(event)) {
        // The one and only ghetto domain blacklist.
        const domain = new URL(
            uv.config.decodeUrl(
              new URL(event.request.url).pathname.replace(uv.config.prefix, '')
            )
          ).hostname,
          domainTld = domain.replace(/.+(?=\.\w)/, '');

        // If the domain is in the blacklist, return a 406 response code.
        if (
          blacklist.hasOwnProperty(domainTld) &&
          blacklist[domainTld].test(domain.slice(0, -domainTld.length))
        )
          return new Response(new Blob(), { status: 406 });

        return await uv.fetch(event);
      }
      return await fetch(event.request);
    })()
  );
});
