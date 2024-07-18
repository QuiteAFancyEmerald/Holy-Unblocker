const stockSW = "/uv/sw.js";
const swAllowedHostnames = ["localhost", "127.0.0.1"];
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";

// Proxy configuration
const proxyUrl = "socks5://localhost:9050"; // Replace with your proxy URL

async function registerSW() {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    )
      throw new Error("Service workers cannot be registered without https.");

    throw new Error("Your browser doesn't support service workers.");
  }

  // Update the transport setup to include the proxy option
  await connection.setTransport("/libcurl/index.mjs", [{ wisp: wispUrl, proxy: proxyUrl }]);
  await navigator.serviceWorker.register(stockSW);
}

async function setupTransportOnLoad() {
  const conn = new BareMux.BareMuxConnection("/baremux/worker.js");
  if (await conn.getTransport() !== "/baremux/module.js") {
    await conn.setTransport("/baremux/module.js", [{ wisp: wispUrl, proxy: proxyUrl }]);
  }
}

// Run transport setup on page load
setupTransportOnLoad();

// Register service worker
registerSW();
