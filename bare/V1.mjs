import http from 'node:http';
import https from 'node:https';
import { MapHeaderNamesFromArray, RawHeaderNames } from './HeaderUtil.mjs';
import { decode_protocol } from './EncodeProtocol.mjs';
import { Response } from './Response.mjs';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const randomBytesAsync = promisify(randomBytes);

// max of 4 concurrent sockets, rest is queued while busy? set max to 75
// const http_agent = http.Agent();
// const https_agent = https.Agent();

async function Fetch(server_request, request_headers, url){
	const options = {
		host: url.host,
		port: url.port,
		path: url.path,
		method: server_request.method,
		headers: request_headers,
	};
	
	let outgoing;

	if(url.protocol === 'https:'){
		outgoing = https.request(options);
	}else if(url.protocol === 'http:'){
		outgoing = http.request(options);
	}else{
		throw new RangeError(`Unsupported protocol: '${url.protocol}'`);
	}
	
	server_request.pipe(outgoing);
	
	return await new Promise((resolve, reject) => {
		outgoing.on('response', resolve);
		outgoing.on('error', reject);	
	});
}

function load_forwarded_headers(request, forward, target){
	const raw = RawHeaderNames(request.rawHeaders);

	for(let header of forward){
		for(let cap of raw){
			if(cap.toLowerCase() == header){
				// header exists and real capitalization was found
				target[cap] = request.headers[header];
			}
		}
	}
}

function read_headers(server_request, request_headers){
	const remote = Object.setPrototypeOf({}, null);
	const headers = Object.setPrototypeOf({}, null);
	
	for(let remote_prop of ['host','port','protocol','path']){
		const header = `x-bare-${remote_prop}`;

		if(header in request_headers){
			let value = request_headers[header];
			
			if(remote_prop === 'port'){
				value = parseInt(value);
				if(isNaN(value))return {
					error: {
						code: 'INVALID_BARE_HEADER',
						id: `request.headers.${header}`,
						message: `Header was not a valid integer.`,
					},
				};
			}

			remote[remote_prop] = value;
		}else{
			return {
				error: {
					code: 'MISSING_BARE_HEADER',
					id: `request.headers.${header}`,
					message: `Header was not specified.`,
				},
			};
		}
	}
	
	if('x-bare-headers' in request_headers){
		let json;
		
		try{
			json = JSON.parse(request_headers['x-bare-headers']);

			for(let header in json){
				if(typeof json[header] !== 'string' && !Array.isArray(json[header])){
					return {
						error: {
							code: 'INVALID_BARE_HEADER',
							id: `bare.headers.${header}`,
							message: `Header was not a String or Array.`,
						},
					};
				}
			}
		}catch(err){
			return {
				error: {
					code: 'INVALID_BARE_HEADER',
					id: `request.headers.${header}`,
					message: `Header contained invalid JSON. (${err.message})`,
				},
			};
		}

		Object.assign(headers, json);
	}else{
		return {
			error: {
				code: 'MISSING_BARE_HEADER',
				id: `request.headers.x-bare-headers`,
				message: `Header was not specified.`,
			},
		};
	}

	if('x-bare-forward-headers' in request_headers){
		let json;
		
		try{
			json = JSON.parse(request_headers['x-bare-forward-headers']);
		}catch(err){
			return {
				error: {
					code: 'INVALID_BARE_HEADER',
					id: `request.headers.x-bare-forward-headers`,
					message: `Header contained invalid JSON. (${err.message})`,
				},
			};
		}

		load_forwarded_headers(server_request, json, headers);
	}else{
		return {
			error: {
				code: 'MISSING_BARE_HEADER',
				id: `request.headers.x-bare-forward-headers`,
				message: `Header was not specified.`,
			},
		};
	}

	return { remote, headers };
}

export async function v1(server, server_request){
	const response_headers = Object.setPrototypeOf({}, null);

	response_headers['x-robots-tag'] = 'noindex';
	response_headers['access-control-allow-headers'] = '*';
	response_headers['access-control-allow-origin'] = '*';
	response_headers['access-control-expose-headers'] = '*';
	
	const { error, remote, headers } = read_headers(server_request, server_request.headers);
	
	if(error){
		// sent by browser, not client
		if(server_request.method === 'OPTIONS'){
			return new Response(undefined, 200, response_headers);
		}else{
			return server.json(400, error);
		}
	}

	let response;

	try{
		response = await Fetch(server_request, headers, remote);
	}catch(err){
		if(err instanceof Error){
			switch(err.code){
				case'ENOTFOUND':
					return server.json(500, {
						code: 'HOST_NOT_FOUND',
						id: 'request',
						message: 'The specified host could not be resolved.',
					});
				case'ECONNREFUSED':
					return server.json(500, {
						code: 'CONNECTION_REFUSED',
						id: 'response',
						message: 'The remote rejected the request.',
					});
				case'ECONNRESET':
					return server.json(500, {
						code: 'CONNECTION_RESET',
						id: 'response',
						message: 'The request was forcibly closed.',
					});
				case'ETIMEOUT':
					return server.json(500, {
						code: 'CONNECTION_TIMEOUT',
						id: 'response',
						message: 'The response timed out.',
					});
			}
		}

		throw err;
	}

	for(let header in response.headers){
		if(header === 'content-encoding' || header === 'x-content-encoding'){
			response_headers['content-encoding'] = response.headers[header];
		}else if(header === 'content-length'){
			response_headers['content-length'] = response.headers[header];
		}
	}

	response_headers['x-bare-headers'] = JSON.stringify(MapHeaderNamesFromArray(RawHeaderNames(response.rawHeaders), {...response.headers}));
	response_headers['x-bare-status'] = response.statusCode
	response_headers['x-bare-status-text'] = response.statusMessage;

	return new Response(response, 200, response_headers);
}

