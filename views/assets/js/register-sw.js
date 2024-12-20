(() => {
  const stockSW = '/uv/sw.js',
    blacklistSW = '/uv/sw-blacklist.js',
    swAllowedHostnames = ['localhost', '127.0.0.1'],
    wispUrl =
      (location.protocol === 'https:' ? 'wss' : 'ws') +
      '://' +
      location.host +
      '/wisp/',
    proxyUrl = 'socks5h://localhost:9050', // Replace with your TOR proxy URL
    transports = {
      epoxy: '/epoxy/index.mjs',
      libcurl: '/libcurl/index.mjs',
      bare: '/baremux/index.mjs',
    },
    readCookie = async (name) => {
      for (let cookie of document.cookie.split('; ')) {
        if (!cookie.indexOf(name + '=')) {
          return decodeURIComponent(cookie.slice(name.length + 1));
        }
      }
    },
    defaultMode = /(?:Chrome|AppleWebKit)\//.test(navigator.userAgent)
      ? 'epoxy'
      : 'libcurl';

  transports.default = transports[defaultMode];

  Object.freeze(transports);

  const waitForScramjetController = () =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (typeof ScramjetController !== 'undefined') {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });

  const registerSW = async () => {
    if (!navigator.serviceWorker) {
      if (
        location.protocol !== 'https:' &&
        !swAllowedHostnames.includes(location.hostname)
      )
        throw new Error('Service workers cannot be registered without https.');

      throw new Error("Your browser doesn't support service workers.");
    }

    // Set the transport mode
    const transportMode =
      transports[await readCookie('HBTransport')] || transports.default;
    let transportOptions = { wisp: wispUrl };

    if ((await readCookie('HBUseOnion')) === 'true') {
      transportOptions.proxy = proxyUrl;
      console.log('Using Onion Proxy:', proxyUrl);
    }

    console.log('Transport mode:', transportMode);

    const connection = new BareMux.BareMuxConnection('/baremux/worker.js');
    await connection.setTransport(transportMode, [transportOptions]);

    const registrations = await navigator.serviceWorker.getRegistrations(),
      usedSW =
        (await readCookie('HBHideAds')) !== 'false' ? blacklistSW : stockSW;

    console.log('Service Worker being registered:', usedSW);

    // Unregister outdated service workers
    for (const registration of registrations)
      if (
        registration.active &&
        new URL(registration.active.scriptURL).pathname !==
          new URL(usedSW, location.origin).pathname
      )
        await registration.unregister();

    await navigator.serviceWorker.register(usedSW);
  };

  const initializeScramjet = async () => {
    try {

      await waitForScramjetController();

      const scramjet = new ScramjetController({
        prefix: '/scram/service/',
        files: {
          wasm: '/scram/scramjet.wasm.js',
          worker: '/scram/scramjet.worker.js',
          client: '/scram/scramjet.client.js',
          shared: '/scram/scramjet.shared.js',
          sync: '/scram/scramjet.sync.js',
        }
      });

      console.log('Initializing ScramjetController');
      scramjet.init('/scram/scramjet.sw.js');
    } catch (err) {
      console.error('Scramjet initialization failed:', err);
    }
  };

  const initialize = async () => {
    try {
      await registerSW();

      await initializeScramjet();
    } catch (err) {
      console.error('Initialization failed:', err);
    }
  };

  initialize();
})();
