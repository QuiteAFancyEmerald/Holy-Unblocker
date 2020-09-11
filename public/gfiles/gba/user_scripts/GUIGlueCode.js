"use strict";
/*
 Copyright (C) 2012-2019 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function registerGUIEvents() {
    //Catch any play status changes:
    IodineGUI.Iodine.attachPlayStatusHandler(updatePlayButton);
    //Add DOM events:
    addEvent("keydown", document, keyDown);
    addEvent("keyup", document, keyUpPreprocess);
    addEvent("change", document.getElementById("rom_load"), fileLoadROM);
    addEvent("change", document.getElementById("bios_load"), fileLoadBIOS);
    addEvent("click", document.getElementById("play"), function (e) {
        IodineGUI.Iodine.play();
    });
    addEvent("click", document.getElementById("pause"), function (e) {
        IodineGUI.Iodine.pause();
    });
    addEvent("click", document.getElementById("restart"), function (e) {
        IodineGUI.Iodine.restart();
    });
    addEvent("click", document.getElementById("sound"), function () {
        setValue("sound", !!this.checked);
        if (this.checked) {
            IodineGUI.Iodine.enableAudio();
        }
        else {
            IodineGUI.Iodine.disableAudio();
        }
    });
    addEvent("click", document.getElementById("skip_boot"), function () {
        setValue("skipBoot", !!this.checked);
        IodineGUI.Iodine.toggleSkipBootROM(this.checked);
    });
    addEvent("click", document.getElementById("toggleDynamicSpeed"), function () {
        setValue("toggleDynamicSpeed", !!this.checked);
        IodineGUI.Iodine.toggleDynamicSpeed(this.checked);
    });
    addEvent("click", document.getElementById("offthread-gpu"), function () {
        setValue("toggleOffthreadGraphics", !!this.checked);
        IodineGUI.Iodine.toggleOffthreadGraphics(this.checked);
    });
    addEvent("click", document.getElementById("offthread-cpu"), function () {
        setValue("toggleOffthreadCPU", !!this.checked);
        //Can't do anything until reload of page.
    });
    addEvent("change", document.getElementById("speedset"), speedChangeFunc);
    addEvent("input", document.getElementById("speedset"), speedChangeFunc);
    addEvent("click", document.getElementById("fullscreen"), toggleFullScreen);
    addEvent("click", document.getElementById("key_a"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 0;
    });
    addEvent("mousedown", document.getElementById("touch-a"), function () {
        IodineGUI.Iodine.keyDown(0);
    });
    addEvent("mouseup", document.getElementById("touch-a"), function () {
        IodineGUI.Iodine.keyUp(0);
    });
    addEvent("click", document.getElementById("key_b"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 1;
    });
    addEvent("mousedown", document.getElementById("touch-b"), function () {
        IodineGUI.Iodine.keyDown(1);
    });
    addEvent("mouseup", document.getElementById("touch-b"), function () {
        IodineGUI.Iodine.keyUp(1);
    });
    addEvent("click", document.getElementById("key_select"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 2;
    });
    addEvent("mousedown", document.getElementById("touch-select"), function () {
        IodineGUI.Iodine.keyDown(2);
    });
    addEvent("mouseup", document.getElementById("touch-select"), function () {
        IodineGUI.Iodine.keyUp(2);
    });
    addEvent("click", document.getElementById("key_start"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 3;
    });
    addEvent("mousedown", document.getElementById("touch-start"), function () {
        IodineGUI.Iodine.keyDown(3);
    });
    addEvent("mouseup", document.getElementById("touch-start"), function () {
        IodineGUI.Iodine.keyUp(3);
    });
    addEvent("click", document.getElementById("key_right"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 4;
    });
    addEvent("mousedown", document.getElementById("touch-right"), function () {
        IodineGUI.Iodine.keyDown(4);
    });
    addEvent("mouseup", document.getElementById("touch-right"), function () {
        IodineGUI.Iodine.keyUp(4);
    });
    addEvent("click", document.getElementById("key_left"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 5;
    });
    addEvent("mousedown", document.getElementById("touch-left"), function () {
        IodineGUI.Iodine.keyDown(5);
    });
    addEvent("mouseup", document.getElementById("touch-left"), function () {
        IodineGUI.Iodine.keyUp(5);
    });
    addEvent("click", document.getElementById("key_up"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 6;
    });
    addEvent("mousedown", document.getElementById("touch-up"), function () {
        IodineGUI.Iodine.keyDown(6);
    });
    addEvent("mouseup", document.getElementById("touch-up"), function () {
        IodineGUI.Iodine.keyUp(6);
    });
    addEvent("click", document.getElementById("key_down"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 7;
    });
    addEvent("mousedown", document.getElementById("touch-down"), function () {
        IodineGUI.Iodine.keyDown(7);
    });
    addEvent("mouseup", document.getElementById("touch-down"), function () {
        IodineGUI.Iodine.keyUp(7);
    });
    addEvent("click", document.getElementById("key_r"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 8;
    });
    addEvent("mousedown", document.getElementById("touch-r"), function () {
        IodineGUI.Iodine.keyDown(8);
    });
    addEvent("mouseup", document.getElementById("touch-r"), function () {
        IodineGUI.Iodine.keyUp(8);
    });
    addEvent("click", document.getElementById("key_l"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesGBA;
        IodineGUI.toMapIndice = 9;
    });
    addEvent("mousedown", document.getElementById("touch-l"), function () {
        IodineGUI.Iodine.keyDown(9);
    });
    addEvent("mouseup", document.getElementById("touch-l"), function () {
        IodineGUI.Iodine.keyUp(9);
    });
    addEvent("click", document.getElementById("key_volumedown"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesControl;
        IodineGUI.toMapIndice = 0;
    });
    addEvent("click", document.getElementById("key_volumeup"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesControl;
        IodineGUI.toMapIndice = 1;
    });
    addEvent("click", document.getElementById("key_speedup"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesControl;
        IodineGUI.toMapIndice = 2;
    });
    addEvent("click", document.getElementById("key_slowdown"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesControl;
        IodineGUI.toMapIndice = 3;
    });
    addEvent("click", document.getElementById("key_speedreset"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesControl;
        IodineGUI.toMapIndice = 4;
    });
    addEvent("click", document.getElementById("key_fullscreen"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesControl;
        IodineGUI.toMapIndice = 5;
    });
    addEvent("click", document.getElementById("key_playpause"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesControl;
        IodineGUI.toMapIndice = 6;
    });
    addEvent("click", document.getElementById("key_restart"), function () {
        IodineGUI.toMap = IodineGUI.defaults.keyZonesControl;
        IodineGUI.toMapIndice = 7;
    });
    addEvent("change", document.getElementById("import"), function (e) {
             if (typeof this.files != "undefined") {
                try {
                    if (this.files.length >= 1) {
                        writeRedTemporaryText("Reading the local file \"" + this.files[0].name + "\" for importing.");
                        try {
                            //Gecko 1.9.2+ (Standard Method)
                            var binaryHandle = new FileReader();
                            binaryHandle.onload = function () {
                                if (this.readyState == 2) {
                                    writeRedTemporaryText("file imported.");
                                    try {
                                        import_save(this.result);
                                    }
                                    catch (error) {
                                        writeRedTemporaryText(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
                                    }
                                }
                                else {
                                    writeRedTemporaryText("importing file, please wait...");
                                }
                            }
                            binaryHandle.readAsBinaryString(this.files[this.files.length - 1]);
                        }
                        catch (error) {
                            //Gecko 1.9.0, 1.9.1 (Non-Standard Method)
                            var romImageString = this.files[this.files.length - 1].getAsBinary();
                            try {
                                import_save(romImageString);
                            }
                            catch (error) {
                                writeRedTemporaryText(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
                            }
                        }
                    }
                    else {
                        writeRedTemporaryText("Incorrect number of files selected for local loading.");
                    }
                }
                catch (error) {
                    writeRedTemporaryText("Could not load in a locally stored ROM file.");
                }
             }
             else {
                writeRedTemporaryText("could not find the handle on the file to open.");
             }
             if (e.preventDefault) {
                e.preventDefault();
             }
    });
    addEvent("click", document.getElementById("export"), refreshStorageListing);
    addEvent("unload", window, ExportSave);
    IodineGUI.Iodine.attachSpeedHandler(function (speed) {
        speed = speed.toFixed(2);
        if (speed != IodineGUI.currentSpeed[1]) {
            IodineGUI.currentSpeed[1] = speed;
            IodineGUI.currentSpeed[0] = true;
        }
    });
    addEvent("change", document.getElementById("volume"), volChangeFunc);
    addEvent("input", document.getElementById("volume"), volChangeFunc);
    addEvent("resize", window, resizeCanvasFunc);
    addEvent("mouseover", document.getElementById("saves_menu"), rebuildSavesMenu);
    if (typeof document.hidden !== "undefined") {
        addEvent("visibilitychange", document, visibilityChangeHandle);
    }
    else if (typeof document.mozHidden !== "undefined") {
        addEvent("mozvisibilitychange", document, mozVisibilityChangeHandle);
    }
    else if (typeof document.msHidden !== "undefined") {
        addEvent("msvisibilitychange", document, msVisibilityChangeHandle);
    }
    else if (typeof document.webkitHidden !== "undefined") {
        addEvent("webkitvisibilitychange", document, webkitVisibilityChangeHandle);
    }
    //Run on init as well:
    resizeCanvasFunc();
}
function registerDefaultSettings() {
    if (findValue("sound") === null) {
        setValue("sound", !!IodineGUI.defaults.sound);
    }
    else {
        IodineGUI.defaults.sound = !!findValue("sound");
    }
    if (findValue("volume") === null) {
        setValue("volume", +IodineGUI.defaults.volume);
    }
    else {
        IodineGUI.defaults.volume = +findValue("volume");
    }
    document.getElementById("volume").value = Math.round(IodineGUI.defaults.volume * 100);
    document.getElementById("speedset").value = 50;
    if (findValue("skipBoot") === null) {
        setValue("skipBoot", !!IodineGUI.defaults.skipBoot);
    }
    else {
        IodineGUI.defaults.skipBoot = !!findValue("skipBoot");
    }
    if (findValue("toggleSmoothScaling") === null) {
        setValue("toggleSmoothScaling", !!IodineGUI.defaults.toggleSmoothScaling);
    }
    else {
        IodineGUI.defaults.toggleSmoothScaling = !!findValue("toggleSmoothScaling");
    }
    if (findValue("toggleDynamicSpeed") === null) {
        setValue("toggleDynamicSpeed", !!IodineGUI.defaults.toggleDynamicSpeed);
    }
    else {
        IodineGUI.defaults.toggleDynamicSpeed = !!findValue("toggleDynamicSpeed");
    }
    if (findValue("toggleOffthreadGraphics") === null) {
        setValue("toggleOffthreadGraphics", !!IodineGUI.defaults.toggleOffthreadGraphics);
    }
    else {
        IodineGUI.defaults.toggleOffthreadGraphics = !!findValue("toggleOffthreadGraphics");
    }
    if (findValue("toggleOffthreadCPU") === null) {
        setValue("toggleOffthreadCPU", !!IodineGUI.defaults.toggleOffthreadCPU);
    }
    else {
        IodineGUI.defaults.toggleOffthreadCPU = !!findValue("toggleOffthreadCPU");
    }
	// Why is this even a thing???
    /*if (findValue("key_a") === null) {
        setValue("key_a", IodineGUI.defaults.keyZonesGBA[0] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[0] = findValue("key_a");
    }
    if (findValue("key_b") === null) {
        setValue("key_b", IodineGUI.defaults.keyZonesGBA[1] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[1] = findValue("key_b");
    }
    if (findValue("key_select") === null) {
        setValue("key_select", IodineGUI.defaults.keyZonesGBA[2] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[2] = findValue("key_select");
    }
    if (findValue("key_start") === null) {
        setValue("key_start", IodineGUI.defaults.keyZonesGBA[3] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[3] = findValue("key_start");
    }
    if (findValue("key_right") === null) {
        setValue("key_right", IodineGUI.defaults.keyZonesGBA[4] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[4] = findValue("key_right");
    }
    if (findValue("key_left") === null) {
        setValue("key_left", IodineGUI.defaults.keyZonesGBA[5] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[5] = findValue("key_left");
    }
    if (findValue("key_up") === null) {
        setValue("key_up", IodineGUI.defaults.keyZonesGBA[6] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[6] = findValue("key_up");
    }
    if (findValue("key_down") === null) {
        setValue("key_down", IodineGUI.defaults.keyZonesGBA[7] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[7] = findValue("key_down");
    }
    if (findValue("key_r") === null) {
        setValue("key_r", IodineGUI.defaults.keyZonesGBA[8] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[8] = findValue("key_r");
    }
    if (findValue("key_l") === null) {
        setValue("key_l", IodineGUI.defaults.keyZonesGBA[9] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesGBA[9] = findValue("key_l");
    }*/
    if (findValue("key_volumedown") === null) {
        setValue("key_volumedown", IodineGUI.defaults.keyZonesControl[0] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesControl[0] = findValue("key_volumedown");
    }
    if (findValue("key_volumeup") === null) {
        setValue("key_volumeup", IodineGUI.defaults.keyZonesControl[1] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesControl[1] = findValue("key_volumeup");
    }
    if (findValue("key_speedup") === null) {
        setValue("key_speedup", IodineGUI.defaults.keyZonesControl[2] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesControl[2] = findValue("key_speedup");
    }
    if (findValue("key_slowdown") === null) {
        setValue("key_slowdown", IodineGUI.defaults.keyZonesControl[3] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesControl[3] = findValue("key_slowdown");
    }
    if (findValue("key_speedreset") === null) {
        setValue("key_speedreset", IodineGUI.defaults.keyZonesControl[4] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesControl[4] = findValue("key_speedreset");
    }
    if (findValue("key_fullscreen") === null) {
        setValue("key_fullscreen", IodineGUI.defaults.keyZonesControl[5] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesControl[5] = findValue("key_fullscreen");
    }
    if (findValue("key_playpause") === null) {
        setValue("key_playpause", IodineGUI.defaults.keyZonesControl[6] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesControl[6] = findValue("key_playpause");
    }
    if (findValue("key_restart") === null) {
        setValue("key_restart", IodineGUI.defaults.keyZonesControl[7] | 0);
    }
    else {
        IodineGUI.defaults.keyZonesControl[7] = findValue("key_restart");
    }
}
function saveKeyBindings() {
    setValue("key_a", IodineGUI.defaults.keyZonesGBA[0] | 0);
    setValue("key_b", IodineGUI.defaults.keyZonesGBA[1] | 0);
    setValue("key_select", IodineGUI.defaults.keyZonesGBA[2] | 0);
    setValue("key_start", IodineGUI.defaults.keyZonesGBA[3] | 0);
    setValue("key_right", IodineGUI.defaults.keyZonesGBA[4] | 0);
    setValue("key_left", IodineGUI.defaults.keyZonesGBA[5] | 0);
    setValue("key_up", IodineGUI.defaults.keyZonesGBA[6] | 0);
    setValue("key_down", IodineGUI.defaults.keyZonesGBA[7] | 0);
    setValue("key_r", IodineGUI.defaults.keyZonesGBA[8] | 0);
    setValue("key_l", IodineGUI.defaults.keyZonesGBA[9] | 0);
    setValue("key_volumedown", IodineGUI.defaults.keyZonesControl[0] | 0);
    setValue("key_volumeup", IodineGUI.defaults.keyZonesControl[1] | 0);
    setValue("key_speedup", IodineGUI.defaults.keyZonesControl[2] | 0);
    setValue("key_slowdown", IodineGUI.defaults.keyZonesControl[3] | 0);
    setValue("key_speedreset", IodineGUI.defaults.keyZonesControl[4] | 0);
    setValue("key_fullscreen", IodineGUI.defaults.keyZonesControl[5] | 0);
    setValue("key_playpause", IodineGUI.defaults.keyZonesControl[6] | 0);
    setValue("key_restart", IodineGUI.defaults.keyZonesControl[7] | 0);
}
function registerGUISettings() {
    document.getElementById("sound").checked = IodineGUI.defaults.sound;
    if (IodineGUI.defaults.sound) {
        IodineGUI.Iodine.enableAudio();
    }
    try {
        var volControl = document.getElementById("volume");
        volControl.min = 0;
        volControl.max = 100;
        volControl.step = 1;
        volControl.value = IodineGUI.defaults.volume * 100;
    }
    catch (e) {}
    IodineGUI.mixerInput.setVolume(IodineGUI.defaults.volume);
    document.getElementById("skip_boot").checked = IodineGUI.defaults.skipBoot;
    IodineGUI.Iodine.toggleSkipBootROM(IodineGUI.defaults.skipBoot);
    document.getElementById("toggleSmoothScaling").checked = IodineGUI.defaults.toggleSmoothScaling;
    IodineGUI.Blitter.setSmoothScaling(IodineGUI.defaults.toggleSmoothScaling);
    document.getElementById("toggleDynamicSpeed").checked = IodineGUI.defaults.toggleDynamicSpeed;
    IodineGUI.Iodine.toggleDynamicSpeed(IodineGUI.defaults.toggleDynamicSpeed);
    document.getElementById("offthread-gpu").checked = IodineGUI.defaults.toggleOffthreadGraphics;
    IodineGUI.Iodine.toggleOffthreadGraphics(IodineGUI.defaults.toggleOffthreadGraphics);
    document.getElementById("offthread-cpu").checked = IodineGUI.defaults.toggleOffthreadCPU;
    if (typeof SharedArrayBuffer != "function" || typeof Atomics != "object") {
        document.getElementById("offthread-gpu").disabled = true;
        document.getElementById("offthread-cpu").disabled = true;
    }
}
function updatePlayButton(isPlaying) {
    isPlaying = isPlaying | 0;
    if ((isPlaying | 0) == 1) {
        document.getElementById("play").className = "hide";
        document.getElementById("pause").className = "show";
        document.getElementById("menu").className = "playing";
        if (!IodineGUI.coreTimerID) {
            startTimer();
        }
        IodineGUI.isPlaying = true;
    }
    else {
        document.getElementById("pause").className = "hide";
        document.getElementById("play").className = "show";
        document.getElementById("menu").className = "paused";
        if (IodineGUI.coreTimerID) {
            clearInterval(IodineGUI.coreTimerID);
            IodineGUI.coreTimerID = null;
        }
        IodineGUI.isPlaying = false;
    }
}
function visibilityChangeHandle() {
    processVisibilityChange(document.hidden);
}
function mozVisibilityChangeHandle() {
    processVisibilityChange(document.mozHidden);
}
function msVisibilityChangeHandle() {
    processVisibilityChange(document.msHidden);
}
function webkitVisibilityChangeHandle() {
    processVisibilityChange(document.webkitHidden);
}
function processVisibilityChange(isHidden) {
    if (!isHidden) {
        if (IodineGUI.suspended) {
            IodineGUI.suspended = false;
            IodineGUI.Iodine.play();
        }
    }
    else {
        if (document.getElementById("play").className == "hide") {
            IodineGUI.Iodine.pause();
            IodineGUI.suspended = true;
        }
    }
}
function stepVolume(delta) {
    var volume = document.getElementById("volume").value / 100;
    volume = Math.min(Math.max(volume + delta, 0), 1);
    IodineGUI.mixerInput.setVolume(volume);
    document.getElementById("volume").value = Math.round(volume * 100);
}
function volChangeFunc() {
    var volume = Math.min(Math.max(parseInt(this.value), 0), 100) * 0.01;
    setValue("volume", +volume);
    IodineGUI.mixerInput.setVolume(+volume);
};
function speedChangeFunc() {
    var speed = Math.min(Math.max(parseInt(this.value), 0), 100) / 50;
    speed = speed * speed;
    IodineGUI.Iodine.setSpeed(+speed);
}
function writeRedTemporaryText(textString) {
    //lol
	/*if (IodineGUI.GUITimerID) {
        clearTimeout(IodineGUI.GUITimerID);
    }
    document.getElementById("tempMessage").style.display = "block";
    document.getElementById("tempMessage").textContent = textString;
    IodineGUI.GUITimerID = setTimeout(clearTempString, 5000);*/
}
function clearTempString() {
    document.getElementById("tempMessage").style.display = "none";
}
function resizeCanvasFunc() {
    var container = document.getElementById("main");
    var containerHeight = container.clientHeight || container.offsetHeight || 0;
    var containerWidth = container.clientWidth || container.offsetWidth || 0;
    if (containerHeight > 0 && containerWidth > 0) {
        var canvas = document.getElementById("emulator_target");
        var maxWidth = Math.floor(containerHeight * 1.5);
        var maxHeight = Math.floor(containerWidth / 1.5);
        var height = Math.min(maxHeight, containerHeight);
        var width = Math.min(maxWidth, containerWidth);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    }
}
function rebuildSavesMenu(e) {
    if (didNotEnter(document.getElementById("saves_menu_container"), e)) {
        ExportSave();
        rebuildExistingSaves();
        if (e.preventDefault) {
           e.preventDefault();
        }
    }
}
function rebuildExistingSaves() {
    var menu = document.getElementById("existing_saves_list");
    ExportSave();
    removeChildNodes(menu);
    var keys = getSavesKeys();
    while (keys.length > 0) {
        addExistingSaveItem(menu, keys.shift());
    }
}
function addExistingSaveItem(menu, key) {
    var listItem = document.createElement("li");
    listItem.className = "nowrap";
    var spanItem = document.createElement("span");
    spanItem.textContent = decodeKeyType(key);
    listItem.appendChild(spanItem);
    var submenu = document.createElement("ul");
    var submenuItem = document.createElement("li");
    submenuItem.className = "nowrap";
    addEvent("click", submenuItem, function () {
        deleteValue(key);
        rebuildExistingSaves();
    });
    var submenuSpan = document.createElement("span");
    submenuSpan.textContent = "Delete";
    submenuItem.appendChild(submenuSpan);
    submenu.appendChild(submenuItem);
    var submenuItem2 = document.createElement("li");
    submenuItem2.className = "nowrap";
    var link1 = document.createElement("a");
    link1.href = "data:application/octet-stream;base64," + base64(generateBlob(key, findValue(key)));
    link1.download = key + "_" + ((new Date()).getTime()) + ".export";
    link1.textContent = "Download as import compatible";
    submenuItem2.appendChild(link1);
    submenu.appendChild(submenuItem2);
    var submenuItem3 = document.createElement("li");
    submenuItem3.className = "nowrap";
    var link2 = document.createElement("a");
    //Saves are already encoded in base64:
    link2.href = "data:application/octet-stream;base64," + findValue(key);
    link2.download = key + "_" + ((new Date()).getTime()) + ".sav";
    link2.textContent = "Download as raw binary";
    submenuItem3.appendChild(link2);
    submenu.appendChild(submenuItem3);
    listItem.appendChild(submenu);
    menu.appendChild(listItem);
}
function decodeKeyType(key) {
    if (key.substring(0, 15) == "SAVE_TYPE_GUID_") {
        return "Game \"" + key.substring(15) + "\" Type Code";
    }
    else if (key.substring(0, 10) == "SAVE_GUID_") {
        return "Game \"" + key.substring(10) + "\" Cartridge Data";
    }
    else if (key.substring(0, 15) == "SAVE_RTC_GUID_") {
        return "Game \"" + key.substring(15) + "\" RTC Data";
    }
    return key;
}
//Some wrappers and extensions for non-DOM3 browsers:
function removeChildNodes(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}
function didNotEnter(oElement, event) {
    var target = (typeof event.target != "undefined") ? event.target : event.srcElement;
    while (target) {
        if (isSameNode(target, oElement)) {
            return false;
        }
        target = target.parentElement;
    }
	return true;
}
function isSameNode(oCheck1, oCheck2) {
	return (typeof oCheck1.isSameNode == "function") ? oCheck1.isSameNode(oCheck2) : (oCheck1 === oCheck2);
}
function addEvent(sEvent, oElement, fListener) {
    try {
        oElement.addEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.attachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}
function removeEvent(sEvent, oElement, fListener) {
    try {
        oElement.removeEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.detachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}

function setSmooth(){
	var chekd = document.getElementById("smooth").checked;setValue("toggleSmoothScaling", !!chekd);
        if (IodineGUI.Blitter) {
            IodineGUI.Blitter.setSmoothScaling(chekd);
        }
}