import { Server as HTTPServer } from 'node:http';
import { Server as BareServer } from './Server.mjs';

const bare_server = new BareServer({
	prefix: '/bare/',
});

const my_server = new HTTPServer();

my_server.on('request', (request, response) => {
	// .route_request() will return true if the request's URL points to the bare server's prefix.
	if(bare_server.route_request(request, response)){
		return;
	}
	
	// send a response for web crawlers/discoverers
	
	const message = Buffer.from(`This server handles TOMP bare requests on the prefix: ${bare_server.prefix}`);
	
	response.writeHead(200, {
		'content-type': 'text/plain',
		'content-length': message.byteLength,
	});
	
	response.end(message);
});

my_server.on('upgrade', (request, socket, head) => {
	if(bare_server.route_upgrade(request, socket, head)){
		return;
	}
	
	// All upgrade sockets should go to TOMP
	// Because we have nothing to do with the socket, we will close it.
	
	socket.end();
});

my_server.on('listening', () => {
	console.log('Listening on localhost:80');
});

my_server.listen({
	host: 'localhost',
	port: 80,
});