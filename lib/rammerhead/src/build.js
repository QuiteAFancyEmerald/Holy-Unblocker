require('dotenv-flow').config();

const path = require('path');
const fs = require('fs');
const UglifyJS = require('uglify-js');

// modify unmodifable items that cannot be hooked in rammerhead.js
fs.writeFileSync(
    path.join(__dirname, './client/hammerhead.js'),
    // part of fix for iframing issue
    'window["%is-hammerhead%"] = true;\n' +
        fs
            .readFileSync(path.join(__dirname, '../node_modules/testcafe-hammerhead/lib/client/hammerhead.js'), 'utf8')
            // fix iframing proxy issue
            .replace(
                /window === window\.top/g,
                '((window.parent === window.top && !window.top["%hammerhead%"]) || window === window.top)'
            )
            .replace(
                'isCrossDomainParent = parentLocationWrapper === parentWindow.location',
                'isCrossDomainParent = parentLocationWrapper === parentWindow.location || !parentWindow["%hammerhead%"]'
            )
            .replace(
                '!sameOriginCheck(window1Location, window2Location)',
                '!(sameOriginCheck(window1Location, window2Location) && (!!window1["%is-hammerhead%"] === !!window2["%is-hammerhead%"]))'
            )
            // return false when unable to convert properties on other windows to booleans (!)
            .replace(
                /!(parent|parentWindow|window1|window2|window\.top)\[("%(?:is-)?hammerhead%")]/g,
                '!(() => { try{ return $1[$2]; }catch(error){ return true } })()'
            )

            // disable saving to localStorage as we are using a completely different implementation
            .replace('saveToNativeStorage = function () {', 'saveToNativeStorage = function () {return;')

            // prevent calls to elements on a closed iframe
            .replace('dispatchEvent: function () {', '$& if (!window) return null;')
            .replace('click: function () {', '$& if (!window) return null;')
            .replace('setSelectionRange: function () {', '$& if (!window) return null;')
            .replace('select: function () {', '$& if (!window) return null;')
            .replace('focus: function () {', '$& if (!window) return null;')
            .replace('blur: function () {', '$& if (!window) return null;')
            .replace('preventDefault: function () {', '$& if (!window) return null;')

            // expose hooks for rammerhead.js
            .replace(
                'function parseProxyUrl$1',
                'window.overrideParseProxyUrl = function(rewrite) {parseProxyUrl$$1 = rewrite(parseProxyUrl$$1)}; $&'
            )
            .replace(
                'function getProxyUrl$1',
                'window.overrideGetProxyUrl = function(rewrite) {getProxyUrl$$1 = rewrite(getProxyUrl$$1)}; $&'
            )
            .replace('return window.location.search;', 'return (new URL(get$$2())).search;')
            .replace('return window.location.hash;', 'return (new URL(get$$2())).hash;')
            .replace(
                'setter: function (search) {',
                '$& var url = new URL(get$$2()); url.search = search; window.location = convertToProxyUrl(url.href); return search;'
            )
            .replace(
                'setter: function (hash) {',
                '$& var url = new URL(get$$2()); url.hash = hash; window.location.hash = (new URL(convertToProxyUrl(url.href))).hash; return hash;'
            )
);

const minify = (fileName, newFileName) => {
    const minified = UglifyJS.minify(fs.readFileSync(path.join(__dirname, './client', fileName), 'utf8'));
    if (minified.error) {
        throw minified.error;
    }
    fs.writeFileSync(path.join(__dirname, './client', newFileName), minified.code, 'utf8');
};

minify('rammerhead.js', 'rammerhead.min.js');
minify('hammerhead.js', 'hammerhead.min.js');