// prevent users from specifying id=__proto__ or id=constructor
const temp_meta = Object.setPrototypeOf({}, null);

setInterval(() => {
	for(let id in temp_meta){
		if(temp_meta[id].expires < Date.now()){
			delete temp_meta[id];
		}
	}
}, 1e3);

export async function v1wsmeta(server, server_request){
	if(!('x-bare-id' in server_request.headers)){
		return server.json(400, {
			code: 'MISSING_BARE_HEADER',
			id: 'request.headers.x-bare-id',
			message: 'Header was not specified',
		});
	}

	const id = server_request.headers['x-bare-id'];

	if(!(id in temp_meta)){
		return server.json(400, {
			code: 'INVALID_BARE_HEADER',
			id: 'request.headers.x-bare-id',
			message: 'Unregistered ID',
		});
	}

	const { meta } = temp_meta[id];

	delete temp_meta[id];

	return server.json(200, meta);
}

export async function v1wsnewmeta(server, server_request){
	const id = (await randomBytesAsync(32)).toString('hex');

	temp_meta[id] = {
		expires: Date.now() + 30e3,
	};
	
	return new Response(Buffer.from(id.toString('hex')))
}

export async function v1socket(server, server_request, server_socket, server_head){
	if(!server_request.headers['sec-websocket-protocol']){
		server_socket.end();
		return;
	}

	const [ first_protocol, data ] = server_request.headers['sec-websocket-protocol'].split(/,\s*/g);
	
	if(first_protocol !== 'bare'){
		server_socket.end();
		return;
	}

	const {
		remote,
		headers,
		forward_headers,
		id,
	} = JSON.parse(decode_protocol(data));
	
	load_forwarded_headers(server_request, forward_headers, headers);

	const options = {
		host: remote.host,
		port: remote.port,
		path: remote.path,
		headers,
		method: server_request.method,	
	};
	
	let request_stream;
	
	let response_promise = new Promise((resolve, reject) => {
		try{
			if(remote.protocol === 'wss:'){
				request_stream = https.request(options, res => {
					reject(`Remote didn't upgrade the request`);
				});
			}else if(remote.protocol === 'ws:'){
				request_stream = http.request(options, res => {
					reject(`Remote didn't upgrade the request`);
				});
			}else{
				return reject(new RangeError(`Unsupported protocol: '${remote.protocol}'`));
			}

			request_stream.on('upgrade', (...args) => {
				resolve(args)
			});
			
			request_stream.on('error', reject);
			request_stream.write(server_head);
			request_stream.end();
		}catch(err){
			reject(err);
		}
	});

	const [ response, socket, head ] = await response_promise;
	
	if('id' in temp_meta){
		if(typeof id !== 'string'){
			socket.end();
			return;
		}

		const meta = {
			headers: MapHeaderNamesFromArray(RawHeaderNames(response.rawHeaders), {...response.headers}),
		};
		
		temp_meta[id].meta = meta;
	}

	
	const response_headers = [
		`HTTP/1.1 101 Switching Protocols`,
		`Upgrade: websocket`,
		`Connection: Upgrade`,
		`Sec-WebSocket-Protocol: bare`,
		`Sec-WebSocket-Accept: ${response.headers['sec-websocket-accept']}`,
	];

	if('sec-websocket-extensions' in response.headers){
		response_headers.push(`Sec-WebSocket-Extensions: ${response.headers['sec-websocket-extensions']}`);
	}

	server_socket.write(response_headers.concat('', '').join('\r\n'));
	server_socket.write(head);

	socket.on('close', () => {
		// console.log('Remote closed');
		server_socket.end();
	});

	server_socket.on('close', () => {
		// console.log('Serving closed');
		socket.end();
	});

	socket.on('error', err => {
		server.error('Remote socket error:', err);
		server_socket.end();
	});
	
	server_socket.on('error', err => {
		server.error('Serving socket error:', err);
		socket.end();
	});

	socket.pipe(server_socket);
	server_socket.pipe(socket);
}
