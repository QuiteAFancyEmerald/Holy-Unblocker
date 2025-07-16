(() => {
  const stockSW = '/uv/sw.js',
    blacklistSW = '/uv/sw-blacklist.js',
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
      japan: 'socks5h://localhost:7003',
    },
    transports = {
      epoxy: '/epoxy/index.mjs',
      libcurl: '/libcurl/index.mjs',
      bare: '/baremux/index.mjs',
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

    // Socks5 Proxy Options
    const proxysets = {
      UseOnion: 'tor',
      UseEU: 'eu',
      UseUSWest: 'usWest',
      UseUSEast: 'usEast',
      UseJapan: 'japan',
    };

    for (const [storeage, proxyoption] of Object.entries(proxysets)) {
      if (readStorage(storeage) === true) {
        transportOptions.proxy = proxyUrl[proxyoption];
        console.log('Using Proxy:', proxyUrl[proxyoption]);
        break;
      }
    }

    console.log('Transport mode:', transportMode);

    const connection = new BareMux.BareMuxConnection('/baremux/worker.js');
    await connection.setTransport(transportMode, [transportOptions]);

    const registrations = await navigator.serviceWorker.getRegistrations(),
      usedSW =
        readStorage('HideAds') !== false ? blacklistSW : stockSW;

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
        prefix: '/scram/network/',
        files: {
          wasm: '/scram/scramjet.wasm.wasm',
          worker: '/scram/scramjet.worker.js',
          client: '/scram/scramjet.client.js',
          shared: '/scram/scramjet.shared.js',
          sync: '/scram/scramjet.sync.js',
        },
        flags: {
          rewriterLogs: false,
          naiiveRewriter: false,
          scramitize: false,
        },
        siteFlags: {
          "https://www.google.com/(search|sorry).*": {
            naiiveRewriter: true,
          },
        },
      });
  
      console.log('Initializing ScramjetController');
      scramjet.init();
      navigator.serviceWorker.register("/scram/scramjet.sw.js");
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
