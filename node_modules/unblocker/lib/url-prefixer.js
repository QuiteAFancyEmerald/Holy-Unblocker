/**
 * This file creates a node.js Stream that re-writes chunks of HTML on-the-fly so that all
 * non-relative URLS are prefixed with the given string.
 *
 * For example, If you set the config.prefix to '/proxy/' and pass in this chunk of html:
 *   <a href="http://example.com/">link to example.com</a>
 * It would output this:
 *   <a href="/proxy/http://example.com/">link to example.com</a>
 *
 * It buffers a small amount of text from the end of each chunk to ensure that it properly
 * handles links that are split between two chunks (packets).
 */

var URL = require('url');
var Transform = require('stream').Transform;
var contentTypes = require('./content-types.js');
var debug = require('debug')('unblocker:url-prefixer');

function urlPrefixer(config) {
    var re_abs_url = /("|'|=|url\(\s*)(https?:)/ig, // "http:, 'http:, =http:, or url( http:, also matches https versions
        re_rel_proto = /("|'|=|url\(\s*)(\/\/\w)/ig, // matches //site.com style urls where the protocol is auto-sensed
        re_rel_root = /((href=|src=|action=|url\(\s*)['"]?)(\/.)/ig, // matches root-relative urls like /foo/bar.html
        // no need to match href="asdf/adf" relative links - those will work without modification

        // partial's dont cause anything to get changed, they just cause last few characters to be buffered and checked with the next batch
        re_html_partial = /((url\(\s*)?\s[^\s]+\s*)$/, // capture the last two "words" and any space after them handles chunks ending in things like `<a href=` and `background-image: url( ` or `url h`

        // things that shouldn't be proxied
        // (in order to keep this a little bit simpler, the initial regex proxies it, and then the second one unproxies it)
        // matches broken xmlns attributes like xmlns="/proxy/http://www.w3.org/1999/xhtml" and xmlns:og="/proxy/http://ogp.me/ns#"
        re_proxied_xmlns = new RegExp('(xmlns(:[a-z]+)?=")' + config.prefix, 'ig'),
        re_proxied_doctype = new RegExp('(<!DOCTYPE[^>]+")' + config.prefix, 'i');


    function rewriteUrls(chunk, uri, prefix) {

        // first upgrade // links to regular http/https links because otherwise they look like root-relative (/whatever.html) links
        chunk = chunk.replace(re_rel_proto, "$1" + uri.protocol + "$2");
        // next replace urls that are relative to the root of the domain (/whatever.html) because this is how proxied urls look
        chunk = chunk.replace(re_rel_root, "$1" + uri.protocol + "//" + uri.host + "$3");
        // last replace any complete urls
        chunk = chunk.replace(re_abs_url, "$1" + prefix + "$2");

        // fix xmlns attributes that were broken because they contained urls.
        // (JS RegExp doesn't support negative lookbehind, so breaking and then fixing is simpler than trying to not break in the first place)
        chunk = chunk.replace(re_proxied_xmlns, "$1");
        chunk = chunk.replace(re_proxied_doctype, "$1");

        return chunk;
    }

    function createStream(uri) {

        // sometimes a chunk will end in data that may need to be modified, but it is impossible to tell
        // in that case, buffer the end and prepend it to the next chunk
        var chunk_remainder;

        return new Transform({
            decodeStrings: false,

            transform: function(chunk, encoding, next) {
                chunk = chunk.toString();
                if (chunk_remainder) {
                    chunk = chunk_remainder + chunk;
                    chunk_remainder = undefined;
                }

                // second, check if any urls are partially present in the end of the chunk,
                // and buffer the end of the chunk if so; otherwise pass it along
                var partial_hits = chunk.match(re_html_partial);
                if (partial_hits && partial_hits[1]) {
                    var snip = partial_hits[1].length;
                    chunk_remainder = chunk.substr(-1 * snip);
                    chunk = chunk.substr(0, chunk.length - snip);
                }

                chunk = rewriteUrls(chunk, uri, config.prefix);

                this.push(chunk);
                next();
            },

            flush: function(done) {
                // if we buffered a bit of text but we're now at the end of the data, then apparently
                // it wasn't a url - send it along
                if (chunk_remainder) {
                    this.push(rewriteUrls(chunk_remainder, uri, config.prefix));
                    chunk_remainder = undefined;
                }
                done();
            }
        });
    }

    function prefixUrls(data) {
        if (contentTypes.shouldProcess(config, data)) {
            var uri = URL.parse(data.url);
            debug('prefixing all urls with %s', config.prefix);
            data.stream = data.stream.pipe(createStream(uri));
        }
    }

    prefixUrls.rewriteUrls = rewriteUrls; // for testing
    prefixUrls.createStream = createStream;

    return prefixUrls;
}



module.exports = urlPrefixer;
