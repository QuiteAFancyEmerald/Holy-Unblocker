// Base64 encoding and decoding functions.
btoa = (str) => {

	str = new Buffer.from(str).toString('base64');

	return str;

};


atob = (str) => {

	str = new Buffer.from(str, 'base64').toString('utf-8');

	return str;

};


// Rewriting URL's.

url = (url, type) => {

	if (url.startsWith('//')) url = 'http:' + url;

	var origin, path;

	switch (type) {

		case 'decode':

			origin = atob(url.split('/').splice(0, 1).join('/'));

			path = '/' + url.split('/').splice(1).join('/');

			break;

		default:

			origin = btoa(url.split('/').splice(0, 3).join('/'));

			path = '/' + url.split('/').splice(3).join('/');

			break;

	}

	return origin + path;

}


// Rewriting response buffers to send to client.

body = (buffer, config) => {


	proxified_body = buffer.toString()
		.replace(/integrity="(.*?)"/gi, '')
		.replace(/nonce="(.*?)"/gi, '')
		.replace(/(href|src|poster|data|action|srcset|data-src|data-href)="\/\/(.*?)"/gi, `$1` + `="http://` + `$2` + `"`)
		.replace(/(href|src|poster|data|action|srcset|data-src|data-href)='\/\/(.*?)'/gi, `$1` + `='http://` + `$2` + `'`)
		.replace(/(href|src|poster|data|action|srcset|data-src|data-href)="\/(.*?)"/gi, `$1` + `="${config.prefix}${btoa(config.url.origin)}/` + `$2` + `"`)
		.replace(/(href|src|poster|data|action|srcset|data-src|data-href)='\/(.*?)'/gi, `$1` + `='${config.prefix}${btoa(config.url.origin)}/` + `$2` + `'`)
		.replace(/(href|src|poster|data|action|srcset|data-src|data-href)="(https:\/\/|http:\/\/)(.*?)"/gi, str => {

			attribute = str.split('=').splice(0, 1).join('');

			href = str.replace(`${attribute}=`, '').slice(1).slice(0, -1);

			return `${attribute}="${config.prefix}${url(href)}"`;

		})
		.replace(/(href|src|poster|data|action|srcset|data-src|data-href)='(https:\/\/|http:\/\/)(.*?)'/gi, str => {

			attribute = str.split('=').splice(0, 1).join('');

			href = str.replace(`${attribute}=`, '').slice(1).slice(0, -1);

			return `${attribute}='${config.prefix}${url(href)}'`;

		})
		.replace(/(window|document).location.href/gi, `"${config.url.href}"`)
		.replace(/(window|document).location.hostname/gi, `"${config.url.hostname}"`)
		.replace(/(window|document).location.pathname/gi, `"${config.url.path}"`)
		.replace(/location.href/gi, `"${config.url.href}"`)
		.replace(/location.hostname/gi, `"${config.url.hostname}"`)
		.replace(/location.pathname/gi, `"${config.url.path}"`)
		.replace(/url\("\/\/(.*?)"\)/gi, `url("http://` + `$1` + `")`)
		.replace(/url\('\/\/(.*?)'\)/gi, `url('http://` + `$1` + `')`)
		.replace(/url\(\/\/(.*?)\)/gi, `url(http://` + `$1` + `)`)
		.replace(/url\("\/(.*?)"\)/gi, `url("${config.prefix}${btoa(config.url.origin)}/` + `$1` + `")`)
		.replace(/url\('\/(.*?)'\)/gi, `url('${config.prefix}${btoa(config.url.origin)}/` + `$1` + `')`)
		.replace(/url\(\/(.*?)\)/gi, `url(${config.prefix}${btoa(config.url.origin)}/` + `$1` + `)`);

	if (config.injection == true) {

		proxified_body = proxified_body.replace(/<head(.*?)>/gi, `<head` + `$1` + `> \n <script src="${config.prefix}static/inject.js" id="_alloy_data" prefix="${config.prefix}" url="${btoa(config.url.href)}"></script>`);

		if (!proxified_body.match(/<head(.*?)>/gi)) proxified_body = proxified_body.replace(/<html(.*?)>/gi, `<html` + `$1` + `> \n <script src="${config.prefix}static/inject.js" id="_alloy_data" prefix="${config.prefix}" url="${btoa(config.url.href)}"></script>`);

	};

	return proxified_body;
};

// Rewriting the "Origin" request header.

origin = (origin, config) => {

	origin = '/' + String(origin).split('/').splice(3).join('/');

	origin = url(origin.replace(config.prefix, ''), 'decode');

	if (origin.startsWith('https://') || origin.startsWith('http://')) {

		origin = origin.split('/').splice(0, 3).join('/');

	} else origin = config.url.origin;

	return origin;
};

// Rewriting the "Referer" request header.

referer = (referer, config) => {

	referer = '/' + String(referer).split('/').splice(3).join('/');

	referer = url(referer.replace(config.prefix, ''), 'decode');

	if (referer.startsWith('https://') || referer.startsWith('http://')) {
		referer = referer;

	} else referer = config.url.href;

	return referer;

};


headers = (proxy) => {

    Object.entries(proxy.response.headers).forEach(([header_name, header_value]) => {

        if (header_name == 'location') {
            proxy.response.statusCode = 308;
            proxy.response.headers[header_name] = proxy.prefix + url(header_value);
        };

        if (header_name == 'set-cookie') {

            var array = [];

            header_value.forEach(cookie => {

                cookie = cookie.replace(/Domain=(.*?);/gi, `Domain=` + proxy.req.headers['host'] + ';').replace(/(.*?)=(.*?);/, '$1' + '@' + proxy.url.hostname + `=` + '$2' + ';');

                array.push(cookie);

            });

            proxy.response.headers[header_name] = array;

        };

        if (header_name.startsWith('content-encoding') || header_name.startsWith('x-') || header_name.startsWith('cf-') || header_name.startsWith('strict-transport-security') || header_name.startsWith('content-security-policy') || header_name.startsWith('content-length')) {

            delete proxy.response.headers[header_name];

        };

    });

};

// Setting all our functions to be used in "proxy.js"

module.exports = {

	url: url,
	body: body,
	origin: origin,
	referer: referer,
	headers: headers

}
