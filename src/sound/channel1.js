var GameboyJS;
(function (GameboyJS) {
"use strict";
var Channel1 = function(apu, channelNumber, audioContext) {
    this.apu = apu;
    this.channelNumber = channelNumber;
    this.playing = false;

    this.soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    this.soundLength = 64; // defaults to 64 periods
    this.lengthCheck = false;

    this.sweepTime = 0; // from 0 to 7
    this.sweepStepLength = 0x8000; // 1 / 128 seconds of instructions
    this.sweepCount = 0;
    this.sweepShifts = 0;
    this.sweepSign = 1; // +1 / -1 for increase / decrease freq

    this.frequency = 0;

    this.envelopeStep = 0;
    this.envelopeStepLength = 0x10000;// 1 / 64 seconds of instructions
    this.envelopeCheck = false;
    this.envelopeSign = 1;

    this.clockLength = 0;
    this.clockEnvelop = 0;
    this.clockSweep = 0;

    var gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    var oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = 1000;
    oscillator.connect(gainNode);
    oscillator.start(0);

    this.audioContext = audioContext;
    this.gainNode = gainNode;
    this.oscillator = oscillator;
};

Channel1.prototype.play = function() {
    if (this.playing) return;
    this.playing = true;
    this.apu.setSoundFlag(this.channelNumber, 1);
    this.gainNode.connect(this.audioContext.destination);
    this.clockLength = 0;
    this.clockEnvelop = 0;
    this.clockSweep = 0;
    if (this.sweepShifts > 0) this.checkFreqSweep();
};
Channel1.prototype.stop = function() {
    this.playing = false;
    this.apu.setSoundFlag(this.channelNumber, 0);
    this.gainNode.disconnect();
};
Channel1.prototype.checkFreqSweep = function() {
    var oldFreq = this.getFrequency();
    var newFreq = oldFreq + this.sweepSign * (oldFreq >> this.sweepShifts);
    if (newFreq > 0x7FF) {
        newFreq = 0;
        this.stop();
    }

    return newFreq;
};
Channel1.prototype.update = function(clockElapsed) {
    this.clockEnvelop += clockElapsed;
    this.clockSweep   += clockElapsed;

    if ((this.sweepCount || this.sweepTime) && this.clockSweep > (this.sweepStepLength * this.sweepTime)) {
        this.clockSweep -= (this.sweepStepLength * this.sweepTime);
        this.sweepCount--;

        var newFreq = this.checkFreqSweep(); // process and check new freq

        this.apu.memory[0xFF13] = newFreq & 0xFF;
        this.apu.memory[0xFF14] &= 0xF8;
        this.apu.memory[0xFF14] |= (newFreq & 0x700) >> 8;
        this.setFrequency(newFreq);

        this.checkFreqSweep(); // check again with new value
    }

    if (this.envelopeCheck && this.clockEnvelop > this.envelopeStepLength) {
        this.clockEnvelop -= this.envelopeStepLength;
        this.envelopeStep--;
        this.setEnvelopeVolume(this.envelopeVolume + this.envelopeSign);
        if (this.envelopeStep <= 0) {
            this.envelopeCheck = false;
        }
    }

    if (this.lengthCheck) {
        this.clockLength += clockElapsed;
        if (this.clockLength > this.soundLengthUnit) {
            this.soundLength--;
            this.clockLength -= this.soundLengthUnit;
            if (this.soundLength == 0) {
                this.setLength(0);
                this.stop();
            }
        }
    }
};
Channel1.prototype.setFrequency = function(value) {
    this.frequency = value;
    this.oscillator.frequency.value = 131072 / (2048 - this.frequency);
};
Channel1.prototype.getFrequency = function() {
    return this.frequency;
};
Channel1.prototype.setLength = function(value) {
    this.soundLength = 64 - (value & 0x3F);
};
Channel1.prototype.setEnvelopeVolume = function(volume) {
    this.envelopeCheck = volume > 0 && volume < 16 ? true : false;
    this.envelopeVolume = volume;
    this.gainNode.gain.value = this.envelopeVolume * 1/100;
};
Channel1.prototype.disable = function() {
    this.oscillator.disconnect();
};
Channel1.prototype.enable = function() {
    this.oscillator.connect(this.gainNode);
};
GameboyJS.Channel1 = Channel1;
}(GameboyJS || (GameboyJS = {})));
