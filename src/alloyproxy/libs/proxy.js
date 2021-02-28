const sendRequest = require('./requests.js'),
	rewrite = require('./rewriting.js'),
	fs = require('fs'),
	bodyParser = (req) => {

		return new Promise(resolve => {

			var body = '';

			req.on('data', chunk => {

				body += chunk;

			}).on('end', () => {

				resolve(body);

			});

		});

	};


module.exports = (config) => {

	return async (req, res, next) => {

		// To have compatibility with both native Node.js HTTP and Express.js.

		if (typeof next != 'function') next = () => res.end('');

		if (typeof config.injection == 'undefined' || typeof config.injection == 'null') config.injection = true;

		if (req.url.startsWith(config.prefix) && config.injection == true) {

			// Setting up public directory for injection scripts.

			if (req.url.startsWith(`${config.prefix}static/`)) {

				path = req.url.toString().replace(`${config.prefix}static`, '');

				if (path.includes('?')) path = path.split('?').splice(0, 1).join('');

				if (path.includes('#')) path = path.split('#').splice(0, 1).join('');

				try {

					return res.end(fs.readFileSync(__dirname + `/static${path}`, {
						encoding: 'utf8'
					}));

				} catch (err) {
					return res.end('')
				};

			}

			// Setting configurations for errors, requests, urls, and blocklist.

			var proxy = {

				request: {

					// Defined later on. Uses clients request headers as the headers used when making the request to the server, although its slightly modifed to work. 

					headers: {},

					// Using the clients request method as the method used when making the request to the server.0

					method: req.method,

					// When this is true, the response of websites with invalid SSL certs will not be given. 

					rejectUnauthorized: false

				},

				error: {

					status: false,

					info: null

				},

				blocked: {

					status: false,

				},

				prefix: config.prefix,

				// Can be used to create extra functions.

				req: req,
				res: res,
				next: next,

			};

			try { proxy.url = new URL(rewrite.url(req.url.replace(config.prefix, ''), 'decode')); } catch(err) {

				proxy.error.status = true;

				// Using 404 error as a filler for this. 

				proxy.error.info = {

					code: 'ENOTFOUND',
					message: `Could not make ${req.method} request to "${rewrite.url(req.url.replace(config.prefix, ''), 'decode')}".` 

				};

				if (config.error) return config.error(proxy);

				return res.end(proxy.error.info.message.replace(/</gi, '<&zwnj;').replace(/>/gi, '>&zwnj;'));

			};

			proxy.injection = config.injection;

			Object.entries(req.headers).forEach(([header_name, header_value]) => proxy.request.headers[header_name] = header_value);

			delete proxy.request.headers['host'];

			// Rewriting "Referer" and "Origin" headers to be accurate as possible in the request.

			if (proxy.request.headers['referer']) proxy.request.headers['referer'] = rewrite.referer(proxy.request.headers['referer'], proxy)

			if (proxy.request.headers['origin']) proxy.request.headers['origin'] = rewrite.origin(proxy.request.headers['origin'], proxy)

			// Forcing character limit on Cookie header because too many cookies in the header can lead to a "Header Overflow" error. Will most likely be replaced in the future.


			if (proxy.request.headers['cookie']) {

				var new_cookie = [],
					cookie_array = proxy.request.headers['cookie'].split('; ');

				cookie_array.forEach(cookie => {

					cookie_name = cookie.split('=').splice(0, 1).join();

					cookie_value = cookie.split('=').splice(1).join();

					if (proxy.url.hostname.includes(cookie_name.split('@').splice(1).join())) new_cookie.push(cookie_name.split('@').splice(0, 1).join() + '=' + cookie_value);

				});

				proxy.request.headers['cookie'] = new_cookie.join('; ');

			}

			// If theres a user agent in the config, use that user agent instead of using the browsers user agent by default.

			if (config.userAgent) proxy.request.headers['user-agent'] = config.useragent;

			if (config.requestAgent) proxy.request['agent'] = config.requestAgent;

			delete proxy.request.headers['accept-encoding'];

			// Getting data from our body parser for HTTP (POST / PATCH) requests.

			if (req.method == 'POST' || req.method == 'PATCH') proxy.request.body = await bodyParser(req);

			config.blocklist.forEach(hostname => {

				if (proxy.url.hostname == hostname) {

					proxy.error.status = true;

					proxy.blocked.status = true;

					proxy.error.info = {

						code: 'BLOCKED',

						message: `Could not make ${req.method} request to "${rewrite.url(req.url.replace(config.prefix, ''), 'decode')}".` 

					}

				}

			});

			// If URL hostname has been detected as blocked, the app blocks all further functions and sends a different response to the client.

			if (proxy.blocked.status == true) {

				if (config.error) return config.error(proxy);

				return res.end(proxy.error.info.message.replace(/</gi, '<&zwnj;').replace(/>/gi, '>&zwnj;'));

			}
			// In http.request(), there is a feature to choose what IP you want to use when making the request. This is useful when your server has additional IP's.
			// When there is multiple IP's in the array, the proxy randomizes which one to use. This is useful to bypass Youtube's request checking.

			if (config.localAddress) proxy.request.localAddress = config.localAddress[Math.floor(Math.random() * config.localAddress.length)]

			// Allowing custom functions to be set before the request is made.

			config.request.forEach(customFunction => customFunction(proxy));

			// The request is made to the website, and is awaiting response.

			// Error handling.

			if (!req.url.startsWith(config.prefix + btoa(proxy.url.origin) + '/')) {
				res.writeHead(307, {
					Location: config.prefix + btoa(proxy.url.origin) + '/'
				});
				return res.end();
			};

			proxy.response = await sendRequest(proxy.url.href, proxy.request).catch(err => {

				proxy.error.status = true;

				proxy.error.info = {

					code: err.code,

					message: `Could not make ${req.method} request to "${rewrite.url(req.url.replace(config.prefix, ''), 'decode')}".` 

				};

			});


			if (proxy.error.status == true) {

				if (config.error) return config.error(proxy);

				return res.end(proxy.error.info.message.replace(/</gi, '<&zwnj;').replace(/>/gi, '>&zwnj;'));

			}

			proxy.sendResponse = await proxy.response.buffer;

			// Filtering out bad headers, setting redirect locations, and rewriting cookies.

			rewrite.headers(proxy);

			// Setting response status and headers.

			res.writeHead(proxy.response.statusCode, proxy.response.headers);

			// When rewriting, the "Content-Type" header is extracted, and if it matches ("text/html" | "text/css") the response body gets rewritten. But when the request is POST, "Content-Type" is undefined so we set the header to "text/html" which won't effect POST responses.

			if (typeof proxy.response.headers['content-type'] == 'null' || typeof proxy.response.headers['content-type'] == 'undefined') proxy.response.headers['content-type'] = 'text/html';

			// Rewriting body based off of "Content-Type" header to not mess up any images or javascript types.

			if (proxy.response.headers['content-type'].startsWith('text/html') || proxy.response.headers['content-type'].startsWith('text/css')) {

				proxy.sendResponse = rewrite.body(proxy.sendResponse.toString(), proxy)

			};


			// Allowing custom functions to be set after response is made and rewritten.

			config.response.forEach(customFunction => customFunction(proxy));

			// Sending response to the client.

			res.end(proxy.sendResponse);

		} else next();

	};

}