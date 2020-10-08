var GameboyJS;
(function (GameboyJS) {
"use strict";


var Rom = function(gameboy, romReader) {
    this.gameboy = gameboy;
    if (romReader) {
        this.addReader(romReader);
    }
};

Rom.prototype.addReader = function(romReader) {
    var self = this;
    romReader.setCallback(function(data) {
        if (!validate(data)) {
            self.gameboy.error('The file is not a valid GameBoy ROM.');
            return;
        }
        self.data = data;
        self.gameboy.startRom(self);
    });
};

// Validate the checksum of the cartridge header
function validate(data) {
    var hash = 0;
    for (var i = 0x134; i <= 0x14C; i++) {
        hash = hash - data[i] - 1;
    }
    return (hash & 0xFF) == data[0x14D];
};

GameboyJS.Rom = Rom;
}(GameboyJS || (GameboyJS = {})));
