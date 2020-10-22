var GameboyJS;
(function (GameboyJS) {
"use strict";

var defaultOptions = {
    pad: {class: GameboyJS.Keyboard, mapping: null},
    zoom: 1,
    romReaders: [],
    statusContainerId: 'status',
    gameNameContainerId: 'game-name',
    errorContainerId: 'error'
};

// Gameboy class
//
// This object is the entry point of the application
// Will delegate user actions to the emulated devices
// and provide information where needed
var Gameboy = function(canvas, options) {
    options = options || {};
    this.options = GameboyJS.Util.extend({}, defaultOptions, options);

    var cpu = new GameboyJS.CPU(this);
    var screen = new GameboyJS.Screen(canvas, this.options.zoom);
    var gpu = new GameboyJS.GPU(screen, cpu);
    cpu.gpu = gpu;

    var pad = new this.options.pad.class(this.options.pad.mapping);
    var input = new GameboyJS.Input(cpu, pad);
    cpu.input = input;

    this.cpu = cpu;
    this.screen = screen;
    this.input = input;
    this.pad = pad;

    this.createRom(this.options.romReaders);

    this.statusContainer   = document.getElementById(this.options.statusContainerId) || document.createElement('div');
    this.gameNameContainer = document.getElementById(this.options.gameNameContainerId) || document.createElement('div');
    this.errorContainer    = document.getElementById(this.options.errorContainerId) || document.createElement('div');
};

// Create the ROM object and bind one or more readers
Gameboy.prototype.createRom = function (readers) {
    var rom = new GameboyJS.Rom(this);
    if (readers.length == 0) {
        // add the default rom reader
        var romReader = new GameboyJS.RomFileReader();
        rom.addReader(romReader);
    } else {
        for (var i in readers) {
            if (readers.hasOwnProperty(i)) {
                rom.addReader(readers[i]);
            }
        }
    }
};

Gameboy.prototype.startRom = function(rom) {
    this.errorContainer.classList.add('hide');
    this.cpu.reset();
    try {
        this.cpu.loadRom(rom.data);
        this.setStatus('Game Running :');
        this.setGameName(this.cpu.getGameName());
        this.cpu.run();
    } catch (e) {
        this.handleException(e);
    }
};

Gameboy.prototype.pause = function(value) {
    if (value) {
        this.setStatus('Game Paused :');
        this.cpu.pause();
    } else {
        this.setStatus('Game Running :');
        this.cpu.unpause();
    }
};

Gameboy.prototype.error = function(message) {
    this.setStatus('Error during execution');
    this.setError('An error occurred during execution:' + message);
    this.cpu.stop();
};

Gameboy.prototype.setStatus = function(status) {
    this.statusContainer.innerHTML = status;
};
// Display an error message
Gameboy.prototype.setError = function(message) {
    this.errorContainer.classList.remove('hide');
    this.errorContainer.innerHTML = message;
};
// Display the name of the game running
Gameboy.prototype.setGameName = function(name) {
    this.gameNameContainer.innerHTML = name;
};
Gameboy.prototype.setSoundEnabled = function(value) {
    if (value) {
        this.cpu.apu.connect();
    } else {
        this.cpu.apu.disconnect();
    }
};
Gameboy.prototype.setScreenZoom = function(value) {
    this.screen.setPixelSize(value);
};
Gameboy.prototype.handleException = function(e) {
    if (e instanceof GameboyJS.UnimplementedException) {
        if (e.fatal) {
            this.error('This cartridge is not supported ('+ e.message +')');
        } else {
            console.error(e.message);
        }
    } else {
        throw e;
    }
};
GameboyJS.Gameboy = Gameboy;
}(GameboyJS || (GameboyJS = {})));
