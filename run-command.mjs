import { readFile, writeFile, unlink, mkdir, rm } from 'node:fs/promises';
import { exec, fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

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

for(let i = 2; i < process.argv.length; i++)
  switch (process.argv[i]) {
    case "start": {
      if (config.production)
        exec("npm run pm2-start", (error, stdout) => {
            if (error) throw error;
            console.log(stdout);
        });
      else if (process.platform === "win32")
        exec("START", ["/MIN", '""', '"node backend.js"'], (error, stdout) => {
          if (error) throw error;
          console.log(stdout);
        });
      else {
        const server = fork(fileURLToPath(new URL("./backend.js", import.meta.url)),
          {detached: true}
        );
        server.unref();
        server.disconnect();
      }
      break;
    }

    case "stop":
      await writeFile(shutdown, "");
      try {
        const response = await Promise.race([
          fetch(new URL("/test-shutdown", serverUrl)),
          new Promise(resolve => {
                setTimeout(() => {
                  resolve("Error");
                }, 5000);
              })
        ]);
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

    case "kill":
      if (process.platform === "win32")
        exec("taskkill", ["/F", "/IM", "node*"], (error, stdout) => {
          console.log(stdout);
        });
      else exec("pkill", ["node"], (error, stdout) => {
        console.log(stdout);
      });
      break;

//  No default case.

  }


process.exitCode = 0;
