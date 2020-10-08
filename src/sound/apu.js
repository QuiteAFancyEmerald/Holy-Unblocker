var GameboyJS;
(function (GameboyJS) {
"use strict";

// Audio Processing unit
// Listens the write accesses to the audio-reserved memory addresses
// and dispatches the data to the sound channels
var APU = function(memory) {
    this.memory = memory;
    this.enabled = false;

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();

    this.channel1 = new GameboyJS.Channel1(this, 1, audioContext);
    this.channel2 = new GameboyJS.Channel1(this, 2, audioContext);
    this.channel3 = new GameboyJS.Channel3(this, 3, audioContext);
    this.channel4 = new GameboyJS.Channel4(this, 4, audioContext);

};
APU.prototype.connect = function() {
    this.channel1.enable();
    this.channel2.enable();
    this.channel3.enable();
};
APU.prototype.disconnect = function() {
    this.channel1.disable();
    this.channel2.disable();
    this.channel3.disable();
};
// Updates the states of each channel given the elapsed time
// (in instructions) since last update
APU.prototype.update = function(clockElapsed) {
    if (this.enabled == false) return;

    this.channel1.update(clockElapsed);
    this.channel2.update(clockElapsed);
    this.channel3.update(clockElapsed);
    this.channel4.update(clockElapsed);
};
APU.prototype.setSoundFlag = function(channel, value) {
    var mask = 0xFF - (1 << (channel - 1));
    value = value << (channel - 1)
    var byteValue = this.memory.rb(APU.registers.NR52);
    byteValue &= mask;
    byteValue |= value;
    this.memory[APU.registers.NR52] = byteValue;
};
// Manage writes to audio registers
// Will update the channels depending on the address
APU.prototype.manageWrite = function(addr, value) {
    if (this.enabled == false && addr < APU.registers.NR52) {
        return;
    }
    this.memory[addr] = value;

    switch (addr) {
        // Channel 1 addresses
        case 0xFF10:
            this.channel1.clockSweep = 0;
            this.channel1.sweepTime = ((value & 0x70) >> 4);
            this.channel1.sweepSign = (value & 0x08) ? -1 : 1;
            this.channel1.sweepShifts = (value & 0x07);
            this.channel1.sweepCount = this.channel1.sweepShifts;
            break;
        case 0xFF11:
            // todo : bits 6-7
            this.channel1.setLength(value & 0x3F);
            break;
        case 0xFF12:
            this.channel1.envelopeSign = (value & 0x08) ? 1 : -1;
            var envelopeVolume = (value & 0xF0) >> 4;
            this.channel1.setEnvelopeVolume(envelopeVolume);
            this.channel1.envelopeStep = (value & 0x07);
            break;
        case 0xFF13:
            var frequency = this.channel1.getFrequency();
            frequency &= 0xF00;
            frequency |= value;
            this.channel1.setFrequency(frequency);
            break;
        case 0xFF14:
            var frequency = this.channel1.getFrequency();
            frequency &= 0xFF;
            frequency |= (value & 7) << 8;
            this.channel1.setFrequency(frequency);
            this.channel1.lengthCheck = (value & 0x40) ? true : false;
            if (value & 0x80) this.channel1.play();
            break;

        // Channel 2 addresses
        case 0xFF16:
            // todo : bits 6-7
            this.channel2.setLength(value & 0x3F);
            break;
        case 0xFF17:
            this.channel2.envelopeSign = (value & 0x08) ? 1 : -1;
            var envelopeVolume = (value & 0xF0) >> 4;
            this.channel2.setEnvelopeVolume(envelopeVolume);
            this.channel2.envelopeStep = (value & 0x07);
            break;
        case 0xFF18:
            var frequency = this.channel2.getFrequency();
            frequency &= 0xF00;
            frequency |= value;
            this.channel2.setFrequency(frequency);
            break;
        case 0xFF19:
            var frequency = this.channel2.getFrequency();
            frequency &= 0xFF;
            frequency |= (value & 7) << 8;
            this.channel2.setFrequency(frequency);
            this.channel2.lengthCheck = (value & 0x40) ? true : false;
            if (value & 0x80) {
                this.channel2.play();
            }
            break;

        // Channel 3 addresses
        case 0xFF1A:
            // todo
            break;
        case 0xFF1B:
            this.channel3.setLength(value);
            break;
        case 0xFF1C:
            // todo
            break;
        case 0xFF1D:
            var frequency = this.channel3.getFrequency();
            frequency &= 0xF00;
            frequency |= value;
            this.channel3.setFrequency(frequency);
            break;
        case 0xFF1E:
            var frequency = this.channel3.getFrequency();
            frequency &= 0xFF;
            frequency |= (value & 7) << 8;
            this.channel3.setFrequency(frequency);
            this.channel3.lengthCheck = (value & 0x40) ? true : false;
            if (value & 0x80) {
                this.channel3.play();
            }
            break;

        // Channel 4 addresses
        case 0xFF20:
            this.channel4.setLength(value & 0x3F);
            break;
        case 0xFF21:
            // todo
            break;
        case 0xFF22:
            // todo
            break;
        case 0xFF23:
            this.channel4.lengthCheck = (value & 0x40) ? true : false;
            if (value & 0x80) {
                this.channel4.play();
            }
            break;

        // channel 3 wave bytes
        case 0xFF30:case 0xFF31:case 0xFF32:case 0xFF33:case 0xFF34:case 0xFF35:case 0xFF36:case 0xFF37:
        case 0xFF38:case 0xFF39:case 0xFF3A:case 0xFF3B:case 0xFF3C:case 0xFF3D:case 0xFF3E:case 0xFF3F:
            var index = addr - 0xFF30;
            this.channel3.setWaveBufferByte(index, value);
            break;

        // general audio switch
        case 0xFF26:
            value &= 0xF0;
            this.memory[addr] = value;
            this.enabled = (value & 0x80) == 0 ? false : true;
            if (!this.enabled) {
                for (var i = 0xFF10; i < 0xFF27; i++)
                    this.memory[i] = 0;
                // todo stop sound
            }
            break;
    }
};

APU.registers = {
    NR10: 0xFF10,
    NR11: 0xFF11,
    NR12: 0xFF12,
    NR13: 0xFF13,
    NR14: 0xFF14,

    NR21: 0xFF16,
    NR22: 0xFF17,
    NR23: 0xFF18,
    NR24: 0xFF19,

    NR30: 0xFF1A,
    NR31: 0xFF1B,
    NR32: 0xFF1C,
    NR33: 0xFF1D,
    NR34: 0xFF1E,

    NR41: 0xFF20,
    NR42: 0xFF21,
    NR43: 0xFF22,
    NR44: 0xFF23,

    NR50: 0xFF24,
    NR51: 0xFF25,
    NR52: 0xFF26
};
GameboyJS.APU = APU;
}(GameboyJS || (GameboyJS = {})));
