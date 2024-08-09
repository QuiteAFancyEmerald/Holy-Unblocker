import { readFile, writeFile, unlink, mkdir, rm } from 'node:fs/promises';
import { exec, fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import ecosystem from './ecosystem.config.js';

// Some necessary constants are copied over from /src/server.mjs.

const config = Object.freeze(
    JSON.parse(await readFile(new URL('./src/config.json', import.meta.url)))
  ),
  ecosystemConfig = Object.freeze(
    ecosystem.apps.find((app) => app.name === 'HolyUB') || ecosystem.apps[0]
  );

const serverUrl = ((base) => {
  try {
    base = new URL(config.host);
  } catch (e) {
    base = new URL('http://a');
    base.host = config.host;
  }
  base.port =
    ecosystemConfig[config.production ? 'env_production' : 'env'].PORT;
  return Object.freeze(base);
})();

const shutdown = fileURLToPath(new URL('./src/.shutdown', import.meta.url));

// Run each command line argument passed after node run-command.mjs.
// Commands are defined in the switch case statement below.
commands: for (let i = 2; i < process.argv.length; i++)
  switch (process.argv[i]) {
    // Commmand to boot up the server. Use PM2 to run if production is true in the
    // config file.
    case 'start':
      if (config.production)
        exec(
          'npx pm2 start ecosystem.config.js --env production',
          (error, stdout) => {
            if (error) throw error;
            console.log(stdout);
          }
        );
      // Handle setup on Windows differently from platforms with POSIX-compliant
      // shells. This should run the server as a background process.
      else if (process.platform === 'win32')
        exec('START /MIN "" node backend.js', (error, stdout) => {
          if (error) {
            console.error(error);
            process.exitCode = 1;
          }
          console.log(stdout);
        });
      // The following approach (and similar approaches) will not work on Windows,
      // because exiting this program will also terminate backend.js on Windows.
      else {
        const server = fork(
          fileURLToPath(new URL('./backend.js', import.meta.url)),
          { cwd: process.cwd(), detached: true }
        );
        server.unref();
        server.disconnect();
      }
      break;

    // Stop the server. Make a temporary file that the server will check for if told
    // to shut down. This is done by sending a GET request to the server.
    case 'stop': {
      await writeFile(shutdown, '');
      let timeoutId,
        hasErrored = false;
      try {
        /* Give the server 5 seconds to respond, otherwise cancel this and throw an
         * error to the console. The fetch request will also throw an error
         * immediately if checking the server on localhost and the port is unused.
         */
        const response = await Promise.race([
          fetch(new URL('/test-shutdown', serverUrl)),
          new Promise((resolve) => {
            timeoutId = setTimeout(() => {
              resolve('Error');
            }, 5000);
          }),
        ]);
        clearTimeout(timeoutId);
        if (response === 'Error') throw new Error('Server is unresponsive.');
      } catch (e) {
        // Remove the temporary shutdown file since the server didn't remove it.
        await unlink(shutdown);
        // Check if this is the error thrown by the fetch request for an unused port.
        // Don't print the unused port error, since nothing has actually broken.
        if (e instanceof TypeError) clearTimeout(timeoutId);
        else {
          console.error(e);
          // Stop here unless Node will be killed later.
          if (!process.argv.slice(i + 1).includes('kill')) hasErrored = true;
        }
      }
      // Do not run this if Node will be killed later in this script. It will fail.
      if (config.production && !process.argv.slice(i + 1).includes('kill'))
        exec('npx pm2 stop ecosystem.config.js', (error, stdout) => {
          if (error) {
            console.error(error);
            hasErrored = true;
          }
          console.log(stdout);
        });
      // Do not continue executing commands since the server was unable to be stopped.
      // Mostly implemented to prevent duplicating Node instances with npm restart.
      if (hasErrored) {
        process.exitCode = 1;
        break commands;
      }
      break;
    }

    case 'build': {
      const dist = fileURLToPath(new URL('./views/dist', import.meta.url));
      await rm(dist, { force: true, recursive: true });
      await mkdir(dist);
      await build({
        entryPoints: [
          './views/uv/**/*.js',
          './views/assets/js/**/*.js',
          './views/assets/css/**/*.css',
        ],
        platform: 'browser',
        sourcemap: true,
        bundle: true,
        minify: true,
        external: ['*.png', '*.jpg', '*.jpeg', '*.webp', '*.svg'],
        outdir: dist,
      });
      break;
    }

    /* Kill all node processes and fully reset PM2. To be used for debugging.
     * Using npx pm2 monit, or npx pm2 list in the terminal will also bring up
     * more PM2 debugging tools.
     */
    case 'kill':
      if (process.platform === 'win32')
        exec(
          '( npx pm2 delete ecosystem.config.js ) ; taskkill /F /IM node*',
          (error, stdout) => {
            console.log(stdout);
          }
        );
      else
        exec(
          'npx pm2 delete ecosystem.config.js; pkill node',
          (error, stdout) => {
            console.log(stdout);
          }
        );
      break;

    /* Make a temporary server solely to test startup errors. The server will
     * stop the command if there is an error, and restart itself otherwise.
     * This uses the same command for both Windows and other platforms, but
     * consequently forces the server to stay completely silent after startup.
     */
    case 'workflow': {
      const tempServer = fork(
        fileURLToPath(new URL('./backend.js', import.meta.url)),
        {
          cwd: process.cwd(),
          stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
          detached: true,
        }
      );
      tempServer.stderr.on('data', (stderr) => {
        // The temporary server will print startup errors that aren't deprecation
        // warnings; stop the process and return an error exit code upon doing so.
        if (stderr.toString().indexOf('DeprecationWarning') >= 0) return;
        console.error(stderr.toString());
        tempServer.kill();
        process.exitCode = 1;
      });
      tempServer.stdout.on('data', () => {
        // There are no startup errors by this point, so kill the server and start
        // over. The restart alters stdio to prevent the workflow check from hanging.
        tempServer.kill();
        const server = fork(
          fileURLToPath(new URL('./backend.js', import.meta.url)),
          // The stdio: 'ignore' makes the server completely silent, yet it is also
          // why this works for Windows when the start command's version does not.
          { cwd: process.cwd(), stdio: 'ignore', detached: true }
        );
        server.unref();
        server.disconnect();
      });
      tempServer.unref();
      tempServer.disconnect();
      break;
    }

    // No default case.
  }

process.exitCode = process.exitCode || 0;
