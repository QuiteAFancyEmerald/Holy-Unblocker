import { v1, v1socket, v1wsmeta, v1wsnewmeta } from './V1.mjs';
import { Response } from './Response.mjs';

export class Server {
	prefix = '/';
	fof = this.json(404, { message: 'Not found.' });
	maintainer = undefined;
	project = {
		name: 'TOMPHTTP NodeJS Bare Server',
		repository: 'https://github.com/tomphttp/bare-server-node',
	};
	log_error = false;
	constructor(directory, log_error, maintainer){
		if(typeof log_error === 'boolean'){
			this.log_error = true;
		}

		if(typeof maintainer === 'object' && maintainer === null){
			this.maintainer = maintainer;
		}

		if(typeof directory !== 'string'){
			throw new Error('Directory must be specified.')
		}

		if(!directory.startsWith('/') || !directory.endsWith('/')){
			throw new RangeError('Directory must start and end with /');
		}

		this.directory = directory;
	}
	error(...args){
		if(this.log_error){
			console.error(...args);
		}
	}
	json(status, json){
		const send = Buffer.from(JSON.stringify(json, null, '\t'));

		return new Response(send, status, {
			'content-type': 'application/json',
			'content-length': send.byteLength,
		});
	}
	route_request(request, response){
		if(request.url.startsWith(this.directory)){
			this.request(request, response);
			return true;
		}else{
			return false;
		}
	}
	route_upgrade(request, socket, head){
		if(request.url.startsWith(this.directory)){
			this.upgrade(request, socket, head);
			return true;
		}else{
			return false;
		}
	}
	get instance_info(){
		return {
			versions: [ 'v1' ],
			language: 'NodeJS',
			memoryUsage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
			maintainer: this.maintainer,
			developer: this.project,
		};
	}
	async upgrade(request, socket, head){
		const service = request.url.slice(this.directory.length - 1);
		
		try{
			switch(service){
				case'/v1/':
					await v1socket(this, request, socket, head);
					break;
				default:
					socket.end();
					break;
			}
		}catch(err){
			this.error(err);
			socket.end();
		}
	}
	async request(server_request, server_response){
		const service = server_request.url.slice(this.directory.length - 1);
		let response;

		try{
			switch(service){
				case'/':

					if(server_request.method != 'GET')response = this.json(405, { message: 'This route only accepts the GET method.' });
					else response = this.json(200, this.instance_info);

					break;
				case'/v1/':

					response = await v1(this, server_request);

					break;
				case'/v1/ws-meta':

					response = await v1wsmeta(this, server_request);

					break;
				case'/v1/ws-new-meta':

					response = await v1wsnewmeta(this, server_request);

					break;
				default:

					response = this.fof;

			}
		}catch(err){
			this.error(err);
			
			if(err instanceof Error){
				response = this.json(500, {
					code: 'UNKNOWN',
					id: `error.${err.name}`,
					message: err.message,
					stack: err.stack,
				});
			}else{
				response = this.json(500, {
					code: 'UNKNOWN',
					id: 'error.Exception',
					message: err,
					stack: new Error(err).stack,
				});
			}
		}

		if(!(response instanceof Response)){
			this.error('Response to', server_request.url, 'was not a response.');
			response = this.fof;
		}
		
		response.send(server_response);
	}
};