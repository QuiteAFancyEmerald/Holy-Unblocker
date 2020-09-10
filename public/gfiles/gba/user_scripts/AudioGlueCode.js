"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GlueCodeMixer(playButton) {
    var parentObj = this;
    this.audio = new XAudioServer(2, this.sampleRate, 0, this.bufferAmount, null, function () {
        parentObj.checkHeartbeats();
    }, function () {
        parentObj.checkPostHeartbeats();
    }, 1, function () {
        //Disable audio in the callback here:
        parentObj.disableAudio();
    }, playButton);
    this.outputUnits = [];
    this.outputUnitsValid = [];
    this.initializeBuffer();
}
GlueCodeMixer.prototype.sampleRate = 44100;
GlueCodeMixer.prototype.bufferAmount = 44100;
GlueCodeMixer.prototype.channelCount = 2;
GlueCodeMixer.prototype.initializeBuffer = function () {
    this.buffer = new AudioSimpleBuffer(this.channelCount,
                                         this.bufferAmount);
}
GlueCodeMixer.prototype.appendInput = function (inUnit) {
    if (this.audio) {
        for (var index = 0; index < this.outputUnits.length; index++) {
            if (!this.outputUnits[index]) {
                break;
            }
        }
        this.outputUnits[index] = inUnit;
        this.outputUnitsValid.push(inUnit);
        inUnit.registerStackPosition(index);
    }
    else if (typeof inUnit.errorCallback == "function") {
        inUnit.errorCallback();
    }
}
GlueCodeMixer.prototype.unregister = function (stackPosition) {
    this.outputUnits[stackPosition] = null;
    this.outputUnitsValid = [];
    for (var index = 0, length = this.outputUnits.length; index < length; ++index) {
        if (this.outputUnits[index]) {
            this.outputUnitsValid.push(this.outputUnits);
        }
    }
}
GlueCodeMixer.prototype.checkHeartbeats = function () {
    var inputCount = this.outputUnitsValid.length;
    for (var inputIndex = 0, output = 0; inputIndex < inputCount; ++inputIndex) {
        this.outputUnitsValid[inputIndex].heartBeatCallback();
    }
}
GlueCodeMixer.prototype.checkPostHeartbeats = function () {
    var inputCount = this.outputUnitsValid.length;
    for (var inputIndex = 0, output = 0; inputIndex < inputCount; ++inputIndex) {
        this.outputUnitsValid[inputIndex].postHeartBeatCallback();
    }
}
GlueCodeMixer.prototype.checkAudio = function () {
    if (this.audio) {
        var inputCount = this.outputUnitsValid.length;
        for (var inputIndex = 0, output = 0; inputIndex < inputCount; ++inputIndex) {
            this.outputUnitsValid[inputIndex].prepareShift();
        }
        for (var count = 0, requested = this.findLowestBufferCount(); count < requested; ++count) {
            for (var inputIndex = 0, output = 0; inputIndex < inputCount; ++inputIndex) {
                output += this.outputUnitsValid[inputIndex].shift();
            }
            this.buffer.push(output);
        }
        var bufferLength = this.buffer.count();
        this.audio.writeAudioNoCallback(this.buffer.buffer, bufferLength);
        this.buffer.reset();
    }
}
GlueCodeMixer.prototype.findLowestBufferCount = function () {
    var count = 0;
    for (var inputIndex = 0, inputCount = this.outputUnitsValid.length; inputIndex < inputCount; ++inputIndex) {
        var tempCount = this.outputUnitsValid[inputIndex].buffer.resampledSamplesLeft();
        if (tempCount > 0) {
            if (count > 0) {
                count = Math.min(count, tempCount);
            }
            else {
                count = tempCount;
            }
        }
    }
    return Math.min(count, this.channelCount * this.bufferAmount);
}
GlueCodeMixer.prototype.disableAudio = function () {
    this.audio = null;
}
function GlueCodeMixerInput(mixer) {
    this.mixer = mixer;
    this.volume = 1;
}
GlueCodeMixerInput.prototype.initialize = function (channelCount, sampleRate, bufferAmount, heartBeatCallback, postHeartBeatCallback, errorCallback) {
    this.channelCount = channelCount;
    this.sampleRate = sampleRate;
    this.bufferAmount = bufferAmount;
    this.heartBeatCallback = heartBeatCallback;
    this.postHeartBeatCallback = postHeartBeatCallback;
    this.errorCallback = errorCallback;
    var oldBuffer = this.buffer;
    this.buffer = new AudioBufferWrapper(this.channelCount,
                                         this.mixer.channelCount,
                                         this.bufferAmount,
                                         this.sampleRate,
                                         this.mixer.sampleRate);
    if (oldBuffer) {
        //If re-using same mixer input node, copy old buffer contents into the new buffer:
        this.buffer.copyOld(oldBuffer);
    }
}
GlueCodeMixerInput.prototype.register = function () {
    this.mixer.appendInput(this);
}
GlueCodeMixerInput.prototype.setVolume = function (volume) {
    this.volume = Math.min(Math.max(volume, 0), 1);
}
GlueCodeMixerInput.prototype.prepareShift = function () {
    this.buffer.resampleRefill();
}
GlueCodeMixerInput.prototype.shift = function () {
    return this.buffer.shift() * this.volume;
}
GlueCodeMixerInput.prototype.push = function (buffer, start, end) {
    this.buffer.push(buffer, start, end);
    this.mixer.checkAudio();
}
GlueCodeMixerInput.prototype.pushDeferred = function (buffer, start, end) {
    this.buffer.push(buffer, start, end);
}
GlueCodeMixerInput.prototype.flush = function () {
    this.mixer.checkAudio();
}
GlueCodeMixerInput.prototype.remainingBuffer = function () {
    return this.buffer.remainingBuffer() + (Math.floor((this.mixer.audio.remainingBuffer() * this.sampleRate / this.mixer.sampleRate) / this.mixer.channelCount) * this.mixer.channelCount);
}
GlueCodeMixerInput.prototype.registerStackPosition = function (stackPosition) {
    this.stackPosition = stackPosition;
}
GlueCodeMixerInput.prototype.unregister = function () {
    this.mixer.unregister(this.stackPosition);
}
GlueCodeMixerInput.prototype.setBufferSpace = function (bufferAmount) {
    this.buffer.setBufferSpace(bufferAmount);
}
function AudioBufferWrapper(channelCount,
                            mixerChannelCount,
                            bufferAmount,
                            sampleRate,
                            mixerSampleRate) {
    this.channelCount = channelCount;
    this.mixerChannelCount = mixerChannelCount;
    this.bufferAmount = bufferAmount;
    this.sampleRate = sampleRate;
    this.mixerSampleRate = mixerSampleRate;
    this.initialize();
}
AudioBufferWrapper.prototype.initialize = function () {
    this.inBufferSize = this.bufferAmount * this.mixerChannelCount;
    this.inBuffer = getFloat32Array(this.inBufferSize);
    this.resampler = new Resampler(this.sampleRate, this.mixerSampleRate, this.mixerChannelCount, this.inBuffer);
    this.outBufferSize = this.resampler.outputBuffer.length;
    this.outBuffer = getFloat32Array(this.outBufferSize);
    this.inputOffset = 0;
    this.resampleBufferStart = 0;
    this.resampleBufferEnd = 0;
}
AudioBufferWrapper.prototype.copyOld = function (oldBuffer) {
    this.resampleRefill();
    while (oldBuffer.resampleBufferStart != oldBuffer.resampleBufferEnd) {
        this.outBuffer[this.resampleBufferEnd++] = oldBuffer.outBuffer[oldBuffer.resampleBufferStart++];
        if (this.resampleBufferEnd == this.outBufferSize) {
            this.resampleBufferEnd = 0;
        }
        if (this.resampleBufferStart == this.resampleBufferEnd) {
            this.resampleBufferStart += this.mixerChannelCount;
            if (this.resampleBufferStart == this.outBufferSize) {
                this.resampleBufferStart = 0;
            }
        }
        if (oldBuffer.resampleBufferStart == oldBuffer.outBufferSize) {
            oldBuffer.resampleBufferStart = 0;
        }
    }
}
AudioBufferWrapper.prototype.push = function (buffer, start, end) {
    var length  = Math.min(buffer.length, end);
    if (this.channelCount < this.mixerChannelCount) {
        for (; start < length && this.inputOffset < this.inBufferSize;) {
            for (var index = this.channelCount; index < this.mixerChannelCount; ++index) {
                this.inBuffer[this.inputOffset++] = buffer[start];
            }
            for (index = 0; index < this.channelCount && start < length; ++index) {
                this.inBuffer[this.inputOffset++] = buffer[start++];
            }
        }
    }
    else if (this.channelCount == this.mixerChannelCount) {
        for (; start < length && this.inputOffset < this.inBufferSize;) {
            this.inBuffer[this.inputOffset++] = buffer[start++];
        }
    }
    else {
        for (; start < length && this.inputOffset < this.inBufferSize;) {
            for (index = 0; index < this.mixerChannelCount && start < length; ++index) {
                this.inBuffer[this.inputOffset++] = buffer[start++];
            }
            start += this.channelCount - this.mixerChannelCount;
        }
    }
}
AudioBufferWrapper.prototype.shift = function () {
    var output = 0;
    if (this.resampleBufferStart != this.resampleBufferEnd) {
        output = this.outBuffer[this.resampleBufferStart++];
        if (this.resampleBufferStart == this.outBufferSize) {
            this.resampleBufferStart = 0;
        }
    }
    return output;
}
AudioBufferWrapper.prototype.resampleRefill = function () {
    if (this.inputOffset > 0) {
        //Resample a chunk of audio:
        var resampleLength = this.resampler.resampler(this.inputOffset);
        var resampledResult = this.resampler.outputBuffer;
        for (var index2 = 0; index2 < resampleLength;) {
            this.outBuffer[this.resampleBufferEnd++] = resampledResult[index2++];
            if (this.resampleBufferEnd == this.outBufferSize) {
                this.resampleBufferEnd = 0;
            }
            if (this.resampleBufferStart == this.resampleBufferEnd) {
                this.resampleBufferStart += this.mixerChannelCount;
                if (this.resampleBufferStart == this.outBufferSize) {
                    this.resampleBufferStart = 0;
                }
            }
        }
        this.inputOffset = 0;
    }
}
AudioBufferWrapper.prototype.setBufferSpace = function (bufferAmount) {
    while (this.inputOffset < bufferAmount && this.inputOffset < this.inBufferSize) {
        this.inBuffer[this.inputOffset++] = 0;
    }
}
AudioBufferWrapper.prototype.remainingBuffer = function () {
    return (Math.floor((this.resampledSamplesLeft() * this.resampler.ratioWeight) / this.mixerChannelCount) * this.mixerChannelCount) + this.inputOffset;
}
AudioBufferWrapper.prototype.resampledSamplesLeft = function () {
    return ((this.resampleBufferStart <= this.resampleBufferEnd) ? 0 : this.outBufferSize) + this.resampleBufferEnd - this.resampleBufferStart;
}
function AudioSimpleBuffer(channelCount, bufferAmount) {
    this.channelCount = channelCount;
    this.bufferAmount = bufferAmount;
    this.outBufferSize = this.channelCount * this.bufferAmount;
    this.stackLength = 0;
    this.buffer = getFloat32Array(this.outBufferSize);
}
AudioSimpleBuffer.prototype.push = function (data) {
    if (this.stackLength < this.outBufferSize) {
        this.buffer[this.stackLength++] = data;
    }
}
AudioSimpleBuffer.prototype.count = function () {
    return this.stackLength;
}
AudioSimpleBuffer.prototype.reset = function () {
    this.stackLength = 0;
}
