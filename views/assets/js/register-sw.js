async function registerSW() {
    if (!navigator.serviceWorker) {
      if (
        location.protocol !== "https:" &&
        !swAllowedHostnames.includes(location.hostname)
      )
        throw new Error("Service workers cannot be registered without https.");
  
      throw new Error("Your browser doesn't support service workers.");
    }
  
    await navigator.serviceWorker.register(stockSW);
  
    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
    await BareMux.SetTransport("EpxMod.EpoxyClient", { wisp: wispUrl });
  }