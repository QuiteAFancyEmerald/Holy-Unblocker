
// default input assignments
var inputAssignments = {
    shiftLeft: ['left'],
    shiftRight: ['right'],
    softDrop: ['down'],
    rotateLeft: ['z'],
    rotateRight: ['x', 'up'],
    swap: ['shift', 'c'],
    hardDrop: ['space']
};

var autoRepeatConfig = 50;
var thresholdConfig = 200;

function loadGameControls() {
    var cookies = ['rotateLeft',
		   'rotateRight',
		   'shiftLeft',
		   'shiftRight',
		   'softDrop',
		   'hardDrop',
		   'swap'],
    i, curVal;
    
    // if custom controls need to be loaded
    if (readCookie('customControls') === 'TRUE') {
	// for each input cookie
	for (i = 0; i < cookies.length; i += 1) {
	    // print the controls to the table
	    curVal = readCookie(cookies[i]);
	    document.getElementById(cookies[i]).innerHTML = curVal;
	    // pass the controls into the config object
	    inputAssignments[cookies[i]] = [curVal.toLowerCase()];
	}
    }

    var autoRepeat = readCookie('autoRepeat');
    if (autoRepeat !== null) {
	autoRepeatConfig = parseInt(autoRepeat);
    }
    var threshold = readCookie('threshold');
    if (threshold != null) {
	thresholdConfig = parseInt(threshold);
    }
}