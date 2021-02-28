const WebSocket = require('ws');

// Setting Base64 encoding and decoding functions.

btoa = (str) => {

	str = new Buffer.from(str).toString('base64');

	return str;

};


atob = (str) => {

	str = new Buffer.from(str, 'base64').toString('utf-8');

	return str;

};

module.exports = (server, config) => {

	// Using the HTTP server as the WS server.

	const wss = new WebSocket.Server({
		server: server
	});

	wss.on('connection', (cli, req) => {

		try {

			const svr = new WebSocket(atob(req.url.replace(config.prefix + 'ws/', '')));

			svr.on('message', (data) => {

				try {
					cli.send(data)
				} catch (err) {}

			});

			// Getting response from WS client to send to the user from the server.

			svr.on('open', () => {

				cli.on('message', (data) => {

					svr.send(data)

				});

			});


			// Closes server when WS client closes.

			cli.on('close', (code) => {

				try {
					svr.close(code);
				} catch (err) {
					svr.close(1006)
				};

			});

			// Closes client when WS server closes.

			svr.on('close', (code) => {

				try {
					cli.close(code);
				} catch (err) {
					cli.close(1006)
				};

			});

			// Closes server when WS client errors.

			cli.on('error', (err) => {

				try {
					svr.close(1001);
				} catch (err) {
					svr.close(1006)
				};

			});

			// Closes client when WS server errors.

			svr.on('error', (err) => {

				try {
					cli.close(1001);
				} catch (err) {
					cli.close(1006)
				};

			});

		} catch (err) {
			console.log(err);
			cli.close(1001);
		}
	});
}