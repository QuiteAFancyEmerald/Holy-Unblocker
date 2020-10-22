var GameboyJS;
(function (GameboyJS) {
"use strict";

// A RomFileReader is able to load a local file from an input element
//
// Expects to be provided a file input element,
// or will try to find one with the "file" DOM ID
var RomFileReader = function(el) {
    this.domElement = el || document.getElementById('file');
    if (!this.domElement) {
        throw 'The RomFileReader needs a valid input element.';
    }

    var self = this;
    this.domElement.addEventListener('change', function(e){
        self.loadFromFile(e.target.files[0]);
    });
};

// The callback argument will be called when a file is successfully
// read, with the data as argument (Uint8Array)
RomFileReader.prototype.setCallback = function(onLoadCallback) {
    this.callback = onLoadCallback;
};

// Automatically called when the DOM input is provided with a file
RomFileReader.prototype.loadFromFile = function(file) {
    if (file === undefined) {
        return;
    }
    var fr = new FileReader();
    var cb = this.callback;

    fr.onload = function() {
        cb && cb(new Uint8Array(fr.result));
    };
    fr.onerror = function(e) {
        console.log('Error reading the file', e.target.error.code)
    };
    fr.readAsArrayBuffer(file);
};

GameboyJS.RomFileReader = RomFileReader;
}(GameboyJS || (GameboyJS = {})));
