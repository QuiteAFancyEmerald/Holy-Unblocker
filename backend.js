(async () => {
  try {
    await import("./src/server.mjs");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
