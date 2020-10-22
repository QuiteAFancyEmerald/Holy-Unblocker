var GameboyJS;
(function (GameboyJS) {
"use strict";

// CPU class
var CPU = function(gameboy) {
    this.gameboy = gameboy;

    this.r = {A:0, F: 0, B:0, C:0, D:0, E:0, H:0, L:0, pc:0, sp:0};
    this.IME = true;
    this.clock = {c: 0, serial: 0};
    this.isHalted = false;
    this.isPaused = false;
    this.usingBootRom = false;

    this.createDevices();
};

CPU.INTERRUPTS = {
    VBLANK: 0,
    LCDC:   1,
    TIMER:  2,
    SERIAL: 3,
    HILO:   4
};
CPU.interruptRoutines = {
    0: function(p){GameboyJS.cpuOps.RSTn(p, 0x40);},
    1: function(p){GameboyJS.cpuOps.RSTn(p, 0x48);},
    2: function(p){GameboyJS.cpuOps.RSTn(p, 0x50);},
    3: function(p){GameboyJS.cpuOps.RSTn(p, 0x58);},
    4: function(p){GameboyJS.cpuOps.RSTn(p, 0x60);}
};

CPU.prototype.createDevices = function() {
    this.memory = new GameboyJS.Memory(this);
    this.timer = new GameboyJS.Timer(this, this.memory);
    this.apu = new GameboyJS.APU(this.memory);

    this.SERIAL_INTERNAL_INSTR = 512; // instr to wait per bit if internal clock
    this.enableSerial = 0;
    this.serialHandler = GameboyJS.ConsoleSerial;
};

CPU.prototype.reset = function() {
    this.memory.reset();

    this.r.sp = 0xFFFE;
};

CPU.prototype.loadRom = function(data) {
    this.memory.setRomData(data);
};

CPU.prototype.getRamSize = function() {
    var size = 0;
    switch (this.memory.rb(0x149)) {
        case 1:
            size = 2048;
            break;
        case 2:
            size = 2048 * 4;
            break;
        case 3:
            size = 2048 * 16;
            break;
    }

    return size;
};

CPU.prototype.getGameName = function() {
    var name = '';
    for (var i = 0x134; i < 0x143; i++) {
        var char = this.memory.rb(i) || 32;
        name += String.fromCharCode(char);
    }

    return name;
};

// Start the execution of the emulator
CPU.prototype.run = function() {
    if (this.usingBootRom) {
        this.r.pc = 0x0000;
    } else {
        this.r.pc = 0x0100;
    }
    this.frame();
};

CPU.prototype.stop = function() {
    clearTimeout(this.nextFrameTimer);
};

// Fetch-and-execute loop
// Will execute instructions for the duration of a frame
//
// The screen unit will notify the vblank period which
// is considered the end of a frame
//
// The function is called on a regular basis with a timeout
CPU.prototype.frame = function() {
    if (!this.isPaused) {
        this.nextFrameTimer = setTimeout(this.frame.bind(this), 1000 / GameboyJS.Screen.physics.FREQUENCY);
    }

    try {
        var vblank = false;
        while (!vblank) {
            var oldInstrCount = this.clock.c;
            if (!this.isHalted) {
                var opcode = this.fetchOpcode();
                GameboyJS.opcodeMap[opcode](this);
                this.r.F &= 0xF0; // tmp fix

                if (this.enableSerial) {
                    var instr = this.clock.c - oldInstrCount;
                    this.clock.serial += instr;
                    if (this.clock.serial >= 8 * this.SERIAL_INTERNAL_INSTR) {
                        this.endSerialTransfer();
                    }
                }
            } else {
                this.clock.c += 4;
            }

            var elapsed = this.clock.c - oldInstrCount;
            vblank = this.gpu.update(elapsed);
            this.timer.update(elapsed);
            this.input.update();
            this.apu.update(elapsed);
            this.checkInterrupt();
        }
        this.clock.c = 0;
    } catch (e) {
        this.gameboy.handleException(e);
    }
};

CPU.prototype.fetchOpcode = function() {
    var opcode = this.memory.rb(this.r.pc++);
    if (opcode === undefined) {console.log(opcode + ' at ' + (this.r.pc-1).toString(16));this.stop();return;}
    if (!GameboyJS.opcodeMap[opcode]) {
        console.error('Unknown opcode '+opcode.toString(16)+' at address '+(this.r.pc-1).toString(16)+', stopping execution...');
        this.stop();
        return null;
    }

    return opcode;
};

// read register
CPU.prototype.rr = function(register) {
    return this.r[register];
};

// write register
CPU.prototype.wr = function(register, value) {
    this.r[register] = value;
};

CPU.prototype.halt = function() {
    this.isHalted = true;
};
CPU.prototype.unhalt = function() {
    this.isHalted = false;
};
CPU.prototype.pause = function() {
    this.isPaused = true;
};
CPU.prototype.unpause = function() {
    if (this.isPaused) {
        this.isPaused = false;
        this.frame();
    }
};

// Look for interrupt flags
CPU.prototype.checkInterrupt = function() {
    if (!this.IME) {
        return;
    }
    for (var i = 0; i < 5; i++) {
        var IFval = this.memory.rb(0xFF0F);
        if (GameboyJS.Util.readBit(IFval, i) && this.isInterruptEnable(i)) {
            IFval &= (0xFF - (1<<i));
            this.memory.wb(0xFF0F, IFval);
            this.disableInterrupts();
            this.clock.c += 4; // 20 clocks to serve interrupt, with 16 for RSTn
            CPU.interruptRoutines[i](this);
            break;
        }
    }
};

// Set an interrupt flag
CPU.prototype.requestInterrupt = function(type) {
    var IFval = this.memory.rb(0xFF0F);
    IFval |= (1 << type)
    this.memory.wb(0xFF0F, IFval) ;
    this.unhalt();
};

CPU.prototype.isInterruptEnable = function(type) {
    return GameboyJS.Util.readBit(this.memory.rb(0xFFFF), type) != 0;
};

CPU.prototype.enableInterrupts = function() {
    this.IME = true;
};
CPU.prototype.disableInterrupts = function() {
    this.IME = false;
};

CPU.prototype.enableSerialTransfer = function() {
    this.enableSerial = 1;
    this.clock.serial = 0;
};

CPU.prototype.endSerialTransfer = function() {
    this.enableSerial = 0;
    var data = this.memory.rb(0xFF01);
    this.memory.wb(0xFF02, 0);
    this.serialHandler.out(data);
    this.memory.wb(0xFF01, this.serialHandler.in());
};

CPU.prototype.resetDivTimer = function() {
    this.timer.resetDiv();
};
GameboyJS.CPU = CPU;
}(GameboyJS || (GameboyJS = {})));
