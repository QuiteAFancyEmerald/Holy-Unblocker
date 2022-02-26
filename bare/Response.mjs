import { OutgoingMessage } from 'node:http';
import { Stream } from 'node:stream';

export class Response {
	headers = Object.setPrototypeOf({}, null);
	status = 200;
	constructor(body, status, headers){
		this.body = body;
		
		if(typeof status === 'number'){
			this.status = status;
		}
		
		if(typeof headers === 'object' && headers !== undefined && headers !== null){
			Object.assign(this.headers, headers);
		}
	}
	send(request){
		if(!(request instanceof OutgoingMessage))throw new TypeError('Request must be an OutgoingMessage');

		request.writeHead(this.status, this.headers);
		
		if(this.body instanceof Stream){
			this.body.pipe(request);
		}else if(this.body instanceof Buffer){
			request.write(this.body);
			request.end();
		}else{
			request.end();
		}

		return true;
	}
};