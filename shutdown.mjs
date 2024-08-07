import { readFile, writeFile, unlink } from 'node:fs/promises';

const config = Object.freeze(JSON.parse(await readFile(new URL("./src/config.json", import.meta.url))));

const serverUrl = (base => {
  try {
    base = new URL(config.host);
  } catch (e) {
    base = new URL("http://a");
    base.host = config.host;
  }
  base.port = process.env.PORT || config.port;
  return Object.freeze(base);
})();

const shutdown = new URL("./src/.shutdown", import.meta.url);

await writeFile(shutdown, "");
try {await fetch(new URL("/test-shutdown", serverUrl))}
catch (e) {await unlink(shutdown)}
process.exitCode = 0;
