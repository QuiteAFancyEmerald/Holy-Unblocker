var availKeys = [
    "backspace",
    "tab",
    "enter",
    "shift",
    "ctrl",
    "alt",
    "space",
    "pageup",
    "pagedown",
    "end",
    "home",
    "left",
    "up",
    "right",
    "down",
    "insert",
    "delete",
    "multiply",
    "add",
    "subtract",
    "decimalpoint",
    "divide",
    "numlock",
    "scrollock",
    "semicolon",
    "equalsign",
    "comma",
    "dash",
    "period",
    "forwardslash",
    "openbracket",
    "backslash",
    "closebracket",
    "singlequote",
    "numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9",
    "0","1","2","3","4","5","6","7","8","9",
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"
];

var inputPolling = false;

function InputMonitor() {
    // give the program a global reference to me
    this.setup = function(){
	jaws.preventDefaultKeys(availKeys);
    };
    
    // do nothing
    this.draw = function(){};

    // polls the keys if appropriate
    this.update = function() {
	var i,
	pressed;
	
	for (i = 0;
	     i < availKeys.length && inputPolling;
	     i += 1) {
	    
	    pressed = jaws.pressed(availKeys[i]);
	    if (pressed) {
		reportKeyPressed(availKeys[i]);
		inputPolling = false;
		break;
	    }
	}
    }
}