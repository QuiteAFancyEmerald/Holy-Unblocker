var GameboyJS;
(function (GameboyJS) {
"use strict";
var Channel4 = function(apu, channelNumber, audioContext) {
    this.apu = apu;
    this.channelNumber = channelNumber;
    this.playing = false;

    this.soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    this.soundLength = 64; // defaults to 64 periods
    this.lengthCheck = false;

    this.clockLength = 0;

    this.audioContext = audioContext;
};

Channel4.prototype.play = function() {
    if (this.playing) return;
    this.playing = true;
    this.apu.setSoundFlag(this.channelNumber, 1);
    this.clockLength = 0;
};
Channel4.prototype.stop = function() {
    this.playing = false;
    this.apu.setSoundFlag(this.channelNumber, 0);
};
Channel4.prototype.update = function(clockElapsed) {
    if (this.lengthCheck) {
        this.clockLength  += clockElapsed;
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
Channel4.prototype.setLength = function(value) {
    this.soundLength = 64 - (value & 0x3F);
};
GameboyJS.Channel4 = Channel4;
}(GameboyJS || (GameboyJS = {})));
