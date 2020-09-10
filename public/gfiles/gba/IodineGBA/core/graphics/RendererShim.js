"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
 function getGameBoyAdvanceGraphicsRenderer(coreExposed, skippingBIOS) {
     if (!coreExposed.offthreadGfxEnabled() || typeof SharedArrayBuffer != "function" || typeof Atomics != "object") {
         return new GameBoyAdvanceGraphicsRenderer(coreExposed, skippingBIOS);
     }
     else {
         try {
			 //Some browsers don't allow webworkers via file:///
			 return new GameBoyAdvanceGraphicsRendererShim(coreExposed, skippingBIOS);
		 }
		 catch (error) {
			 return new GameBoyAdvanceGraphicsRenderer(coreExposed, skippingBIOS);
		 }
     }
 }
 function GameBoyAdvanceGraphicsRendererShim(coreExposed, skippingBIOS) {
     this.coreExposed = coreExposed;
     this.initializeWorker(skippingBIOS);
     this.appendAtomicSync();
     this.initializeBuffers();
     this.shareStaticBuffers();
     this.shareDynamicBuffers();
 }
 GameBoyAdvanceGraphicsRendererShim.prototype.initializeWorker = function (skippingBIOS) {
     skippingBIOS = !!skippingBIOS;
     //Apparently running on localhost is nearly impossible for webworkers in a cross-browser manner:
     var loc = location.href;
     var loc = loc.split("/");
     loc = loc.slice(0, loc.length - 1).join("/");
     try {
         if (typeof WorkerGlobalScope === 'undefined' || !(self instanceof WorkerGlobalScope)) {
             //Use the catch block:
             throw null;
         }
         //Firefox:
         var loc2 = loc + "/graphics/Worker.js";
         this.worker = new Worker(loc2);
     }
     catch (e) {
         //Google Chrome:
         var loc3 = loc + "/IodineGBA/core/graphics/Worker.js";
         this.worker = new Worker(loc3);
     }
     this.worker.postMessage({
         messageID:1,
         skippingBIOS:!!skippingBIOS
     });
 }
 GameBoyAdvanceGraphicsRendererShim.prototype.initializeBuffers = function () {
     //Graphics Buffers:
     this.gfxCommandBufferLength = 0x80000;
     this.gfxCommandBufferMask = ((this.gfxCommandBufferLength | 0) - 1) | 0;
     this.gfxCommandBuffer = getSharedInt32Array(this.gfxCommandBufferLength | 0);
     this.gfxCommandCounters = getSharedInt32Array(3);
     this.gfxLineCounter = getSharedInt32Array(1);
     this.start = 0;
     this.end = 0;
     this.linesPassed = 0;
     this.OAMRAM = getUint8Array(0x400);
     this.OAMRAM16 = getUint16View(this.OAMRAM);
     this.OAMRAM32 = getInt32View(this.OAMRAM);
     this.paletteRAM = getUint8Array(0x400);
     this.VRAM = getUint8Array(0x18000);
     this.VRAM16 = getUint16View(this.VRAM);
     this.VRAM32 = getInt32View(this.VRAM);
     this.paletteRAM16 = getUint16View(this.paletteRAM);
     this.paletteRAM32 = getInt32View(this.paletteRAM);
 }
 GameBoyAdvanceGraphicsRendererShim.prototype.increaseCommandBufferCapacity = function () {
     //Tell the other thread to break for receiving the new buffer:
     Atomics.store(this.gfxCommandCounters, 2, 1);
     //Double the size to the next power of 2:
     this.gfxCommandBufferLength = this.gfxCommandBufferLength << 1;
     this.gfxCommandBufferMask = ((this.gfxCommandBufferLength | 0) - 1) | 0;
     this.gfxCommandBuffer = getSharedInt32Array(this.gfxCommandBufferLength | 0);
     this.gfxCommandCounters = getSharedInt32Array(3);
     this.start = 0;
     this.end = 0;
     //Share our new buffers:
     this.shareDynamicBuffers();
 }
 GameBoyAdvanceGraphicsRendererShim.prototype.appendAtomicSync = function () {
     //Command buffer counters get synchronized with emulator runtime head/end for efficiency:
     var parentObj = this;
     this.coreExposed.appendStartIterationSync(function () {
         parentObj.synchronizeReader();
     });
     this.coreExposed.appendEndIterationSync(function () {
         parentObj.synchronizeWriter();
     });
     this.coreExposed.appendTerminationSync(function () {
         //Core instance being replaced, kill the worker thread:
         parentObj.worker.terminate();
     });
 }
