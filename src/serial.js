var GameboyJS;
(function (GameboyJS) {
"use strict";

// Handlers for the Serial port of the Gameboy

// The ConsoleSerial is an output-only serial port
// designed for debug purposes as some test roms output data on the serial port
//
// Will regularly output the received byte (converted to string) in the console logs
// This handler always push the value 0xFF as an input
var ConsoleSerial = {
    current: '',
    timeout: null,
    out: function(data) {
        ConsoleSerial.current += String.fromCharCode(data);
        if (data == 10) {
            ConsoleSerial.print();
        } else {
            clearTimeout(ConsoleSerial.timeout);
            ConsoleSerial.timeout = setTimeout(ConsoleSerial.print, 500);
        }
    },
    in: function() {
        return 0xFF;
    },
    print: function() {
        clearTimeout(ConsoleSerial.timeout);
        console.log('serial: '+ConsoleSerial.current);
        ConsoleSerial.current = '';
    }
};
GameboyJS.ConsoleSerial = ConsoleSerial;

// A DummySerial outputs nothing and always inputs 0xFF
var DummySerial = {
    out: function() {},
    in: function() {
        return 0xFF;
    }
};
GameboyJS.DummySerial = DummySerial;
}(GameboyJS || (GameboyJS = {})));
