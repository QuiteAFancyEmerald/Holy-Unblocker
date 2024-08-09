// Encase everything in a new scope so that variables are not accidentally
// attached to the global scope.
(() => {
const stockSW = '/uv/sw.js',
  blacklistSW = '/uv/sw-blacklist.js',
  swAllowedHostnames = ['localhost', '127.0.0.1'],
  connection = new BareMux.BareMuxConnection('/baremux/worker.js'),
  wispUrl =
    (location.protocol === 'https:' ? 'wss' : 'ws') +
    '://' +
    location.host +
    '/wisp/',
  // Proxy configuration
  proxyUrl = 'socks5h://localhost:9050', // Replace with your proxy URL
  transports = {
    epoxy: '/epoxy/index.mjs',
    libcurl: '/libcurl/index.mjs',
    bare: '/baremux/index.mjs',
  },
  // The following two variables are copied and pasted here from csel.js.
  readCookie = async (name) => {
    // Get the first cookie that has the same name.
    for (let cookie of document.cookie.split('; '))
      if (!cookie.indexOf(name + '='))
        // Return the cookie's stored content.
        return decodeURIComponent(cookie.slice(name.length + 1));
  },
  // Sets the default transport mode based on the browser. Firefox is not
  // supported by epoxy yet, which is why this is implemented.
  defaultMode = /(?:Chrome|AppleWebKit)\//.test(navigator.userAgent)
    ? 'epoxy'
    : 'libcurl';

transports.default = transports[defaultMode];

// Prevent the transports object from accidentally being edited.
Object.freeze(transports);

const registerSW = async () => {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== 'https:' &&
      !swAllowedHostnames.includes(location.hostname)
    )
      throw new Error('Service workers cannot be registered without https.');

    throw new Error("Your browser doesn't support service workers.");
  }

  // If the user has changed the transport mode, use that over the default.
  const transportMode =
    transports[await readCookie('HBTransport')] || transports.default;
  let transportOptions = { wisp: wispUrl };

  // Only use Tor with the proxy if the user has enabled it in settings.
  if ((await readCookie('HBUseOnion')) === 'true')
    transportOptions.proxy = proxyUrl;

  await connection.setTransport(transportMode, [transportOptions]);

  /* Choose a service worker to register based on whether or not the user
   * has ads enabled. If the user changes this setting, this script needs
   * to be reloaded for this to update, such as by refreshing the page.
   */
  const registrations = await navigator.serviceWorker.getRegistrations(),
    usedSW =
      (await readCookie('HBHideAds')) !== 'false' ? blacklistSW : stockSW;

  // Unregister a service worker if it isn't the one being used.
  for (const registration of registrations)
    if (
      registration.active &&
      new URL(registration.active.scriptURL).pathname !==
        new URL(usedSW, location.origin).pathname
    )
      await registration.unregister();

  await navigator.serviceWorker.register(usedSW);
};

/*

Commented out upon discovering that a duplicate BareMux connection may be
unnecessary; previously thought to have prevented issues with refreshing.

async function setupTransportOnLoad() {
  const conn = new BareMux.BareMuxConnection("/baremux/worker.js");
  if (await conn.getTransport() !== "/baremux/module.js") {
    await conn.setTransport("/libcurl/index.mjs", [{ wisp: wispUrl, proxy: proxyUrl }]);
  }
}

// Run transport setup on page load.
setupTransportOnLoad();
*/

registerSW();
})();
