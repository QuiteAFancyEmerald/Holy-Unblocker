"use strict";
var debug = require('debug')('unblocker:charsets');
var Transform = require("stream").Transform;
var PassThrough = require('stream').PassThrough;
var iconv = require('iconv-lite');
var contentTypes = require('./content-types.js');

// content-types that might possibly have the charset in a meta tag
function mayContainMeta(type) {
    var types = [
        'text/html',
        'application/xml+xhtml',
        'application/xhtml+xml'
    ];

    return types.indexOf(type) != -1;
}


function charsets(config) {

    function decodeCharset(data) {
        if (contentTypes.shouldProcess(config, data)) {

            var charset = contentTypes.getCharset(data);

            if (iconv.encodingExists(charset)) {
                // happy case, we know the encoding right away, so we can just return decode/recode streams
                data.charset = charset;
                data.stream = data.stream.pipe(iconv.decodeStream(charset));
                debug('decoding %s charset via iconv stream', charset);
            } else if (mayContainMeta(data.contentType)) {
                debug('decoding unknown charset via iconv html stream');
                data.charsetDecoder = new IconvHtmlStream();
                data.charsetDecoder.on('charset', function(charset) {
                    // note: while the recode stream will accept content before this and just output utf-8, it shouldn't actually receive any data because the decode stream buffers until *after* this event
                    data.charset = charset;
                });
                data.stream = data.stream.pipe(data.charsetDecoder);
            } else {
                debug('no charset info available, assuming utf8');
                // semi-happy case. we know the content needs parsed but have no way of knowing it's charset. Hopefully .toString() will be good enough. No recoding
                data.stream = data.stream.pipe(new PassThrough({
                    encoding: 'utf8'
                }));
            }


            // in all cases, we output utf8, so we want to make sure any headers and meta tags match that
            contentTypes.setHeader(data);
            data.stream = data.stream.pipe(new MetaCharsetReplacerStream());
        }

    }

    return decodeCharset;
}

module.exports = charsets;


// based on https://github.com/ashtuchkin/iconv-lite/blob/master/lib/streams.js

var re_charset_finder = /<\?xml[^>]+encoding="([^">]+)"|<meta [^>]*charset=['"]?([^ '">]+)['"]/i; // warning: making this global causes it to not include the matched value in the results :/

// == Decoder stream =======================================================
function IconvHtmlStream(options) {
    this.buff = new Buffer([]);
    this.isBuffering = true;
    this.conv = null;
    options = options || {};
    this.rewrite = (options.rewrite !== false);
    this.inputEncoding = 'utf8';
    this.encoding = options.encoding = 'utf8'; // this is the *output* encoding
    this.conv = iconv.getEncoder(this.inputEncoding);
    Transform.call(this, options);
}

IconvHtmlStream.prototype = Object.create(Transform.prototype, {
    constructor: {
        value: IconvHtmlStream
    }
});

IconvHtmlStream.prototype._transform = function(chunk, encoding, done) {
    if (!Buffer.isBuffer(chunk))
        return done(new Error("delayed decoding stream needs buffers as its input."));

    if (this.isBuffering) {
        this.bufferAndTest(chunk, encoding, done);
    } else {
        this.stream(chunk, encoding, done);
    }
};

IconvHtmlStream.prototype.stream = function(chunk, encoding, done) {
    try {
        var res = this.conv.write(chunk);
        if (res && res.length) this.push(res, this.encoding);
        done();
    } catch (e) {
        done(e);
    }
};


IconvHtmlStream.prototype.bufferAndTest = function(chunk, encoding, done) {
    this.buff = Buffer.concat([this.buff, chunk]);
    var str = this.buff.toString();
    var charsetMatch = str.match(re_charset_finder); // extract the charset from a meta tag or the opening <?xml tag
    var endOfHead = str.match(/<\/head>/); // todo: consider matching on some other tags such as |<div |<span <a | to avoid buffering entire html snippets
    if (charsetMatch) {
        this.startStreaming(charsetMatch[1] || charsetMatch[2], encoding, done);
    } else if (endOfHead) {
        // go with the safest guess for the charset
        // todo: try using something like https://www.npmjs.com/package/detect-character-encoding here (although probably not that one specifically since it doesn't work on windows or 32-bit *nix)
        this.startStreaming('utf8', encoding, done);
    } else {
        debug('buffering');
        // otherwise just buffer the chunk. Call done() to ensure that we get the next one.
        done();
    }
};

IconvHtmlStream.prototype.startStreaming = function(charset, encoding, done) {
    // setup the decoder
    if (iconv.encodingExists(charset)) {
        this.inputEncoding = charset;
        this.conv = iconv.getDecoder(this.inputEncoding);
    } else {
        console.error("unrecognized charset %s, decoding as utf8", this.inputEncoding);
    }
    this.emit('charset', this.inputEncoding);
    this.isBuffering = false;
    // decode and forward our existing buffer
    this.stream(this.buff, encoding, done);
    // cleanup to ensure _flush doesn't accidentally send data twice
    this.buff = null;
};

IconvHtmlStream.prototype._flush = function(done) {
    var res;
    try {
        if (this.buff) {
            res = this.conv.write(this.buff);
            if (res && res.length) this.push(res, this.encoding);
            this.buff = null;
        }
        res = this.conv.end();
        if (res && res.length) this.push(res, this.encoding);
        done();
    } catch (e) {
        done(e);
    }
};


var re_charset_replacer = /<\?xml[^>]+encoding="([^">]+)"|<meta [^>]*charset=['"]?([^ '">]+)['"]/ig; // similar to the charset_finder, except global

function MetaCharsetReplacerStream(options) {
    options = options || {};
    this.encoding = options.encoding = 'utf8'; // this is the *output* encoding
    options.decodeStrings = false; // don't turn my strings back into a buffer!
    Transform.call(this, options);
}

MetaCharsetReplacerStream.prototype = Object.create(Transform.prototype, {
    constructor: {
        value: MetaCharsetReplacerStream
    }
});

MetaCharsetReplacerStream.prototype._transform = function(chunk, encoding, done) {
    done(null, chunk.toString().replace(re_charset_replacer, function(subChunk, xmlCharset, metaCharset) {
        var oldCharset = xmlCharset || metaCharset;
        var newSubChunk = subChunk.replace(oldCharset, "UTF-8");
        debug("rewriting charset meta tag from %s to %s", subChunk, newSubChunk);
        return newSubChunk;
    }));
};
