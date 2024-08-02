const LRUCache = require('lru-cache');
const LRUFiles = require('keyv-lru-files');
const crypto = require('crypto');
const fs = require('fs');

let cacheGet = async (_key) => {
    throw new TypeError('cannot cache get: must initialize cache settings first');
};
let cacheSet = async (_key, _value) => {
    throw new TypeError('cannot cache set: must initialize cache settings first');
};

module.exports = async function (diskJsCachePath, jsCacheSize) {
    const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

    if (!diskJsCachePath) {
        const jsLRUMemCache = new LRUCache({
            max: jsCacheSize,
            length: (n) => n.length
        });
        cacheGet = (key) => jsLRUMemCache.get(md5(key));
        cacheSet = (key, value) => jsLRUMemCache.set(md5(key), value);
    } else {
        if (!fs.existsSync(diskJsCachePath)) {
            throw new TypeError('disk cache folder does not exist: ' + diskJsCachePath);
        }
        if (!fs.lstatSync(diskJsCachePath).isDirectory()) {
            throw new TypeError('disk cache folder must be a directory: ' + diskJsCachePath);
        }
        const jsLRUFileCache = new LRUFiles({
            dir: diskJsCachePath,
            size: jsCacheSize
        });
        await jsLRUFileCache.open_sqlite();
        cacheGet = async (key) => (await jsLRUFileCache.get(md5(key)))?.toString('utf8');
        cacheSet = async (key, value) => await jsLRUFileCache.set(md5(key), value);
    }
};

// patch ScriptResourceProcessor
// https://github.com/DevExpress/testcafe-hammerhead/blob/7f80940225bc1c615517455dc7d30452b0365243/src/processing/resources/script.ts#L21

const scriptProcessor = require('testcafe-hammerhead/lib/processing/resources/script');
const { processScript } = require('testcafe-hammerhead/lib/processing/script');
const { updateScriptImportUrls } = require('testcafe-hammerhead/lib/utils/url');
const BUILTIN_HEADERS = require('testcafe-hammerhead/lib/request-pipeline/builtin-header-names');

scriptProcessor.__proto__.processResource = async function processResource(script, ctx, _charset, urlReplacer) {
    if (!script) return script;

    let processedScript = await cacheGet(script);

    if (!processedScript) {
        processedScript = processScript(
            script,
            true,
            false,
            urlReplacer,
            ctx.destRes.headers[BUILTIN_HEADERS.serviceWorkerAllowed]
        );
        await cacheSet(script, processedScript);
    } else processedScript = updateScriptImportUrls(processedScript, ctx.serverInfo, ctx.session.id, ctx.windowId);

    return processedScript;
};