GameBoyAdvanceGraphicsRendererShim.prototype.shareStaticBuffers = function () {
    try {
        this.worker.postMessage({
            messageID:0,
            gfxBuffers:gfxBuffers,
            gfxCounters:gfxCounters,
            gfxLineCounter:this.gfxLineCounter
        }, [
            gfxBuffers[0].buffer,
            gfxBuffers[1].buffer,
            gfxCounters.buffer,
            this.gfxLineCounter.buffer
        ]);
    }
    catch (e) {
        this.worker.postMessage({
            messageID:0,
            gfxBuffers:gfxBuffers,
            gfxCounters:gfxCounters,
            gfxLineCounter:this.gfxLineCounter
        });
    }
}
GameBoyAdvanceGraphicsRendererShim.prototype.shareDynamicBuffers = function () {
    try {
        this.worker.postMessage({
            messageID:2,
            gfxCommandBuffer:this.gfxCommandBuffer,
            gfxCommandCounters:this.gfxCommandCounters
            }, [
            this.gfxCommandBuffer.buffer,
            this.gfxCommandCounters.buffer
        ]);
    }
    catch (e) {
        this.worker.postMessage({
            messageID:2,
            gfxCommandBuffer:this.gfxCommandBuffer,
            gfxCommandCounters:this.gfxCommandCounters
        });
    }
     //Wake up the producer "GPU" thread:
     Atomics.notify(gfxCounters, 2, 1);
}
GameBoyAdvanceGraphicsRendererShim.prototype.pushCommand = function (command, data) {
    command = command | 0;
    data = data | 0;
    //Check if buffer is full:
    this.checkCommandBufferFull();
    //Get the write offset into the ring buffer:
    var endCorrected = this.end & this.gfxCommandBufferMask;
    //Push command into buffer:
    this.gfxCommandBuffer[endCorrected | 0] = command | 0;
    //Push data into buffer:
    this.gfxCommandBuffer[endCorrected | 1] = data | 0;
    //Update the cross thread buffering count:
    this.end = ((this.end | 0) + 2) | 0;
}
GameBoyAdvanceGraphicsRendererShim.prototype.checkCommandBufferFull = function () {
    if ((this.start | 0) == (((this.end | 0) - (this.gfxCommandBufferLength | 0)) | 0)) {
        //Give the reader our updated counter and tell it to run:
        this.synchronizeWriter();
        //Increase buffer size:
        this.increaseCommandBufferCapacity();
        //Reload reader counter value:
        this.synchronizeReader();
    }
}
GameBoyAdvanceGraphicsRendererShim.prototype.synchronizeWriter = function () {
    //Store command buffer writer counter value:
    Atomics.store(this.gfxCommandCounters, 1, this.end | 0);
    Atomics.store(this.gfxLineCounter, 0, this.linesPassed | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.synchronizeReader = function () {
    //Load command buffer reader counter value:
    this.start = Atomics.load(this.gfxCommandCounters, 0) | 0;
}
GameBoyAdvanceGraphicsRendererShim.prototype.pushVRAM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    address = address & 0xFFFF;
    this.pushCommand(0x10000 | address, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.pushVRAM32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    address = address & 0x7FFF;
    this.pushCommand(0x20000 | address, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.pushPAL16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    address = address & 0x1FF;
    this.pushCommand(0x30000 | address, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.pushPAL32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    address = address & 0xFF;
    this.pushCommand(0x40000 | address, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.pushOAM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    address = address & 0x1FF;
    this.pushCommand(0x50000 | address, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.pushOAM32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    address = address & 0xFF;
    this.pushCommand(0x60000 | address, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.incrementScanLineQueue = function () {
    //Increment scan line command:
    this.pushCommand(0, 0);
    //Increment how many scanlines we've pushed out:
    this.linesPassed = ((this.linesPassed | 0) + 1) | 0;
}
GameBoyAdvanceGraphicsRendererShim.prototype.ensureFraming = function () {
    //Vertical blank synchronization command:
    this.pushCommand(0, 1);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeDISPCNT8_0 = function (data) {
    data = data | 0;
    this.pushCommand(1, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeDISPCNT8_1 = function (data) {
    data = data | 0;
    this.pushCommand(2, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeDISPCNT8_2 = function (data) {
    data = data | 0;
    this.pushCommand(3, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeDISPCNT16 = function (data) {
    data = data | 0;
    this.pushCommand(4, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeDISPCNT32 = function (data) {
    data = data | 0;
    this.pushCommand(5, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0CNT8_0 = function (data) {
    data = data | 0;
    this.pushCommand(6, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0CNT8_1 = function (data) {
    data = data | 0;
    this.pushCommand(7, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0CNT16 = function (data) {
    data = data | 0;
    this.pushCommand(8, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1CNT8_0 = function (data) {
    data = data | 0;
    this.pushCommand(9, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1CNT8_1 = function (data) {
    data = data | 0;
    this.pushCommand(10, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1CNT16 = function (data) {
    data = data | 0;
    this.pushCommand(11, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0BG1CNT32 = function (data) {
    data = data | 0;
    this.pushCommand(12, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2CNT8_0 = function (data) {
    data = data | 0;
    this.pushCommand(13, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2CNT8_1 = function (data) {
    data = data | 0;
    this.pushCommand(14, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2CNT16 = function (data) {
    data = data | 0;
    this.pushCommand(15, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3CNT8_0 = function (data) {
    data = data | 0;
    this.pushCommand(16, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3CNT8_1 = function (data) {
    data = data | 0;
    this.pushCommand(17, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3CNT16 = function (data) {
    data = data | 0;
    this.pushCommand(18, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2BG3CNT32 = function (data) {
    data = data | 0;
    this.pushCommand(19, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0HOFS8_0 = function (data) {
    data = data | 0;
    this.pushCommand(20, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0HOFS8_1 = function (data) {
    data = data | 0;
    this.pushCommand(21, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0HOFS16 = function (data) {
    data = data | 0;
    this.pushCommand(22, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0VOFS8_0 = function (data) {
    data = data | 0;
    this.pushCommand(23, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0VOFS8_1 = function (data) {
    data = data | 0;
    this.pushCommand(24, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0VOFS16 = function (data) {
    data = data | 0;
    this.pushCommand(25, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG0OFS32 = function (data) {
    data = data | 0;
    this.pushCommand(26, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1HOFS8_0 = function (data) {
    data = data | 0;
    this.pushCommand(27, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1HOFS8_1 = function (data) {
    data = data | 0;
    this.pushCommand(28, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1HOFS16 = function (data) {
    data = data | 0;
    this.pushCommand(29, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1VOFS8_0 = function (data) {
    data = data | 0;
    this.pushCommand(30, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1VOFS8_1 = function (data) {
    data = data | 0;
    this.pushCommand(31, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1VOFS16 = function (data) {
    data = data | 0;
    this.pushCommand(32, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG1OFS32 = function (data) {
    data = data | 0;
    this.pushCommand(33, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2HOFS8_0 = function (data) {
    data = data | 0;
    this.pushCommand(34, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2HOFS8_1 = function (data) {
    data = data | 0;
    this.pushCommand(35, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2HOFS16 = function (data) {
    data = data | 0;
    this.pushCommand(36, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2VOFS8_0 = function (data) {
    data = data | 0;
    this.pushCommand(37, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2VOFS8_1 = function (data) {
    data = data | 0;
    this.pushCommand(38, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2VOFS16 = function (data) {
    data = data | 0;
    this.pushCommand(39, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2OFS32 = function (data) {
    data = data | 0;
    this.pushCommand(40, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3HOFS8_0 = function (data) {
    data = data | 0;
    this.pushCommand(41, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3HOFS8_1 = function (data) {
    data = data | 0;
    this.pushCommand(42, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3HOFS16 = function (data) {
    data = data | 0;
    this.pushCommand(43, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3VOFS8_0 = function (data) {
    data = data | 0;
    this.pushCommand(44, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3VOFS8_1 = function (data) {
    data = data | 0;
    this.pushCommand(45, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3VOFS16 = function (data) {
    data = data | 0;
    this.pushCommand(46, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3OFS32 = function (data) {
    data = data | 0;
    this.pushCommand(47, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PA8_0 = function (data) {
    data = data | 0;
    this.pushCommand(48, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PA8_1 = function (data) {
    data = data | 0;
    this.pushCommand(49, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PA16 = function (data) {
    data = data | 0;
    this.pushCommand(50, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PB8_0 = function (data) {
    data = data | 0;
    this.pushCommand(51, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PB8_1 = function (data) {
    data = data | 0;
    this.pushCommand(52, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PB16 = function (data) {
    data = data | 0;
    this.pushCommand(53, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PAB32 = function (data) {
    data = data | 0;
    this.pushCommand(54, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PC8_0 = function (data) {
    data = data | 0;
    this.pushCommand(55, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PC8_1 = function (data) {
    data = data | 0;
    this.pushCommand(56, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PC16 = function (data) {
    data = data | 0;
    this.pushCommand(57, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PD8_0 = function (data) {
    data = data | 0;
    this.pushCommand(58, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PD8_1 = function (data) {
    data = data | 0;
    this.pushCommand(59, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PD16 = function (data) {
    data = data | 0;
    this.pushCommand(60, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2PCD32 = function (data) {
    data = data | 0;
    this.pushCommand(61, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PA8_0 = function (data) {
    data = data | 0;
    this.pushCommand(62, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PA8_1 = function (data) {
    data = data | 0;
    this.pushCommand(63, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PA16 = function (data) {
    data = data | 0;
    this.pushCommand(64, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PB8_0 = function (data) {
    data = data | 0;
    this.pushCommand(65, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PB8_1 = function (data) {
    data = data | 0;
    this.pushCommand(66, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PB16 = function (data) {
    data = data | 0;
    this.pushCommand(67, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PAB32 = function (data) {
    data = data | 0;
    this.pushCommand(68, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PC8_0 = function (data) {
    data = data | 0;
    this.pushCommand(69, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PC8_1 = function (data) {
    data = data | 0;
    this.pushCommand(70, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PC16 = function (data) {
    data = data | 0;
    this.pushCommand(71, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PD8_0 = function (data) {
    data = data | 0;
    this.pushCommand(72, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PD8_1 = function (data) {
    data = data | 0;
    this.pushCommand(73, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PD16 = function (data) {
    data = data | 0;
    this.pushCommand(74, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3PCD32 = function (data) {
    data = data | 0;
    this.pushCommand(75, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2X8_0 = function (data) {
    data = data | 0;
    this.pushCommand(76, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2X8_1 = function (data) {
    data = data | 0;
    this.pushCommand(77, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2X8_2 = function (data) {
    data = data | 0;
    this.pushCommand(78, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2X8_3 = function (data) {
    data = data | 0;
    this.pushCommand(79, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2X16_0 = function (data) {
    data = data | 0;
    this.pushCommand(80, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2X16_1 = function (data) {
    data = data | 0;
    this.pushCommand(81, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2X32 = function (data) {
    data = data | 0;
    this.pushCommand(82, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2Y8_0 = function (data) {
    data = data | 0;
    this.pushCommand(83, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2Y8_1 = function (data) {
    data = data | 0;
    this.pushCommand(84, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2Y8_2 = function (data) {
    data = data | 0;
    this.pushCommand(85, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2Y8_3 = function (data) {
    data = data | 0;
    this.pushCommand(86, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2Y16_0 = function (data) {
    data = data | 0;
    this.pushCommand(87, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2Y16_1 = function (data) {
    data = data | 0;
    this.pushCommand(88, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG2Y32 = function (data) {
    data = data | 0;
    this.pushCommand(89, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3X8_0 = function (data) {
    data = data | 0;
    this.pushCommand(90, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3X8_1 = function (data) {
    data = data | 0;
    this.pushCommand(91, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3X8_2 = function (data) {
    data = data | 0;
    this.pushCommand(92, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3X8_3 = function (data) {
    data = data | 0;
    this.pushCommand(93, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3X16_0 = function (data) {
    data = data | 0;
    this.pushCommand(94, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3X16_1 = function (data) {
    data = data | 0;
    this.pushCommand(95, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3X32 = function (data) {
    data = data | 0;
    this.pushCommand(96, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3Y8_0 = function (data) {
    data = data | 0;
    this.pushCommand(97, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3Y8_1 = function (data) {
    data = data | 0;
    this.pushCommand(98, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3Y8_2 = function (data) {
    data = data | 0;
    this.pushCommand(99, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3Y8_3 = function (data) {
    data = data | 0;
    this.pushCommand(100, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3Y16_0 = function (data) {
    data = data | 0;
    this.pushCommand(101, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3Y16_1 = function (data) {
    data = data | 0;
    this.pushCommand(102, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBG3Y32 = function (data) {
    data = data | 0;
    this.pushCommand(103, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN0XCOORDRight8 = function (data) {
    data = data | 0;
    this.pushCommand(104, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN0XCOORDLeft8 = function (data) {
    data = data | 0;
    this.pushCommand(105, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN0XCOORD16 = function (data) {
    data = data | 0;
    this.pushCommand(106, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN1XCOORDRight8 = function (data) {
    data = data | 0;
    this.pushCommand(107, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN1XCOORDLeft8 = function (data) {
    data = data | 0;
    this.pushCommand(108, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN1XCOORD16 = function (data) {
    data = data | 0;
    this.pushCommand(109, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWINXCOORD32 = function (data) {
    data = data | 0;
    this.pushCommand(110, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN0YCOORDBottom8 = function (data) {
    data = data | 0;
    this.pushCommand(111, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN0YCOORDTop8 = function (data) {
    data = data | 0;
    this.pushCommand(112, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN0YCOORD16 = function (data) {
    data = data | 0;
    this.pushCommand(113, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN1YCOORDBottom8 = function (data) {
    data = data | 0;
    this.pushCommand(114, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN1YCOORDTop8 = function (data) {
    data = data | 0;
    this.pushCommand(115, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN1YCOORD16 = function (data) {
    data = data | 0;
    this.pushCommand(116, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWINYCOORD32 = function (data) {
    data = data | 0;
    this.pushCommand(117, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN0IN8 = function (data) {
    data = data | 0;
    this.pushCommand(118, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWIN1IN8 = function (data) {
    data = data | 0;
    this.pushCommand(119, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWININ16 = function (data) {
    data = data | 0;
    this.pushCommand(120, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWINOUT8 = function (data) {
    data = data | 0;
    this.pushCommand(121, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWINOBJIN8 = function (data) {
    data = data | 0;
    this.pushCommand(122, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWINOUT16 = function (data) {
    data = data | 0;
    this.pushCommand(123, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeWINCONTROL32 = function (data) {
    data = data | 0;
    this.pushCommand(124, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeMOSAIC8_0 = function (data) {
    data = data | 0;
    this.pushCommand(125, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeMOSAIC8_1 = function (data) {
    data = data | 0;
    this.pushCommand(126, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeMOSAIC16 = function (data) {
    data = data | 0;
    this.pushCommand(127, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBLDCNT8_0 = function (data) {
    data = data | 0;
    this.pushCommand(128, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBLDCNT8_1 = function (data) {
    data = data | 0;
    this.pushCommand(129, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBLDCNT16 = function (data) {
    data = data | 0;
    this.pushCommand(130, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBLDALPHA8_0 = function (data) {
    data = data | 0;
    this.pushCommand(131, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBLDALPHA8_1 = function (data) {
    data = data | 0;
    this.pushCommand(132, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBLDALPHA16 = function (data) {
    data = data | 0;
    this.pushCommand(133, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBLDCNT32 = function (data) {
    data = data | 0;
    this.pushCommand(134, data | 0);
}
GameBoyAdvanceGraphicsRendererShim.prototype.writeBLDY8 = function (data) {
    data = data | 0;
    this.pushCommand(135, data | 0);
}
if (__LITTLE_ENDIAN__) {
    GameBoyAdvanceGraphicsRendererShim.prototype.writeVRAM8 =
    GameBoyAdvanceGraphicsRendererShim.prototype.writeVRAM16 = function (address, data) {
        address = address | 0;
        data = data | 0;
        this.VRAM16[address & 0xFFFF] = data & 0xFFFF;
        this.pushVRAM16(address | 0, data | 0);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writeVRAM32 = function (address, data) {
        address = address | 0;
        data = data | 0;
        this.VRAM32[address & 0x7FFF] = data | 0;
        this.pushVRAM32(address | 0, data | 0);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readVRAM16 = function (address) {
        address = address | 0;
        return this.VRAM16[address & 0xFFFF] | 0;
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readVRAM32 = function (address) {
        address = address | 0;
        return this.VRAM32[address & 0x7FFF] | 0;
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writePalette16 = function (address, data) {
        data = data | 0;
        address = address | 0;
        this.paletteRAM16[address & 0x1FF] = data & 0xFFFF;
        this.pushPAL16(address | 0, data | 0);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writePalette32 = function (address, data) {
        data = data | 0;
        address = address | 0;
        this.paletteRAM32[address & 0xFF] = data | 0;
        this.pushPAL32(address | 0, data | 0);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readPalette16 = function (address) {
        address = address | 0;
        return this.paletteRAM16[address & 0x1FF] | 0;
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readPalette32 = function (address) {
        address = address | 0;
        return this.paletteRAM32[address & 0xFF] | 0;
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writeOAM16 = function (address, data) {
        address = address | 0;
        data = data | 0;
        this.OAMRAM16[address & 0x1FF] = data & 0xFFFF;
        this.pushOAM16(address | 0, data | 0);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writeOAM32 = function (address, data) {
        address = address | 0;
        data = data | 0;
        this.OAMRAM32[address & 0xFF] = data | 0;
        this.pushOAM32(address | 0, data | 0);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readOAM16 = function (address) {
        address = address | 0;
        return this.OAMRAM16[address & 0x1FF] | 0;
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readOAM32 = function (address) {
        address = address | 0;
        return this.OAMRAM32[address & 0xFF] | 0;
    }
}
else {
    GameBoyAdvanceGraphicsRendererShim.prototype.writeVRAM8 =
    GameBoyAdvanceGraphicsRendererShim.prototype.writeVRAM16 = function (address, data) {
        address <<= 1;
        address &= 0x1FFFE;
        this.VRAM[address] = data & 0xFF;
        this.VRAM[address + 1] = (data >> 8) & 0xFF;
        this.pushVRAM16(address, data);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writeVRAM32 = function (address, data) {
        address <<= 2;
        address &= 0x1FFFC;
        this.VRAM[address] = data & 0xFF;
        this.VRAM[address + 1] = (data >> 8) & 0xFF;
        this.VRAM[address + 2] = (data >> 16) & 0xFF;
        this.VRAM[address + 3] = data >>> 24;
        this.pushVRAM32(address, data);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readVRAM16 = function (address) {
        address <<= 1;
        address &= 0x1FFFE;
        return this.VRAM[address] | (this.VRAM[address + 1] << 8);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readVRAM32 = function (address) {
        address <<= 2;
        address &= 0x1FFFC;
        return this.VRAM[address] | (this.VRAM[address + 1] << 8) | (this.VRAM[address + 2] << 16) | (this.VRAM[address + 3] << 24);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writePalette16 = function (address, data) {
        this.paletteRAM[address << 1] = data & 0xFF;
        this.paletteRAM[(address << 1) + 1] = data >> 8;
        this.pushPAL16(address, data);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writePalette32 = function (address, data) {
        address <<= 2;
        this.paletteRAM[address] = data & 0xFF;
        this.paletteRAM[address | 1] = (data >> 8) & 0xFF;
        this.paletteRAM[address | 2] = (data >> 16) & 0xFF;
        this.paletteRAM[address | 3] = data >>> 24;
        address >>= 2;
        this.pushPAL32(address, data);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readPalette16 = function (address) {
        address &= 0x3FE;
        return this.paletteRAM[address] | (this.paletteRAM[address | 1] << 8);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readPalette32 = function (address) {
        address &= 0x3FC;
        return this.paletteRAM[address] | (this.paletteRAM[address | 1] << 8) | (this.paletteRAM[address | 2] << 16)  | (this.paletteRAM[address | 3] << 24);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writeOAM16 = function (address, data) {
        address &= 0x1FF;
        this.OAMRAM[address << 1] = data & 0xFF;
        this.OAMRAM[(address << 1) | 1] = data >> 8;
        this.pushOAM16(address, data);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.writeOAM32 = function (address, data) {
        address &= 0xFF;
        address <<= 2;
        this.OAMRAM[address] = data & 0xFF;
        this.OAMRAM[address + 1] = (data >> 8) & 0xFF;
        this.OAMRAM[address + 2] = (data >> 16) & 0xFF;
        this.OAMRAM[address + 3] = data >>> 24;
        address >>= 2;
        this.pushOAM32(address, data);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readOAM16 = function (address) {
        address &= 0x1FF;
        address <<= 1;
        return this.OAMRAM[address] | (this.OAMRAM[address | 1] << 8);
    }
    GameBoyAdvanceGraphicsRendererShim.prototype.readOAM32 = function (address) {
        address &= 0xFF;
        address <<= 2;
        return this.OAMRAM[address] | (this.OAMRAM[address | 1] << 8) | (this.OAMRAM[address | 2] << 16)  | (this.OAMRAM[address | 3] << 24);
    }
}
GameBoyAdvanceGraphicsRendererShim.prototype.readVRAM8 = function (address) {
    address = address | 0;
    return this.VRAM[address & 0x1FFFF] | 0;
}
GameBoyAdvanceGraphicsRendererShim.prototype.readOAM = function (address) {
    address = address | 0;
    return this.OAMRAM[address & 0x3FF] | 0;
}
GameBoyAdvanceGraphicsRendererShim.prototype.readPalette8 = function (address) {
    address = address | 0;
    return this.paletteRAM[address & 0x3FF] | 0;
}
