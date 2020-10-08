function loadboot(p) {
    var boot = [
        0x31, 0xFE, 0xFF, 0xAF, 0x21, 0xFF, 0x9F, 0x32, 0xCB, 0x7C, 0x20, 0xFB, 0x21, 0x26, 0xFF, 0x0E,
        0x11, 0x3E, 0x80, 0x32, 0xE2, 0x0C, 0x3E, 0xF3, 0xE2, 0x32, 0x3E, 0x77, 0x77, 0x3E, 0xFC, 0xE0,
        0x47, 0x11, 0x04, 0x01, 0x21, 0x10, 0x80, 0x1A, 0xCD, 0x95, 0x00, 0xCD, 0x96, 0x00, 0x13, 0x7B,
        0xFE, 0x34, 0x20, 0xF3, 0x11, 0xD8, 0x00, 0x06, 0x08, 0x1A, 0x13, 0x22, 0x23, 0x05, 0x20, 0xF9,
        0x3E, 0x19, 0xEA, 0x10, 0x99, 0x21, 0x2F, 0x99, 0x0E, 0x0C, 0x3D, 0x28, 0x08, 0x32, 0x0D, 0x20,
        0xF9, 0x2E, 0x0F, 0x18, 0xF3, 0x67, 0x3E, 0x64, 0x57, 0xE0, 0x42, 0x3E, 0x91, 0xE0, 0x40, 0x04,
        0x1E, 0x02, 0x0E, 0x0C, 0xF0, 0x44, 0xFE, 0x90, 0x20, 0xFA, 0x0D, 0x20, 0xF7, 0x1D, 0x20, 0xF2,
        0x0E, 0x13, 0x24, 0x7C, 0x1E, 0x83, 0xFE, 0x62, 0x28, 0x06, 0x1E, 0xC1, 0xFE, 0x64, 0x20, 0x06,
        0x7B, 0xE2, 0x0C, 0x3E, 0x87, 0xE2, 0xF0, 0x42, 0x90, 0xE0, 0x42, 0x15, 0x20, 0xD2, 0x05, 0x20,
        0x4F, 0x16, 0x20, 0x18, 0xCB, 0x4F, 0x06, 0x04, 0xC5, 0xCB, 0x11, 0x17, 0xC1, 0xCB, 0x11, 0x17,
        0x05, 0x20, 0xF5, 0x22, 0x23, 0x22, 0x23, 0xC9, 0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B,
        0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D, 0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E,
        0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99, 0xBB, 0xBB, 0x67, 0x63, 0x6E, 0x0E, 0xEC, 0xCC,
        0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E, 0x3C, 0x42, 0xB9, 0xA5, 0xB9, 0xA5, 0x42, 0x3C,
        0x21, 0x04, 0x01, 0x11, 0xA8, 0x00, 0x1A, 0x13, 0xBE, 0x00, 0x00, 0x23, 0x7D, 0xFE, 0x34, 0x20,
        0xF5, 0x06, 0x19, 0x78, 0x86, 0x23, 0x05, 0x20, 0xFB, 0x86, 0x00, 0x00, 0x3E, 0x01, 0xE0, 0x50
    ];

    for (var i in boot) {
        p.memory[i] = boot[i];
    }
    p.r.pc = 0;
    p.usingBootRom = true;
}

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

var GameboyJS;
(function (GameboyJS) {
"use strict";

var Debug = {};
// Output a range of 16 memory addresses
Debug.view_memory = function(addr, gameboy) {
    var memory = gameboy.cpu.memory;
    addr = addr & 0xFFF0;
    var pad = '00';
    var str = addr.toString(16) + ':';
    for (var i = addr; i < addr + 0x10; i++) {
        if ((i & 0x1) == 0) {
            str += ' ';
        }
        var val = memory[i] || 0;

        val = val.toString(16);
        str += pad.substring(val.length) + val;
    }

    return str;
};

Debug.view_tile = function(gameboy, index, dataStart) {
    var memory = gameboy.cpu.memory;
    var screen = gameboy.screen;
    var LCDC = screen.deviceram(screen.LCDC);
    if (typeof dataStart === 'undefined') {
        dataStart = 0x8000;
        if (!GameboyJS.Util.readBit(LCDC, 4)) {
            dataStart = 0x8800;
            index = GameboyJS.cpuOps._getSignedValue(index) + 128;
        }
    }

    var tileData = screen.readTileData(index, dataStart);

    var pixelData = new Array(8 * 8)
    for (var line = 0; line < 8; line++) {
        var b1 = tileData.shift();
        var b2 = tileData.shift();

        for (var pixel = 0; pixel < 8; pixel++) {
            var mask = (1 << (7-pixel));
            var colorValue = ((b1 & mask) >> (7-pixel)) + ((b2 & mask) >> (7-pixel))*2;
            pixelData[line * 8 + pixel] = colorValue;
        }
    }

    var i = 0;
    while (pixelData.length) {
        console.log(i++ + ' ' + pixelData.splice(0, 8).join(''));
    }
};

Debug.list_visible_sprites = function(gameboy) {
    var memory = gameboy.cpu.memory;
    var indexes = new Array();
    for (var i = 0xFE00; i < 0xFE9F; i += 4) {
        var x = memory.oamram(i + 1);
        var y = memory.oamram(i);
        var tileIndex = memory.oamram(i + 2);
        if (x == 0 || x >= 168) {
            continue;
        }
        indexes.push({oamIndex:i, x:x, y:y, tileIndex:tileIndex});
    }

    return indexes;
};
GameboyJS.Debug = Debug;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";
var Screen;
var GPU = function(screen, cpu) {
    this.cpu = cpu;
    this.screen = screen;

    this.LCDC= 0xFF40;
    this.STAT= 0xFF41;
    this.SCY = 0xFF42;
    this.SCX = 0xFF43;
    this.LY  = 0xFF44;
    this.LYC = 0xFF45;
    this.BGP = 0xFF47;
    this.OBP0= 0xFF48;
    this.OBP1= 0xFF49;
    this.WY  = 0xFF4A;
    this.WX  = 0xFF4B;

    this.vram = cpu.memory.vram.bind(cpu.memory);

    this.OAM_START = 0xFE00;
    this.OAM_END   = 0xFE9F;
    this.deviceram = cpu.memory.deviceram.bind(cpu.memory);
    this.oamram = cpu.memory.oamram.bind(cpu.memory);
    this.VBLANK_TIME = 70224;
    this.clock = 0;
    this.mode = 2;
    this.line = 0;

    Screen = GameboyJS.Screen;
    this.buffer = new Array(Screen.physics.WIDTH * Screen.physics.HEIGHT);
    this.tileBuffer = new Array(8);
    this.bgTileCache = {};
};

GPU.tilemap = {
    HEIGHT: 32,
    WIDTH: 32,
    START_0: 0x9800,
    START_1: 0x9C00,
    LENGTH: 0x0400 // 1024 bytes = 32*32
};

GPU.prototype.update = function(clockElapsed) {
    this.clock += clockElapsed;
    var vblank = false;

    switch (this.mode) {
        case 0: // HBLANK
            if (this.clock >= 204) {
                this.clock -= 204;
                this.line++;
                this.updateLY();
                if (this.line == 144) {
                    this.setMode(1);
                    vblank = true;
                    this.cpu.requestInterrupt(GameboyJS.CPU.INTERRUPTS.VBLANK);
                    this.drawFrame();
                } else {
                    this.setMode(2);
                }
            }
            break;
        case 1: // VBLANK
            if (this.clock >= 456) {
                this.clock -= 456;
                this.line++;
                if (this.line > 153) {
                    this.line = 0;
                    this.setMode(2);
                }
                this.updateLY();
            }

            break;
        case 2: // SCANLINE OAM
            if (this.clock >= 80) {
                this.clock -= 80;
                this.setMode(3);
            }
            break;
        case 3: // SCANLINE VRAM
            if (this.clock >= 172) {
                this.clock -= 172;
                this.drawScanLine(this.line);
                this.setMode(0);
            }
            break;
    }

    return vblank;
};

GPU.prototype.updateLY = function() {
    this.deviceram(this.LY, this.line);
    var STAT = this.deviceram(this.STAT);
    if (this.deviceram(this.LY) == this.deviceram(this.LYC)) {
        this.deviceram(this.STAT, STAT | (1 << 2));
        if (STAT & (1 << 6)) {
            this.cpu.requestInterrupt(GameboyJS.CPU.INTERRUPTS.LCDC);
        }
    } else {
        this.deviceram(this.STAT, STAT & (0xFF - (1 << 2)));
    }
};

GPU.prototype.setMode = function(mode) {
    this.mode = mode;
    var newSTAT = this.deviceram(this.STAT);
    newSTAT &= 0xFC;
    newSTAT |= mode;
    this.deviceram(this.STAT, newSTAT);

    if (mode < 3) {
        if (newSTAT & (1 << (3+mode))) {
            this.cpu.requestInterrupt(GameboyJS.CPU.INTERRUPTS.LCDC);
        }
    }
};

// Push one scanline into the main buffer
GPU.prototype.drawScanLine = function(line) {
    var LCDC = this.deviceram(this.LCDC);
    var enable = GameboyJS.Util.readBit(LCDC, 7);
    if (enable) {
        var lineBuffer = new Array(Screen.physics.WIDTH);
        this.drawBackground(LCDC, line, lineBuffer);
        this.drawSprites(LCDC, line, lineBuffer);
        // TODO draw a line for the window here too
    }
};

GPU.prototype.drawFrame = function() {
    var LCDC = this.deviceram(this.LCDC);
    var enable = GameboyJS.Util.readBit(LCDC, 7);
    if (enable) {
        //this.drawSprites(LCDC);
        this.drawWindow(LCDC);
    }
    this.bgTileCache = {};
    this.screen.render(this.buffer);
};

GPU.prototype.drawBackground = function(LCDC, line, lineBuffer) {
    if (!GameboyJS.Util.readBit(LCDC, 0)) {
        return;
    }

    var mapStart = GameboyJS.Util.readBit(LCDC, 3) ? GPU.tilemap.START_1 : GPU.tilemap.START_0;

    var dataStart, signedIndex = false;
    if (GameboyJS.Util.readBit(LCDC, 4)) {
        dataStart = 0x8000;
    } else {
        dataStart = 0x8800;
        signedIndex = true;
    }

    var bgx = this.deviceram(this.SCX);
    var bgy = this.deviceram(this.SCY);
    var tileLine = ((line + bgy) & 7);

    // browse BG tilemap for the line to render
    var tileRow = ((((bgy + line) / 8) | 0) & 0x1F);
    var firstTile = ((bgx / 8) | 0) + 32 * tileRow;
    var lastTile = firstTile + Screen.physics.WIDTH / 8 + 1;
    if ((lastTile & 0x1F) < (firstTile & 0x1F)) {
        lastTile -= 32;
    }
    var x = (firstTile & 0x1F) * 8 - bgx; // x position of the first tile's leftmost pixel
    for (var i = firstTile; i != lastTile; i++, (i & 0x1F) == 0 ? i-=32 : null) {
        var tileIndex = this.vram(i + mapStart);

        if (signedIndex) {
            tileIndex = GameboyJS.Util.getSignedValue(tileIndex) + 128;
        }

        // try to retrieve the tile data from the cache, or use readTileData() to read from ram
        // TODO find a better cache system now that the BG is rendered line by line
        var tileData = this.bgTileCache[tileIndex] || (this.bgTileCache[tileIndex] = this.readTileData(tileIndex, dataStart));

        this.drawTileLine(tileData, tileLine);
        this.copyBGTileLine(lineBuffer, this.tileBuffer, x);
        x += 8;
    }

    this.copyLineToBuffer(lineBuffer, line);
};

// Copy a tile line from a tileBuffer to a line buffer, at a given x position
GPU.prototype.copyBGTileLine = function(lineBuffer, tileBuffer, x) {
    // copy tile line to buffer
    for (var k = 0; k < 8; k++, x++) {
        if (x < 0 || x >= Screen.physics.WIDTH) continue;
        lineBuffer[x] = tileBuffer[k];
    }
};

// Copy a scanline into the main buffer
GPU.prototype.copyLineToBuffer = function(lineBuffer, line) {
    var bgPalette = GPU.getPalette(this.deviceram(this.BGP));

    for (var x = 0; x < Screen.physics.WIDTH; x++) {
        var color = lineBuffer[x];
        this.drawPixel(x, line, bgPalette[color]);
    }
};

// Write a line of a tile (8 pixels) into a buffer array
GPU.prototype.drawTileLine = function(tileData, line, xflip, yflip) {
    xflip = xflip | 0;
    yflip = yflip | 0;
    var l = yflip ? 7 - line : line;
    var byteIndex = l * 2;
    var b1 = tileData[byteIndex++];
    var b2 = tileData[byteIndex++];

    var offset = 8;
    for (var pixel = 0; pixel < 8; pixel++) {
        offset--;
        var mask = (1 << offset);
        var colorValue = ((b1 & mask) >> offset) + ((b2 & mask) >> offset)*2;
        var p = xflip ? offset : pixel;
        this.tileBuffer[p] = colorValue;
    }
};

GPU.prototype.drawSprites = function(LCDC, line, lineBuffer) {
    if (!GameboyJS.Util.readBit(LCDC, 1)) {
        return;
    }
    var spriteHeight = GameboyJS.Util.readBit(LCDC, 2) ? 16 : 8;

    var sprites = new Array();
    for (var i = this.OAM_START; i < this.OAM_END && sprites.length < 10; i += 4) {
        var y = this.oamram(i);
        var x = this.oamram(i+1);
        var index = this.oamram(i+2);
        var flags = this.oamram(i+3);

        if (y - 16 > line || y - 16 < line - spriteHeight) {
            continue;
        }
        sprites.push({x:x, y:y, index:index, flags:flags})
    }

    if (sprites.length == 0) return;

    // cache object to store read tiles from this frame
    var cacheTile = {};
    var spriteLineBuffer = new Array(Screen.physics.WIDTH);

    for (var i = 0; i < sprites.length; i++) {
        var sprite = sprites[i];
        var tileLine = line - sprite.y + 16;
        var paletteNumber = GameboyJS.Util.readBit(flags, 4);
        var xflip = GameboyJS.Util.readBit(sprite.flags, 5);
        var yflip = GameboyJS.Util.readBit(sprite.flags, 6);
        var tileData = cacheTile[sprite.index] || (cacheTile[sprite.index] = this.readTileData(sprite.index, 0x8000, spriteHeight * 2));
        this.drawTileLine(tileData, tileLine, xflip, yflip);
        this.copySpriteTileLine(spriteLineBuffer, this.tileBuffer, sprite.x - 8, paletteNumber);
    }

    this.copySpriteLineToBuffer(spriteLineBuffer, line);
};

// Copy a tile line from a tileBuffer to a line buffer, at a given x position
GPU.prototype.copySpriteTileLine = function(lineBuffer, tileBuffer, x, palette) {
    // copy tile line to buffer
    for (var k = 0; k < 8; k++, x++) {
        if (x < 0 || x >= Screen.physics.WIDTH || tileBuffer[k] == 0) continue;
        lineBuffer[x] = {color:tileBuffer[k], palette: palette};
    }
};

// Copy a sprite scanline into the main buffer
GPU.prototype.copySpriteLineToBuffer = function(spriteLineBuffer, line) {
    var spritePalettes = {};
    spritePalettes[0] = GPU.getPalette(this.deviceram(this.OBP0));
    spritePalettes[1] = GPU.getPalette(this.deviceram(this.OBP1));

    for (var x = 0; x < Screen.physics.WIDTH; x++) {
        if (!spriteLineBuffer[x]) continue;
        var color = spriteLineBuffer[x].color;
        if (color === 0) continue;
        var paletteNumber = spriteLineBuffer[x].palette;
        this.drawPixel(x, line, spritePalettes[paletteNumber][color]);
    }
};

GPU.prototype.drawTile = function(tileData, x, y, buffer, bufferWidth, xflip, yflip, spriteMode) {
    xflip = xflip | 0;
    yflip = yflip | 0;
    spriteMode = spriteMode | 0;
    var byteIndex = 0;
    for (var line = 0; line < 8; line++) {
        var l = yflip ? 7 - line : line;
        var b1 = tileData[byteIndex++];
        var b2 = tileData[byteIndex++];

        for (var pixel = 0; pixel < 8; pixel++) {
            var mask = (1 << (7-pixel));
            var colorValue = ((b1 & mask) >> (7-pixel)) + ((b2 & mask) >> (7-pixel))*2;
            if (spriteMode && colorValue == 0) continue;
            var p = xflip ? 7 - pixel : pixel;
            var bufferIndex = (x + p) + (y + l) * bufferWidth;
            buffer[bufferIndex] = colorValue;
        }
    }
};

// get an array of tile bytes data (16 entries for 8*8px)
GPU.prototype.readTileData = function(tileIndex, dataStart, tileSize) {
    tileSize = tileSize || 0x10; // 16 bytes / tile by default (8*8 px)
    var tileData = new Array();

    var tileAddressStart = dataStart + (tileIndex * 0x10);
    for (var i = tileAddressStart; i < tileAddressStart + tileSize; i++) {
        tileData.push(this.vram(i));
    }

    return tileData;
};

GPU.prototype.drawWindow = function(LCDC) {
    if (!GameboyJS.Util.readBit(LCDC, 5)) {
        return;
    }

    var buffer = new Array(256*256);
    var mapStart = GameboyJS.Util.readBit(LCDC, 6) ? GPU.tilemap.START_1 : GPU.tilemap.START_0;

    var dataStart, signedIndex = false;
    if (GameboyJS.Util.readBit(LCDC, 4)) {
        dataStart = 0x8000;
    } else {
        dataStart = 0x8800;
        signedIndex = true;
    }

    // browse Window tilemap
    for (var i = 0; i < GPU.tilemap.LENGTH; i++) {
        var tileIndex = this.vram(i + mapStart);

        if (signedIndex) {
            tileIndex = GameboyJS.Util.getSignedValue(tileIndex) + 128;
        }

        var tileData = this.readTileData(tileIndex, dataStart);
        var x = i % GPU.tilemap.WIDTH;
        var y = (i / GPU.tilemap.WIDTH) | 0;
        this.drawTile(tileData, x * 8, y * 8, buffer, 256);
    }

    var wx = this.deviceram(this.WX) - 7;
    var wy = this.deviceram(this.WY);
    for (var x = Math.max(0, -wx); x < Math.min(Screen.physics.WIDTH, Screen.physics.WIDTH - wx); x++) {
        for (var y = Math.max(0, -wy); y < Math.min(Screen.physics.HEIGHT, Screen.physics.HEIGHT - wy); y++) {
            var color = buffer[(x & 255) + (y & 255) * 256];
            this.drawPixel(x + wx, y + wy, color);
        }
    }
};

GPU.prototype.drawPixel = function(x, y, color) {
    this.buffer[y * 160 + x] = color;
};

GPU.prototype.getPixel = function(x, y) {
    return this.buffer[y * 160 + x];
};

// Get the palette mapping from a given palette byte as stored in memory
// A palette will map a tile color to a final palette color index
// used with Screen.colors to get a shade of grey
GPU.getPalette = function(paletteByte) {
    var palette = [];
    for (var i = 0; i < 8; i += 2) {
        var shade = (paletteByte & (3 << i)) >> i;
        palette.push(shade);
    }
    return palette;
};

GameboyJS.GPU = GPU;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";

// Screen device
var Screen = function(canvas, pixelSize) {
    this.context = canvas.getContext('2d');
    this.canvas = canvas;
    this.pixelSize = pixelSize || 1;
    this.initImageData();
};

Screen.colors = [
    0xFF,
    0xAA,
    0x55,
    0x00
];

Screen.physics = {
    WIDTH    : 160,
    HEIGHT   : 144,
    FREQUENCY: 60
};

Screen.prototype.setPixelSize = function(pixelSize) {
    this.pixelSize = pixelSize;
    this.initImageData();
};

Screen.prototype.initImageData = function() {
    this.canvas.width = Screen.physics.WIDTH * this.pixelSize;
    this.canvas.height = Screen.physics.HEIGHT * this.pixelSize;
    this.imageData = this.context.createImageData(this.canvas.width, this.canvas.height);
};

Screen.prototype.clearScreen = function() {
    this.context.fillStyle = '#FFF';
    this.context.fillRect(0, 0, Screen.physics.WIDTH * this.pixelSize, Screen.physics.HEIGHT * this.pixelSize);
};

Screen.prototype.fillImageData = function(buffer) {
    for (var y = 0; y < Screen.physics.HEIGHT; y++) {
        for (var py = 0; py < this.pixelSize; py++) {
            var _y = y * this.pixelSize + py;
            for (var x = 0; x < Screen.physics.WIDTH; x++) {
                for (var px = 0; px < this.pixelSize; px++) {
                    var offset = _y * this.canvas.width + (x * this.pixelSize + px);
                    var v = Screen.colors[buffer[y * Screen.physics.WIDTH + x]];
                    this.imageData.data[offset * 4] = v;
                    this.imageData.data[offset * 4 + 1] = v;
                    this.imageData.data[offset * 4 + 2] = v;
                    this.imageData.data[offset * 4 + 3] = 255;
                }
            }
        }
    }
};

Screen.prototype.render = function(buffer) {
    this.fillImageData(buffer);
    this.context.putImageData(this.imageData, 0, 0);
};

GameboyJS.Screen = Screen;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";

// This exception should be thrown whenever a critical feature that
// has not been implemented is requested
function UnimplementedException(message, fatal) {
    this.message = message;
    this.name = UnimplementedException;
    if (fatal === undefined) {
        fatal = true;
    }
    this.fatal = fatal;
}
GameboyJS.UnimplementedException = UnimplementedException;
}(GameboyJS || (GameboyJS = {})));

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

