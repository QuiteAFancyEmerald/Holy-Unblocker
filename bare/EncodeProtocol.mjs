const valid_chars = "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~";
const reserved_chars = "%";

export function valid_protocol(protocol){
	protocol = protocol.toString();

	for(let i = 0; i < protocol.length; i++){
		const char = protocol[i];

		if(!valid_chars.includes(char)){
			return false;
		}
	}
	
	return true;
}

export function encode_protocol(protocol){
	protocol = protocol.toString();

	let result = '';
	
	for(let i = 0; i < protocol.length; i++){
		const char = protocol[i];

		if(valid_chars.includes(char) && !reserved_chars.includes(char)){
			result += char;
		}else{
			const code = char.charCodeAt();
			result += '%' + code.toString(16).padStart(2, 0);
		}
	}

	return result;
}

export function decode_protocol(protocol){
	if(typeof protocol != 'string')throw new TypeError('protocol must be a string');

	let result = '';
	
	for(let i = 0; i < protocol.length; i++){
		const char = protocol[i];
		
		if(char == '%'){
			const code = parseInt(protocol.slice(i + 1, i + 3), 16);
			const decoded = String.fromCharCode(code);
			
			result += decoded;
			i += 2;
		}else{
			result += char;
		}
	}

	return result;
}