"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceGPIOChip() {
    this.type = 0;
    this.data = 0;
    this.direction = 0;
    this.readWrite = 0;
}
GameBoyAdvanceGPIOChip.prototype.getType = function () {
    return this.type | 0;
}
GameBoyAdvanceGPIOChip.prototype.setType = function (type) {
    type = type | 0;
    this.type = type | 0;
}
GameBoyAdvanceGPIOChip.prototype.read = function (address) {
    address = address | 0;
    var data = 0;
    if (this.readWrite | 0) {
        switch (address & 0xF) {
            case 0x4:
                this.readTick();
                data = this.data | 0;
                break;
            case 0x6:
                data = this.direction | 0;
                break;
            case 0x8:
                data = this.readWrite | 0;
        }
    }
    return data | 0;
}
GameBoyAdvanceGPIOChip.prototype.write = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (address & 0xF) {
        case 0x4:
            this.data = data & 0xF;
            this.writeTick(data | 0);
            break;
        case 0x6:
            this.direction = data & 0xF;
            break;
        case 0x8:
            this.readWrite = data & 0x1;
    }
}
