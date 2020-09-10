"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceGraphicsRenderer(coreExposed, skippingBIOS) {
    this.coreExposed = coreExposed;
    this.initializeIO(!!skippingBIOS);
    this.initializePaletteStorage();
    this.generateRenderers();
    this.initializeRenderers();
}
function GameBoyAdvanceGraphicsRendererOffthread(skippingBIOS) {
    this.initializeIO(!!skippingBIOS);
    this.initializePaletteStorage();
    this.generateRenderers();
    this.initializeRenderers();
}
if (__VIEWS_SUPPORTED__) {
    GameBoyAdvanceGraphicsRendererOffthread.prototype.initializeIO = GameBoyAdvanceGraphicsRenderer.prototype.initializeIO = function (skippingBIOS) {
        //Initialize Pre-Boot:
        this.displayControl = 0x80;
        this.display = 0;
        this.greenSwap = 0;
        this.WINOutside = 0;
        this.paletteRAM = getUint8Array(0x400);
        this.VRAM = getUint8Array(0x18000);
        this.VRAM16 = getUint16View(this.VRAM);
        this.VRAM32 = getInt32View(this.VRAM);
        this.paletteRAM16 = getUint16View(this.paletteRAM);
        this.paletteRAM32 = getInt32View(this.paletteRAM);
        //Check for SIMD support:
        if (typeof SIMD == "object" && typeof SIMD.Int32x4 == "function") {
            //We bounce effects logic through some copies:
            this.buffer = getInt32Array(0x900);
        }
        else {
            this.buffer = getInt32Array(0x680);
        }
        this.lineBuffer = getInt32ViewCustom(this.buffer, 0, 240);
        this.frameBuffer = getInt32Array(38400);        //The internal buffer to composite to.
        this.swizzledFrame = getUint8Array(115200);     //The swizzled output buffer that syncs to the internal framebuffer on v-blank.
        this.totalLinesPassed = 0;
        this.queuedScanLines = 0;
        this.lastUnrenderedLine = 0;
        if (skippingBIOS) {
            //BIOS entered the ROM at line 0x7C:
            this.lastUnrenderedLine = 0x7C;
        }
        this.backdrop = 0x3A00000;
    }
}
else {
    GameBoyAdvanceGraphicsRendererOffthread.prototype.initializeIO = GameBoyAdvanceGraphicsRenderer.prototype.initializeIO = function (skippingBIOS) {
        //Initialize Pre-Boot:
        this.displayControl = 0x80;
        this.display = 0;
        this.greenSwap = 0;
        this.WINOutside = 0;
        this.paletteRAM = getUint8Array(0x400);
        this.VRAM = getUint8Array(0x18000);
        this.VRAM16 = getUint16View(this.VRAM);
        this.VRAM32 = getInt32View(this.VRAM);
        this.paletteRAM16 = getUint16View(this.paletteRAM);
        this.paletteRAM32 = getInt32View(this.paletteRAM);
        this.buffer = getInt32Array(0x680);
        this.frameBuffer = getInt32Array(38400);        //The internal buffer to composite to.
        this.swizzledFrame = getUint8Array(115200);     //The swizzled output buffer that syncs to the internal framebuffer on v-blank.
        this.totalLinesPassed = 0;
        this.queuedScanLines = 0;
        this.lastUnrenderedLine = 0;
        if (skippingBIOS) {
            //BIOS entered the ROM at line 0x7C:
            this.lastUnrenderedLine = 0x7C;
        }
        this.backdrop = 0x3A00000;
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.generateRenderers = GameBoyAdvanceGraphicsRenderer.prototype.generateRenderers = function () {
    this.compositor = new GameBoyAdvanceCompositor(this);
    this.bg0Renderer = new GameBoyAdvanceBGTEXTRenderer(this, 0);
    this.bg1Renderer = new GameBoyAdvanceBGTEXTRenderer(this, 1);
    this.bg2TextRenderer = new GameBoyAdvanceBGTEXTRenderer(this, 2);
    this.bg3TextRenderer = new GameBoyAdvanceBGTEXTRenderer(this, 3);
    this.bgAffineRenderer0 = new GameBoyAdvanceAffineBGRenderer(this, 2);
    this.bgAffineRenderer1 = new GameBoyAdvanceAffineBGRenderer(this, 3);
    this.bg2MatrixRenderer = new GameBoyAdvanceBGMatrixRenderer(this);
    this.bg3MatrixRenderer = new GameBoyAdvanceBGMatrixRenderer(this);
    this.bg2FrameBufferRenderer = new GameBoyAdvanceBG2FrameBufferRenderer(this);
    this.objRenderer = new GameBoyAdvanceOBJRenderer(this);
    this.window0Renderer = new GameBoyAdvanceWindowRenderer(new GameBoyAdvanceWindowCompositor(this));
    this.window1Renderer = new GameBoyAdvanceWindowRenderer(new GameBoyAdvanceWindowCompositor(this));
    this.objWindowRenderer = new GameBoyAdvanceOBJWindowRenderer(new GameBoyAdvanceOBJWindowCompositor(this));
    this.mosaicRenderer = new GameBoyAdvanceMosaicRenderer(this.buffer);
    this.colorEffectsRenderer = new GameBoyAdvanceColorEffectsRenderer(this.buffer);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.initializeRenderers = GameBoyAdvanceGraphicsRenderer.prototype.initializeRenderers = function () {
    this.compositor.initialize();
    this.compositorPreprocess();
    this.bg0Renderer.initialize();
    this.bg1Renderer.initialize();
    this.bg2TextRenderer.initialize();
    this.bg3TextRenderer.initialize();
    this.bgAffineRenderer0.initialize();
    this.bgAffineRenderer1.initialize();
    this.bg2MatrixRenderer.initialize();
    this.bg3MatrixRenderer.initialize();
    this.bg2FrameBufferRenderer.initialize();
    this.objRenderer.initialize();
    this.window0Renderer.initialize();
    this.window1Renderer.initialize();
    this.objWindowRenderer.initialize();
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.initializePaletteStorage = GameBoyAdvanceGraphicsRenderer.prototype.initializePaletteStorage = function () {
    //Both BG and OAM in unified storage:
    this.palette256 = getInt32Array(0x100);
    this.palette256[0] = 0x3800000;
    this.paletteOBJ256 = getInt32Array(0x100);
    this.paletteOBJ256[0] = 0x3800000;
    this.palette16 = getInt32Array(0x100);
    this.paletteOBJ16 = getInt32Array(0x100);
    for (var index = 0; (index | 0) < 0x10; index = ((index | 0) + 1) | 0) {
        this.palette16[index << 4] = 0x3800000;
        this.paletteOBJ16[index << 4] = 0x3800000;
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.swizzleFrameBuffer = GameBoyAdvanceGraphicsRenderer.prototype.swizzleFrameBuffer = function () {
    //Convert our dirty 15-bit (15-bit, with internal render flags above it) framebuffer to an 8-bit buffer with separate indices for the RGB channels:
    var bufferIndex = 0;
    for (var canvasIndex = 0; (canvasIndex | 0) < 115200; bufferIndex = ((bufferIndex | 0) + 1) | 0) {
        this.swizzledFrame[canvasIndex | 0] = (this.frameBuffer[bufferIndex | 0] & 0x1F) << 3;      //Red
        canvasIndex = ((canvasIndex | 0) + 1) | 0;
        this.swizzledFrame[canvasIndex | 0] = (this.frameBuffer[bufferIndex | 0] & 0x3E0) >> 2;     //Green
        canvasIndex = ((canvasIndex | 0) + 1) | 0;
        this.swizzledFrame[canvasIndex | 0] = (this.frameBuffer[bufferIndex | 0] & 0x7C00) >> 7;    //Blue
        canvasIndex = ((canvasIndex | 0) + 1) | 0;
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.prepareFrame = GameBoyAdvanceGraphicsRenderer.prototype.prepareFrame = function () {
    //Copy the internal frame buffer to the output buffer:
    this.swizzleFrameBuffer();
    this.requestDraw();
}
GameBoyAdvanceGraphicsRenderer.prototype.requestDraw = function () {
    if (this.coreExposed.graphicsHandle) {
        //We actually updated the graphics internally, so copy out:
        this.coreExposed.graphicsHandle.copyBuffer(this.swizzledFrame);
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.requestDraw = function () {
    //We actually updated the graphics internally, so copy out:
    copyBuffer(this.swizzledFrame);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.graphicsJIT = function () {
    //Not needed for offthread rendering.
}
GameBoyAdvanceGraphicsRenderer.prototype.graphicsJIT = function () {
    this.totalLinesPassed = 0;            //Mark frame for ensuring a JIT pass for the next framebuffer output.
    this.graphicsJITScanlineGroup();
}
GameBoyAdvanceGraphicsRenderer.prototype.graphicsJITVBlank = function () {
    //JIT the graphics to v-blank framing:
    this.totalLinesPassed = ((this.totalLinesPassed | 0) + (this.queuedScanLines | 0)) | 0;
    this.graphicsJITScanlineGroup();
}
GameBoyAdvanceGraphicsRenderer.prototype.graphicsJITScanlineGroup = function () {
    //Normal rendering JIT, where we try to do groups of scanlines at once:
    while ((this.queuedScanLines | 0) > 0) {
        this.renderScanLine();
        this.incrementScanLine();
        this.queuedScanLines = ((this.queuedScanLines | 0) - 1) | 0;
    }
}
GameBoyAdvanceGraphicsRenderer.prototype.incrementScanLineQueue = function () {
    if ((this.queuedScanLines | 0) < 160) {
        this.queuedScanLines = ((this.queuedScanLines | 0) + 1) | 0;
    }
    else {
        this.incrementScanLine();
    }
}
GameBoyAdvanceGraphicsRenderer.prototype.ensureFraming = function () {
    //Ensure JIT framing alignment:
    if ((this.totalLinesPassed | 0) < 160) {
        //Make sure our gfx are up-to-date:
        this.graphicsJITVBlank();
        //Draw the frame:
        this.prepareFrame();
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.renderScanLine = GameBoyAdvanceGraphicsRenderer.prototype.renderScanLine = function () {
    var line = this.lastUnrenderedLine | 0;
    if ((this.displayControl & 0x80) == 0) {
        //Render with the current mode selected:
        switch (this.displayControl & 0x7) {
            case 0:
                //Mode 0:
                this.renderMode0(line | 0);
                break;
            case 1:
                //Mode 1:
                this.renderMode1(line | 0);
                break;
            case 2:
                //Mode 2:
                this.renderMode2(line | 0);
                break;
            default:
                //Modes 3-5:
                this.renderModeFrameBuffer(line | 0);
        }
        //Copy line to our framebuffer:
        this.copyLineToFrameBuffer(line | 0);
    }
    else {
        //Forced blank is on, rendering disabled:
        this.renderForcedBlank(line | 0);
    }
    //Update the affine bg counters:
    this.updateReferenceCounters();
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.incrementScanLine = GameBoyAdvanceGraphicsRenderer.prototype.incrementScanLine = function () {
    if ((this.lastUnrenderedLine | 0) < 159) {
        this.lastUnrenderedLine = ((this.lastUnrenderedLine | 0) + 1) | 0;
    }
    else {
        this.lastUnrenderedLine = 0;
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.renderMode0 = GameBoyAdvanceGraphicsRenderer.prototype.renderMode0 = function (line) {
    line = line | 0;
    //Mode 0 Rendering Selected:
    var toRender = this.display & 0x1F;
    if ((toRender & 0x1) != 0) {
        //Render the BG0 layer:
        this.bg0Renderer.renderScanLine(line | 0);
    }
    if ((toRender & 0x2) != 0) {
        //Render the BG1 layer:
        this.bg1Renderer.renderScanLine(line | 0);
    }
    if ((toRender & 0x4) != 0) {
        //Render the BG2 layer:
        this.bg2TextRenderer.renderScanLine(line | 0);
    }
    if ((toRender & 0x8) != 0) {
        //Render the BG3 layer:
        this.bg3TextRenderer.renderScanLine(line | 0);
    }
    if ((toRender & 0x10) != 0) {
        //Render the sprite layer:
        this.objRenderer.renderScanLine(line | 0);
    }
    //Composite the non-windowed result:
    this.compositeLayers(toRender | 0);
    //Composite the windowed result:
    this.compositeWindowedLayers(line | 0, toRender | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.renderMode1 = GameBoyAdvanceGraphicsRenderer.prototype.renderMode1 = function (line) {
    line = line | 0;
    //Mode 1 Rendering Selected:
    var toRender = this.display & 0x17;
    if ((toRender & 0x1) != 0) {
        //Render the BG0 layer:
        this.bg0Renderer.renderScanLine(line | 0);
    }
    if ((toRender & 0x2) != 0) {
        //Render the BG1 layer:
        this.bg1Renderer.renderScanLine(line | 0);
    }
    if ((toRender & 0x4) != 0) {
        //Render the BG2 layer:
        this.bgAffineRenderer0.renderScanLine2M(line | 0);
    }
    if ((toRender & 0x10) != 0) {
        //Render the sprite layer:
        this.objRenderer.renderScanLine(line | 0);
    }
    //Composite the non-windowed result:
    this.compositeLayers(toRender | 0);
    //Composite the windowed result:
    this.compositeWindowedLayers(line | 0, toRender | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.renderMode2 = GameBoyAdvanceGraphicsRenderer.prototype.renderMode2 = function (line) {
    line = line | 0;
    //Mode 2 Rendering Selected:
    var toRender = this.display & 0x1C;
    if ((toRender & 0x4) != 0) {
        //Render the BG2 layer:
        this.bgAffineRenderer0.renderScanLine2M(line | 0);
    }
    if ((toRender & 0x8) != 0) {
        //Render the BG3 layer:
        this.bgAffineRenderer1.renderScanLine3M(line | 0);
    }
    if ((toRender & 0x10) != 0) {
        //Render the sprite layer:
        this.objRenderer.renderScanLine(line | 0);
    }
    //Composite the non-windowed result:
    this.compositeLayers(toRender | 0);
    //Composite the windowed result:
    this.compositeWindowedLayers(line | 0, toRender | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.renderModeFrameBuffer = GameBoyAdvanceGraphicsRenderer.prototype.renderModeFrameBuffer = function (line) {
    line = line | 0;
    //Mode 3/4/5 Rendering Selected:
    var toRender = this.display & 0x14;
    if ((toRender & 0x4) != 0) {
        this.bgAffineRenderer0.renderScanLine2F(line | 0);
    }
    if ((toRender & 0x10) != 0) {
        //Render the sprite layer:
        this.objRenderer.renderScanLine(line | 0);
    }
    //Composite the non-windowed result:
    this.compositeLayers(toRender | 0);
    //Composite the windowed result:
    this.compositeWindowedLayers(line | 0, toRender | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.compositeLayers = GameBoyAdvanceGraphicsRenderer.prototype.compositeLayers = function (toRender) {
    toRender = toRender | 0;
    if ((this.display & 0xE0) > 0) {
        //Window registers can further disable background layers if one or more window layers enabled:
        toRender = toRender & this.WINOutside;
    }
    //Composite the non-windowed result:
    this.compositor.renderScanLine(toRender | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.compositeWindowedLayers = GameBoyAdvanceGraphicsRenderer.prototype.compositeWindowedLayers = function (line, toRender) {
    line = line | 0;
    toRender = toRender | 0;
    //Composite the windowed result:
    if ((this.display & 0x90) == 0x90) {
        //Object Window:
        this.objWindowRenderer.renderScanLine(line | 0, toRender | 0);
    }
    if ((this.display & 0x40) != 0) {
        //Window 1:
        this.window1Renderer.renderScanLine(line | 0, toRender | 0);
    }
    if ((this.display & 0x20) != 0) {
        //Window 0:
        this.window0Renderer.renderScanLine(line | 0, toRender | 0);
    }
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceGraphicsRendererOffthread.prototype.copyLineToFrameBuffer = GameBoyAdvanceGraphicsRenderer.prototype.copyLineToFrameBuffer = function (line) {
        line = line | 0;
        var offsetStart = Math.imul(line | 0, 240) | 0;
        if ((this.greenSwap | 0) == 0) {
            //Blit normally:
            this.copyLineToFrameBufferNormal(offsetStart | 0);
        }
        else {
            //Blit with green swap:
            this.copyLineToFrameBufferGreenSwapped(offsetStart | 0);
        }
    }
    if (__LITTLE_ENDIAN__ && typeof Uint8Array.prototype.fill == "function") {
        GameBoyAdvanceGraphicsRendererOffthread.prototype.renderForcedBlank = GameBoyAdvanceGraphicsRenderer.prototype.renderForcedBlank = function (line) {
            line = line | 0;
            var offsetStart = Math.imul(line | 0, 240) | 0;
            //Render a blank line:
            var offsetEnd = ((offsetStart | 0) + 240) | 0;
            this.frameBuffer.fill(0x7FFF, offsetStart | 0, offsetEnd | 0);
        }
    }
    else {
        GameBoyAdvanceGraphicsRendererOffthread.prototype.renderForcedBlank = GameBoyAdvanceGraphicsRenderer.prototype.renderForcedBlank = function (line) {
            line = line | 0;
            var offsetStart = Math.imul(line | 0, 240) | 0;
            //Render a blank line:
            for (var position = 0; (position | 0) < 240; position = ((position | 0) + 1) | 0) {
                this.frameBuffer[offsetStart | 0] = 0x7FFF;
                offsetStart = ((offsetStart | 0) + 1) | 0;
            }
        }
    }
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceGraphicsRendererOffthread.prototype.copyLineToFrameBuffer = GameBoyAdvanceGraphicsRenderer.prototype.copyLineToFrameBuffer = function (line) {
        var offsetStart = line * 240;
        if (this.greenSwap == 0) {
            //Blit normally:
            this.copyLineToFrameBufferNormal(offsetStart);
        }
        else {
            //Blit with green swap:
            this.copyLineToFrameBufferGreenSwapped(offsetStart);
        }
    }
    GameBoyAdvanceGraphicsRendererOffthread.prototype.renderForcedBlank = GameBoyAdvanceGraphicsRenderer.prototype.renderForcedBlank = function (line) {
        var offsetStart = line * 240;
        //Render a blank line:
        for (var position = 0; position < 240; ++position) {
            this.frameBuffer[offsetStart++] = 0x7FFF;
        }
    }
}
if (__VIEWS_SUPPORTED__ && typeof Uint8Array.prototype.set == "function") {
    GameBoyAdvanceGraphicsRendererOffthread.prototype.copyLineToFrameBufferNormal = GameBoyAdvanceGraphicsRenderer.prototype.copyLineToFrameBufferNormal = function (offsetStart) {
        offsetStart = offsetStart | 0;
        //Render a line:
        this.frameBuffer.set(this.lineBuffer, offsetStart | 0);
    }
}
else {
    GameBoyAdvanceGraphicsRendererOffthread.prototype.copyLineToFrameBufferNormal = GameBoyAdvanceGraphicsRenderer.prototype.copyLineToFrameBufferNormal = function (offsetStart) {
        offsetStart = offsetStart | 0;
        //Render a line:
        for (var position = 0; (position | 0) < 240; position = ((position | 0) + 1) | 0) {
            this.frameBuffer[offsetStart | 0] = this.buffer[position | 0] | 0;
            offsetStart = ((offsetStart | 0) + 1) | 0;
        }
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.copyLineToFrameBufferGreenSwapped = GameBoyAdvanceGraphicsRenderer.prototype.copyLineToFrameBufferGreenSwapped = function (offsetStart) {
    offsetStart = offsetStart | 0;
    //Render a line with green swap effect:
    var position = 0;
    var pixel0 = 0;
    var pixel1 = 0;
    while ((position | 0) < 240) {
        pixel0 = this.buffer[position | 0] | 0;
        position = ((position | 0) + 1) | 0;
        pixel1 = this.buffer[position | 0] | 0;
        position = ((position | 0) + 1) | 0;
        this.frameBuffer[offsetStart | 0] = (pixel0 & 0x7C1F) | (pixel1 & 0x3E0);
        offsetStart = ((offsetStart | 0) + 1) | 0;
        this.frameBuffer[offsetStart | 0] = (pixel1 & 0x7C1F) | (pixel0 & 0x3E0);
        offsetStart = ((offsetStart | 0) + 1) | 0;
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.updateReferenceCounters = GameBoyAdvanceGraphicsRenderer.prototype.updateReferenceCounters = function () {
    if ((this.lastUnrenderedLine | 0) == 159) {
        //Reset some affine bg counters on roll-over to line 0:
        this.bgAffineRenderer0.resetReferenceCounters();
        this.bgAffineRenderer1.resetReferenceCounters();
    }
    else {
        //Increment the affine bg counters:
        this.bgAffineRenderer0.incrementReferenceCounters();
        this.bgAffineRenderer1.incrementReferenceCounters();
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.compositorPreprocess = GameBoyAdvanceGraphicsRenderer.prototype.compositorPreprocess = function () {
    var controlBits = this.WINOutside & 0x20;
    if ((this.display & 0xE0) == 0) {
        controlBits = controlBits | 1;
    }
    this.compositor.preprocess(controlBits | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.frameBufferModePreprocess = GameBoyAdvanceGraphicsRenderer.prototype.frameBufferModePreprocess = function (displayControl) {
    displayControl = displayControl | 0;
    displayControl = Math.min(displayControl & 0x7, 5) | 0;
    //Set up pixel fetcher ahead of time:
    if ((displayControl | 0) > 2) {
        this.bg2FrameBufferRenderer.selectMode(displayControl | 0);
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeDISPCNT8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeDISPCNT8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2FrameBufferRenderer.writeFrameSelect((data & 0x10) << 27);
    this.objRenderer.setHBlankIntervalFreeStatus(data & 0x20);
    this.frameBufferModePreprocess(data | 0);
    this.displayControl = data | 0;
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeDISPCNT8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeDISPCNT8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.display = data & 0xFF;
    this.compositorPreprocess();
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeDISPCNT8_2 = GameBoyAdvanceGraphicsRenderer.prototype.writeDISPCNT8_2 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.greenSwap = data & 0x01;
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeDISPCNT16 = GameBoyAdvanceGraphicsRenderer.prototype.writeDISPCNT16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2FrameBufferRenderer.writeFrameSelect((data & 0x10) << 27);
    this.objRenderer.setHBlankIntervalFreeStatus(data & 0x20);
    this.frameBufferModePreprocess(data | 0);
    this.displayControl = data | 0;
    this.display = data >> 8;
    this.compositorPreprocess();
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeDISPCNT32 = GameBoyAdvanceGraphicsRenderer.prototype.writeDISPCNT32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2FrameBufferRenderer.writeFrameSelect((data & 0x10) << 27);
    this.objRenderer.setHBlankIntervalFreeStatus(data & 0x20);
    this.frameBufferModePreprocess(data | 0);
    this.displayControl = data | 0;
    this.display = (data >> 8) & 0xFF;
    this.compositorPreprocess();
    this.greenSwap = data & 0x10000;
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0CNT8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0CNT8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg0Renderer.writeBGCNT8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0CNT8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0CNT8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg0Renderer.writeBGCNT8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0CNT16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0CNT16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg0Renderer.writeBGCNT16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1CNT8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1CNT8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg1Renderer.writeBGCNT8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1CNT8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1CNT8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg1Renderer.writeBGCNT8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1CNT16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1CNT16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg1Renderer.writeBGCNT16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0BG1CNT32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0BG1CNT32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg0Renderer.writeBGCNT16(data | 0);
    //Bits 5-6 always 0.
    this.bg1Renderer.writeBGCNT16(data >> 16);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2CNT8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2CNT8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg2TextRenderer.writeBGCNT8_0(data | 0);
    this.bgAffineRenderer0.setMosaicEnable(data & 0x40);
    this.bgAffineRenderer0.priorityPreprocess(data & 0x3);
    this.bg2MatrixRenderer.characterBaseBlockPreprocess((data & 0xC) >> 2);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2CNT8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2CNT8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2TextRenderer.writeBGCNT8_1(data | 0);
    this.bg2MatrixRenderer.screenSizePreprocess((data & 0xC0) >> 6);
    this.bg2MatrixRenderer.screenBaseBlockPreprocess(data & 0x1F);
    this.bg2MatrixRenderer.displayOverflowPreprocess(data & 0x20);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2CNT16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2CNT16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg2TextRenderer.writeBGCNT16(data | 0);
    this.bgAffineRenderer0.setMosaicEnable(data & 0x40);
    this.bgAffineRenderer0.priorityPreprocess(data & 0x3);
    this.bg2MatrixRenderer.characterBaseBlockPreprocess((data & 0xC) >> 2);
    this.bg2MatrixRenderer.screenSizePreprocess((data & 0xC000) >> 14);
    data = data >> 8;
    this.bg2MatrixRenderer.screenBaseBlockPreprocess(data & 0x1F);
    this.bg2MatrixRenderer.displayOverflowPreprocess(data & 0x20);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3CNT8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3CNT8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg3TextRenderer.writeBGCNT8_0(data | 0);
    this.bgAffineRenderer1.setMosaicEnable(data & 0x40);
    this.bgAffineRenderer1.priorityPreprocess(data & 0x3);
    this.bg3MatrixRenderer.characterBaseBlockPreprocess((data & 0xC) >> 2);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3CNT8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3CNT8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg3TextRenderer.writeBGCNT8_1(data | 0);
    this.bg3MatrixRenderer.screenSizePreprocess((data & 0xC0) >> 6);
    this.bg3MatrixRenderer.screenBaseBlockPreprocess(data & 0x1F);
    this.bg3MatrixRenderer.displayOverflowPreprocess(data & 0x20);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3CNT16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3CNT16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg3TextRenderer.writeBGCNT16(data | 0);
    this.bgAffineRenderer1.setMosaicEnable(data & 0x40);
    this.bgAffineRenderer1.priorityPreprocess(data & 0x3);
    this.bg3MatrixRenderer.characterBaseBlockPreprocess((data & 0xC) >> 2);
    this.bg3MatrixRenderer.screenSizePreprocess((data & 0xC000) >> 14);
    data = data >> 8;
    this.bg3MatrixRenderer.screenBaseBlockPreprocess(data & 0x1F);
    this.bg3MatrixRenderer.displayOverflowPreprocess(data & 0x20);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2BG3CNT32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2BG3CNT32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    //Bits 5-6 always 0.
    this.bg2TextRenderer.writeBGCNT16(data | 0);
    this.bgAffineRenderer0.setMosaicEnable(data & 0x40);
    this.bgAffineRenderer0.priorityPreprocess(data & 0x3);
    this.bg2MatrixRenderer.characterBaseBlockPreprocess((data & 0xC) >> 2);
    this.bg2MatrixRenderer.screenSizePreprocess((data & 0xC000) >> 14);
    this.bg2MatrixRenderer.screenBaseBlockPreprocess((data >> 8) & 0x1F);
    this.bg2MatrixRenderer.displayOverflowPreprocess((data >> 8) & 0x20);
    //Bits 5-6 always 0.
    data = data >> 16;
    this.bg3TextRenderer.writeBGCNT16(data | 0);
    this.bgAffineRenderer1.setMosaicEnable(data & 0x40);
    this.bgAffineRenderer1.priorityPreprocess(data & 0x3);
    this.bg3MatrixRenderer.characterBaseBlockPreprocess((data & 0xC) >> 2);
    this.bg3MatrixRenderer.screenSizePreprocess((data & 0xC000) >> 14);
    data = data >> 8;
    this.bg3MatrixRenderer.screenBaseBlockPreprocess(data & 0x1F);
    this.bg3MatrixRenderer.displayOverflowPreprocess(data & 0x20);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0HOFS8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0HOFS8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg0Renderer.writeBGHOFS8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0HOFS8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0HOFS8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg0Renderer.writeBGHOFS8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0HOFS16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0HOFS16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg0Renderer.writeBGHOFS16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0VOFS8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0VOFS8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg0Renderer.writeBGVOFS8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0VOFS8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0VOFS8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg0Renderer.writeBGVOFS8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0VOFS16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0VOFS16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg0Renderer.writeBGVOFS16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG0OFS32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG0OFS32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg0Renderer.writeBGOFS32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1HOFS8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1HOFS8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg1Renderer.writeBGHOFS8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1HOFS8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1HOFS8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg1Renderer.writeBGHOFS8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1HOFS16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1HOFS16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg1Renderer.writeBGHOFS16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1VOFS8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1VOFS8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg1Renderer.writeBGVOFS8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1VOFS8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1VOFS8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg1Renderer.writeBGVOFS8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1VOFS16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1VOFS16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg1Renderer.writeBGVOFS16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG1OFS32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG1OFS32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg1Renderer.writeBGOFS32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2HOFS8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2HOFS8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2TextRenderer.writeBGHOFS8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2HOFS8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2HOFS8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2TextRenderer.writeBGHOFS8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2HOFS16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2HOFS16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2TextRenderer.writeBGHOFS16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2VOFS8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2VOFS8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2TextRenderer.writeBGVOFS8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2VOFS8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2VOFS8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2TextRenderer.writeBGVOFS8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2VOFS16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2VOFS16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2TextRenderer.writeBGVOFS16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2OFS32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2OFS32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg2TextRenderer.writeBGOFS32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3HOFS8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3HOFS8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg3TextRenderer.writeBGHOFS8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3HOFS8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3HOFS8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg3TextRenderer.writeBGHOFS8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3HOFS16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3HOFS16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg3TextRenderer.writeBGHOFS16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3VOFS8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3VOFS8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg3TextRenderer.writeBGVOFS8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3VOFS8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3VOFS8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg3TextRenderer.writeBGVOFS8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3VOFS16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3VOFS16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg3TextRenderer.writeBGVOFS16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3OFS32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3OFS32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bg3TextRenderer.writeBGOFS32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PA8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PA8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPA8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PA8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PA8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPA8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PA16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PA16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPA16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PB8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PB8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPB8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PB8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PB8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPB8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PB16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PB16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPB16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PAB32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PAB32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPAB32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PC8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PC8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPC8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PC8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PC8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPC8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PC16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PC16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPC16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PD8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PD8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPD8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PD8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PD8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPD8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PD16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PD16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPD16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2PCD32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2PCD32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGPCD32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PA8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PA8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPA8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PA8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PA8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPA8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PA16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PA16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPA16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PB8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PB8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPB8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PB8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PB8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPB8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PB16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PB16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPB16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PAB32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PAB32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPAB32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PC8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PC8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPC8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PC8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PC8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPC8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PC16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PC16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPC16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PD8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PD8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPD8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PD8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PD8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPD8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PD16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PD16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPD16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3PCD32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3PCD32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGPCD32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2X8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2X8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGX8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2X8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2X8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGX8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2X8_2 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2X8_2 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGX8_2(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2X8_3 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2X8_3 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGX8_3(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2X16_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2X16_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGX16_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2X16_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2X16_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGX16_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2X32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2X32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGX32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2Y8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2Y8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGY8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2Y8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2Y8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGY8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2Y8_2 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2Y8_2 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGY8_2(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2Y8_3 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2Y8_3 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGY8_3(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2Y16_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2Y16_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGY16_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2Y16_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2Y16_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGY16_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG2Y32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG2Y32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer0.writeBGY32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3X8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3X8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGX8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3X8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3X8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGX8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3X8_2 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3X8_2 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGX8_2(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3X8_3 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3X8_3 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGX8_3(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3X16_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3X16_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGX16_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3X16_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3X16_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGX16_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3X32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3X32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGX32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3Y8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3Y8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGY8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3Y8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3Y8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGY8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3Y8_2 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3Y8_2 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGY8_2(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3Y8_3 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3Y8_3 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGY8_3(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3Y16_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3Y16_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGY16_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3Y16_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3Y16_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGY16_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBG3Y32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBG3Y32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.bgAffineRenderer1.writeBGY32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN0XCOORDRight8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN0XCOORDRight8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window0Renderer.writeWINXCOORDRight8(data | 0);        //Window x-coord goes up to this minus 1.
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN0XCOORDLeft8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN0XCOORDLeft8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window0Renderer.writeWINXCOORDLeft8(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN0XCOORD16 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN0XCOORD16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window0Renderer.writeWINXCOORD16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN1XCOORDRight8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN1XCOORDRight8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window1Renderer.writeWINXCOORDRight8(data | 0);        //Window x-coord goes up to this minus 1.
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN1XCOORDLeft8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN1XCOORDLeft8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window1Renderer.writeWINXCOORDLeft8(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN1XCOORD16 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN1XCOORD16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window1Renderer.writeWINXCOORD16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWINXCOORD32 = GameBoyAdvanceGraphicsRenderer.prototype.writeWINXCOORD32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window0Renderer.writeWINXCOORD16(data & 0xFFFF);
    this.window1Renderer.writeWINXCOORD16(data >>> 16);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN0YCOORDBottom8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN0YCOORDBottom8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window0Renderer.writeWINYCOORDBottom8(data | 0);        //Window y-coord goes up to this minus 1.
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN0YCOORDTop8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN0YCOORDTop8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window0Renderer.writeWINYCOORDTop8(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN0YCOORD16 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN0YCOORD16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window0Renderer.writeWINYCOORD16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN1YCOORDBottom8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN1YCOORDBottom8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window1Renderer.writeWINYCOORDBottom8(data | 0);        //Window y-coord goes up to this minus 1.
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN1YCOORDTop8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN1YCOORDTop8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window1Renderer.writeWINYCOORDTop8(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN1YCOORD16 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN1YCOORD16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window1Renderer.writeWINYCOORD16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWINYCOORD32 = GameBoyAdvanceGraphicsRenderer.prototype.writeWINYCOORD32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.window0Renderer.writeWINYCOORD16(data & 0xFFFF);
    this.window1Renderer.writeWINYCOORD16(data >>> 16);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN0IN8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN0IN8 = function (data) {
    data = data | 0;
    //Window 0:
    this.graphicsJIT();
    this.window0Renderer.writeWININ8(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWIN1IN8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWIN1IN8 = function (data) {
    data = data | 0;
    //Window 1:
    this.graphicsJIT();
    this.window1Renderer.writeWININ8(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWININ16 = GameBoyAdvanceGraphicsRenderer.prototype.writeWININ16 = function (data) {
    data = data | 0;
    //Window 0:
    this.graphicsJIT();
    this.window0Renderer.writeWININ8(data & 0xFF);
    //Window 1:
    this.window1Renderer.writeWININ8(data >> 8);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWINOUT8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWINOUT8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.WINOutside = data | 0;
    this.compositorPreprocess();
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWINOBJIN8 = GameBoyAdvanceGraphicsRenderer.prototype.writeWINOBJIN8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.objWindowRenderer.writeWINOBJIN8(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWINOUT16 = GameBoyAdvanceGraphicsRenderer.prototype.writeWINOUT16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.WINOutside = data | 0;
    this.compositorPreprocess();
    this.objWindowRenderer.writeWINOBJIN8(data >> 8);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeWINCONTROL32 = GameBoyAdvanceGraphicsRenderer.prototype.writeWINCONTROL32 = function (data) {
    data = data | 0;
    //Window 0:
    this.graphicsJIT();
    this.window0Renderer.writeWININ8(data & 0xFF);
    //Window 1:
    this.window1Renderer.writeWININ8((data >> 8) & 0xFF);
    this.WINOutside = data >> 16;
    this.compositorPreprocess();
    this.objWindowRenderer.writeWINOBJIN8(data >>> 24);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeMOSAIC8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeMOSAIC8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.mosaicRenderer.writeMOSAIC8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeMOSAIC8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeMOSAIC8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.mosaicRenderer.writeMOSAIC8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeMOSAIC16 = GameBoyAdvanceGraphicsRenderer.prototype.writeMOSAIC16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.mosaicRenderer.writeMOSAIC16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBLDCNT8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBLDCNT8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.colorEffectsRenderer.writeBLDCNT8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBLDCNT8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBLDCNT8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.colorEffectsRenderer.writeBLDCNT8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBLDCNT16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBLDCNT16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.colorEffectsRenderer.writeBLDCNT16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBLDALPHA8_0 = GameBoyAdvanceGraphicsRenderer.prototype.writeBLDALPHA8_0 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.colorEffectsRenderer.writeBLDALPHA8_0(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBLDALPHA8_1 = GameBoyAdvanceGraphicsRenderer.prototype.writeBLDALPHA8_1 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.colorEffectsRenderer.writeBLDALPHA8_1(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBLDALPHA16 = GameBoyAdvanceGraphicsRenderer.prototype.writeBLDALPHA16 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.colorEffectsRenderer.writeBLDALPHA16(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBLDCNT32 = GameBoyAdvanceGraphicsRenderer.prototype.writeBLDCNT32 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.colorEffectsRenderer.writeBLDCNT32(data | 0);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeBLDY8 = GameBoyAdvanceGraphicsRenderer.prototype.writeBLDY8 = function (data) {
    data = data | 0;
    this.graphicsJIT();
    this.colorEffectsRenderer.writeBLDY8(data | 0);
}
if (__LITTLE_ENDIAN__) {
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writeVRAM8 = GameBoyAdvanceGraphicsRenderer.prototype.writeVRAM8 =
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writeVRAM16 = GameBoyAdvanceGraphicsRenderer.prototype.writeVRAM16 = function (address, data) {
        address = address | 0;
        data = data | 0;
        this.graphicsJIT();
        this.VRAM16[address & 0xFFFF] = data & 0xFFFF;
    }
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writeVRAM32 = GameBoyAdvanceGraphicsRenderer.prototype.writeVRAM32 = function (address, data) {
        address = address | 0;
        data = data | 0;
        this.graphicsJIT();
        this.VRAM32[address & 0x7FFF] = data | 0;
    }
    GameBoyAdvanceGraphicsRenderer.prototype.readVRAM16 = function (address) {
        address = address | 0;
        return this.VRAM16[address & 0xFFFF] | 0;
    }
    GameBoyAdvanceGraphicsRenderer.prototype.readVRAM32 = function (address) {
        address = address | 0;
        return this.VRAM32[address & 0x7FFF] | 0;
    }
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writePalette16 = GameBoyAdvanceGraphicsRenderer.prototype.writePalette16 = function (address, data) {
        data = data | 0;
        address = address | 0;
        this.graphicsJIT();
        this.paletteRAM16[address & 0x1FF] = data & 0xFFFF;
        data = data & 0x7FFF;
        this.writePalette256Color(address | 0, data | 0);
        this.writePalette16Color(address | 0, data | 0);
    }
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writePalette32 = GameBoyAdvanceGraphicsRenderer.prototype.writePalette32 = function (address, data) {
        data = data | 0;
        address = address | 0;
        this.graphicsJIT();
        this.paletteRAM32[address & 0xFF] = data | 0;
        address = address << 1;
        var palette = data & 0x7FFF;
        this.writePalette256Color(address | 0, palette | 0);
        this.writePalette16Color(address | 0, palette | 0);
        palette = (data >> 16) & 0x7FFF;
        this.writePalette256Color(address | 1, palette | 0);
        this.writePalette16Color(address | 1, palette | 0);
    }
    GameBoyAdvanceGraphicsRenderer.prototype.readPalette16 = function (address) {
        address = address | 0;
        return this.paletteRAM16[address & 0x1FF] | 0;
    }
    GameBoyAdvanceGraphicsRenderer.prototype.readPalette32 = function (address) {
        address = address | 0;
        return this.paletteRAM32[address & 0xFF] | 0;
    }
}
else {
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writeVRAM8 = GameBoyAdvanceGraphicsRenderer.prototype.writeVRAM8 =
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writeVRAM16 = GameBoyAdvanceGraphicsRenderer.prototype.writeVRAM16 = function (address, data) {
        address <<= 1;
        address &= 0x1FFFE;
        this.graphicsJIT();
        this.VRAM[address++] = data & 0xFF;
        this.VRAM[address] = (data >> 8) & 0xFF;
    }
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writeVRAM32 = GameBoyAdvanceGraphicsRenderer.prototype.writeVRAM32 = function (address, data) {
        address <<= 2;
        address &= 0x1FFFC;
        this.graphicsJIT();
        this.VRAM[address++] = data & 0xFF;
        this.VRAM[address++] = (data >> 8) & 0xFF;
        this.VRAM[address++] = (data >> 16) & 0xFF;
        this.VRAM[address] = data >>> 24;
    }
    GameBoyAdvanceGraphicsRenderer.prototype.readVRAM16 = function (address) {
        address <<= 1;
        address &= 0x1FFFE;
        return this.VRAM[address] | (this.VRAM[address + 1] << 8);
    }
    GameBoyAdvanceGraphicsRenderer.prototype.readVRAM32 = function (address) {
        address <<= 2;
        address &= 0x1FFFC;
        return this.VRAM[address] | (this.VRAM[address + 1] << 8) | (this.VRAM[address + 2] << 16) | (this.VRAM[address + 3] << 24);
    }
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writePalette16 = GameBoyAdvanceGraphicsRenderer.prototype.writePalette16 = function (address, data) {
        this.graphicsJIT();
        address <<= 1;
        this.paletteRAM[address] = data & 0xFF;
        this.paletteRAM[address | 1] = data >> 8;
        data &= 0x7FFF;
        address >>= 1;
        this.writePalette256Color(address, data);
        this.writePalette16Color(address, data);
    }
    GameBoyAdvanceGraphicsRendererOffthread.prototype.writePalette32 = GameBoyAdvanceGraphicsRenderer.prototype.writePalette32 = function (address, data) {
        this.graphicsJIT();
        address <<= 2;
        this.paletteRAM[address] = data & 0xFF;
        this.paletteRAM[address | 1] = (data >> 8) & 0xFF;
        this.paletteRAM[address | 2] = (data >> 16) & 0xFF;
        this.paletteRAM[address | 3] = data >>> 24;
        address >>= 1;
        var palette = data & 0x7FFF;
        this.writePalette256Color(address, palette);
        this.writePalette16Color(address, palette);
        palette = (data >> 16) & 0x7FFF;
        address |= 1;
        this.writePalette256Color(address, palette);
        this.writePalette16Color(address, palette);
    }
    GameBoyAdvanceGraphicsRenderer.prototype.readPalette16 = function (address) {
        address <<= 1;
        address &= 0x3FE;
        return this.paletteRAM[address] | (this.paletteRAM[address | 1] << 8);
    }
    GameBoyAdvanceGraphicsRenderer.prototype.readPalette32 = function (address) {
        address <<= 2;
        address &= 0x3FC;
        return this.paletteRAM[address] | (this.paletteRAM[address | 1] << 8) | (this.paletteRAM[address | 2] << 16)  | (this.paletteRAM[address | 3] << 24);
    }
}
GameBoyAdvanceGraphicsRenderer.prototype.readVRAM8 = function (address) {
    address = address | 0;
    return this.VRAM[address & 0x1FFFF] | 0;
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeOAM16 = GameBoyAdvanceGraphicsRenderer.prototype.writeOAM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.graphicsJIT();
    this.objRenderer.writeOAM16(address & 0x1FF, data & 0xFFFF);
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writeOAM32 = GameBoyAdvanceGraphicsRenderer.prototype.writeOAM32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.graphicsJIT();
    this.objRenderer.writeOAM32(address & 0xFF, data | 0);
}
GameBoyAdvanceGraphicsRenderer.prototype.readOAM = function (address) {
    address = address | 0;
    return this.objRenderer.readOAM(address | 0) | 0;
}
GameBoyAdvanceGraphicsRenderer.prototype.readOAM16 = function (address) {
    address = address | 0;
    return this.objRenderer.readOAM16(address | 0) | 0;
}
GameBoyAdvanceGraphicsRenderer.prototype.readOAM32 = function (address) {
    address = address | 0;
    return this.objRenderer.readOAM32(address | 0) | 0;
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writePalette256Color = GameBoyAdvanceGraphicsRenderer.prototype.writePalette256Color = function (address, palette) {
    address = address | 0;
    palette = palette | 0;
    if ((address & 0xFF) == 0) {
        palette = 0x3800000 | palette;
        if (address == 0) {
            this.backdrop = palette | 0x200000;
        }
    }
    if ((address | 0) < 0x100) {
        this.palette256[address & 0xFF] = palette | 0;
    }
    else {
        this.paletteOBJ256[address & 0xFF] = palette | 0;
    }
}
GameBoyAdvanceGraphicsRendererOffthread.prototype.writePalette16Color = GameBoyAdvanceGraphicsRenderer.prototype.writePalette16Color = function (address, palette) {
    address = address | 0;
    palette = palette | 0;
    if ((address & 0xF) == 0) {
        palette = 0x3800000 | palette;
    }
    if ((address | 0) < 0x100) {
        //BG Layer Palette:
        this.palette16[address & 0xFF] = palette | 0;
    }
    else {
        //OBJ Layer Palette:
        this.paletteOBJ16[address & 0xFF] = palette | 0;
    }
}
GameBoyAdvanceGraphicsRenderer.prototype.readPalette8 = function (address) {
    address = address | 0;
    return this.paletteRAM[address & 0x3FF] | 0;
}
