import { Server as BareServer } from './Server.mjs';
import { Server as HTTPServer, Server } from 'node:http';
import { Server as TLSHTTPServer } from 'node:https';
import { readFile } from 'node:fs/promises';
import { cwd } from 'node:process';

import { program, Option } from 'commander';
import { resolve } from 'node:path';

const default_port = Symbol();

program
.addOption(new Option('--d, --directory <string>', 'Bare directory').default('/'))
.addOption(new Option('--h, --host <string>', 'Listening host').default('localhost'))
.addOption(new Option('--p, --port <number>', 'Listening port').default(default_port).env('PORT'))
.addOption(new Option('--e, --errors', 'Error logging').default(false))
.addOption(new Option('--tls', 'use HTTPS (TLS/SSL)'))
.addOption(new Option('--cert <string>', 'TLS certificate').default(''))
.addOption(new Option('--key <string>', 'TLS key').default(''))
;

program.parse(process.argv);

const options = program.opts();

const bare = new BareServer(options.directory, options.errors);
console.info('Created Bare Server on directory:', options.directory);
console.info('Error logging is', options.errors ? 'enabled.' : 'disabled.');

let http;

if(options.tls){
	const tls = {};
	
	if(options.key !== ''){
		options.key = resolve(cwd(), options.key);
		console.info('Reading key from file:', options.key);
		tls.key = await readFile(options.key);
	}

	if(options.cert !== ''){
		options.cert = resolve(cwd(), options.cert);
		console.info('Reading certificate from file:', options.cert);
		tls.cert = await readFile(options.cert);
	}
	
	http = new TLSHTTPServer(tls);
	console.info('Created TLS HTTP server.');
}else{
	http = new HTTPServer();
	console.info('Created HTTP server.');
}

http.on('request', (req, res) => {
	if(bare.route_request(req, res))return;

	res.writeHead(400);
	res.send('Not found');
});

http.on('upgrade', (req, socket, head) => {
	if(bare.route_upgrade(req, socket, head))return;
	socket.end();
});

if(options.port === default_port){
	if(options.tls){
		options.port = 443;
	}else{
		options.port = 80;
	}
}

http.on('listening', () => {
	console.log(`HTTP server listening. View live at ${options.tls ? 'https:' : 'http:'}//${options.host}:${options.port}${options.directory}`);
});

http.listen({
	host: options.host,
	port: options.port,
});