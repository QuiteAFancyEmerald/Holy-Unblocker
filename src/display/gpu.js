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
