const stockSW = "/uv/sw.js",
swAllowedHostnames = ["localhost", "127.0.0.1"],
connection = new BareMux.BareMuxConnection("/baremux/worker.js"),
wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/",

//  Proxy configuration
proxyUrl = "socks5h://localhost:9050", // Replace with your proxy URL
transports = {
  epoxy: "/epoxy/index.mjs",
  libcurl: "/libcurl/index.mjs",
  bare: "/baremux/index.mjs"
};

//  Set epoxy as the default transport mode.
transports.default = transports.epoxy;
//  Prevent the transports object from being edited.
Object.freeze(transports);

async function registerSW() {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    )
      throw new Error("Service workers cannot be registered without https.");

    throw new Error("Your browser doesn't support service workers.");
  }


  let transportMode = transports.default,
  transportOptions = { wisp: wispUrl };
  try {
//  If the user has changed the transport mode, use that over the default.
    transportMode = transports[await readCookie("HBTransport")] ||
    transports.default;

//  Only use Tor with the proxy if the user has enabled it in settings.
    if (await readCookie("HBUseOnion") === "true")
      transportOptions.proxy = proxyUrl;

//  Errors here are likely caused by this script failing to access csel.js.
  } catch (e) {console.log(e)}

  await connection.setTransport(transportMode, [transportOptions]);
  await navigator.serviceWorker.register(stockSW);
}

/*

Commented out upon discovering that a duplicate BareMux connection may be
unnecessary; previously thought to have prevented issues with refreshing.

async function setupTransportOnLoad() {
  const conn = new BareMux.BareMuxConnection("/baremux/worker.js");
  if (await conn.getTransport() !== "/baremux/module.js") {
    await conn.setTransport("/libcurl/index.mjs", [{ wisp: wispUrl, proxy: proxyUrl }]);
  }
}

// Run transport setup on page load
setupTransportOnLoad();
*/

// Register service worker
registerSW();
