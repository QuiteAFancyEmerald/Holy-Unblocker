const mime = require('mime');
const fs = require('fs');
const path = require('path');

// these routes are reserved by hammerhead and rammerhead
const forbiddenRoutes = [
    '/rammerhead.js',
    '/hammerhead.js',
    '/task.js',
    '/iframe-task.js',
    '/messaging',
    '/transport-worker.js',
    '/worker-hammerhead.js'
];

const isDirectory = (dir) => fs.lstatSync(dir).isDirectory();

/**
 *
 * @param {import('testcafe-hammerhead').Proxy} proxy
 * @param {string} staticDir - all of the files and folders in the specified directory will be served
 * publicly. /index.html will automatically link to /
 * @param {string} rootPath - all the files that will be served under rootPath
 */
function addStaticFilesToProxy(proxy, staticDir, rootPath = '/', shouldIgnoreFile = (_file, _dir) => false) {
    if (!isDirectory(staticDir)) {
        throw new TypeError('specified folder path is not a directory');
    }

    if (!rootPath.endsWith('/')) rootPath = rootPath + '/';
    if (!rootPath.startsWith('/')) rootPath = '/' + rootPath;

    const files = fs.readdirSync(staticDir);

    files.map((file) => {
        if (isDirectory(path.join(staticDir, file))) {
            addStaticFilesToProxy(proxy, path.join(staticDir, file), rootPath + file + '/', shouldIgnoreFile);
            return;
        }

        if (shouldIgnoreFile(file, staticDir)) {
            return;
        }

        const pathToFile = path.join(staticDir, file);
        const staticContent = {
            content: fs.readFileSync(pathToFile),
            contentType: mime.getType(file)
        };
        const route = rootPath + file;

        if (forbiddenRoutes.includes(route)) {
            throw new TypeError(
                `route clashes with hammerhead. problematic route: ${route}. problematic static file: ${pathToFile}`
            );
        }

        proxy.GET(rootPath + file, staticContent);
        if (file === 'index.html') {
            proxy.GET(rootPath, staticContent);
        }
    });
}

module.exports = addStaticFilesToProxy;
