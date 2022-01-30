var controlsLoaded = false;
var curControl = null;

function onControlsLoad() {
    jaws.start(InputMonitor);
    // check for an existing controls cookie
    var customControls = readCookie('customControls');

    // these actions will trigger the controls configurations
    if (customControls === 'TRUE') {
	// if there is a cookie, set up the controls for it
	document.getElementById('customRadio').checked = true;
	configureCustomControls();
    } else {
	// if no cookie, assign defaults, create the cookie
	document.getElementById('defaultRadio').checked = true;
	setDefaultControls();
    }

    configureAutoRepeat();

    controlsLoaded = true;
}

function setDefaultControls() {
    stopPollingInput();

    document.getElementById('instructionsDefault').setAttribute('class', 'withDisplay');
    document.getElementById('instructionsCustom').setAttribute('class', 'noDisplay');
    document.getElementById('instructionsPending').setAttribute('class', 'noDisplay');

    // set the cookies
    createCookie('customControls', 'FALSE', 1000);

    // configure the gui to the default text
    document.getElementById('rotateLeftValue')
	.innerHTML = 'Z';
    document.getElementById('rotateRightValue')
	.innerHTML = 'X, UP';
    document.getElementById('shiftLeftValue')
	.innerHTML = 'LEFT';
    document.getElementById('shiftRightValue')
	.innerHTML = 'RIGHT';
    document.getElementById('softDropValue')
	.innerHTML = 'DOWN';
    document.getElementById('hardDropValue')
	.innerHTML = 'SPACE';
    document.getElementById('swapValue')
	.innerHTML = 'SHIFT, C';
}

function configureCustomControls(fromCookie, fromThreshold) {
    stopPollingInput();

    document.getElementById('instructionsDefault').setAttribute('class', 'noDisplay');
    document.getElementById('instructionsCustom').setAttribute('class', 'withDisplay');
    document.getElementById('instructionsPending').setAttribute('class', 'noDisplay');

    if (controlsLoaded && !fromCookie) {
	// the cookies need to be created & initialized
	createCookie('rotateLeft', 'Z', 1000);
	createCookie('rotateRight', 'X', 1000);
	createCookie('shiftLeft', 'LEFT', 1000);
	createCookie('shiftRight', 'RIGHT', 1000);
	createCookie('softDrop', 'DOWN', 1000);
	createCookie('hardDrop', 'SPACE', 1000);
	createCookie('swap', 'C', 1000);

	createCookie('customControls', 'TRUE', 1000);
    }

    // assign all of the GUI elements based on the cookie
    document.getElementById('rotateLeftValue')
	.innerHTML = readCookie('rotateLeft');
    document.getElementById('rotateRightValue')
	.innerHTML = readCookie('rotateRight');
    document.getElementById('shiftLeftValue')
	.innerHTML = readCookie('shiftLeft');
    document.getElementById('shiftRightValue')
	.innerHTML = readCookie('shiftRight');
    document.getElementById('softDropValue')
	.innerHTML = readCookie('softDrop');
    document.getElementById('hardDropValue')
	.innerHTML = readCookie('hardDrop');
    document.getElementById('swapValue')
	.innerHTML = readCookie('swap');
}

function controlsUnitClicked(controlName) {
    // if default controls, switch to custom
    if (readCookie('customControls') !== 'TRUE') {
	// if no cookie, assign defaults, create the cookie
	document.getElementById('customRadio').checked = true;
	configureCustomControls();
    }

    document.getElementById('instructionsDefault').setAttribute('class', 'noDisplay');
    document.getElementById('instructionsCustom').setAttribute('class', 'noDisplay');
    document.getElementById('instructionsPending').setAttribute('class', 'withDisplay');

    if (curControl !== null) {
	stopPollingInput();
    }
    curControl = {
	name:  controlName,
	containerId: controlName + 'Div'
    };

    startPollingInput();
}

function startPollingInput() {
    document.getElementById(curControl.containerId).setAttribute('class', 'controlsUnit controlsUnitPending');
    
    inputPolling = true;
}

function stopPollingInput() {
    if (curControl !== null) {
	inputPolling = false;
	
	document.getElementById(curControl.containerId).setAttribute('class', 'controlsUnit');
	curControl = null;
    }
}

function findWhereKeyUsed(key) {
    var cookies = ['rotateLeft',
		   'rotateRight',
		   'shiftLeft',
		   'shiftRight',
		   'softDrop',
		   'hardDrop',
		   'swap'],
    i;

    for (i = 0; i < cookies.length; i += 1) {
	if (readCookie(cookies[i]) === key) {
	    return cookies[i];
	}
    }

    return null;
}

function reportKeyPressed(keyLower) {
    // should never fail this case...
    if (curControl !== null) {
	var key = keyLower.toUpperCase();

	// if this key is used anywhere else
	var controlUsed = findWhereKeyUsed(key);
	if (controlUsed !== null) {
	    // swap the two controls
	    createCookie(controlUsed, readCookie(curControl.name), 1000);
	    createCookie(curControl.name, key, 1000);
	} else {
	    // set this key to the new value
	    createCookie(curControl.name, key, 1000);
	}

	configureCustomControls(true);

	stopPollingInput();
    }
}

function configureAutoRepeat() {
    var autoRepeat = readCookie('autoRepeat');
    if (autoRepeat === null) {
	autoRepeat = "50";
	createCookie('autoRepeat', autoRepeat, 1000);
    }
    var threshold = readCookie('threshold');
    if (threshold === null) {
	threshold = "200";
	createCookie("threshold", threshold, 1000);
    }

    document.getElementById('autoRepeatRange').value = autoRepeat;
    document.getElementById('autoRepeatValue').innerHTML = autoRepeat;
    document.getElementById('thresholdRange').value = threshold;
    document.getElementById('thresholdValue').innerHTML = threshold;
}

function updateAutoRepeat() {
    var newVal = document.getElementById('autoRepeatRange').value;
    document.getElementById('autoRepeatValue').innerHTML = newVal;
    createCookie('autoRepeat', newVal, 1000);
}

function updateThreshold() {
    var newVal = document.getElementById('thresholdRange').value;
    document.getElementById('thresholdValue').innerHTML = newVal;
    createCookie('threshold', newVal, 1000);
}

function resetAutoRepeat() {
    eraseCookie('autoRepeat');
    eraseCookie('threshold');
    configureAutoRepeat();
}