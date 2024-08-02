// https://github.com/DevExpress/testcafe-hammerhead/blob/7f80940225bc1c615517455dc7d30452b0365243/src/processing/resources/index.ts

const url = require('url');
const pageProcessor = require('testcafe-hammerhead/lib/processing/resources/page');
const manifestProcessor = require('testcafe-hammerhead/lib/processing/resources/manifest');
const scriptProcessor = require('testcafe-hammerhead/lib/processing/resources/script');
const stylesheetProcessor = require('testcafe-hammerhead/lib/processing/resources/stylesheet');
const urlUtil = require('testcafe-hammerhead/lib/utils/url');
const { encodeContent, decodeContent } = require('testcafe-hammerhead/lib/processing/encoding');
const { platform } = require('os');

const IS_WIN = platform() === 'win32';
const DISK_RE = /^[A-Za-z]:/;
const RESOURCE_PROCESSORS = [pageProcessor, manifestProcessor, scriptProcessor, stylesheetProcessor];

function getResourceUrlReplacer(ctx) {
    return function (resourceUrl, resourceType, charsetAttrValue, baseUrl, isCrossDomain) {
        if (!urlUtil.isSupportedProtocol(resourceUrl) && !urlUtil.isSpecialPage(resourceUrl)) return resourceUrl;

        if (IS_WIN && ctx.dest.protocol === 'file:' && DISK_RE.test(resourceUrl)) resourceUrl = '/' + resourceUrl;

        // NOTE: Resolves base URLs without a protocol ('//google.com/path' for example).
        baseUrl = baseUrl ? url.resolve(ctx.dest.url, baseUrl) : '';
        resourceUrl = urlUtil.processSpecialChars(resourceUrl);

        let resolvedUrl = url.resolve(baseUrl || ctx.dest.url, resourceUrl);

        if (!urlUtil.isValidUrl(resolvedUrl)) return resourceUrl;

        // NOTE: Script or <link rel='preload' as='script'>
        const isScriptLike = urlUtil.parseResourceType(resourceType).isScript;
        const charsetStr = charsetAttrValue || (isScriptLike && ctx.contentInfo.charset.get());

        resolvedUrl = urlUtil.ensureTrailingSlash(resourceUrl, resolvedUrl);

        if (!urlUtil.isValidUrl(resolvedUrl)) return resolvedUrl;

        return ctx.toProxyUrl(resolvedUrl, isCrossDomain, resourceType, charsetStr);
    };
}

require('testcafe-hammerhead/lib/processing/resources/index').process = async function process(ctx) {
    const { destResBody, contentInfo } = ctx;
    const { encoding, charset } = contentInfo;

    for (const processor of RESOURCE_PROCESSORS) {
        if (!processor.shouldProcessResource(ctx)) continue;

        const urlReplacer = getResourceUrlReplacer(ctx);

        if (pageProcessor === processor) await ctx.prepareInjectableUserScripts();

        const decoded = await decodeContent(destResBody, encoding, charset);

        // @ts-ignore: Cannot invoke an expression whose type lacks a call signature
        const processed = await processor.processResource(decoded, ctx, charset, urlReplacer); // <-- add async support

        if (processed === pageProcessor.RESTART_PROCESSING) return await process(ctx);

        return await encodeContent(processed, encoding, charset);
    }

    return destResBody;
};
