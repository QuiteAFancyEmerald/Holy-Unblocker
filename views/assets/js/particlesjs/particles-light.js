(async () => {
  await loadFull(tsParticles);

  await tsParticles.load({
    id: 'particles-js',
    options: {
      background: {
        color: { value: 'transparent' },
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
          value: '#485163',
        },
        move: {
          enable: true,
          speed: 0.3,
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
          value: { min: 0.1, max: 0.3 },
          animation: {
            enable: true,
            speed: 0.2,
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
            speed: 0.3,
            sync: false,
          },
        },
        links: {
          enable: true,
          distance: 150,
          color: '#485163',
          opacity: 0.2,
          width: 1,
        },
      },
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
    },
  });
})();
