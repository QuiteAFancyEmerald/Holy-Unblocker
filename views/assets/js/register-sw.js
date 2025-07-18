(() => {
  const stockSW = '/network/sw.js',
    blacklistSW = '/network/sw-blacklist.js',
    swAllowedHostnames = ['localhost', '127.0.0.1'],
    wispUrl =
      (location.protocol === 'https:' ? 'wss' : 'ws') +
      '://' +
      location.host +
      '/wisp/',
    proxyUrl = {
      tor: 'socks5h://localhost:9050',
      eu: 'socks5h://localhost:7000',
      usWest: 'socks5h://localhost:7001',
      usEast: 'socks5h://localhost:7002',
      jp: 'socks5h://localhost:7003',
    },
    transports = {
      epoxy: '/ep/index.mjs',
      libcurl: '/lc/index.mjs',
      bare: '/bm/index.mjs',
    },
    storageId = 'hu-lts-storage',
    storageObject = () => JSON.parse(localStorage.getItem(storageId)) || {},
    readStorage = (name) => storageObject()[name],
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

    // Fix for Firefox
    if (navigator.userAgent.includes('Firefox')) {
      Object.defineProperty(globalThis, 'crossOriginIsolated', {
        value: true,
        writable: false,
      });
    }

    // Set the transport mode
    const transportMode =
      transports[readStorage('Transport')] || transports.default;
    let transportOptions = { wisp: wispUrl };

    // Socks5 proxy options
    if ('string' === typeof readStorage('UseSocks5'))
      transportOptions.proxy = proxyUrl[readStorage('UseSocks5')];

    console.log('Using proxy:', transportOptions.proxy);
    console.log('Transport mode:', transportMode);

    const connection = new BareMux.BareMuxConnection('/baremux/worker.js');
    await connection.setTransport(transportMode, [transportOptions]);

    const registrations = await navigator.serviceWorker.getRegistrations(),
      usedSW = readStorage('HideAds') !== false ? blacklistSW : stockSW;

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
        prefix: '/worker/service/',
        files: {
          wasm: '/worker/w.wasm.wasm',
          worker: '/worker/w.worker.js',
          client: '/worker/w.client.js',
          shared: '/worker/w.shared.js',
          sync: '/worker/w.sync.js',
        },
        flags: {
          rewriterLogs: false,
          naiiveRewriter: false,
          scramitize: false,
        },
        siteFlags: {
          'https://www.google.com/(search|sorry).*': {
            naiiveRewriter: true,
          },
        },
      });

      console.log('Initializing ScramjetController');
      scramjet.init();
      navigator.serviceWorker.register('/worker/w.sw.js');
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
