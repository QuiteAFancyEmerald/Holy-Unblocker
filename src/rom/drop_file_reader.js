var GameboyJS;
(function (GameboyJS) {
"use strict";

// A RomDropFileReader is able to load a drag and dropped file
var RomDropFileReader = function(el) {
    this.dropElement = el;
    if (!this.dropElement) {
        throw 'The RomDropFileReader needs a drop zone.';
    }

    var self = this;
    this.dropElement.addEventListener('dragenter', function(e) {
        e.preventDefault();
        if (e.target !== self.dropElement) {
          return;
        }
        self.dropElement.classList.add('drag-active');
    });
    this.dropElement.addEventListener('dragleave', function(e) {
        e.preventDefault();
        if (e.target !== self.dropElement) {
          return;
        }
        self.dropElement.classList.remove('drag-active');
    });
    this.dropElement.addEventListener('dragover', function(e) {
        e.preventDefault();
        self.dropElement.classList.add('drag-active');
    });
    this.dropElement.addEventListener('drop', function (e) {
        self.dropElement.classList.remove('drag-active');
        if (e.dataTransfer.files.length == 0) {
            return;
        }
        e.preventDefault();
        self.loadFromFile(e.dataTransfer.files[0]);
    });
};

// The callback argument will be called when a file is successfully
// read, with the data as argument (Uint8Array)
RomDropFileReader.prototype.setCallback = function(onLoadCallback) {
    this.callback = onLoadCallback;
};

// The file loading logic is the same as the regular file reader
RomDropFileReader.prototype.loadFromFile = function(file) {
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

GameboyJS.RomDropFileReader = RomDropFileReader;
}(GameboyJS || (GameboyJS = {})));
