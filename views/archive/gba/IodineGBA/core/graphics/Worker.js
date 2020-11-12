"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
importScripts("../../includes/TypedArrayShim.js");
importScripts("Renderer.js");
importScripts("BGTEXT.js");
importScripts("BG2FrameBuffer.js");
importScripts("BGMatrix.js");
importScripts("AffineBG.js");
importScripts("ColorEffects.js");
importScripts("Mosaic.js");
importScripts("OBJ.js");
importScripts("OBJWindow.js");
importScripts("Window.js");
importScripts("Compositor.js");
var renderer = null;
var gfxBuffers = null;
var gfxCounters = null;
var gfxCommandBuffer = null;
var gfxCommandCounters = null;
var gfxCommandBufferMask = 1;
var gfxLineCounter = null;
var gfxLinesCPU = 0;
var gfxLinesGPU = 0;
self.onmessage = function (event) {
    var data = event.data;
    switch (data.messageID | 0) {
        case 0:
            assignStaticBuffers(data.gfxBuffers, data.gfxCounters, data.gfxLineCounter);
            break;
        case 1:
            initializeRenderer(!!data.skippingBIOS);
            break;
        default:
            assignDynamicBuffers(data.gfxCommandBuffer, data.gfxCommandCounters);
            waitForVSync();
    }
}
function copyBuffer(swizzledFrame) {
    //Push a frame of graphics to the blitter handle:
    //Load the counter values:
    var start = Atomics.load(gfxCounters, 0) | 0;       //Written by the other thread.
    var end = gfxCounters[1] | 0;                       //Written by this thread.
    //Check if buffer is full:
    if ((end | 0) == (((start | 0) + 2) | 0)) {
        //Skip copying a frame out:
        return;
    }
    //Copy samples into the ring buffer:
    //Hardcoded for 2 buffers for a triple buffer effect:
    gfxBuffers[end & 0x1].set(swizzledFrame);
    //Increment the ending position counter by 1:
    //Atomic to commit the counter to memory:
    Atomics.store(gfxCounters, 1, ((end | 0) + 1) | 0);
}
function waitForVSync() {
    //Only breaks if the buffer gets resized:
    while ((Atomics.load(gfxCommandCounters, 2) | 0) == 0) {
        //Process the current buffer:
        processCommands();
        //Main thread calls wake to unblock us here:
        Atomics.wait(gfxCounters, 2, 0);
    }
    //Empty old buffer before getting a new buffer to refer to:
    processCommands();
}
function initializeRenderer(skippingBIOS) {
    skippingBIOS = !!skippingBIOS;
    renderer = new GameBoyAdvanceGraphicsRendererOffthread(!!skippingBIOS);
}
function assignStaticBuffers(gfxb, gfxc, cmdl) {
    gfxBuffers = gfxb;
    gfxCounters = gfxc;
    gfxLineCounter = cmdl;
}
function assignDynamicBuffers(cmdb, cmdc) {
    gfxCommandBuffer = cmdb;
    gfxCommandCounters = cmdc;
    var gfxCommandBufferLength = gfxCommandBuffer.length | 0;
    gfxCommandBufferMask = ((gfxCommandBufferLength | 0) - 1) | 0;
}
function processCommands() {
    //Load the counter values:
    var start = gfxCommandCounters[0] | 0;              //Written by this thread.
    var end = Atomics.load(gfxCommandCounters, 1) | 0;  //Written by the other thread.
    gfxLinesCPU = Atomics.load(gfxLineCounter, 0) | 0;  //Keep atomic; IonMonkey thinks this is dead code if it's removed.
    //Don't process if nothing to process:
    if ((end | 0) == (start | 0)) {
        //Buffer is empty:
        return;
    }
    //Dispatch commands:
    var startCorrected = start & gfxCommandBufferMask;
    var endCorrected = end & gfxCommandBufferMask;
    do {
        //Read a command:
        dispatchCommand(gfxCommandBuffer[startCorrected | 0] | 0, gfxCommandBuffer[startCorrected | 1] | 0);
        //Increment by two since we're reading the command code and corresponding data after it:
        startCorrected = ((startCorrected | 0) + 2) & gfxCommandBufferMask;
    } while ((startCorrected | 0) != (endCorrected | 0));
    //Update the starting position counter to match the end position:
    Atomics.store(gfxCommandCounters, 0, end | 0);
}
function dispatchCommand(command, data) {
    command = command | 0;
    data = data | 0;
    /*
        We squeeze some address bits as a portion of the command code.
        The top bits will be the actual command, the bottom ones will be the address,
        unless of course the top bits are zero, for which then it's purely a command code:
    */
    switch (command >> 16) {
        //IO:
        case 0:
            dispatchIOCommand(command | 0, data | 0);
            break;
        //VRAM 16-BIT:
        case 1:
            renderer.writeVRAM16(command & 0xFFFF, data | 0);
            break;
        //VRAM 32-BIT:
        case 2:
            renderer.writeVRAM32(command & 0x7FFF, data | 0);
            break;
        //Palette 16-BIT:
        case 3:
            renderer.writePalette16(command & 0x1FF, data | 0);
            break;
        //Palette 32-BIT:
        case 4:
            renderer.writePalette32(command & 0xFF, data | 0);
            break;
        //OAM 16-BIT:
        case 5:
            renderer.writeOAM16(command & 0x1FF, data | 0);
            break;
        //OAM 32-BIT:
        default:
            renderer.writeOAM32(command & 0xFF, data | 0);
    }
}
function dispatchIOCommand(command, data) {
    command = command | 0;
    data = data | 0;
    switch (command | 0) {
        case 0:
            decodeInternalCommand(data | 0);
            break;
        case 1:
            renderer.writeDISPCNT8_0(data | 0);
            break;
        case 2:
            renderer.writeDISPCNT8_1(data | 0);
            break;
        case 3:
            renderer.writeDISPCNT8_2(data | 0);
            break;
        case 4:
            renderer.writeDISPCNT16(data | 0);
            break;
        case 5:
            renderer.writeDISPCNT32(data | 0);
            break;
        case 6:
            renderer.writeBG0CNT8_0(data | 0);
            break;
        case 7:
            renderer.writeBG0CNT8_1(data | 0);
            break;
        case 8:
            renderer.writeBG0CNT16(data | 0);
            break;
        case 9:
            renderer.writeBG1CNT8_0(data | 0);
            break;
        case 10:
            renderer.writeBG1CNT8_1(data | 0);
            break;
        case 11:
            renderer.writeBG1CNT16(data | 0);
            break;
        case 12:
            renderer.writeBG0BG1CNT32(data | 0);
            break;
        case 13:
            renderer.writeBG2CNT8_0(data | 0);
            break;
        case 14:
            renderer.writeBG2CNT8_1(data | 0);
            break;
        case 15:
            renderer.writeBG2CNT16(data | 0);
            break;
        case 16:
            renderer.writeBG3CNT8_0(data | 0);
            break;
        case 17:
            renderer.writeBG3CNT8_1(data | 0);
            break;
        case 18:
            renderer.writeBG3CNT16(data | 0);
            break;
        case 19:
            renderer.writeBG2BG3CNT32(data | 0);
            break;
        case 20:
            renderer.writeBG0HOFS8_0(data | 0);
            break;
        case 21:
            renderer.writeBG0HOFS8_1(data | 0);
            break;
        case 22:
            renderer.writeBG0HOFS16(data | 0);
            break;
        case 23:
            renderer.writeBG0VOFS8_0(data | 0);
            break;
        case 24:
            renderer.writeBG0VOFS8_1(data | 0);
            break;
        case 25:
            renderer.writeBG0VOFS16(data | 0);
            break;
        case 26:
            renderer.writeBG0OFS32(data | 0);
            break;
        case 27:
            renderer.writeBG1HOFS8_0(data | 0);
            break;
        case 28:
            renderer.writeBG1HOFS8_1(data | 0);
            break;
        case 29:
            renderer.writeBG1HOFS16(data | 0);
            break;
        case 30:
            renderer.writeBG1VOFS8_0(data | 0);
            break;
        case 31:
            renderer.writeBG1VOFS8_1(data | 0);
            break;
        case 32:
            renderer.writeBG1VOFS16(data | 0);
            break;
        case 33:
            renderer.writeBG1OFS32(data | 0);
            break;
        case 34:
            renderer.writeBG2HOFS8_0(data | 0);
            break;
        case 35:
            renderer.writeBG2HOFS8_1(data | 0);
            break;
        case 36:
            renderer.writeBG2HOFS16(data | 0);
            break;
        case 37:
            renderer.writeBG2VOFS8_0(data | 0);
            break;
        case 38:
            renderer.writeBG2VOFS8_1(data | 0);
            break;
        case 39:
            renderer.writeBG2VOFS16(data | 0);
            break;
        case 40:
            renderer.writeBG2OFS32(data | 0);
            break;
        case 41:
            renderer.writeBG3HOFS8_0(data | 0);
            break;
        case 42:
            renderer.writeBG3HOFS8_1(data | 0);
            break;
        case 43:
            renderer.writeBG3HOFS16(data | 0);
            break;
        case 44:
            renderer.writeBG3VOFS8_0(data | 0);
            break;
        case 45:
            renderer.writeBG3VOFS8_1(data | 0);
            break;
        case 46:
            renderer.writeBG3VOFS16(data | 0);
            break;
        case 47:
            renderer.writeBG3OFS32(data | 0);
            break;
        case 48:
            renderer.writeBG2PA8_0(data | 0);
            break;
        case 49:
            renderer.writeBG2PA8_1(data | 0);
            break;
        case 50:
            renderer.writeBG2PA16(data | 0);
            break;
        case 51:
            renderer.writeBG2PB8_0(data | 0);
            break;
        case 52:
            renderer.writeBG2PB8_1(data | 0);
            break;
        case 53:
            renderer.writeBG2PB16(data | 0);
            break;
        case 54:
            renderer.writeBG2PAB32(data | 0);
            break;
        case 55:
            renderer.writeBG2PC8_0(data | 0);
            break;
        case 56:
            renderer.writeBG2PC8_1(data | 0);
            break;
        case 57:
            renderer.writeBG2PC16(data | 0);
            break;
        case 58:
            renderer.writeBG2PD8_0(data | 0);
            break;
        case 59:
            renderer.writeBG2PD8_1(data | 0);
            break;
        case 60:
            renderer.writeBG2PD16(data | 0);
            break;
        case 61:
            renderer.writeBG2PCD32(data | 0);
            break;
        case 62:
            renderer.writeBG3PA8_0(data | 0);
            break;
        case 63:
            renderer.writeBG3PA8_1(data | 0);
            break;
        case 64:
            renderer.writeBG3PA16(data | 0);
            break;
        case 65:
            renderer.writeBG3PB8_0(data | 0);
            break;
        case 66:
            renderer.writeBG3PB8_1(data | 0);
            break;
        case 67:
            renderer.writeBG3PB16(data | 0);
            break;
        case 68:
            renderer.writeBG3PAB32(data | 0);
            break;
        case 69:
            renderer.writeBG3PC8_0(data | 0);
            break;
        case 70:
            renderer.writeBG3PC8_1(data | 0);
            break;
        case 71:
            renderer.writeBG3PC16(data | 0);
            break;
        case 72:
            renderer.writeBG3PD8_0(data | 0);
            break;
        case 73:
            renderer.writeBG3PD8_1(data | 0);
            break;
        case 74:
            renderer.writeBG3PD16(data | 0);
            break;
        case 75:
            renderer.writeBG3PCD32(data | 0);
            break;
        case 76:
            renderer.writeBG2X8_0(data | 0);
            break;
        case 77:
            renderer.writeBG2X8_1(data | 0);
            break;
        case 78:
            renderer.writeBG2X8_2(data | 0);
            break;
        case 79:
            renderer.writeBG2X8_3(data | 0);
            break;
        case 80:
            renderer.writeBG2X16_0(data | 0);
            break;
        case 81:
            renderer.writeBG2X16_1(data | 0);
            break;
        case 82:
            renderer.writeBG2X32(data | 0);
            break;
        case 83:
            renderer.writeBG2Y8_0(data | 0);
            break;
        case 84:
            renderer.writeBG2Y8_1(data | 0);
            break;
        case 85:
            renderer.writeBG2Y8_2(data | 0);
            break;
        case 86:
            renderer.writeBG2Y8_3(data | 0);
            break;
        case 87:
            renderer.writeBG2Y16_0(data | 0);
            break;
        case 88:
            renderer.writeBG2Y16_1(data | 0);
            break;
        case 89:
            renderer.writeBG2Y32(data | 0);
            break;
        case 90:
            renderer.writeBG3X8_0(data | 0);
            break;
        case 91:
            renderer.writeBG3X8_1(data | 0);
            break;
        case 92:
            renderer.writeBG3X8_2(data | 0);
            break;
        case 93:
            renderer.writeBG3X8_3(data | 0);
            break;
        case 94:
            renderer.writeBG3X16_0(data | 0);
            break;
        case 95:
            renderer.writeBG3X16_1(data | 0);
            break;
        case 96:
            renderer.writeBG3X32(data | 0);
            break;
        case 97:
            renderer.writeBG3Y8_0(data | 0);
            break;
        case 98:
            renderer.writeBG3Y8_1(data | 0);
            break;
        case 99:
            renderer.writeBG3Y8_2(data | 0);
            break;
        case 100:
            renderer.writeBG3Y8_3(data | 0);
            break;
        case 101:
            renderer.writeBG3Y16_0(data | 0);
            break;
        case 102:
            renderer.writeBG3Y16_1(data | 0);
            break;
        case 103:
            renderer.writeBG3Y32(data | 0);
            break;
        case 104:
            renderer.writeWIN0XCOORDRight8(data | 0);
            break;
        case 105:
            renderer.writeWIN0XCOORDLeft8(data | 0);
            break;
        case 106:
            renderer.writeWIN0XCOORD16(data | 0);
            break;
        case 107:
            renderer.writeWIN1XCOORDRight8(data | 0);
            break;
        case 108:
            renderer.writeWIN1XCOORDLeft8(data | 0);
            break;
        case 109:
            renderer.writeWIN1XCOORD16(data | 0);
            break;
        case 110:
            renderer.writeWINXCOORD32(data | 0);
            break;
        case 111:
            renderer.writeWIN0YCOORDBottom8(data | 0);
            break;
        case 112:
            renderer.writeWIN0YCOORDTop8(data | 0);
            break;
        case 113:
            renderer.writeWIN0YCOORD16(data | 0);
            break;
        case 114:
            renderer.writeWIN1YCOORDBottom8(data | 0);
            break;
        case 115:
            renderer.writeWIN1YCOORDTop8(data | 0);
            break;
        case 116:
            renderer.writeWIN1YCOORD16(data | 0);
            break;
        case 117:
            renderer.writeWINYCOORD32(data | 0);
            break;
        case 118:
            renderer.writeWIN0IN8(data | 0);
            break;
        case 119:
            renderer.writeWIN1IN8(data | 0);
            break;
        case 120:
            renderer.writeWININ16(data | 0);
            break;
        case 121:
            renderer.writeWINOUT8(data | 0);
            break;
        case 122:
            renderer.writeWINOBJIN8(data | 0);
            break;
        case 123:
            renderer.writeWINOUT16(data | 0);
            break;
        case 124:
            renderer.writeWINCONTROL32(data | 0);
            break;
        case 125:
            renderer.writeMOSAIC8_0(data | 0);
            break;
        case 126:
            renderer.writeMOSAIC8_1(data | 0);
            break;
        case 127:
            renderer.writeMOSAIC16(data | 0);
            break;
        case 128:
            renderer.writeBLDCNT8_0(data | 0);
            break;
        case 129:
            renderer.writeBLDCNT8_1(data | 0);
            break;
        case 130:
            renderer.writeBLDCNT16(data | 0);
            break;
        case 131:
            renderer.writeBLDALPHA8_0(data | 0);
            break;
        case 132:
            renderer.writeBLDALPHA8_1(data | 0);
            break;
        case 133:
            renderer.writeBLDALPHA16(data | 0);
            break;
        case 134:
            renderer.writeBLDCNT32(data | 0);
            break;
        default:
            renderer.writeBLDY8(data | 0);
    }
}
function decodeInternalCommand(data) {
    data = data | 0;
    switch (data | 0) {
        case 0:
            //Check to see if we need to skip rendering to catch up:
            if ((((gfxLinesCPU | 0) - (gfxLinesGPU | 0)) | 0) < 480) {
                //Render a scanline:
                renderer.renderScanLine();
            }
            else {
                //Update some internal counters to maintain state:
                renderer.updateReferenceCounters();
            }
            //Clock the scanline counter:
            renderer.incrementScanLine();
            //Increment how many scanlines we've received out:
            gfxLinesGPU = ((gfxLinesGPU | 0) + 1) | 0;
            break;
        default:
            //Check to see if we need to skip rendering to catch up:
            if ((((gfxLinesCPU | 0) - (gfxLinesGPU | 0)) | 0) < 480) {
                //Push out a frame of graphics:
                renderer.prepareFrame();
            }
    }
}