var GameboyJS;
(function (GameboyJS) {
"use strict";

// This is the default buttons mapping for the Gamepad
// It's optimized for the XBOX pad
//
// Any other mapping can be provided as a constructor argument of the Gamepad object
// An alternative mapping should be an object with keys being the indexes
// of the gamepad buttons and values the normalized gameboy button names
var xboxMapping = {
    0: 'UP',
    1: 'DOWN',
    2: 'LEFT',
    3: 'RIGHT',
    4: 'START',
    5: 'SELECT',
    11: 'A',
    12: 'B'
};

// Gamepad listener
// Communication layer between the Gamepad API and the Input class
// Any physical controller can be used but the mapping should be provided
// in order to get an optimal layout of the buttons (see above)
var Gamepad = function(mapping) {
    this.gamepad = null;
    this.state = {A:0,B:0,START:0,SELECT:0,LEFT:0,RIGHT:0,UP:0,DOWN:0};
    this.pullInterval = null;
    this.buttonMapping = mapping || xboxMapping;
};

// Initialize the keyboard listeners and set up the callbacks
// for button press / release
Gamepad.prototype.init = function(onPress, onRelease) {
    this.onPress = onPress;
    this.onRelease = onRelease;

    var self = this;
    window.addEventListener('gamepadconnected', function(e) {
        self.gamepad = e.gamepad;
        self.activatePull();
    });
    window.addEventListener('gamepaddisconnected', function(e) {
        self.gamepad = null;
        self.deactivatePull();
    });
};

Gamepad.prototype.activatePull = function() {
    this.deactivatePull();
    this.pullInterval = setInterval(this.pullState.bind(this), 100);
};

Gamepad.prototype.deactivatePull = function() {
    clearInterval(this.pullInterval);
};

// Check the state of the current gamepad in order to detect any press/release action
Gamepad.prototype.pullState = function() {
    for (var index in this.buttonMapping) {
        var button = this.buttonMapping[index];
        var oldState = this.state[button];
        this.state[button] = this.gamepad.buttons[index].pressed;

        if (this.state[button] == 1 && oldState == 0) {
            this.managePress(button);
        } else if (this.state[button] == 0 && oldState == 1) {
            this.manageRelease(button);
        }
    }
};

Gamepad.prototype.managePress = function(key) {
    this.onPress(key);
};

Gamepad.prototype.manageRelease = function(key) {
    this.onRelease(key);
};

GameboyJS.Gamepad = Gamepad;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";

// The Input management system
//
// The pressKey() and releaseKey() functions should be called by a device class
// like GameboyJS.Keyboard after a physical button trigger event
//
// They rely on the name of the original buttons as parameters (see Input.keys)
var Input = function(cpu, pad) {
    this.cpu = cpu;
    this.memory = cpu.memory;
    this.P1 = 0xFF00;
    this.state = 0;

    pad.init(this.pressKey.bind(this), this.releaseKey.bind(this));
};

Input.keys = {
    START:  0x80,
    SELECT: 0x40,
    B:      0x20,
    A:      0x10,
    DOWN:   0x08,
    UP:     0x04,
    LEFT:   0x02,
    RIGHT:  0x01
};

Input.prototype.pressKey = function(key) {
    this.state |= Input.keys[key];

    this.cpu.requestInterrupt(GameboyJS.CPU.INTERRUPTS.HILO);
};

Input.prototype.releaseKey = function(key) {
    var mask = 0xFF - Input.keys[key];
    this.state &= mask;
};

Input.prototype.update = function() {
    var value = this.memory.rb(this.P1);
    value = ((~value) & 0x30); // invert the value so 1 means 'active'
    if (value & 0x10) { // direction keys listened
        value |= (this.state & 0x0F);
    } else if (value & 0x20) { // action keys listened
        value |= ((this.state & 0xF0) >> 4);
    } else if ((value & 0x30) == 0) { // no keys listened
        value &= 0xF0;
    }

    value = ((~value) & 0x3F); // invert back
    this.memory[this.P1] = value;
};
GameboyJS.Input = Input;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";

// Keyboard listener
// Does the mapping between the keyboard and the Input class
var Keyboard = function() {};

// Initialize the keyboard listeners and set up the callbacks
// for button press / release
Keyboard.prototype.init = function(onPress, onRelease) {
    this.onPress = onPress;
    this.onRelease = onRelease;

    var self = this;
    document.addEventListener('keydown', function(e) {
        self.managePress(e.keyCode);
    });
    document.addEventListener('keyup', function(e) {
        self.manageRelease(e.keyCode);
    });
}

Keyboard.prototype.managePress = function(keycode) {
    var key = this.translateKey(keycode);
    if (key) {
        this.onPress(key);
    }
};

Keyboard.prototype.manageRelease = function(keycode) {
    var key = this.translateKey(keycode);
    if (key) {
        this.onRelease(key);
    }
};

// Transform a keyboard keycode into a key of the Input.keys object
Keyboard.prototype.translateKey = function(keycode) {
    var key = null;
    switch (keycode) {
        case 71: // G
            key = 'A';
            break;
        case 66: // B
            key = 'B';
            break;
        case 72: // H
            key = 'START';
            break;
        case 78: // N
            key = 'SELECT';
            break;
        case 37: // left
            key = 'LEFT';
            break;
        case 38: // up
            key = 'UP';
            break;
        case 39: // right
            key = 'RIGHT';
            break;
        case 40: // down
            key = 'DOWN';
            break;
    }

    return key;
};
GameboyJS.Keyboard = Keyboard;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";

// List of CPU operations
// Most operations have been factorized here to limit code redundancy
//
// How to read operations:
// Uppercase letters qualify the kind of operation (LD = LOAD, INC = INCREMENT, etc.)
// Lowercase letters are used to hint parameters :
// r = register, n = 1 memory byte, sp = sp register,
// a = suffix for memory address, i = bit index
// Example : LDrrar = LOAD operation with two-registers memory address
// as first parameter and one register value as second
//
// Underscore-prefixed functions are here to delegate the logic between similar operations,
// they should not be called from outside
//
// It's up to each operation to update the CPU clock
var ops = {
    LDrrnn: function(p, r1, r2) {p.wr(r2, p.memory.rb(p.r.pc));p.wr(r1, p.memory.rb(p.r.pc+1)); p.r.pc+=2;p.clock.c += 12;},
    LDrrar: function(p, r1, r2, r3) {ops._LDav(p, GameboyJS.Util.getRegAddr(p, r1, r2), p.r[r3]);p.clock.c += 8;},
    LDrrra: function(p, r1, r2, r3) {p.wr(r1, p.memory.rb(GameboyJS.Util.getRegAddr(p, r2, r3)));p.clock.c += 8;},
    LDrn:   function(p, r1) {p.wr(r1, p.memory.rb(p.r.pc++));p.clock.c += 8;},
    LDrr:   function(p, r1, r2) {p.wr(r1, p.r[r2]);p.clock.c += 4;},
    LDrar:  function(p, r1, r2) {p.memory.wb(p.r[r1]+0xFF00, p.r[r2]);p.clock.c += 8;},
    LDrra:  function(p, r1, r2) {p.wr(r1, p.memory.rb(p.r[r2]+0xFF00));p.clock.c += 8;},
    LDspnn: function(p) {p.wr('sp', (p.memory.rb(p.r.pc + 1) << 8) + p.memory.rb(p.r.pc));p.r.pc+=2;p.clock.c += 12;},
    LDsprr: function(p, r1, r2) {p.wr('sp', GameboyJS.Util.getRegAddr(p, r1, r2));p.clock.c += 8;},
    LDnnar: function(p, r1) {var addr=(p.memory.rb(p.r.pc + 1) << 8) + p.memory.rb(p.r.pc);p.memory.wb(addr,p.r[r1]);p.r.pc+=2; p.clock.c += 16;},
    LDrnna: function(p, r1) {var addr=(p.memory.rb(p.r.pc + 1) << 8) + p.memory.rb(p.r.pc);p.wr(r1, p.memory.rb(addr));p.r.pc+=2; p.clock.c += 16;},
    LDrrspn:function(p, r1, r2) {var rel = p.memory.rb(p.r.pc++);rel=GameboyJS.Util.getSignedValue(rel);var val=p.r.sp + rel;
        var c = (p.r.sp&0xFF) + (rel&0xFF) > 0xFF;var h = (p.r.sp & 0xF) + (rel & 0xF) > 0xF;val &= 0xFFFF;
        var f = 0; if(h)f|=0x20;if(c)f|=0x10;p.wr('F', f);
        p.wr(r1, val >> 8);p.wr(r2, val&0xFF);
        p.clock.c+=12;},
    LDnnsp: function(p) {var addr = p.memory.rb(p.r.pc++) + (p.memory.rb(p.r.pc++)<<8); ops._LDav(p, addr, p.r.sp & 0xFF);ops._LDav(p, addr+1, p.r.sp >> 8);p.clock.c+=20;},
    LDrran: function(p, r1, r2){var addr = GameboyJS.Util.getRegAddr(p, r1, r2);ops._LDav(p, addr, p.memory.rb(p.r.pc++));p.clock.c+=12;},
    _LDav:  function(p, addr, val){p.memory.wb(addr, val);},
    LDHnar: function(p, r1){p.memory.wb(0xFF00 + p.memory.rb(p.r.pc++), p.r[r1]);p.clock.c+=12;},
    LDHrna: function(p, r1){p.wr(r1, p.memory.rb(0xFF00 + p.memory.rb(p.r.pc++)));p.clock.c+=12;},
    INCrr:  function(p, r1, r2) {p.wr(r2, (p.r[r2]+1)&0xFF); if (p.r[r2] == 0) p.wr(r1, (p.r[r1]+1)&0xFF);p.clock.c += 8;},
    INCrra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var val = (p.memory.rb(addr)+1)&0xFF;var z = val==0;var h=(p.memory.rb(addr)&0xF)+1 > 0xF;
        p.memory.wb(addr, val);
        p.r.F&=0x10;if(h)p.r.F|=0x20;if(z)p.r.F|=0x80;
        p.clock.c+=12;},
    INCsp:  function(p){p.wr('sp', p.r.sp+1); p.r.sp &= 0xFFFF; p.clock.c+=8;},
    INCr:   function(p, r1) {var h = ((p.r[r1]&0xF) + 1)&0x10;p.wr(r1, (p.r[r1] + 1)&0xFF);var z = p.r[r1]==0;
        p.r.F&=0x10;if(h)p.r.F|=0x20;if(z)p.r.F|=0x80;
        p.clock.c += 4;},
    DECrr:  function(p, r1, r2) {p.wr(r2, (p.r[r2] - 1) & 0xFF); if (p.r[r2] == 0xFF) p.wr(r1, (p.r[r1] - 1)&0xFF);p.clock.c += 8;},
    DECsp:  function(p){p.wr('sp', p.r.sp-1); p.r.sp &= 0xFFFF; p.clock.c+=8;},
    DECr:   function(p, r1) {var h = (p.r[r1]&0xF) < 1;p.wr(r1, (p.r[r1] - 1) & 0xFF);var z = p.r[r1]==0;
        p.r.F&=0x10;p.r.F|=0x40;if(h)p.r.F|=0x20;if(z)p.r.F|=0x80;
        p.clock.c += 4;},
    DECrra: function(p, r1, r2){var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var val = (p.memory.rb(addr)-1)&0xFF;var z = val==0;var h=(p.memory.rb(addr)&0xF) < 1;
        p.memory.wb(addr, val);
        p.r.F&=0x10;p.r.F|=0x40;if(h)p.r.F|=0x20;if(z)p.r.F|=0x80;
        p.clock.c+=12;},
    ADDrr:  function(p, r1, r2) {var n = p.r[r2];ops._ADDrn(p, r1, n); p.clock.c += 4;},
    ADDrn:  function(p, r1) {var n = p.memory.rb(p.r.pc++);ops._ADDrn(p, r1, n); p.clock.c+=8;},
    _ADDrn: function(p, r1, n) {var h=((p.r[r1]&0xF)+(n&0xF))&0x10;p.wr(r1, p.r[r1]+n);var c=p.r[r1]&0x100;p.r[r1]&=0xFF;
            var f = 0;if (p.r[r1]==0)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.wr('F', f);},
    ADDrrrr:function(p, r1, r2, r3, r4) {ops._ADDrrn(p, r1, r2, (p.r[r3]<<8) + p.r[r4]); p.clock.c+=8;},
    ADDrrsp:function(p, r1, r2) {ops._ADDrrn(p, r1, r2, p.r.sp); p.clock.c += 8;},
    ADDspn: function(p) {var v = p.memory.rb(p.r.pc++);v = GameboyJS.Util.getSignedValue(v);
        var c = ((p.r.sp&0xFF) + (v&0xFF)) > 0xFF; var h = (p.r.sp & 0xF) + (v&0xF) > 0xF;
        var f = 0; if(h)f|=0x20;if(c)f|=0x10;p.wr('F', f);
        p.wr('sp', (p.r.sp + v) & 0xFFFF);
        p.clock.c+=16;},
    _ADDrrn:function(p, r1, r2, n) {var v1 = (p.r[r1]<<8) + p.r[r2];var v2 = n;
        var res = v1 + v2;var c = res&0x10000;var h = ((v1&0xFFF) + (v2&0xFFF))&0x1000;var z = p.r.F&0x80;
        res&=0xFFFF;p.r[r2]=res&0xFF;res=res>>8;p.r[r1]=res&0xFF;
        var f=0;if(z)f|=0x80;if(h)f|=0x20;if(c)f|=0x10;p.r.F=f;},
    ADCrr:  function(p, r1, r2) {var n = p.r[r2]; ops._ADCrn(p, r1, n); p.clock.c += 4;},
    ADCrn:  function(p, r1) {var n = p.memory.rb(p.r.pc++); ops._ADCrn(p, r1, n); p.clock.c += 8;},
    _ADCrn: function(p, r1, n) {
        var c = p.r.F&0x10?1:0;var h=((p.r[r1]&0xF)+(n&0xF)+c)&0x10;
        p.wr(r1, p.r[r1]+n+c);c=p.r[r1]&0x100;p.r[r1]&=0xFF;
        var f = 0;if (p.r[r1]==0)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.r.F=f;},
    ADCrrra:function(p, r1, r2, r3) {var n = p.memory.rb(GameboyJS.Util.getRegAddr(p, r2, r3)); ops._ADCrn(p, r1, n); p.clock.c += 8;},
    ADDrrra:function(p, r1, r2, r3) {var v = p.memory.rb(GameboyJS.Util.getRegAddr(p, r2, r3));var h=((p.r[r1]&0xF)+(v&0xF))&0x10;p.wr(r1, p.r[r1]+v);var c=p.r[r1]&0x100;p.r[r1]&=0xFF;
        var f = 0;if (p.r[r1]==0)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.wr('F', f);
        p.clock.c += 8;},
    SUBr:   function(p, r1) {var n = p.r[r1];ops._SUBn(p, n);p.clock.c += 4;},
    SUBn:   function(p) {var n = p.memory.rb(p.r.pc++);ops._SUBn(p, n);p.clock.c += 8;},
    SUBrra: function(p, r1, r2) {var n = p.memory.rb(GameboyJS.Util.getRegAddr(p, r1, r2));ops._SUBn(p, n);p.clock.c+=8;},
    _SUBn:  function(p, n) {var c = p.r.A < n;var h = (p.r.A&0xF) < (n&0xF);
        p.wr('A', p.r.A - n);p.r.A&=0xFF; var z = p.r.A==0;
        var f = 0x40;if (z)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.wr('F', f);},
    SBCn:   function(p) {var n = p.memory.rb(p.r.pc++); ops._SBCn(p, n); p.clock.c += 8;},
    SBCr:   function(p, r1) {var n = p.r[r1]; ops._SBCn(p, n); p.clock.c += 4;},
    SBCrra: function(p, r1, r2) {var v = p.memory.rb((p.r[r1] << 8) + p.r[r2]); ops._SBCn(p, v); p.clock.c += 8;},
    _SBCn:  function(p, n) {var carry = p.r.F&0x10 ? 1 : 0;
        var c = p.r.A < n + carry;var h = (p.r.A&0xF) < (n&0xF) + carry;
        p.wr('A', p.r.A - n - carry); p.r.A&=0xFF; var z = p.r.A == 0;
        var f = 0x40;if (z)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.r.F=f;},
    ORr:    function(p, r1) {p.r.A|=p.r[r1];p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 4;},
    ORn:    function(p) {p.r.A|=p.memory.rb(p.r.pc++);p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 8;},
    ORrra:  function(p, r1, r2) {p.r.A|=p.memory.rb((p.r[r1] << 8)+ p.r[r2]);p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 8;},
    ANDr:   function(p, r1) {p.r.A&=p.r[r1];p.r.F=(p.r.A==0)?0xA0:0x20;p.clock.c += 4;},
    ANDn:   function(p) {p.r.A&=p.memory.rb(p.r.pc++);p.r.F=(p.r.A==0)?0xA0:0x20;p.clock.c += 8;},
    ANDrra: function(p, r1, r2) {p.r.A&=p.memory.rb(GameboyJS.Util.getRegAddr(p, r1, r2));p.r.F=(p.r.A==0)?0xA0:0x20;p.clock.c += 8;},
    XORr:   function(p, r1) {p.r.A^=p.r[r1];p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 4;},
    XORn:   function(p) {p.r.A^=p.memory.rb(p.r.pc++);p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 8;},
    XORrra: function(p, r1, r2) {p.r.A^=p.memory.rb((p.r[r1] << 8)+ p.r[r2]);p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 8;},
    CPr:    function(p, r1) {var n = p.r[r1];ops._CPn(p, n); p.clock.c += 4;},
    CPn:    function(p) {var n =p.memory.rb(p.r.pc++);ops._CPn(p, n);p.clock.c+=8;},
    CPrra:  function(p, r1, r2) {var n = p.memory.rb(GameboyJS.Util.getRegAddr(p, r1, r2));ops._CPn(p, n);p.clock.c+=8;},
    _CPn:   function(p, n) {
        var c = p.r.A < n;var z = p.r.A == n;var h = (p.r.A&0xF) < (n&0xF);
        var f = 0x40;if(z)f+=0x80;if (h)f+=0x20;if (c)f+=0x10;p.r.F=f;},
    RRCr:   function(p, r1) {p.r.F=0;var out=p.r[r1] & 0x01;if(out)p.r.F|=0x10;p.r[r1]=(p.r[r1]>>1)|(out*0x80);if(p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    RRCrra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F=0;var out=p.memory.rb(addr)&0x01;if(out)p.r.F|=0x10;p.memory.wb(addr, (p.memory.rb(addr)>>1)|(out*0x80));if(p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    RLCr:   function(p, r1) {p.r.F=0;var out=p.r[r1]&0x80?1:0;if(out)p.r.F|=0x10;p.r[r1]=((p.r[r1]<<1)+out)&0xFF;if(p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    RLCrra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F=0;var out=p.memory.rb(addr)&0x80?1:0;if(out)p.r.F|=0x10;p.memory.wb(addr, ((p.memory.rb(addr)<<1)+out)&0xFF);if(p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    RLr:    function(p, r1) {var c=(p.r.F&0x10)?1:0;p.r.F=0;var out=p.r[r1]&0x80;out?p.r.F|=0x10:p.r.F&=0xEF;p.r[r1]=((p.r[r1]<<1)+c)&0xFF;if(p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    RLrra:  function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var c=(p.r.F&0x10)?1:0;p.r.F=0;var out=p.memory.rb(addr)&0x80;out?p.r.F|=0x10:p.r.F&=0xEF;p.memory.wb(addr,((p.memory.rb(addr)<<1)+c)&0xFF);if(p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    RRr:    function(p, r1) {var c=(p.r.F&0x10)?1:0;p.r.F=0;var out=p.r[r1]&0x01;out?p.r.F|=0x10:p.r.F&=0xEF;p.r[r1]=(p.r[r1]>>1)|(c*0x80);if(p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    RRrra:  function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var c=(p.r.F&0x10)?1:0;p.r.F=0;var out=p.memory.rb(addr)&0x01;out?p.r.F|=0x10:p.r.F&=0xEF;p.memory.wb(addr,(p.memory.rb(addr)>>1)|(c*0x80));if(p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    SRAr:   function(p, r1) {p.r.F = 0;if (p.r[r1]&0x01)p.r.F|=0x10;var msb=p.r[r1]&0x80;p.r[r1]=(p.r[r1]>>1)|msb;if (p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    SRArra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F = 0;if (p.memory.rb(addr)&0x01)p.r.F|=0x10;var msb=p.memory.rb(addr)&0x80;p.memory.wb(addr, (p.memory.rb(addr)>>1)|msb);if (p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    SLAr:   function(p, r1) {p.r.F = 0;if (p.r[r1]&0x80)p.r.F|=0x10;p.r[r1]=(p.r[r1]<<1)&0xFF;if (p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    SLArra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F = 0;if (p.memory.rb(addr)&0x80)p.r.F|=0x10;p.memory.wb(addr, (p.memory.rb(addr)<<1)&0xFF);if (p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    SRLr:   function(p, r1) {p.r.F = 0;if (p.r[r1]&0x01)p.r.F|=0x10;p.r[r1]=p.r[r1]>>1;if (p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    SRLrra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F = 0;if (p.memory.rb(addr)&0x01)p.r.F|=0x10;p.memory.wb(addr, p.memory.rb(addr)>>1);if (p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    BITir:  function(p, i, r1) {var mask=1<<i;var z=(p.r[r1]&mask)?0:1;var f=p.r.F&0x10;f |= 0x20;if(z)f|=0x80;p.r.F=f;p.clock.c+=4;},
    BITirra:function(p, i, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var mask=1<<i;var z=(p.memory.rb(addr)&mask)?0:1;var f=p.r.F&0x10;f |= 0x20;if(z)f|=0x80;p.r.F=f;p.clock.c+=8;},
    SETir:  function(p, i, r1) {var mask=1<<i;p.r[r1]|=mask;p.clock.c += 4;},
    SETirra:function(p, i, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var mask=1<<i;p.memory.wb(addr, p.memory.rb(addr)|mask);p.clock.c += 12;},
    RESir:  function(p, i, r1) {var mask=0xFF - (1<<i);p.r[r1]&=mask;p.clock.c += 4;},
    RESirra:function(p, i, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var mask=0xFF - (1<<i);p.memory.wb(addr, p.memory.rb(addr)&mask);p.clock.c += 12;},
    SWAPr:  function(p, r1) {p.r[r1] = ops._SWAPn(p, p.r[r1]);p.clock.c+=4;},
    SWAPrra:function(p, r1, r2){var addr = (p.r[r1] << 8)+ p.r[r2]; p.memory.wb(addr, ops._SWAPn(p, p.memory.rb(addr))); p.clock.c+=12;},
    _SWAPn: function(p, n){p.r.F = n==0?0x80:0;return ((n&0xF0) >> 4) | ((n&0x0F) << 4);},
    JPnn:   function(p) {p.wr('pc', (p.memory.rb(p.r.pc+1) << 8) + p.memory.rb(p.r.pc));p.clock.c += 16;},
    JRccn:  function(p, cc) {if (GameboyJS.Util.testFlag(p, cc)){var v=p.memory.rb(p.r.pc++);v=GameboyJS.Util.getSignedValue(v);p.r.pc += v;p.clock.c+=4;}else{p.r.pc++;}p.clock.c += 8;},
    JPccnn: function(p, cc) {if (GameboyJS.Util.testFlag(p, cc)){p.wr('pc', (p.memory.rb(p.r.pc+1) << 8) + p.memory.rb(p.r.pc));p.clock.c+=4;}else{p.r.pc+=2;}p.clock.c += 12;},
    JPrr:   function(p, r1, r2) {p.r.pc = (p.r[r1] << 8) + p.r[r2];p.clock.c += 4;},
    JRn:    function(p) {var v=p.memory.rb(p.r.pc++);v=GameboyJS.Util.getSignedValue(v);p.r.pc += v;p.clock.c += 12;},
    PUSHrr: function(p, r1, r2) {p.wr('sp', p.r.sp-1);p.memory.wb(p.r.sp, p.r[r1]);p.wr('sp', p.r.sp-1);p.memory.wb(p.r.sp, p.r[r2]);p.clock.c+=16;},
    POPrr:  function(p, r1, r2) {p.wr(r2, p.memory.rb(p.r.sp));p.wr('sp', p.r.sp+1);p.wr(r1, p.memory.rb(p.r.sp));p.wr('sp', p.r.sp+1);p.clock.c+=12;},
    RSTn:   function(p, n) {p.wr('sp', p.r.sp-1);p.memory.wb(p.r.sp,p.r.pc>>8);p.wr('sp', p.r.sp-1);p.memory.wb(p.r.sp,p.r.pc&0xFF);p.r.pc=n;p.clock.c+=16;},
    RET:    function(p) {p.r.pc = p.memory.rb(p.r.sp);p.wr('sp', p.r.sp+1);p.r.pc+=p.memory.rb(p.r.sp)<<8;p.wr('sp', p.r.sp+1);p.clock.c += 16;},
    RETcc:  function(p, cc) {if (GameboyJS.Util.testFlag(p, cc)){p.r.pc = p.memory.rb(p.r.sp);p.wr('sp', p.r.sp+1);p.r.pc+=p.memory.rb(p.r.sp)<<8;p.wr('sp', p.r.sp+1);p.clock.c+=12;}p.clock.c+=8;},
    CALLnn: function(p) {ops._CALLnn(p); p.clock.c+=24;},
    CALLccnn:function(p, cc) {if (GameboyJS.Util.testFlag(p, cc)){ops._CALLnn(p);p.clock.c+=12;}else{p.r.pc+=2;}p.clock.c+=12; },
    _CALLnn:function(p){p.wr('sp', p.r.sp - 1); p.memory.wb(p.r.sp, ((p.r.pc+2)&0xFF00)>>8);
        p.wr('sp', p.r.sp - 1); p.memory.wb(p.r.sp, (p.r.pc+2)&0x00FF);
        var j=p.memory.rb(p.r.pc)+(p.memory.rb(p.r.pc+1)<<8);p.r.pc=j;},
    CPL:    function(p) {p.wr('A', (~p.r.A)&0xFF);p.r.F|=0x60,p.clock.c += 4;},
    CCF:    function(p) {p.r.F&=0x9F;p.r.F&0x10?p.r.F&=0xE0:p.r.F|=0x10;p.clock.c += 4;},
    SCF:    function(p) {p.r.F&=0x9F;p.r.F|=0x10;p.clock.c+=4;},
    DAA:    function(p) {
        var sub = (p.r.F&0x40) ? 1 : 0; var h = (p.r.F&0x20)?1:0;var c = (p.r.F&0x10)?1:0;
        if (sub) {
            if (h) {
                p.r.A = (p.r.A - 0x6) & 0xFF;
            }
            if (c) {
                p.r.A -= 0x60;
            }
        } else {
            if ((p.r.A&0xF) > 9 || h) {
                p.r.A += 0x6;
            }
            if (p.r.A > 0x9F || c) {
                p.r.A += 0x60;
            }
        }
        if (p.r.A&0x100) c = 1;

        p.r.A &= 0xFF;
        p.r.F &= 0x40;if (p.r.A == 0) p.r.F|=0x80;if (c) p.r.F|=0x10;
        p.clock.c += 4;
    },
    HALT:   function(p) {p.halt(); p.clock.c+=4;},
    DI:     function(p) {p.disableInterrupts();p.clock.c += 4;},
    EI:     function(p) {p.enableInterrupts();p.clock.c += 4;},
    RETI:   function(p) {p.enableInterrupts();ops.RET(p);},
    CB:     function(p) {var opcode = p.memory.rb(p.r.pc++);
        GameboyJS.opcodeCbmap[opcode](p);
        p.clock.c+=4;}
};
GameboyJS.cpuOps = ops;
}(GameboyJS || (GameboyJS = {})));

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

var GameboyJS;
(function (GameboyJS) {
"use strict";

// Memory bank controllers

var MBC = {};

// Create an MBC instance depending on the type specified in the cartridge
MBC.getMbcInstance = function(memory, type) {
    var instance;
    switch (type) {
        case 0x00:
            instance = new MBC0(memory);
            break;
        case 0x01: case 0x02: case 0x03:
            instance = new MBC1(memory);
            break;
        case 0x0F: case 0x10: case 0x11: case 0x12: case 0x13:
            instance = new MBC3(memory);
            break;
        case 0x19: case 0x1A: case 0x1B: case 0x1C: case 0x1D: case 0x1E:
            instance = new MBC5(memory);
            break;
        default:
            throw new GameboyJS.UnimplementedException('MBC type not supported');
    }

    return instance;
};

var MBC1 = function(memory) {
    this.memory = memory;
    this.romBankNumber = 1;
    this.mode = 0; // mode 0 = ROM, mode 1 = RAM
    this.ramEnabled = true;
    this.extRam = new GameboyJS.ExtRam();
};

MBC1.prototype.loadRam = function(game, size) {
    this.extRam.loadRam(game, size);
};

MBC1.prototype.manageWrite = function(addr, value) {
    switch (addr & 0xF000) {
        case 0x0000: case 0x1000: // enable RAM
            this.ramEnabled = (value & 0x0A) ? true : false;
            if (this.ramEnabled) {
                this.extRam.saveRamData();
            }
            break;
        case 0x2000: case 0x3000: // ROM bank number lower 5 bits
            value &= 0x1F;
            if (value == 0) value = 1;
            var mask = this.mode ? 0 : 0xE0;
            this.romBankNumber = (this.romBankNumber & mask) +value;
            this.memory.loadRomBank(this.romBankNumber);
            break;
        case 0x4000: case 0x5000: // RAM bank or high bits ROM
            value &= 0x03;
            if (this.mode == 0) { // ROM upper bits
                this.romBankNumber = (this.romBankNumber&0x1F) | (value << 5);
                this.memory.loadRomBank(this.romBankNumber);
            } else { // RAM bank
                this.extRam.setRamBank(value);
            }
            break;
        case 0x6000: case 0x7000: // ROM / RAM mode
            this.mode = value & 1;
            break;
        case 0xA000: case 0xB000:
            this.extRam.manageWrite(addr - 0xA000, value);
            break;
    }
};
MBC1.prototype.readRam = function(addr) {
    return this.extRam.manageRead(addr - 0xA000);
};

var MBC3 = function(memory) {
    this.memory = memory;
    this.romBankNumber = 1;
    this.ramEnabled = true;
    this.extRam = new GameboyJS.ExtRam();
};

MBC3.prototype.loadRam = function(game, size) {
    this.extRam.loadRam(game, size);
};

MBC3.prototype.manageWrite = function(addr, value) {
    switch (addr & 0xF000) {
        case 0x0000: case 0x1000: // enable RAM
            this.ramEnabled = (value & 0x0A) ? true : false;
            if (this.ramEnabled) {
                this.extRam.saveRamData();
            }
            break;
        case 0x2000: case 0x3000: // ROM bank number
            value &= 0x7F;
            if (value == 0) value = 1;
            this.romBankNumber = value;
            this.memory.loadRomBank(this.romBankNumber);
            break;
        case 0x4000: case 0x5000: // RAM bank
            this.extRam.setRamBank(value);
            break;
        case 0x6000: case 0x7000: // Latch clock data
            throw new GameboyJS.UnimplementedException('cartridge clock not supported', false);
            break;
        case 0xA000: case 0xB000:
            this.extRam.manageWrite(addr - 0xA000, value);
            break;
    }
};
MBC3.prototype.readRam = function(addr) {
    return this.extRam.manageRead(addr - 0xA000);
};

// declare MBC5 for compatibility with most cartriges
// does not support rumble feature
var MBC5 = MBC3;

// MBC0 exists for consistency and manages the no-MBC cartriges
var MBC0 = function(memory) {this.memory = memory;};

MBC0.prototype.manageWrite = function(addr, value) {
    this.memory.loadRomBank(value);
};
MBC0.prototype.readRam = function(addr) {return 0;};
MBC0.prototype.loadRam = function() {};

GameboyJS.MBC = MBC;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";

// Memory unit
var Memory = function(cpu) {
    this.MEM_SIZE = 65536; // 64KB

    this.MBCtype = 0;
    this.banksize = 0x4000;
    this.rom = null;
    this.mbc = null;
    this.cpu = cpu;
};

Memory.addresses = {
    VRAM_START : 0x8000,
    VRAM_END   : 0x9FFF,

    EXTRAM_START : 0xA000,
    EXTRAM_END   : 0xBFFF,

    OAM_START : 0xFE00,
    OAM_END   : 0xFE9F,

    DEVICE_START: 0xFF00,
    DEVICE_END:   0xFF7F
};

// Memory can be accessed as an Array
Memory.prototype = new Array();

Memory.prototype.reset = function() {
    this.length = this.MEM_SIZE;
    for (var i = Memory.addresses.VRAM_START; i <= Memory.addresses.VRAM_END; i++) {
        this[i] = 0;
    }
    for (var i = Memory.addresses.DEVICE_START; i <= Memory.addresses.DEVICE_END; i++) {
        this[i] = 0;
    }
    this[0xFFFF] = 0;
};

Memory.prototype.setRomData = function(data) {
    this.rom = data;
    this.loadRomBank(0);
    this.mbc = GameboyJS.MBC.getMbcInstance(this, this[0x147]);
    this.loadRomBank(1);
    this.mbc.loadRam(this.cpu.getGameName(), this.cpu.getRamSize());
};

Memory.prototype.loadRomBank = function(index) {
    var start = index ? 0x4000 : 0x0;
    var romStart = index * 0x4000;
    for (var i = 0; i < this.banksize; i++) {
        this[i + start] = this.rom[romStart + i];
    }
};

// Video ram accessor
Memory.prototype.vram = function(address) {
    if (address < Memory.addresses.VRAM_START || address > Memory.addresses.VRAM_END) {
        throw 'VRAM access in out of bounds address ' + address;
    }

    return this[address];
};

// OAM ram accessor
Memory.prototype.oamram = function(address) {
    if (address < Memory.addresses.OAM_START || address > Memory.addresses.OAM_END) {
        throw 'OAMRAM access in out of bounds address ' + address;
    }

    return this[address];
};

// Device ram accessor
Memory.prototype.deviceram = function(address, value) {
    if (address < Memory.addresses.DEVICERAM_START || address > Memory.addresses.DEVICERAM_END) {
        throw 'Device RAM access in out of bounds address ' + address;
    }
    if (typeof value === "undefined") {
        return this[address];
    } else {
        this[address] = value;
    }

};

// Memory read proxy function
// Used to centralize memory read access
Memory.prototype.rb = function (addr) {
    if (addr >= 0xFF10 && addr < 0xFF40) {
        var mask = apuMask[addr - 0xFF10];
        return this[addr] | mask;
    }
    if ((addr >= 0xA000 && addr < 0xC000)) {
        return this.mbc.readRam(addr);
    }
    return this[addr];
};

// Bitmasks for audio addresses reads
var apuMask = [
0x80,0x3F,0x00,0xFF,0xBF, // NR10-NR15
0xFF,0x3F,0x00,0xFF,0xBF, // NR20-NR25
0x7F,0xFF,0x9F,0xFF,0xBF, // NR30-NR35
0xFF,0xFF,0x00,0x00,0xBF, // NR40-NR45
0x00,0x00,0x70,           // NR50-NR52
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // Wave RAM
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
];

// Memory write proxy function
// Used to centralize memory writes and delegate specific behaviour
// to the correct units
Memory.prototype.wb = function(addr, value) {
    if (addr < 0x8000 || (addr >= 0xA000 && addr < 0xC000)) { // MBC
        this.mbc.manageWrite(addr, value);
    } else if (addr >= 0xFF10 && addr <= 0xFF3F) { // sound registers
        this.cpu.apu.manageWrite(addr, value);
    } else if (addr == 0xFF00) { // input register
        this[addr] = ((this[addr] & 0x0F) | (value & 0x30));
    } else {
        this[addr] = value;
        if ((addr & 0xFF00) == 0xFF00) {
            if (addr == 0xFF02) {
                if (value & 0x80) {
                    this.cpu.enableSerialTransfer();
                }
            }
            if (addr == 0xFF04) {
                this.cpu.resetDivTimer();
            }
            if (addr == 0xFF46) { // OAM DMA transfer
                this.dmaTransfer(value);
            }
        }
    }
}

// Start a DMA transfer (OAM data from cartrige to RAM)
Memory.prototype.dmaTransfer = function(startAddressPrefix) {
    var startAddress = (startAddressPrefix << 8);
    for (var i = 0; i < 0xA0; i++) {
        this[Memory.addresses.OAM_START + i] = this[startAddress + i];
    }
};

GameboyJS.Memory = Memory;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";

var ops = GameboyJS.cpuOps;
// Each opcode (0 to 0xFF) is associated to a CPU operation
// CPU operations are implemented separately
// The cbmap object holds operations for CB prefixed opcodes (0xCB00 to 0xCBFF)
// Non existent opcodes are commented out and marked empty
var map = {
    0x00: function(p){p.clock.c += 4;},
    0x01: function(p){ops.LDrrnn(p, 'B', 'C');},
    0x02: function(p){ops.LDrrar(p, 'B', 'C', 'A');},
    0x03: function(p){ops.INCrr(p, 'B', 'C');},
    0x04: function(p){ops.INCr(p, 'B');},
    0x05: function(p){ops.DECr(p, 'B');},
    0x06: function(p){ops.LDrn(p, 'B');},
    0x07: function(p){var out=p.r.A & 0x80?1:0; out ? p.r.F=0x10:p.r.F=0; p.wr('A', ((p.r.A<<1)+out)&0xFF);p.clock.c+=4;},
    0x08: function(p){ops.LDnnsp(p);},
    0x09: function(p){ops.ADDrrrr(p, 'H', 'L', 'B', 'C');},
    0x0A: function(p){ops.LDrrra(p, 'A', 'B', 'C');},
    0x0B: function(p){ops.DECrr(p, 'B', 'C');},
    0x0C: function(p){ops.INCr(p, 'C');},
    0x0D: function(p){ops.DECr(p, 'C');},
    0x0E: function(p){ops.LDrn(p, 'C');},
    0x0F: function(p){var out=p.r.A & 0x01; out ? p.r.F=0x10:p.r.F=0; p.wr('A', (p.r.A>>1)|(out*0x80));p.clock.c+=4;},

    0x10: function(p){p.r.pc++;p.clock.c+=4;},
    0x11: function(p){ops.LDrrnn(p, 'D', 'E');},
    0x12: function(p){ops.LDrrar(p, 'D', 'E', 'A');},
    0x13: function(p){ops.INCrr(p, 'D', 'E');},
    0x14: function(p){ops.INCr(p, 'D');},
    0x15: function(p){ops.DECr(p, 'D');},
    0x16: function(p){ops.LDrn(p, 'D');},
    0x17: function(p){var c = (p.r.F&0x10)?1:0;var out=p.r.A & 0x80?1:0; out ? p.r.F=0x10:p.r.F=0; p.wr('A',((p.r.A<<1)+c)&0xFF);p.clock.c+=4;},
    0x18: function(p){ops.JRn(p);},
    0x19: function(p){ops.ADDrrrr(p, 'H', 'L', 'D', 'E');},
    0x1A: function(p){ops.LDrrra(p, 'A', 'D', 'E');},
    0x1B: function(p){ops.DECrr(p, 'D', 'E');},
    0x1C: function(p){ops.INCr(p, 'E');},
    0x1D: function(p){ops.DECr(p, 'E');},
    0x1E: function(p){ops.LDrn(p, 'E');},
    0x1F: function(p){var c = (p.r.F&0x10)?1:0;var out=p.r.A & 0x01; out ? p.r.F=0x10:p.r.F=0; p.wr('A', (p.r.A>>1)|(c*0x80));p.clock.c+=4;},

    0x20: function(p){ops.JRccn(p, 'NZ');},
    0x21: function(p){ops.LDrrnn(p, 'H', 'L');},
    0x22: function(p){ops.LDrrar(p, 'H', 'L', 'A');ops.INCrr(p, 'H', 'L');p.clock.c -= 8;},
    0x23: function(p){ops.INCrr(p, 'H', 'L');},
    0x24: function(p){ops.INCr(p, 'H');},
    0x25: function(p){ops.DECr(p, 'H');},
    0x26: function(p){ops.LDrn(p, 'H');},
    0x27: function(p){ops.DAA(p);},
    0x28: function(p){ops.JRccn(p, 'Z');},
    0x29: function(p){ops.ADDrrrr(p, 'H', 'L', 'H', 'L');},
    0x2A: function(p){ops.LDrrra(p, 'A', 'H', 'L');ops.INCrr(p, 'H', 'L');p.clock.c -= 8;},
    0x2B: function(p){ops.DECrr(p, 'H', 'L');},
    0x2C: function(p){ops.INCr(p, 'L');},
    0x2D: function(p){ops.DECr(p, 'L');},
    0x2E: function(p){ops.LDrn(p, 'L');},
    0x2F: function(p){ops.CPL(p);},

    0x30: function(p){ops.JRccn(p, 'NC');},
    0x31: function(p){ops.LDspnn(p);},
    0x32: function(p){ops.LDrrar(p, 'H', 'L', 'A');ops.DECrr(p, 'H', 'L');p.clock.c -= 8;},
    0x33: function(p){ops.INCsp(p);},
    0x34: function(p){ops.INCrra(p, 'H', 'L');},
    0x35: function(p){ops.DECrra(p, 'H', 'L');},
    0x36: function(p){ops.LDrran(p, 'H', 'L');},
    0x37: function(p){ops.SCF(p);},
    0x38: function(p){ops.JRccn(p, 'C');},
    0x39: function(p){ops.ADDrrsp(p, 'H', 'L');},
    0x3A: function(p){ops.LDrrra(p, 'A', 'H', 'L');ops.DECrr(p, 'H', 'L');p.clock.c -= 8;},
    0x3B: function(p){ops.DECsp(p);},
    0x3C: function(p){ops.INCr(p, 'A');},
    0x3D: function(p){ops.DECr(p, 'A');},
    0x3E: function(p){ops.LDrn(p, 'A');},
    0x3F: function(p){ops.CCF(p);},

    0x40: function(p){ops.LDrr(p, 'B', 'B');},
    0x41: function(p){ops.LDrr(p, 'B', 'C');},
    0x42: function(p){ops.LDrr(p, 'B', 'D');},
    0x43: function(p){ops.LDrr(p, 'B', 'E');},
    0x44: function(p){ops.LDrr(p, 'B', 'H');},
    0x45: function(p){ops.LDrr(p, 'B', 'L');},
    0x46: function(p){ops.LDrrra(p, 'B', 'H', 'L');},
    0x47: function(p){ops.LDrr(p, 'B', 'A');},
    0x48: function(p){ops.LDrr(p, 'C', 'B');},
    0x49: function(p){ops.LDrr(p, 'C', 'C');},
    0x4A: function(p){ops.LDrr(p, 'C', 'D');},
    0x4B: function(p){ops.LDrr(p, 'C', 'E');},
    0x4C: function(p){ops.LDrr(p, 'C', 'H');},
    0x4D: function(p){ops.LDrr(p, 'C', 'L');},
    0x4E: function(p){ops.LDrrra(p, 'C', 'H', 'L');},
    0x4F: function(p){ops.LDrr(p, 'C', 'A');},

    0x50: function(p){ops.LDrr(p, 'D', 'B');},
    0x51: function(p){ops.LDrr(p, 'D', 'C');},
    0x52: function(p){ops.LDrr(p, 'D', 'D');},
    0x53: function(p){ops.LDrr(p, 'D', 'E');},
    0x54: function(p){ops.LDrr(p, 'D', 'H');},
    0x55: function(p){ops.LDrr(p, 'D', 'L');},
    0x56: function(p){ops.LDrrra(p, 'D', 'H', 'L');},
    0x57: function(p){ops.LDrr(p, 'D', 'A');},
    0x58: function(p){ops.LDrr(p, 'E', 'B');},
    0x59: function(p){ops.LDrr(p, 'E', 'C');},
    0x5A: function(p){ops.LDrr(p, 'E', 'D');},
    0x5B: function(p){ops.LDrr(p, 'E', 'E');},
    0x5C: function(p){ops.LDrr(p, 'E', 'H');},
    0x5D: function(p){ops.LDrr(p, 'E', 'L');},
    0x5E: function(p){ops.LDrrra(p, 'E', 'H', 'L');},
    0x5F: function(p){ops.LDrr(p, 'E', 'A');},

    0x60: function(p){ops.LDrr(p, 'H', 'B');},
    0x61: function(p){ops.LDrr(p, 'H', 'C');},
    0x62: function(p){ops.LDrr(p, 'H', 'D');},
    0x63: function(p){ops.LDrr(p, 'H', 'E');},
    0x64: function(p){ops.LDrr(p, 'H', 'H');},
    0x65: function(p){ops.LDrr(p, 'H', 'L');},
    0x66: function(p){ops.LDrrra(p, 'H', 'H', 'L');},
    0x67: function(p){ops.LDrr(p, 'H', 'A');},
    0x68: function(p){ops.LDrr(p, 'L', 'B');},
    0x69: function(p){ops.LDrr(p, 'L', 'C');},
    0x6A: function(p){ops.LDrr(p, 'L', 'D');},
    0x6B: function(p){ops.LDrr(p, 'L', 'E');},
    0x6C: function(p){ops.LDrr(p, 'L', 'H');},
    0x6D: function(p){ops.LDrr(p, 'L', 'L');},
    0x6E: function(p){ops.LDrrra(p, 'L', 'H', 'L');},
    0x6F: function(p){ops.LDrr(p, 'L', 'A');},

    0x70: function(p){ops.LDrrar(p, 'H', 'L', 'B');},
    0x71: function(p){ops.LDrrar(p, 'H', 'L', 'C');},
    0x72: function(p){ops.LDrrar(p, 'H', 'L', 'D');},
    0x73: function(p){ops.LDrrar(p, 'H', 'L', 'E');},
    0x74: function(p){ops.LDrrar(p, 'H', 'L', 'H');},
    0x75: function(p){ops.LDrrar(p, 'H', 'L', 'L');},
    0x76: function(p){ops.HALT(p);},
    0x77: function(p){ops.LDrrar(p, 'H', 'L', 'A');},
    0x78: function(p){ops.LDrr(p, 'A', 'B');},
    0x79: function(p){ops.LDrr(p, 'A', 'C');},
    0x7A: function(p){ops.LDrr(p, 'A', 'D');},
    0x7B: function(p){ops.LDrr(p, 'A', 'E');},
    0x7C: function(p){ops.LDrr(p, 'A', 'H');},
    0x7D: function(p){ops.LDrr(p, 'A', 'L');},
    0x7E: function(p){ops.LDrrra(p, 'A', 'H', 'L');},
    0x7F: function(p){ops.LDrr(p, 'A', 'A');},

    0x80: function(p){ops.ADDrr(p, 'A', 'B');},
    0x81: function(p){ops.ADDrr(p, 'A', 'C');},
    0x82: function(p){ops.ADDrr(p, 'A', 'D');},
    0x83: function(p){ops.ADDrr(p, 'A', 'E');},
    0x84: function(p){ops.ADDrr(p, 'A', 'H');},
    0x85: function(p){ops.ADDrr(p, 'A', 'L');},
    0x86: function(p){ops.ADDrrra(p, 'A', 'H', 'L');},
    0x87: function(p){ops.ADDrr(p, 'A', 'A');},
    0x88: function(p){ops.ADCrr(p, 'A', 'B');},
    0x89: function(p){ops.ADCrr(p, 'A', 'C');},
    0x8A: function(p){ops.ADCrr(p, 'A', 'D');},
    0x8B: function(p){ops.ADCrr(p, 'A', 'E');},
    0x8C: function(p){ops.ADCrr(p, 'A', 'H');},
    0x8D: function(p){ops.ADCrr(p, 'A', 'L');},
    0x8E: function(p){ops.ADCrrra(p, 'A', 'H', 'L');},
    0x8F: function(p){ops.ADCrr(p, 'A', 'A');},

    0x90: function(p){ops.SUBr(p, 'B');},
    0x91: function(p){ops.SUBr(p, 'C');},
    0x92: function(p){ops.SUBr(p, 'D');},
    0x93: function(p){ops.SUBr(p, 'E');},
    0x94: function(p){ops.SUBr(p, 'H');},
    0x95: function(p){ops.SUBr(p, 'L');},
    0x96: function(p){ops.SUBrra(p, 'H', 'L');},
    0x97: function(p){ops.SUBr(p, 'A');},
    0x98: function(p){ops.SBCr(p, 'B');},
    0x99: function(p){ops.SBCr(p, 'C');},
    0x9A: function(p){ops.SBCr(p, 'D');},
    0x9B: function(p){ops.SBCr(p, 'E');},
    0x9C: function(p){ops.SBCr(p, 'H');},
    0x9D: function(p){ops.SBCr(p, 'L');},
    0x9E: function(p){ops.SBCrra(p, 'H', 'L');},
    0x9F: function(p){ops.SBCr(p, 'A');},

    0xA0: function(p){ops.ANDr(p, 'B');},
    0xA1: function(p){ops.ANDr(p, 'C');},
    0xA2: function(p){ops.ANDr(p, 'D');},
    0xA3: function(p){ops.ANDr(p, 'E');},
    0xA4: function(p){ops.ANDr(p, 'H');},
    0xA5: function(p){ops.ANDr(p, 'L');},
    0xA6: function(p){ops.ANDrra(p, 'H', 'L');},
    0xA7: function(p){ops.ANDr(p, 'A');},
    0xA8: function(p){ops.XORr(p, 'B');},
    0xA9: function(p){ops.XORr(p, 'C');},
    0xAA: function(p){ops.XORr(p, 'D');},
    0xAB: function(p){ops.XORr(p, 'E');},
    0xAC: function(p){ops.XORr(p, 'H');},
    0xAD: function(p){ops.XORr(p, 'L');},
    0xAE: function(p){ops.XORrra(p, 'H', 'L');},
    0xAF: function(p){ops.XORr(p, 'A');},

    0xB0: function(p){ops.ORr(p, 'B');},
    0xB1: function(p){ops.ORr(p, 'C');},
    0xB2: function(p){ops.ORr(p, 'D');},
    0xB3: function(p){ops.ORr(p, 'E');},
    0xB4: function(p){ops.ORr(p, 'H');},
    0xB5: function(p){ops.ORr(p, 'L');},
    0xB6: function(p){ops.ORrra(p, 'H', 'L');},
    0xB7: function(p){ops.ORr(p, 'A');},
    0xB8: function(p){ops.CPr(p, 'B');},
    0xB9: function(p){ops.CPr(p, 'C');},
    0xBA: function(p){ops.CPr(p, 'D');},
    0xBB: function(p){ops.CPr(p, 'E');},
    0xBC: function(p){ops.CPr(p, 'H');},
    0xBD: function(p){ops.CPr(p, 'L');},
    0xBE: function(p){ops.CPrra(p, 'H', 'L');},
    0xBF: function(p){ops.CPr(p, 'A');},

    0xC0: function(p){ops.RETcc(p, 'NZ');},
    0xC1: function(p){ops.POPrr(p, 'B', 'C');},
    0xC2: function(p){ops.JPccnn(p, 'NZ');},
    0xC3: function(p){ops.JPnn(p);},
    0xC4: function(p){ops.CALLccnn(p, 'NZ');},
    0xC5: function(p){ops.PUSHrr(p, 'B', 'C');},
    0xC6: function(p){ops.ADDrn(p, 'A');},
    0xC7: function(p){ops.RSTn(p, 0x00);},
    0xC8: function(p){ops.RETcc(p, 'Z');},
    0xC9: function(p){ops.RET(p);},
    0xCA: function(p){ops.JPccnn(p, 'Z');},
    0xCB: function(p){ops.CB(p);},
    0xCC: function(p){ops.CALLccnn(p, 'Z');},
    0xCD: function(p){ops.CALLnn(p);},
    0xCE: function(p){ops.ADCrn(p, 'A');},
    0xCF: function(p){ops.RSTn(p, 0x08);},

    0xD0: function(p){ops.RETcc(p, 'NC');},
    0xD1: function(p){ops.POPrr(p, 'D', 'E');},
    0xD2: function(p){ops.JPccnn(p, 'NC');},
    //0xD3 empty
    0xD4: function(p){ops.CALLccnn(p, 'NC');},
    0xD5: function(p){ops.PUSHrr(p, 'D', 'E');},
    0xD6: function(p){ops.SUBn(p);},
    0xD7: function(p){ops.RSTn(p, 0x10);},
    0xD8: function(p){ops.RETcc(p, 'C');},
    0xD9: function(p){ops.RETI(p);},
    0xDA: function(p){ops.JPccnn(p, 'C');},
    //0xDB empty
    0xDC: function(p){ops.CALLccnn(p, 'C');},
    //0xDD empty
    0xDE: function(p){ops.SBCn(p);},
    0xDF: function(p){ops.RSTn(p, 0x18);},

    0xE0: function(p){ops.LDHnar(p, 'A');},
    0xE1: function(p){ops.POPrr(p, 'H', 'L');},
    0xE2: function(p){ops.LDrar(p, 'C', 'A');},
    //0xE3 empty
    //0xE4 empty
    0xE5: function(p){ops.PUSHrr(p, 'H', 'L');},
    0xE6: function(p){ops.ANDn(p);},
    0xE7: function(p){ops.RSTn(p, 0x20);},
    0xE8: function(p){ops.ADDspn(p);},
    0xE9: function(p){ops.JPrr(p, 'H', 'L');},
    0xEA: function(p){ops.LDnnar(p, 'A');},
    //0xEB empty
    //0xEC empty
    //0xED empty
    0xEE: function(p){ops.XORn(p);},
    0xEF: function(p){ops.RSTn(p, 0x28);},

    0xF0: function(p){ops.LDHrna(p, 'A');},
    0xF1: function(p){ops.POPrr(p, 'A', 'F');},
    0xF2: function(p){ops.LDrra(p, 'A', 'C');},
    0xF3: function(p){ops.DI(p);},
    //0xF4 empty
    0xF5: function(p){ops.PUSHrr(p, 'A', 'F');},
    0xF6: function(p){ops.ORn(p);},
    0xF7: function(p){ops.RSTn(p, 0x30);},
    0xF8: function(p){ops.LDrrspn(p, 'H', 'L');},
    0xF9: function(p){ops.LDsprr(p, 'H', 'L');},
    0xFA: function(p){ops.LDrnna(p, 'A');},
    0xFB: function(p){ops.EI(p);},
    //0xFC empty
    //0xFD empty
    0xFE: function(p){ops.CPn(p);},
    0xFF: function(p){ops.RSTn(p, 0x38);}
};

var cbmap = {
    0x00: function(p){ops.RLCr(p, 'B');},
    0x01: function(p){ops.RLCr(p, 'C');},
    0x02: function(p){ops.RLCr(p, 'D');},
    0x03: function(p){ops.RLCr(p, 'E');},
    0x04: function(p){ops.RLCr(p, 'H');},
    0x05: function(p){ops.RLCr(p, 'L');},
    0x06: function(p){ops.RLCrra(p, 'H', 'L');},
    0x07: function(p){ops.RLCr(p, 'A');},
    0x08: function(p){ops.RRCr(p, 'B');},
    0x09: function(p){ops.RRCr(p, 'C');},
    0x0A: function(p){ops.RRCr(p, 'D');},
    0x0B: function(p){ops.RRCr(p, 'E');},
    0x0C: function(p){ops.RRCr(p, 'H');},
    0x0D: function(p){ops.RRCr(p, 'L');},
    0x0E: function(p){ops.RRCrra(p, 'H', 'L');},
    0x0F: function(p){ops.RRCr(p, 'A');},

    0x10: function(p){ops.RLr(p, 'B');},
    0x11: function(p){ops.RLr(p, 'C');},
    0x12: function(p){ops.RLr(p, 'D');},
    0x13: function(p){ops.RLr(p, 'E');},
    0x14: function(p){ops.RLr(p, 'H');},
    0x15: function(p){ops.RLr(p, 'L');},
    0x16: function(p){ops.RLrra(p, 'H', 'L');},
    0x17: function(p){ops.RLr(p, 'A');},
    0x18: function(p){ops.RRr(p, 'B');},
    0x19: function(p){ops.RRr(p, 'C');},
    0x1A: function(p){ops.RRr(p, 'D');},
    0x1B: function(p){ops.RRr(p, 'E');},
    0x1C: function(p){ops.RRr(p, 'H');},
    0x1D: function(p){ops.RRr(p, 'L');},
    0x1E: function(p){ops.RRrra(p, 'H', 'L');},
    0x1F: function(p){ops.RRr(p, 'A');},

    0x20: function(p){ops.SLAr(p, 'B');},
    0x21: function(p){ops.SLAr(p, 'C');},
    0x22: function(p){ops.SLAr(p, 'D');},
    0x23: function(p){ops.SLAr(p, 'E');},
    0x24: function(p){ops.SLAr(p, 'H');},
    0x25: function(p){ops.SLAr(p, 'L');},
    0x26: function(p){ops.SLArra(p, 'H', 'L');},
    0x27: function(p){ops.SLAr(p, 'A');},
    0x28: function(p){ops.SRAr(p, 'B');},
    0x29: function(p){ops.SRAr(p, 'C');},
    0x2A: function(p){ops.SRAr(p, 'D');},
    0x2B: function(p){ops.SRAr(p, 'E');},
    0x2C: function(p){ops.SRAr(p, 'H');},
    0x2D: function(p){ops.SRAr(p, 'L');},
    0x2E: function(p){ops.SRArra(p, 'H', 'L');},
    0x2F: function(p){ops.SRAr(p, 'A');},

    0x30: function(p){ops.SWAPr(p, 'B');},
    0x31: function(p){ops.SWAPr(p, 'C');},
    0x32: function(p){ops.SWAPr(p, 'D');},
    0x33: function(p){ops.SWAPr(p, 'E');},
    0x34: function(p){ops.SWAPr(p, 'H');},
    0x35: function(p){ops.SWAPr(p, 'L');},
    0x36: function(p){ops.SWAPrra(p, 'H', 'L');},
    0x37: function(p){ops.SWAPr(p, 'A');},
    0x38: function(p){ops.SRLr(p, 'B');},
    0x39: function(p){ops.SRLr(p, 'C');},
    0x3A: function(p){ops.SRLr(p, 'D');},
    0x3B: function(p){ops.SRLr(p, 'E');},
    0x3C: function(p){ops.SRLr(p, 'H');},
    0x3D: function(p){ops.SRLr(p, 'L');},
    0x3E: function(p){ops.SRLrra(p, 'H', 'L');},
    0x3F: function(p){ops.SRLr(p, 'A');},

    0x40: function(p){ops.BITir(p, 0, 'B');},
    0x41: function(p){ops.BITir(p, 0, 'C');},
    0x42: function(p){ops.BITir(p, 0, 'D');},
    0x43: function(p){ops.BITir(p, 0, 'E');},
    0x44: function(p){ops.BITir(p, 0, 'H');},
    0x45: function(p){ops.BITir(p, 0, 'L');},
    0x46: function(p){ops.BITirra(p, 0, 'H', 'L');},
    0x47: function(p){ops.BITir(p, 0, 'A');},
    0x48: function(p){ops.BITir(p, 1, 'B');},
    0x49: function(p){ops.BITir(p, 1, 'C');},
    0x4A: function(p){ops.BITir(p, 1, 'D');},
    0x4B: function(p){ops.BITir(p, 1, 'E');},
    0x4C: function(p){ops.BITir(p, 1, 'H');},
    0x4D: function(p){ops.BITir(p, 1, 'L');},
    0x4E: function(p){ops.BITirra(p, 1, 'H', 'L');},
    0x4F: function(p){ops.BITir(p, 1, 'A');},

    0x50: function(p){ops.BITir(p, 2, 'B');},
    0x51: function(p){ops.BITir(p, 2, 'C');},
    0x52: function(p){ops.BITir(p, 2, 'D');},
    0x53: function(p){ops.BITir(p, 2, 'E');},
    0x54: function(p){ops.BITir(p, 2, 'H');},
    0x55: function(p){ops.BITir(p, 2, 'L');},
    0x56: function(p){ops.BITirra(p, 2, 'H', 'L');},
    0x57: function(p){ops.BITir(p, 2, 'A');},
    0x58: function(p){ops.BITir(p, 3, 'B');},
    0x59: function(p){ops.BITir(p, 3, 'C');},
    0x5A: function(p){ops.BITir(p, 3, 'D');},
    0x5B: function(p){ops.BITir(p, 3, 'E');},
    0x5C: function(p){ops.BITir(p, 3, 'H');},
    0x5D: function(p){ops.BITir(p, 3, 'L');},
    0x5E: function(p){ops.BITirra(p, 3, 'H', 'L');},
    0x5F: function(p){ops.BITir(p, 3, 'A');},

    0x60: function(p){ops.BITir(p, 4, 'B');},
    0x61: function(p){ops.BITir(p, 4, 'C');},
    0x62: function(p){ops.BITir(p, 4, 'D');},
    0x63: function(p){ops.BITir(p, 4, 'E');},
    0x64: function(p){ops.BITir(p, 4, 'H');},
    0x65: function(p){ops.BITir(p, 4, 'L');},
    0x66: function(p){ops.BITirra(p, 4, 'H', 'L');},
    0x67: function(p){ops.BITir(p, 4, 'A');},
    0x68: function(p){ops.BITir(p, 5, 'B');},
    0x69: function(p){ops.BITir(p, 5, 'C');},
    0x6A: function(p){ops.BITir(p, 5, 'D');},
    0x6B: function(p){ops.BITir(p, 5, 'E');},
    0x6C: function(p){ops.BITir(p, 5, 'H');},
    0x6D: function(p){ops.BITir(p, 5, 'L');},
    0x6E: function(p){ops.BITirra(p, 5, 'H', 'L');},
    0x6F: function(p){ops.BITir(p, 5, 'A');},

    0x70: function(p){ops.BITir(p, 6, 'B');},
    0x71: function(p){ops.BITir(p, 6, 'C');},
    0x72: function(p){ops.BITir(p, 6, 'D');},
    0x73: function(p){ops.BITir(p, 6, 'E');},
    0x74: function(p){ops.BITir(p, 6, 'H');},
    0x75: function(p){ops.BITir(p, 6, 'L');},
    0x76: function(p){ops.BITirra(p, 6, 'H', 'L');},
    0x77: function(p){ops.BITir(p, 6, 'A');},
    0x78: function(p){ops.BITir(p, 7, 'B');},
    0x79: function(p){ops.BITir(p, 7, 'C');},
    0x7A: function(p){ops.BITir(p, 7, 'D');},
    0x7B: function(p){ops.BITir(p, 7, 'E');},
    0x7C: function(p){ops.BITir(p, 7, 'H');},
    0x7D: function(p){ops.BITir(p, 7, 'L');},
    0x7E: function(p){ops.BITirra(p, 7, 'H', 'L');},
    0x7F: function(p){ops.BITir(p, 7, 'A');},

    0x80: function(p){ops.RESir(p, 0, 'B');},
    0x81: function(p){ops.RESir(p, 0, 'C');},
    0x82: function(p){ops.RESir(p, 0, 'D');},
    0x83: function(p){ops.RESir(p, 0, 'E');},
    0x84: function(p){ops.RESir(p, 0, 'H');},
    0x85: function(p){ops.RESir(p, 0, 'L');},
    0x86: function(p){ops.RESirra(p, 0, 'H', 'L');},
    0x87: function(p){ops.RESir(p, 0, 'A');},
    0x88: function(p){ops.RESir(p, 1, 'B');},
    0x89: function(p){ops.RESir(p, 1, 'C');},
    0x8A: function(p){ops.RESir(p, 1, 'D');},
    0x8B: function(p){ops.RESir(p, 1, 'E');},
    0x8C: function(p){ops.RESir(p, 1, 'H');},
    0x8D: function(p){ops.RESir(p, 1, 'L');},
    0x8E: function(p){ops.RESirra(p, 1, 'H', 'L');},
    0x8F: function(p){ops.RESir(p, 1, 'A');},

    0x90: function(p){ops.RESir(p, 2, 'B');},
    0x91: function(p){ops.RESir(p, 2, 'C');},
    0x92: function(p){ops.RESir(p, 2, 'D');},
    0x93: function(p){ops.RESir(p, 2, 'E');},
    0x94: function(p){ops.RESir(p, 2, 'H');},
    0x95: function(p){ops.RESir(p, 2, 'L');},
    0x96: function(p){ops.RESirra(p, 2, 'H', 'L');},
    0x97: function(p){ops.RESir(p, 2, 'A');},
    0x98: function(p){ops.RESir(p, 3, 'B');},
    0x99: function(p){ops.RESir(p, 3, 'C');},
    0x9A: function(p){ops.RESir(p, 3, 'D');},
    0x9B: function(p){ops.RESir(p, 3, 'E');},
    0x9C: function(p){ops.RESir(p, 3, 'H');},
    0x9D: function(p){ops.RESir(p, 3, 'L');},
    0x9E: function(p){ops.RESirra(p, 3, 'H', 'L');},
    0x9F: function(p){ops.RESir(p, 3, 'A');},

    0xA0: function(p){ops.RESir(p, 4, 'B');},
    0xA1: function(p){ops.RESir(p, 4, 'C');},
    0xA2: function(p){ops.RESir(p, 4, 'D');},
    0xA3: function(p){ops.RESir(p, 4, 'E');},
    0xA4: function(p){ops.RESir(p, 4, 'H');},
    0xA5: function(p){ops.RESir(p, 4, 'L');},
    0xA6: function(p){ops.RESirra(p, 4, 'H', 'L');},
    0xA7: function(p){ops.RESir(p, 4, 'A');},
    0xA8: function(p){ops.RESir(p, 5, 'B');},
    0xA9: function(p){ops.RESir(p, 5, 'C');},
    0xAA: function(p){ops.RESir(p, 5, 'D');},
    0xAB: function(p){ops.RESir(p, 5, 'E');},
    0xAC: function(p){ops.RESir(p, 5, 'H');},
    0xAD: function(p){ops.RESir(p, 5, 'L');},
    0xAE: function(p){ops.RESirra(p, 5, 'H', 'L');},
    0xAF: function(p){ops.RESir(p, 5, 'A');},

    0xB0: function(p){ops.RESir(p, 6, 'B');},
    0xB1: function(p){ops.RESir(p, 6, 'C');},
    0xB2: function(p){ops.RESir(p, 6, 'D');},
    0xB3: function(p){ops.RESir(p, 6, 'E');},
    0xB4: function(p){ops.RESir(p, 6, 'H');},
    0xB5: function(p){ops.RESir(p, 6, 'L');},
    0xB6: function(p){ops.RESirra(p, 6, 'H', 'L');},
    0xB7: function(p){ops.RESir(p, 6, 'A');},
    0xB8: function(p){ops.RESir(p, 7, 'B');},
    0xB9: function(p){ops.RESir(p, 7, 'C');},
    0xBA: function(p){ops.RESir(p, 7, 'D');},
    0xBB: function(p){ops.RESir(p, 7, 'E');},
    0xBC: function(p){ops.RESir(p, 7, 'H');},
    0xBD: function(p){ops.RESir(p, 7, 'L');},
    0xBE: function(p){ops.RESirra(p, 7, 'H', 'L');},
    0xBF: function(p){ops.RESir(p, 7, 'A');},

    0xC0: function(p){ops.SETir(p, 0, 'B');},
    0xC1: function(p){ops.SETir(p, 0, 'C');},
    0xC2: function(p){ops.SETir(p, 0, 'D');},
    0xC3: function(p){ops.SETir(p, 0, 'E');},
    0xC4: function(p){ops.SETir(p, 0, 'H');},
    0xC5: function(p){ops.SETir(p, 0, 'L');},
    0xC6: function(p){ops.SETirra(p, 0, 'H', 'L');},
    0xC7: function(p){ops.SETir(p, 0, 'A');},
    0xC8: function(p){ops.SETir(p, 1, 'B');},
    0xC9: function(p){ops.SETir(p, 1, 'C');},
    0xCA: function(p){ops.SETir(p, 1, 'D');},
    0xCB: function(p){ops.SETir(p, 1, 'E');},
    0xCC: function(p){ops.SETir(p, 1, 'H');},
    0xCD: function(p){ops.SETir(p, 1, 'L');},
    0xCE: function(p){ops.SETirra(p, 1, 'H', 'L');},
    0xCF: function(p){ops.SETir(p, 1, 'A');},

    0xD0: function(p){ops.SETir(p, 2, 'B');},
    0xD1: function(p){ops.SETir(p, 2, 'C');},
    0xD2: function(p){ops.SETir(p, 2, 'D');},
    0xD3: function(p){ops.SETir(p, 2, 'E');},
    0xD4: function(p){ops.SETir(p, 2, 'H');},
    0xD5: function(p){ops.SETir(p, 2, 'L');},
    0xD6: function(p){ops.SETirra(p, 2, 'H', 'L');},
    0xD7: function(p){ops.SETir(p, 2, 'A');},
    0xD8: function(p){ops.SETir(p, 3, 'B');},
    0xD9: function(p){ops.SETir(p, 3, 'C');},
    0xDA: function(p){ops.SETir(p, 3, 'D');},
    0xDB: function(p){ops.SETir(p, 3, 'E');},
    0xDC: function(p){ops.SETir(p, 3, 'H');},
    0xDD: function(p){ops.SETir(p, 3, 'L');},
    0xDE: function(p){ops.SETirra(p, 3, 'H', 'L');},
    0xDF: function(p){ops.SETir(p, 3, 'A');},

    0xE0: function(p){ops.SETir(p, 4, 'B');},
    0xE1: function(p){ops.SETir(p, 4, 'C');},
    0xE2: function(p){ops.SETir(p, 4, 'D');},
    0xE3: function(p){ops.SETir(p, 4, 'E');},
    0xE4: function(p){ops.SETir(p, 4, 'H');},
    0xE5: function(p){ops.SETir(p, 4, 'L');},
    0xE6: function(p){ops.SETirra(p, 4, 'H', 'L');},
    0xE7: function(p){ops.SETir(p, 4, 'A');},
    0xE8: function(p){ops.SETir(p, 5, 'B');},
    0xE9: function(p){ops.SETir(p, 5, 'C');},
    0xEA: function(p){ops.SETir(p, 5, 'D');},
    0xEB: function(p){ops.SETir(p, 5, 'E');},
    0xEC: function(p){ops.SETir(p, 5, 'H');},
    0xED: function(p){ops.SETir(p, 5, 'L');},
    0xEE: function(p){ops.SETirra(p, 5, 'H', 'L');},
    0xEF: function(p){ops.SETir(p, 5, 'A');},

    0xF0: function(p){ops.SETir(p, 6, 'B');},
    0xF1: function(p){ops.SETir(p, 6, 'C');},
    0xF2: function(p){ops.SETir(p, 6, 'D');},
    0xF3: function(p){ops.SETir(p, 6, 'E');},
    0xF4: function(p){ops.SETir(p, 6, 'H');},
    0xF5: function(p){ops.SETir(p, 6, 'L');},
    0xF6: function(p){ops.SETirra(p, 6, 'H', 'L');},
    0xF7: function(p){ops.SETir(p, 6, 'A');},
    0xF8: function(p){ops.SETir(p, 7, 'B');},
    0xF9: function(p){ops.SETir(p, 7, 'C');},
    0xFA: function(p){ops.SETir(p, 7, 'D');},
    0xFB: function(p){ops.SETir(p, 7, 'E');},
    0xFC: function(p){ops.SETir(p, 7, 'H');},
    0xFD: function(p){ops.SETir(p, 7, 'L');},
    0xFE: function(p){ops.SETirra(p, 7, 'H', 'L');},
    0xFF: function(p){ops.SETir(p, 7, 'A');}
};
GameboyJS.opcodeMap = map;
GameboyJS.opcodeCbmap = cbmap;
}(GameboyJS || (GameboyJS = {})));

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
        e.target.classList.add('drag-active');
    });
    this.dropElement.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.target.classList.remove('drag-active');
    });
    this.dropElement.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    this.dropElement.addEventListener('drop', function (e) {
        e.target.classList.remove('drag-active');
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

var GameboyJS;
(function (GameboyJS) {
"use strict";

// Audio Processing unit
// Listens the write accesses to the audio-reserved memory addresses
// and dispatches the data to the sound channels
var APU = function(memory) {
    this.memory = memory;
    this.enabled = false;

    AudioContext = window.AudioContext || window.webkitAudioContext;
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

var GameboyJS;
(function (GameboyJS) {
"use strict";
var Channel1 = function(apu, channelNumber, audioContext) {
    this.apu = apu;
    this.channelNumber = channelNumber;
    this.playing = false;

    this.soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    this.soundLength = 64; // defaults to 64 periods
    this.lengthCheck = false;

    this.sweepTime = 0; // from 0 to 7
    this.sweepStepLength = 0x8000; // 1 / 128 seconds of instructions
    this.sweepCount = 0;
    this.sweepShifts = 0;
    this.sweepSign = 1; // +1 / -1 for increase / decrease freq

    this.frequency = 0;

    this.envelopeStep = 0;
    this.envelopeStepLength = 0x10000;// 1 / 64 seconds of instructions
    this.envelopeCheck = false;
    this.envelopeSign = 1;

    this.clockLength = 0;
    this.clockEnvelop = 0;
    this.clockSweep = 0;

    var gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    var oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = 1000;
    oscillator.connect(gainNode);
    oscillator.start(0);

    this.audioContext = audioContext;
    this.gainNode = gainNode;
    this.oscillator = oscillator;
};

Channel1.prototype.play = function() {
    if (this.playing) return;
    this.playing = true;
    this.apu.setSoundFlag(this.channelNumber, 1);
    this.gainNode.connect(this.audioContext.destination);
    this.clockLength = 0;
    this.clockEnvelop = 0;
    this.clockSweep = 0;
    if (this.sweepShifts > 0) this.checkFreqSweep();
};
Channel1.prototype.stop = function() {
    this.playing = false;
    this.apu.setSoundFlag(this.channelNumber, 0);
    this.gainNode.disconnect();
};
Channel1.prototype.checkFreqSweep = function() {
    var oldFreq = this.getFrequency();
    var newFreq = oldFreq + this.sweepSign * (oldFreq >> this.sweepShifts);
    if (newFreq > 0x7FF) {
        newFreq = 0;
        this.stop();
    }

    return newFreq;
};
Channel1.prototype.update = function(clockElapsed) {
    this.clockEnvelop += clockElapsed;
    this.clockSweep   += clockElapsed;

    if ((this.sweepCount || this.sweepTime) && this.clockSweep > (this.sweepStepLength * this.sweepTime)) {
        this.clockSweep -= (this.sweepStepLength * this.sweepTime);
        this.sweepCount--;

        var newFreq = this.checkFreqSweep(); // process and check new freq

        this.apu.memory[0xFF13] = newFreq & 0xFF;
        this.apu.memory[0xFF14] &= 0xF8;
        this.apu.memory[0xFF14] |= (newFreq & 0x700) >> 8;
        this.setFrequency(newFreq);

        this.checkFreqSweep(); // check again with new value
    }

    if (this.envelopeCheck && this.clockEnvelop > this.envelopeStepLength) {
        this.clockEnvelop -= this.envelopeStepLength;
        this.envelopeStep--;
        this.setEnvelopeVolume(this.envelopeVolume + this.envelopeSign);
        if (this.envelopeStep <= 0) {
            this.envelopeCheck = false;
        }
    }

    if (this.lengthCheck) {
        this.clockLength += clockElapsed;
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
Channel1.prototype.setFrequency = function(value) {
    this.frequency = value;
    this.oscillator.frequency.value = 131072 / (2048 - this.frequency);
};
Channel1.prototype.getFrequency = function() {
    return this.frequency;
};
Channel1.prototype.setLength = function(value) {
    this.soundLength = 64 - (value & 0x3F);
};
Channel1.prototype.setEnvelopeVolume = function(volume) {
    this.envelopeCheck = volume > 0 && volume < 16 ? true : false;
    this.envelopeVolume = volume;
    this.gainNode.gain.value = this.envelopeVolume * 1/100;
};
Channel1.prototype.disable = function() {
    this.oscillator.disconnect();
};
Channel1.prototype.enable = function() {
    this.oscillator.connect(this.gainNode);
};
GameboyJS.Channel1 = Channel1;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";
var Channel3 = function(apu, channelNumber, audioContext) {
    this.apu = apu;
    this.channelNumber = channelNumber;
    this.playing = false;

    this.soundLength = 0;
    this.soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    this.lengthCheck = false;

    this.clockLength = 0;

    this.buffer = new Float32Array(32);

    var gainNode = audioContext.createGain();
    gainNode.gain.value = 1;
    this.gainNode = gainNode;

    this.baseSpeed = 65536;
    var waveBuffer = audioContext.createBuffer(1, 32, this.baseSpeed);

    var bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = waveBuffer;
    bufferSource.loop = true;
    bufferSource.connect(gainNode);
    bufferSource.start(0);

    this.audioContext = audioContext;
    this.waveBuffer = waveBuffer;
    this.bufferSource = bufferSource;

};
Channel3.prototype.play = function() {
    if (this.playing) return;
    this.playing = true;
    this.apu.setSoundFlag(this.channelNumber, 1);
    this.waveBuffer.copyToChannel(this.buffer, 0, 0);

    this.gainNode.connect(this.audioContext.destination);
    this.clockLength = 0;
};
Channel3.prototype.stop = function() {
    this.playing = false;
    this.apu.setSoundFlag(this.channelNumber, 0);
    this.gainNode.disconnect();
};
Channel3.prototype.update = function(clockElapsed) {
    if (this.lengthCheck){
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
Channel3.prototype.setFrequency = function(value) {
    value = 65536 / (2048  - value);
    this.bufferSource.playbackRate.value = value / this.baseSpeed;
};
Channel3.prototype.getFrequency = function() {
    var freq = 2048 - 65536 / (this.bufferSource.playbackRate.value * this.baseSpeed);
    return freq | 1;
};
Channel3.prototype.setLength = function(value) {
    this.soundLength = 256 - value;
};
Channel3.prototype.setWaveBufferByte = function(index, value) {
    var bufferIndex = index * 2;

    this.buffer[bufferIndex]   = (value >> 4) / 8 - 1; // value in buffer is in -1 -> 1
    this.buffer[bufferIndex+1] = (value & 0x0F) / 8 - 1;
};
Channel3.prototype.disable = function() {
    this.bufferSource.disconnect();
};
Channel3.prototype.enable = function() {
    this.bufferSource.connect(this.gainNode);
};
GameboyJS.Channel3 = Channel3;
}(GameboyJS || (GameboyJS = {})));

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

var GameboyJS;
(function (GameboyJS) {
"use strict";

var Timer = function(cpu, memory) {
    this.cpu    = cpu;
    this.memory = memory;

    this.DIV  = 0xFF04;
    this.TIMA = 0xFF05;
    this.TMA  = 0xFF06;
    this.TAC  = 0xFF07;

    this.mainTime  = 0;
    this.divTime   = 0;
};

Timer.prototype.update = function(clockElapsed) {
    this.updateDiv(clockElapsed);
    this.updateTimer(clockElapsed);
};

Timer.prototype.updateTimer = function(clockElapsed) {
    if (!(this.memory.rb(this.TAC) & 0x4)) {
        return;
    }
    this.mainTime += clockElapsed;

    var threshold = 64;
    switch (this.memory.rb(this.TAC) & 3) {
        case 0: threshold=64; break; // 4KHz
        case 1: threshold=1;  break; // 256KHz
        case 2: threshold=4;  break; // 64KHz
        case 3: threshold=16; break; // 16KHz
    }
    threshold *= 16;

    while (this.mainTime >= threshold) {
        this.mainTime -= threshold;

        this.memory.wb(this.TIMA, this.memory.rb(this.TIMA) + 1);
        if (this.memory.rb(this.TIMA) > 0xFF) {
            this.memory.wb(this.TIMA, this.memory.rb(this.TMA));
            this.cpu.requestInterrupt(GameboyJS.CPU.INTERRUPTS.TIMER);
        }
    }
};
// Update the DIV register internal clock
// Increment it if the clock threshold is elapsed and
// reset it if its value overflows
Timer.prototype.updateDiv = function(clockElapsed) {
    var divThreshold = 256; // DIV is 16KHz
    this.divTime += clockElapsed;
    if (this.divTime > divThreshold) {
        this.divTime -= divThreshold;
        var div = this.memory.rb(this.DIV) + 1;
        this.memory.wb(this.DIV, div&0xFF);
    }
};

Timer.prototype.resetDiv = function() {
    this.divTime = 0;
    this.memory[this.DIV] = 0; // direct write to avoid looping
};
GameboyJS.Timer = Timer;
}(GameboyJS || (GameboyJS = {})));

var GameboyJS;
(function (GameboyJS) {
"use strict";

// Utility functions
var Util = {
    // Add to the first argument the properties of all other arguments
    extend: function(target /*, source1, source2, etc. */) {
        var sources = Array.prototype.slice.call(arguments);
        for (var i in sources) {
            var source = sources[i];
            for (var name in source) {
                target[name] = source[name];
            }
        }

        return target;
    },
    testFlag: function(p, cc) {
        var test=1;
        var mask=0x10;
        if (cc=='NZ'||cc=='NC') test=0;
        if (cc=='NZ'||cc=='Z')  mask=0x80;
        return (test && p.r.F&mask) || (!test && !(p.r.F&mask));
    },
    getRegAddr: function(p, r1, r2) {return Util.makeword(p.r[r1], p.r[r2]);},

    // make a 16 bits word from 2 bytes
    makeword: function(b1, b2) {return (b1 << 8) + b2;},

    // return the integer signed value of a given byte
    getSignedValue: function(v) {return v & 0x80 ? v-256 : v;},

    // extract a bit from a byte
    readBit: function(byte, index) {
        return (byte >> index) & 1;
    }
};

GameboyJS.Util = Util;
}(GameboyJS || (GameboyJS = {})));
