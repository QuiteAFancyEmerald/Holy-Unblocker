var GameboyJS;
(function (GameboyJS) {
"use strict";

// Object for mapping the cartridge RAM
var ExtRam = function() {
    this.extRam = null;
    this.ramSize = 0;
    this.ramBank = 0;
};

ExtRam.prototype.loadRam = function(game, size) {
    this.gameName = game;

    this.ramSize = size;
    this.ramBanksize = this.ramSize >= 0x2000 ? 8192 : 2048;

    var key = this.getStorageKey();
    var data = localStorage.getItem(key);
    if (data == null) {
        this.extRam = Array.apply(null, new Array(this.ramSize)).map(function(){return 0;});
    } else {
        this.extRam = JSON.parse(data);
        if (this.extRam.length != size) {
            console.error('Found RAM data but not matching expected size.');
        }
    }
};

ExtRam.prototype.setRamBank = function(bank) {
    this.ramBank = bank;
};

ExtRam.prototype.manageWrite = function(offset, value) {
    this.extRam[this.ramBank * 8192 + offset] = value;
};

ExtRam.prototype.manageRead = function(offset) {
    return this.extRam[this.ramBank * 8192 + offset];
};

ExtRam.prototype.getStorageKey = function() {
    return this.gameName + '_EXTRAM';;
};
// Actually save the RAM in the physical storage (localStorage)
ExtRam.prototype.saveRamData = function() {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(this.extRam));
};
GameboyJS.ExtRam = ExtRam;
}(GameboyJS || (GameboyJS = {})));
