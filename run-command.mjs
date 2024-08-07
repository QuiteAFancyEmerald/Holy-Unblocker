import { readFile, writeFile, unlink, mkdir, rm } from 'node:fs/promises';
import { exec, fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

//  Necessary constants are copied over from /src/server.mjs.

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

const shutdown = fileURLToPath(new URL("./src/.shutdown", import.meta.url));

//  Run each command line argument passed after node run-command.mjs.
//  Commands are defined in the switch case statement below.
for(let i = 2; i < process.argv.length; i++)
  switch (process.argv[i]) {
//  Commmand to boot up the server. Use PM2 to run if production is true in the
//  config file.
    case "start":
      if (config.production)
        exec("npm run pm2-start", (error, stdout) => {
            if (error) throw error;
            console.log(stdout);
        });
//    Handle setup on Windows differently from platforms with POSIX-compliant shells.
//    This should run the server as a background process.
      else if (process.platform === "win32")
        exec('START /MIN "" "node backend.js"', (error, stdout) => {
          if (error) throw error;
          console.log(stdout);
        });
      else {
        const server = fork(
          fileURLToPath(new URL("./backend.js", import.meta.url)),
          {detached: true}
        );
        server.unref();
        server.disconnect();
      }
      break;

//  Stop the server. Make a temporary file that the server will check for if told
//  to shut down. This is done by sending a GET request to the server.
    case "stop":
      await writeFile(shutdown, "");
      try {
        let timeoutId = undefined;
        const response = await Promise.race([
          fetch(new URL("/test-shutdown", serverUrl)),
          new Promise(resolve => {
                timeoutId = setTimeout(() => {
                  resolve("Error");
                }, 5000);
              })
        ]);
        clearTimeout(timeoutId);
        if(response === "Error") throw new Error("Server is unresponsive.");
      } catch (e) {await unlink(shutdown)}
      if (config.production)
        exec("npm run pm2-stop", (error, stdout) => {
          if (error) throw error;
          console.log(stdout);
        });
      break;

    case "build": {
      const dist = fileURLToPath(new URL("./views/dist", import.meta.url));
      await rm(dist, {force: true, recursive: true});
      await mkdir(dist);
      await build({
        entryPoints: [
          "./views/uv/**/*.js",
          "./views/assets/js/**/*.js",
          "./views/assets/css/**/*.css"
        ],
        platform: "browser",
        sourcemap: true,
        bundle: true,
        minify: true,
        external: ["*.png", "*.jpg", "*.jpeg", "*.webp", "*.svg"],
        outdir: dist
      });
      break;
    }

//  Forcibly kill all node processes and fully reset PM2. To be used for debugging.
    case "kill":
      exec("npm run pm2-nuke", (error, stdout) => {console.log(stdout)});
      if (process.platform === "win32")
        exec("taskkill /F /IM node*", (error, stdout) => {console.log(stdout)});
      else exec("pkill node", (error, stdout) => {console.log(stdout)});
      break;

//  No default case.

  }


process.exitCode = 0;
