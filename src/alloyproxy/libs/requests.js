const http = require('http'),
	https = require('https'),
	zlib = require('zlib');


module.exports = (url, options) => {


	if (!options) options = {};

	var request = {};

	request.options = options;

	var protocol;

	if (url.startsWith('https://')) {
		protocol = https
	} else protocol = http;

	return new Promise((resolve, error) => {

		var req = protocol.request(url, request.options, res => {

			var response = res;

			response.json = new Promise(resolve => {

				var body = '',
					json = '';

				res.on('data', chunk => body += chunk);

				res.on('end', () => {

					try {

						json = JSON.parse(body);

					} catch (err) {

						json = {};

					}

					resolve(json);

				});

			});

			response.text = new Promise(resolve => {

				var data = '',
					text = '';

				res.on('data', chunk => data = chunk.toString());

				res.on('end', () => {
					text = data;
					resolve(text);
				});

			});

			response.buffer = new Promise(resolve => {

				var buffer = [];

				res.on('data', binary => {

					buffer.push(binary)

				}).on('end', () => {

					buffer = Buffer.concat(buffer)

					switch (res.headers['content-encoding']) {

						case 'gzip':
						case 'x-gzip':

							zlib.gunzip(buffer, (err, buffer) => {

								resolve(buffer);

							});

							break;

						case 'deflate':
						case 'x-deflate':

							zlib.inflate(buffer, (err, buffer) => {

								resolve(buffer);

							});

							break;

						case 'br':

							zlib.BrotliDecompress(buffer, (err, buffer) => {

								resolve(buffer);

							});

							break;

						default:

							resolve(buffer);

							break;

					};

				});

			});

			resolve(response);

		});

		req.on('error', err => {

			error(err);

		});

		if (options.body) {
			req.write(options.body);
			req.end();
		} else req.end();


	});

}