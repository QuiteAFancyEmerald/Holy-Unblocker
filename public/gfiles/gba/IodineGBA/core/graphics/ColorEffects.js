"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceColorEffectsRenderer(buffer) {
    this.effectsTarget1 = 0;
    this.colorEffectsType = 0;
    this.effectsTarget2 = 0;
    this.initialize(buffer);
}
if (typeof SIMD == "object" && typeof SIMD.Int32x4 == "function") {
    //SIMD support found, insert the optimized SIMD path in:
    GameBoyAdvanceColorEffectsRenderer.prototype.initialize = function (buffer) {
        this.alphaBlendAmountTarget1 = SIMD.Int32x4.splat(0);
        this.alphaBlendAmountTarget2 = SIMD.Int32x4.splat(0);
        this.brightnessEffectAmount = SIMD.Int32x4.splat(0);
        this.brightnessEffectAmountReverse = SIMD.Int32x4.splat(0x10);
        this.buffer = buffer;
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.pixelMask = SIMD.Int32x4.splat(0x1F);
    GameBoyAdvanceColorEffectsRenderer.prototype.temporaryPixelBuffer = new Int32Array(4);
    GameBoyAdvanceColorEffectsRenderer.prototype.alphaBlend = function (topPixel, lowerPixel) {
        topPixel = topPixel | 0;
        lowerPixel = lowerPixel | 0;
        var p1 = SIMD.Int32x4(topPixel >> 10, topPixel >> 5, topPixel, 0);
        var p2 = SIMD.Int32x4(lowerPixel >> 10, lowerPixel >> 5, lowerPixel, 0);
        p1 = SIMD.Int32x4.and(p1, this.pixelMask);
        p2 = SIMD.Int32x4.and(p2, this.pixelMask);
        p1 = SIMD.Int32x4.mul(p1, this.alphaBlendAmountTarget1);
        p2 = SIMD.Int32x4.mul(p2, this.alphaBlendAmountTarget2);
        var presult = SIMD.Int32x4.add(p1, p2);
        presult = SIMD.Int32x4.shiftRightByScalar(presult, 4);
        var selectMask = SIMD.Int32x4.lessThanOrEqual(presult, this.pixelMask);
        presult = SIMD.Int32x4.select(selectMask, presult, this.pixelMask);
        SIMD.Int32x4.store(this.temporaryPixelBuffer, 0, presult);
        return (this.temporaryPixelBuffer[0] << 10) | (this.temporaryPixelBuffer[1] << 5) | this.temporaryPixelBuffer[2];
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.brightnessIncrease = function (topPixel) {
        topPixel = topPixel | 0;
        var p1 = SIMD.Int32x4(topPixel >> 10, topPixel >> 5, topPixel, 0);
        p1 = SIMD.Int32x4.and(p1, this.pixelMask);
        var pTemp = SIMD.Int32x4.sub(this.pixelMask, p1);
        pTemp = SIMD.Int32x4.mul(pTemp, this.brightnessEffectAmount);
        pTemp = SIMD.Int32x4.shiftRightByScalar(pTemp, 4);
        p1 = SIMD.Int32x4.add(p1, pTemp);
        SIMD.Int32x4.store(this.temporaryPixelBuffer, 0, p1);
        return (this.temporaryPixelBuffer[0] << 10) | (this.temporaryPixelBuffer[1] << 5) | this.temporaryPixelBuffer[2];
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.brightnessDecrease = function (topPixel) {
        topPixel = topPixel | 0;
        var p1 = SIMD.Int32x4(topPixel >> 10, topPixel >> 5, topPixel, 0);
        p1 = SIMD.Int32x4.and(p1, this.pixelMask);
        p1 = SIMD.Int32x4.mul(p1, this.brightnessEffectAmountReverse);
        p1 = SIMD.Int32x4.shiftRightByScalar(p1, 4);
        SIMD.Int32x4.store(this.temporaryPixelBuffer, 0, p1);
        return (this.temporaryPixelBuffer[0] << 10) | (this.temporaryPixelBuffer[1] << 5) | this.temporaryPixelBuffer[2];
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDALPHA8_0 = function (data) {
        data = data | 0;
        var alphaBlendAmountTarget1Scratch = data & 0x1F;
        this.alphaBlendAmountTarget1 = SIMD.Int32x4.splat(Math.min(alphaBlendAmountTarget1Scratch | 0, 0x10) | 0);
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDALPHA8_1 = function (data) {
        data = data | 0;
        var alphaBlendAmountTarget2Scratch = data & 0x1F;
        this.alphaBlendAmountTarget2 = SIMD.Int32x4.splat(Math.min(alphaBlendAmountTarget2Scratch | 0, 0x10) | 0);
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDALPHA16 = function (data) {
        data = data | 0;
        var alphaBlendAmountTarget1Scratch = data & 0x1F;
        this.alphaBlendAmountTarget1 = SIMD.Int32x4.splat(Math.min(alphaBlendAmountTarget1Scratch | 0, 0x10) | 0);
        var alphaBlendAmountTarget2Scratch = (data >> 8) & 0x1F;
        this.alphaBlendAmountTarget2 = SIMD.Int32x4.splat(Math.min(alphaBlendAmountTarget2Scratch | 0, 0x10) | 0);
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDCNT32 = function (data) {
        data = data | 0;
        //Select target 1 and color effects mode:
        this.effectsTarget1 = (data & 0x3F) << 16;
        this.colorEffectsType = (data >> 6) & 0x3;
        //Select target 2:
        this.effectsTarget2 = (data & 0x3F00) << 8;
        var alphaBlendAmountTarget1Scratch = (data >> 16) & 0x1F;
        this.alphaBlendAmountTarget1 = SIMD.Int32x4.splat(Math.min(alphaBlendAmountTarget1Scratch | 0, 0x10) | 0);
        var alphaBlendAmountTarget2Scratch = (data >> 24) & 0x1F;
        this.alphaBlendAmountTarget2 = SIMD.Int32x4.splat(Math.min(alphaBlendAmountTarget2Scratch | 0, 0x10) | 0);
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDY8 = function (data) {
        data = data | 0;
        var data = Math.min(data & 0x1F, 0x10) | 0;
        this.brightnessEffectAmount = SIMD.Int32x4.splat(data | 0);
        this.brightnessEffectAmountReverse = SIMD.Int32x4.splat((0x10 - (data | 0)) | 0);
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.processFullNormalEffectsNoSprites = function () {
        for (var index = 0; (index | 0) < 240; index = ((index | 0) + 4) | 0) {
            this.buffer[index | 0] = this.processPixelNormal(this.buffer[index | 0x700] | 0, this.buffer[index | 0x800] | 0);
            this.buffer[index | 1] = this.processPixelNormal(this.buffer[index | 0x701] | 0, this.buffer[index | 0x801] | 0);
            this.buffer[index | 2] = this.processPixelNormal(this.buffer[index | 0x702] | 0, this.buffer[index | 0x802] | 0);
            this.buffer[index | 3] = this.processPixelNormal(this.buffer[index | 0x703] | 0, this.buffer[index | 0x803] | 0);
        }
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.processWindowNormalEffectsNoSprites = function (xStart, xEnd) {
        xStart = xStart | 0;
        xEnd = xEnd | 0;
        while ((xStart | 0) < (xEnd | 0)) {
            this.buffer[xStart | 0] = this.processPixelNormal(this.buffer[xStart | 0x700] | 0, this.buffer[xStart | 0x800] | 0);
            xStart = ((xStart | 0) + 1) | 0;
        }
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.processFullNormalEffectsWithSprites = function () {
        for (var index = 0; (index | 0) < 240; index = ((index | 0) + 4) | 0) {
            this.buffer[index | 0] = this.processPixelTestFull(this.buffer[index | 0x700] | 0, this.buffer[index | 0x800] | 0);
            this.buffer[index | 1] = this.processPixelTestFull(this.buffer[index | 0x701] | 0, this.buffer[index | 0x801] | 0);
            this.buffer[index | 2] = this.processPixelTestFull(this.buffer[index | 0x702] | 0, this.buffer[index | 0x802] | 0);
            this.buffer[index | 3] = this.processPixelTestFull(this.buffer[index | 0x703] | 0, this.buffer[index | 0x803] | 0);
        }
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.processWindowNormalEffectsWithSprites = function (xStart, xEnd) {
        xStart = xStart | 0;
        xEnd = xEnd | 0;
        while ((xStart | 0) < (xEnd | 0)) {
            this.buffer[xStart | 0] = this.processPixelTestFull(this.buffer[xStart | 0x700] | 0, this.buffer[xStart | 0x800] | 0);
            xStart = ((xStart | 0) + 1) | 0;
        }
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.processFullNoEffectsWithSprites = function () {
        for (var index = 0; (index | 0) < 240; index = ((index | 0) + 4) | 0) {
            this.buffer[index | 0] = this.processPixelTestSprite(this.buffer[index | 0x700] | 0, this.buffer[index | 0x800] | 0);
            this.buffer[index | 1] = this.processPixelTestSprite(this.buffer[index | 0x701] | 0, this.buffer[index | 0x801] | 0);
            this.buffer[index | 2] = this.processPixelTestSprite(this.buffer[index | 0x702] | 0, this.buffer[index | 0x802] | 0);
            this.buffer[index | 3] = this.processPixelTestSprite(this.buffer[index | 0x703] | 0, this.buffer[index | 0x803] | 0);
        }
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.processWindowNoEffectsWithSprites = function (xStart, xEnd) {
        xStart = xStart | 0;
        xEnd = xEnd | 0;
        while ((xStart | 0) < (xEnd | 0)) {
            this.buffer[xStart | 0] = this.processPixelTestSprite(this.buffer[xStart | 0x700] | 0, this.buffer[xStart | 0x800] | 0);
            xStart = ((xStart | 0) + 1) | 0;
        }
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.processPixelTestFull = function (lowerPixel, currentPixel) {
        lowerPixel = lowerPixel | 0;
        currentPixel = currentPixel | 0;
        if ((currentPixel & 0x400000) == 0) {
            return this.processPixelNormal(lowerPixel | 0, currentPixel | 0) | 0;
        }
        else {
            return this.processPixelSprite(lowerPixel | 0, currentPixel | 0) | 0;
        }
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.processPixelTestSprite = function (lowerPixel, currentPixel) {
        lowerPixel = lowerPixel | 0;
        currentPixel = currentPixel | 0;
        if ((currentPixel & 0x400000) == 0) {
            return currentPixel | 0;
        }
        else {
            return this.processPixelSprite(lowerPixel | 0, currentPixel | 0) | 0;
        }
    }
}
else {
    //No SIMD support found, use the scalar path instead:
    GameBoyAdvanceColorEffectsRenderer.prototype.initialize = function (buffer) {
        this.alphaBlendAmountTarget1 = 0;
        this.alphaBlendAmountTarget2 = 0;
        this.brightnessEffectAmount = 0;
    }
    if (typeof Math.imul == "function") {
        //Math.imul found, insert the optimized path in:
        GameBoyAdvanceColorEffectsRenderer.prototype.alphaBlend = function (topPixel, lowerPixel) {
            topPixel = topPixel | 0;
            lowerPixel = lowerPixel | 0;
            var b1 = (topPixel >> 10) & 0x1F;
            var g1 = (topPixel >> 5) & 0x1F;
            var r1 = topPixel & 0x1F;
            var b2 = (lowerPixel >> 10) & 0x1F;
            var g2 = (lowerPixel >> 5) & 0x1F;
            var r2 = lowerPixel & 0x1F;
            b1 = Math.imul(b1 | 0, this.alphaBlendAmountTarget1 | 0) | 0;
            g1 = Math.imul(g1 | 0, this.alphaBlendAmountTarget1 | 0) | 0;
            r1 = Math.imul(r1 | 0, this.alphaBlendAmountTarget1 | 0) | 0;
            b2 = Math.imul(b2 | 0, this.alphaBlendAmountTarget2 | 0) | 0;
            g2 = Math.imul(g2 | 0, this.alphaBlendAmountTarget2 | 0) | 0;
            r2 = Math.imul(r2 | 0, this.alphaBlendAmountTarget2 | 0) | 0;
            //Keep this not inlined in the return, firefox 22 grinds on it:
            var b = Math.min(((b1 | 0) + (b2 | 0)) >> 4, 0x1F) | 0;
            var g = Math.min(((g1 | 0) + (g2 | 0)) >> 4, 0x1F) | 0;
            var r = Math.min(((r1 | 0) + (r2 | 0)) >> 4, 0x1F) | 0;
            return (b << 10) | (g << 5) | r;
        }
        GameBoyAdvanceColorEffectsRenderer.prototype.brightnessIncrease = function (topPixel) {
            topPixel = topPixel | 0;
            var b1 = (topPixel >> 10) & 0x1F;
            var g1 = (topPixel >> 5) & 0x1F;
            var r1 = topPixel & 0x1F;
            b1 = ((b1 | 0) + (Math.imul((0x1F - (b1 | 0)) | 0, this.brightnessEffectAmount | 0) >> 4)) | 0;
            g1 = ((g1 | 0) + (Math.imul((0x1F - (g1 | 0)) | 0, this.brightnessEffectAmount | 0) >> 4)) | 0;
            r1 = ((r1 | 0) + (Math.imul((0x1F - (r1 | 0)) | 0, this.brightnessEffectAmount | 0) >> 4)) | 0;
            return (b1 << 10) | (g1 << 5) | r1;
        }
        GameBoyAdvanceColorEffectsRenderer.prototype.brightnessDecrease = function (topPixel) {
            topPixel = topPixel | 0;
            var b1 = (topPixel >> 10) & 0x1F;
            var g1 = (topPixel >> 5) & 0x1F;
            var r1 = topPixel & 0x1F;
            var decreaseMultiplier = (0x10 - (this.brightnessEffectAmount | 0)) | 0;
            b1 = Math.imul(b1 | 0, decreaseMultiplier | 0) >> 4;
            g1 = Math.imul(g1 | 0, decreaseMultiplier | 0) >> 4;
            r1 = Math.imul(r1 | 0, decreaseMultiplier | 0) >> 4;
            return (b1 << 10) | (g1 << 5) | r1;
        }
    }
    else {
        //Math.imul not found, use the compatibility method:
        GameBoyAdvanceColorEffectsRenderer.prototype.alphaBlend = function (topPixel, lowerPixel) {
            topPixel = topPixel | 0;
            lowerPixel = lowerPixel | 0;
            var b1 = (topPixel >> 10) & 0x1F;
            var g1 = (topPixel >> 5) & 0x1F;
            var r1 = (topPixel & 0x1F);
            var b2 = (lowerPixel >> 10) & 0x1F;
            var g2 = (lowerPixel >> 5) & 0x1F;
            var r2 = lowerPixel & 0x1F;
            b1 = b1 * this.alphaBlendAmountTarget1;
            g1 = g1 * this.alphaBlendAmountTarget1;
            r1 = r1 * this.alphaBlendAmountTarget1;
            b2 = b2 * this.alphaBlendAmountTarget2;
            g2 = g2 * this.alphaBlendAmountTarget2;
            r2 = r2 * this.alphaBlendAmountTarget2;
            return (Math.min((b1 + b2) >> 4, 0x1F) << 10) | (Math.min((g1 + g2) >> 4, 0x1F) << 5) | Math.min((r1 + r2) >> 4, 0x1F);
        }
        GameBoyAdvanceColorEffectsRenderer.prototype.brightnessIncrease = function (topPixel) {
            topPixel = topPixel | 0;
            var b1 = (topPixel >> 10) & 0x1F;
            var g1 = (topPixel >> 5) & 0x1F;
            var r1 = topPixel & 0x1F;
            b1 += ((0x1F - b1) * this.brightnessEffectAmount) >> 4;
            g1 += ((0x1F - g1) * this.brightnessEffectAmount) >> 4;
            r1 += ((0x1F - r1) * this.brightnessEffectAmount) >> 4;
            return (b1 << 10) | (g1 << 5) | r1;
        }
        GameBoyAdvanceColorEffectsRenderer.prototype.brightnessDecrease = function (topPixel) {
            topPixel = topPixel | 0;
            var b1 = (topPixel >> 10) & 0x1F;
            var g1 = (topPixel >> 5) & 0x1F;
            var r1 = topPixel & 0x1F;
            var decreaseMultiplier = 0x10 - this.brightnessEffectAmount;
            b1 = (b1 * decreaseMultiplier) >> 4;
            g1 = (g1 * decreaseMultiplier) >> 4;
            r1 = (r1 * decreaseMultiplier) >> 4;
            return (b1 << 10) | (g1 << 5) | r1;
        }
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDALPHA8_0 = function (data) {
        data = data | 0;
        var alphaBlendAmountTarget1Scratch = data & 0x1F;
        this.alphaBlendAmountTarget1 = Math.min(alphaBlendAmountTarget1Scratch | 0, 0x10) | 0;
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDALPHA8_1 = function (data) {
        data = data | 0;
        var alphaBlendAmountTarget2Scratch = data & 0x1F;
        this.alphaBlendAmountTarget2 = Math.min(alphaBlendAmountTarget2Scratch | 0, 0x10) | 0;
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDALPHA16 = function (data) {
        data = data | 0;
        var alphaBlendAmountTarget1Scratch = data & 0x1F;
        this.alphaBlendAmountTarget1 = Math.min(alphaBlendAmountTarget1Scratch | 0, 0x10) | 0;
        var alphaBlendAmountTarget2Scratch = (data >> 8) & 0x1F;
        this.alphaBlendAmountTarget2 = Math.min(alphaBlendAmountTarget2Scratch | 0, 0x10) | 0;
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDCNT32 = function (data) {
        data = data | 0;
        //Select target 1 and color effects mode:
        this.effectsTarget1 = (data & 0x3F) << 16;
        this.colorEffectsType = (data >> 6) & 0x3;
        //Select target 2:
        this.effectsTarget2 = (data & 0x3F00) << 8;
        var alphaBlendAmountTarget1Scratch = (data >> 16) & 0x1F;
        this.alphaBlendAmountTarget1 = Math.min(alphaBlendAmountTarget1Scratch | 0, 0x10) | 0;
        var alphaBlendAmountTarget2Scratch = (data >> 24) & 0x1F;
        this.alphaBlendAmountTarget2 = Math.min(alphaBlendAmountTarget2Scratch | 0, 0x10) | 0;
    }
    GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDY8 = function (data) {
        data = data | 0;
        this.brightnessEffectAmount = Math.min(data & 0x1F, 0x10) | 0;
    }
}
GameBoyAdvanceColorEffectsRenderer.prototype.processPixelNormal = function (lowerPixel, topPixel) {
    lowerPixel = lowerPixel | 0;
    topPixel = topPixel | 0;
    if (((topPixel | 0) & (this.effectsTarget1 | 0)) != 0) {
        switch (this.colorEffectsType | 0) {
            case 1:
                if (((lowerPixel | 0) & (this.effectsTarget2 | 0)) != 0 && (topPixel | 0) != (lowerPixel | 0)) {
                    return this.alphaBlend(topPixel | 0, lowerPixel | 0) | 0;
                }
                break;
            case 2:
                return this.brightnessIncrease(topPixel | 0) | 0;
            case 3:
                return this.brightnessDecrease(topPixel | 0) | 0;
        }
    }
    return topPixel | 0;
}
GameBoyAdvanceColorEffectsRenderer.prototype.processPixelSprite = function (lowerPixel, topPixel) {
    lowerPixel = lowerPixel | 0;
    topPixel = topPixel | 0;
    if (((lowerPixel | 0) & (this.effectsTarget2 | 0)) != 0) {
        return this.alphaBlend(topPixel | 0, lowerPixel | 0) | 0;
    }
    else if (((topPixel | 0) & (this.effectsTarget1 | 0)) != 0) {
        switch (this.colorEffectsType | 0) {
            case 2:
                return this.brightnessIncrease(topPixel | 0) | 0;
            case 3:
                return this.brightnessDecrease(topPixel | 0) | 0;
        }
    }
    return topPixel | 0;
}
GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDCNT8_0 = function (data) {
    data = data | 0;
    //Select target 1 and color effects mode:
    this.effectsTarget1 = (data & 0x3F) << 16;
    this.colorEffectsType = data >> 6;
}
GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDCNT8_1 = function (data) {
    data = data | 0;
    //Select target 2:
    this.effectsTarget2 = (data & 0x3F) << 16;
}
GameBoyAdvanceColorEffectsRenderer.prototype.writeBLDCNT16 = function (data) {
    data = data | 0;
    //Select target 1 and color effects mode:
    this.effectsTarget1 = (data & 0x3F) << 16;
    this.colorEffectsType = (data >> 6) & 0x3;
    //Select target 2:
    this.effectsTarget2 = (data & 0x3F00) << 8;
}
