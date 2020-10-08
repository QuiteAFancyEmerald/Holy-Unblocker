var GameboyJS;
(function (GameboyJS) {
"use strict";

// A RomAjaxReader is able to load a file through an AJAX request
var RomAjaxReader = function() {

};

// The callback argument will be called when a file is successfully
// read, with the data as argument (Uint8Array)
RomAjaxReader.prototype.setCallback = function(onLoadCallback) {
    this.callback = onLoadCallback;
};

// This function should be called by application code
// and will trigger the AJAX call itself and push data to the ROM object
RomAjaxReader.prototype.loadFromUrl = function(url) {
    if (!url) {
        throw 'No url has been set in order to load a ROM file.';
    }
    var cb = this.callback;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        var rom = new Uint8Array(xhr.response);
        cb && cb(rom);
    };

    xhr.send();
};

GameboyJS.RomAjaxReader = RomAjaxReader;
}(GameboyJS || (GameboyJS = {})));
