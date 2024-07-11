const stockSW = "/uv/sw.js";
const swAllowedHostnames = ["localhost", "127.0.0.1"];
let connection = new BareMux.BareMuxConnection("/baremux/worker.js")

async function registerSW() {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    )
      throw new Error("Service workers cannot be registered without https.");

    throw new Error("Your browser doesn't support service workers.");
  }
  let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
  await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }])
  await navigator.serviceWorker.register(stockSW);

//  When testing proxy support CLEAR service workers from 8080 (or whatever current port you are using)

//  navigator.serviceWorker.register(stockSW).then(register => register.unregister().then(bool => console.log("Unregistered: " + bool)));

}

registerSW();