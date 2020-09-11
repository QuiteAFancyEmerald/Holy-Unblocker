"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function keyDown(e) {
    var keyCode = e.keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 10; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesGBA[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            IodineGUI.Iodine.keyDown(keyMapIndex | 0);
            if (e.preventDefault) {
                e.preventDefault();
            }
            return;
        }
    }
}
function keyUpGBA(keyCode) {
    keyCode = keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 10; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesGBA[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            IodineGUI.Iodine.keyUp(keyMapIndex | 0);
            return;
        }
    }
}
function keyUp(keyCode) {
    keyCode = keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 8; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesControl[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            keyboardEmulatorControl(keyMapIndex | 0);
            return true;
        }
    }
    return false;
}
function keyUpPreprocess(e) {
    var keyCode = e.keyCode | 0;
    //If we're not mapping a key:
    if (!IodineGUI.toMap) {
        //Check for emulator binding:
        if (!keyUp(keyCode | 0)) {
            //Check for GBA binding:
            keyUpGBA(keyCode);
        }
    }
    else {
        //Map a key binding:
        IodineGUI.toMap[IodineGUI.toMapIndice | 0] = keyCode | 0;
        IodineGUI.toMap = null;
        saveKeyBindings();
    }
}
function keyboardEmulatorControl(keyCode) {
    keyCode = keyCode | 0;
    switch (keyCode | 0) {
        case 0:
            stepVolume(-0.04);
            break;
        case 1:
            stepVolume(0.04);
            break;
        case 2:
            IodineGUI.Iodine.incrementSpeed(0.05);
            break;
        case 3:
            IodineGUI.Iodine.incrementSpeed(-0.05);
            break;
        case 4:
            IodineGUI.Iodine.setSpeed(1);
            break;
        case 5:
            toggleFullScreen();
            break;
        case 6:
            togglePlayState();
            break;
        case 7:
            IodineGUI.Iodine.restart();
    }
}
function toggleFullScreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            }
            else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
function togglePlayState() {
    if (IodineGUI.isPlaying) {
        IodineGUI.Iodine.pause();
    }
    else {
        IodineGUI.Iodine.play();
    }
}