(async () => {
  await loadFull(tsParticles);

  await tsParticles.load({
    id: 'particles-js',
    options: {
      background: {
        color: { value: '#1d232a' },
      },
      fullScreen: {
        enable: true,
        zIndex: -1,
      },
      detectRetina: true,
      fpsLimit: 60,
      interactivity: {
        events: {
          resize: {
            enable: true,
          },
        },
      },
      particles: {
        color: {
          value: '#ffffff',
        },
        move: {
          enable: true,
          speed: 0.8,
          direction: 'none',
          outModes: {
            default: 'out',
          },
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 100,
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
          },
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 5 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
          },
        },
        links: {
          enable: true,
          distance: 150,
          color: '#ffffff',
          opacity: 0.4,
          width: 1,
        },
      },
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
    },
  });
})();
