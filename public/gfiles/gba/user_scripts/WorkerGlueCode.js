"use strict";
/*
 Copyright (C) 2012-2019 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function IodineGBAWorkerShim() {
	this.playStatus = null;
    this.gfx = null;
    this.audio = null;
    this.speed = null;
    this.saveExport = null;
    this.saveImport = null;
    this.worker = null;
    this.gfxBuffers = null;
    this.gfxCounters = null;
    this.audioBuffer = null;
    this.audioCounters = null;
    this.audioSamplesRemaining = null;
    this.audioBufferSize = 0;
    this.audioBufferSizeMask = 0;
    this.audioInitialized = false;
    this.timestamp = null;
    this.initialize();
}
var tempvar = document.getElementsByTagName("script");
IodineGBAWorkerShim.prototype.filepath = tempvar[tempvar.length-1].src;
IodineGBAWorkerShim.prototype.initialize = function () {
    var parentObj = this;
    var loc = this.filepath.split("/");
    loc = loc.slice(0, loc.length - 2).join("/");
    loc += "/IodineGBA/core/Worker.js";
    this.worker = new Worker(loc);
    this.worker.onmessage = function (event) {
        parentObj.decodeMessage(event.data);
    }
}
IodineGBAWorkerShim.prototype.sendMessageSingle = function (eventCode) {
    eventCode = eventCode | 0;
    this.worker.postMessage({messageID:eventCode});
}
IodineGBAWorkerShim.prototype.sendMessageDouble = function (eventCode, eventData) {
    eventCode = eventCode | 0;
    this.worker.postMessage({messageID:eventCode, payload:eventData});
}
IodineGBAWorkerShim.prototype.play = function () {
    this.sendMessageSingle(0);
}
IodineGBAWorkerShim.prototype.pause = function () {
    this.sendMessageSingle(1);
}
IodineGBAWorkerShim.prototype.restart = function () {
    this.sendMessageSingle(2);
}
IodineGBAWorkerShim.prototype.setIntervalRate = function (rate) {
    rate = +rate;
    this.sendMessageDouble(3, +rate);
}
IodineGBAWorkerShim.prototype.timerCallback = function (timestamp) {
    timestamp = timestamp >>> 0;
    //If memory location provided for timestamp buffering:
    if (this.timestamp) {
        //Forward latest timestamp to worker:
        Atomics.store(this.timestamp, 0, timestamp >>> 0);
    }
}
IodineGBAWorkerShim.prototype.attachPlayStatusHandler = function (playStatus) {
	this.playStatus = playStatus;
    this.sendMessageSingle(23);
}
IodineGBAWorkerShim.prototype.issuePlayStatus = function (isPlaying) {
    isPlaying = isPlaying | 0;
	if (this.playStatus) {
		this.playStatus(isPlaying | 0);
	}
}
IodineGBAWorkerShim.prototype.attachGraphicsFrameHandler = function (gfx) {
    this.gfx = gfx;
    var parentObj = this;
    this.gfx.attachGfxCallback(function () {
        parentObj.graphicsHeartBeat();
    });
    this.sendMessageSingle(4);
}
IodineGBAWorkerShim.prototype.attachAudioHandler = function (audio) {
    this.audio = audio;
    this.sendMessageSingle(5);
}
IodineGBAWorkerShim.prototype.enableAudio = function () {
    if (this.audio) {
        this.sendMessageSingle(6);
    }
}
IodineGBAWorkerShim.prototype.disableAudio = function () {
    if (this.audio) {
        this.sendMessageSingle(7);
    }
}
IodineGBAWorkerShim.prototype.toggleSkipBootROM = function (doEnable) {
    doEnable = doEnable | 0;
    this.sendMessageDouble(8, doEnable | 0);
}
IodineGBAWorkerShim.prototype.toggleDynamicSpeed = function (doEnable) {
    doEnable = doEnable | 0;
    this.sendMessageDouble(9, doEnable | 0);
}
IodineGBAWorkerShim.prototype.toggleOffthreadGraphics = function (doEnable) {
    doEnable = doEnable | 0;
    this.sendMessageDouble(22, doEnable | 0);
}
IodineGBAWorkerShim.prototype.attachSpeedHandler = function (speed) {
    this.speed = speed;
    this.sendMessageSingle(10);
}
IodineGBAWorkerShim.prototype.keyDown = function (keyCode) {
    keyCode = keyCode | 0;
    this.sendMessageDouble(11, keyCode | 0);
}
IodineGBAWorkerShim.prototype.keyUp = function (keyCode) {
    keyCode = keyCode | 0;
    this.sendMessageDouble(12, keyCode | 0);
}
IodineGBAWorkerShim.prototype.incrementSpeed = function (newSpeed) {
    newSpeed = +newSpeed;
    this.sendMessageDouble(13, +newSpeed);
}
IodineGBAWorkerShim.prototype.setSpeed = function (newSpeed) {
    newSpeed = +newSpeed;
    this.sendMessageDouble(14, +newSpeed);
}
IodineGBAWorkerShim.prototype.attachBIOS = function (BIOS) {
    this.sendMessageDouble(15, BIOS);
}
IodineGBAWorkerShim.prototype.attachROM = function (ROM) {
    this.sendMessageDouble(16, ROM);
}
IodineGBAWorkerShim.prototype.exportSave = function () {
    this.sendMessageSingle(17);
}
IodineGBAWorkerShim.prototype.attachSaveExportHandler = function (saveExport) {
    this.saveExport = saveExport;
    this.sendMessageSingle(18);
}
IodineGBAWorkerShim.prototype.attachSaveImportHandler = function (saveImport) {
    this.saveImport = saveImport;
    this.sendMessageSingle(19);
}
IodineGBAWorkerShim.prototype.decodeMessage = function (data) {
    switch (data.messageID | 0) {
        case 0:
            this.buffersInitialize(data.gfxBuffer1, data.gfxBuffer2, data.gfxCounters, data.audioSamplesRemaining, data.timestamp);
            break;
        case 1:
            this.audioInitialize(data.channels | 0, +data.sampleRate, data.bufferLimit | 0, data.audioBuffer, data.audioCounters);
            break;
        case 2:
            this.audioRegister();
            break;
        case 3:
            this.audioUnregister();
            break;
        case 4:
            this.audioSetBufferSpace(data.audioBufferContainAmount | 0);
            break;
        case 5:
            this.saveImportRequest(data.saveID);
            break;
        case 6:
            this.saveExportRequest(data.saveID, data.saveData);
            break;
        case 7:
            this.speedPush(+data.speed);
			break;
		default:
			this.issuePlayStatus(data.playing | 0);
    }
}
IodineGBAWorkerShim.prototype.audioInitialize = function (channels, sampleRate, bufferLimit, audioBuffer, audioCounters) {
    channels = channels | 0;
    sampleRate = +sampleRate;
    bufferLimit = bufferLimit | 0;
    var parentObj = this;
    if (this.audio) {
        //(Re-)Initialize:
        this.audio.initialize(channels | 0, +sampleRate, bufferLimit | 0, function () {
            //Empty buffers inside the provided audio event callback:
            parentObj.audioHeartBeat();
        }, function () {
            //Get the remaining sample count:
            parentObj.audioPostHeartBeat();
        },function () {
            //Disable audio in the callback here:
            parentObj.disableAudio();
        });
        this.audioInitialized = true;
    }
    //Grab the new buffer:
    this.audioBuffer = audioBuffer;
    this.audioCounters = audioCounters;
    this.audioBufferSize = audioBuffer.length | 0;
    this.audioBufferSizeMask = ((this.audioBufferSize | 0) - 1) | 0;
}
IodineGBAWorkerShim.prototype.audioHeartBeat = function () {
    //If audio API handle provided and we got a buffer reference:
    if (this.audioInitialized) {
        //Empty the buffer out:
        this.consumeAudioBuffer();
    }
}
IodineGBAWorkerShim.prototype.consumeAudioBuffer = function () {
    //Load the counter values:
    var start = this.audioCounters[0] | 0;                //Written by this thread.
    var end = Atomics.load(this.audioCounters, 1) | 0;    //Written to by the other thread.
    //Don't process if nothing to process:
    if ((end | 0) == (start | 0)) {
        //Buffer is empty:
        return;
    }
    //Copy samples out from the ring buffer:
    this.copyAudioBuffer(start | 0, end | 0);
    //Update the sample count reported by the audio mixer:
    //Done before updating ring buffer counter, so we don't over-produce:
    this.audioPostHeartBeat();
    //Update the starting position counter to match the end position:
    //Atomic store, because the sample count by the audio system needs to be reported prior to this:
    Atomics.store(this.audioCounters, 0, end | 0);
    //Tell audio mixer input to flush to audio mixer:
    this.audio.flush();
}
IodineGBAWorkerShim.prototype.copyAudioBuffer = function (start, end) {
    start = start | 0;
    end = end | 0;
    //Compute the positions in the ring buffer:
    var startCorrected = ((start | 0) & (this.audioBufferSizeMask | 0)) | 0;
    var endCorrected = ((end | 0) & (this.audioBufferSizeMask | 0)) | 0;
    //Copy samples out to audio mixer input (but don't process them yet):
    if ((startCorrected | 0) >= (endCorrected | 0)) {
        //Handle looping to start of buffer:
        this.audio.pushDeferred(this.audioBuffer, startCorrected | 0, this.audioBufferSize | 0);
        this.audio.pushDeferred(this.audioBuffer, 0, endCorrected | 0);
    }
    else {
        this.audio.pushDeferred(this.audioBuffer, startCorrected | 0, endCorrected | 0);
    }
}
IodineGBAWorkerShim.prototype.audioPostHeartBeat = function () {
    //Push latest audio metrics with no buffering:
    this.audioSamplesRemaining[0] = this.audio.remainingBuffer() | 0;
}
IodineGBAWorkerShim.prototype.graphicsHeartBeat = function () {
    //If graphics callback handle provided and we got a buffer reference:
    if (this.gfx && this.gfxCounters) {
        //Copy the buffer out to local:
        this.consumeGraphicsBuffer();
        //Wake up the producer thread:
        Atomics.notify(this.gfxCounters, 2, 1);
    }
}
IodineGBAWorkerShim.prototype.consumeGraphicsBuffer = function () {
    //Load the counter values:
    var start = this.gfxCounters[0] | 0;              //Written by this thread.
    var end = Atomics.load(this.gfxCounters, 1) | 0;  //Written by the other thread.
    //Don't process if nothing to process:
    if ((end | 0) == (start | 0)) {
        //Buffer is empty:
        return;
    }
    //Copy samples out from the ring buffer:
    do {
        //Hardcoded for 2 buffers for a triple buffer effect:
        this.gfx.copyBuffer(this.gfxBuffers[start & 0x1]);
        start = ((start | 0) + 1) | 0;
    } while ((start | 0) != (end | 0));
    //Update the starting position counter to match the end position:
    //Let the other Atomic loads/stores naturally flush this value:
    this.gfxCounters[0] = end | 0;
}
IodineGBAWorkerShim.prototype.audioRegister = function () {
    if (this.audio) {
        this.audio.register();
    }
}
IodineGBAWorkerShim.prototype.audioUnregister = function () {
    if (this.audio) {
        //Empty the existing buffer:
        this.audioHeartBeat();
        //Unregister from mixer:
        this.audio.unregister();
    }
}
IodineGBAWorkerShim.prototype.audioSetBufferSpace = function (bufferSpace) {
    bufferSpace = bufferSpace | 0;
    if (this.audio) {
        this.audio.setBufferSpace(bufferSpace | 0);
    }
}
IodineGBAWorkerShim.prototype.buffersInitialize = function (gfxBuffer1, gfxBuffer2, gfxCounters, audioSamplesRemaining, timestamp) {
    this.gfxBuffers = [gfxBuffer1, gfxBuffer2];
    this.gfxCounters = gfxCounters;
    this.audioSamplesRemaining = audioSamplesRemaining;
    this.timestamp = timestamp;
}
IodineGBAWorkerShim.prototype.speedPush = function (speed) {
    speed = +speed;
    if (this.speed) {
        this.speed(+speed);
    }
}
IodineGBAWorkerShim.prototype.saveImportRequest = function (saveID) {
    if (this.saveImport) {
        var parentObj = this;
        this.saveImport(saveID, function (saveData) {
            parentObj.sendMessageDouble(20, saveData);
        },
        function () {
            parentObj.sendMessageSingle(21);
        });
    }
}
IodineGBAWorkerShim.prototype.saveExportRequest = function (saveID, saveData) {
    if (this.saveExport) {
        this.saveExport(saveID, saveData);
    }
}
