/* -----------------------------------------------
/* Author : Divide
/* MIT license: http://opensource.org/licenses/MIT
/* ----------------------------------------------- */

var fs = require('fs'),
    path = require('path'),
    mime = require('mime-types'),
    char_insert = (str, hash) => {
        var output = '';

        str.split(' ').forEach((word, word_index) => (word.split('').forEach((chr, chr_index) => output += (!chr_index || chr_index == word.length) ? '<span style="white-space: nowrap">&#' + chr.charCodeAt() + '</span>' : '<span style="white-space: nowrap">&#8203;<span style="display:none;font-size:0px;">&#8203;' + hash + '</span>&#' + chr.charCodeAt() + '&#8203;</span>'), output += word_index != str.split(' ').length - 1 ? ' ' : ''));

        return output
    },
    hash = s => { for (var i = 0, h = 9; i < s.length;) h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9); return h ^ h >>> 9 },
    express_ip = req => {
        var ip = null,
            methods = [req.headers['cf-connecting-ip'], req.headers['x-real-ip'], req.headers['x-forwarded-for']];

        methods.filter(method => method).forEach(method => {
            if (ip) return;

            ip = method;

            if (ip.includes(',')) {
                ip = ip.split(',')[ip.split(',').length - 1].replace(' ', '');
                if (ip.length > 15) ip = ip.split(',')[0].replace(' ', '');
            }
        });

        return ip || '127.0.0.1';
    };

module.exports = {
    static: public_path => (req, res, next) => {
        var pub_file = path.join(public_path, req.url);

        if (fs.existsSync(pub_file)) {
            if (fs.statSync(pub_file).isDirectory()) pub_file = path.join(pub_file, 'index.html');
            if (!fs.existsSync(pub_file)) return next();

            var mime_type = mime.lookup(pub_file),
                data = fs.readFileSync(pub_file),
                ext = path.extname(pub_file);

            if (ext == '.html') data = data.toString('utf8').replace(/char_?insert{([\s\S]*?)}/gi, (match, str) => char_insert(str, hash(express_ip(req))));

            res.contentType(mime_type).send(data);
        } else next();
    },
    parse: string => char_insert(string, '-1231'),
}