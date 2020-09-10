"use strict";
/*
 Copyright (C) 2012-2019 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceEmulator() {
    this.settings = {
        SKIPBoot:false,                   //Skip the BIOS boot screen.
        audioBufferUnderrunLimit:100,     //Audio buffer minimum span amount over x milliseconds.
        audioBufferDynamicLimit:32,       //Audio buffer dynamic minimum span amount over x milliseconds.
        audioBufferSize:300,              //Audio buffer maximum span amount over x milliseconds.
        emulatorSpeed:1.0,                //Speed multiplier of the emulator.
        metricCollectionMinimum:500,      //How many milliseconds of cycling to count before determining speed.
        dynamicSpeed:false,               //Whether to actively change the target speed for best user experience.
        overclockBlockLimit:200,          //Whether to throttle clocks in audio adjustment.
        offthreadGfxEnabled:true          //Whether to allow offthread graphics rendering if support is present.
    };
    this.audioFound = 0;                      //Do we have audio output sink found yet?
    this.emulatorStatus = 0x10;               //{paused, saves loaded, fault found, loaded}
    this.BIOS = [];                           //Initialize BIOS as not existing.
    this.ROM = [];                            //Initialize BIOS as not existing.
    this.audioUpdateState = 1;                //Do we need to update the sound core with new info?
    this.saveExportHandler = null;            //Save export handler attached by GUI.
    this.saveImportHandler = null;            //Save import handler attached by GUI.
    this.speedCallback = null;                //Speed report handler attached by GUI.
    this.playStatusCallback = null;           //Play status change handler attached by GUI.
    this.startCallbacks = [];                 //Some jobs to run at iteration head.
    this.endCallbacks = [];                   //Some jobs to run at iteration end.
    this.terminationCallbacks = [];           //Some jobs to run if the emulation core is killed.
    this.timerIntervalRate = 16;              //How often the emulator core is called into (in milliseconds).
    this.lastTimestamp = 0;                   //Track the last time given in milliseconds.
    this.dynamicSpeedRefresh = false;         //Whether speed is allowed to be changed dynamically in the current cycle.
    this.calculateTimings();                  //Calculate some multipliers against the core emulator timer.
    this.generateCoreExposed();               //Generate a limit API for the core to call this shell object.
}
GameBoyAdvanceEmulator.prototype.generateCoreExposed = function () {
    var parentObj = this;
    this.coreExposed = {
        outputAudio:function (l, r) {
            parentObj.outputAudio(l, r);
        },
        graphicsHandle:null,
        appendStartIterationSync:function (callback) {
            parentObj.startCallbacks.push(callback);
        },
        appendEndIterationSync:function (callback) {
            parentObj.endCallbacks.push(callback);
        },
        appendTerminationSync:function (callback) {
            parentObj.terminationCallbacks.push(callback);
        },
        offthreadGfxEnabled:function () {
            return !!parentObj.settings.offthreadGfxEnabled;
        }
    }
}
GameBoyAdvanceEmulator.prototype.play = function () {
    if ((this.emulatorStatus | 0) >= 0x10) {
        this.emulatorStatus = this.emulatorStatus & 0xF;
        if ((this.emulatorStatus & 0x1) == 0 && this.BIOS && this.ROM) {
            if ((this.initializeCore() | 0) == 0) {
                //Failure to initialize:
                this.pause();
                return;
            }
            this.importSave();
        }
        this.invalidateMetrics();
        this.setBufferSpace();
        //Report new status back:
        this.playStatusCallback(1);
    }
}
GameBoyAdvanceEmulator.prototype.pause = function () {
    if ((this.emulatorStatus | 0) < 0x10) {
        this.exportSave();
        this.emulatorStatus = this.emulatorStatus | 0x10;
        //Report new status back:
        this.playStatusCallback(0);
    }
}
GameBoyAdvanceEmulator.prototype.stop = function () {
    this.emulatorStatus = this.emulatorStatus & 0x1C;
    this.audioUpdateState = 1;
    this.pause();
}
GameBoyAdvanceEmulator.prototype.restart = function () {
    if ((this.emulatorStatus & 0x1) == 0x1) {
        this.emulatorStatus = this.emulatorStatus & 0x1D;
        this.exportSave();
        if ((this.initializeCore() | 0) == 0) {
            //Failure to initialize:
            this.pause();
            return;
        }
        this.importSave();
        this.audioUpdateState = 1;
        this.processNewSpeed(1);
        this.setBufferSpace();
    }
}
GameBoyAdvanceEmulator.prototype.timerCallback = function (lastTimestamp) {
    //Callback passes us a reference timestamp:
    this.lastTimestamp = lastTimestamp >>> 0;
    switch (this.emulatorStatus | 0) {
        //Core initialized and saves loaded:
        case 5:
            this.iterationStartSequence();                              //Run start of iteration stuff.
            this.IOCore.enter(this.CPUCyclesTotal | 0);                 //Step through the emulation core loop.
            this.iterationEndSequence();                                //Run end of iteration stuff.
            break;
        //Core initialized, but saves still loading:
        case 1:
            break;
        default:
            //Some pending error is preventing execution, so pause:
            this.pause();
    }
}
GameBoyAdvanceEmulator.prototype.iterationStartSequence = function () {
    this.calculateSpeedPercentage();                                    //Calculate the emulator realtime run speed heuristics.
    this.emulatorStatus = this.emulatorStatus | 0x2;                    //If the end routine doesn't unset this, then we are marked as having crashed.
    this.audioUnderrunAdjustment();                                     //If audio is enabled, look to see how much we should overclock by to maintain the audio buffer.
    this.audioPushNewState();                                           //Check to see if we need to update the audio core for any output changes.
    this.runStartJobs();                                                //Run various callbacks assigned from internal components.
}
GameBoyAdvanceEmulator.prototype.iterationEndSequence = function () {
    this.emulatorStatus = this.emulatorStatus & 0x1D;                   //If core did not throw while running, unset the fatal error flag.
    this.clockCyclesSinceStart = ((this.clockCyclesSinceStart | 0) + (this.CPUCyclesTotal | 0)) | 0;    //Accumulate tracking.
    this.submitAudioBuffer();                                           //Flush audio buffer to output.
    this.runEndJobs();                                                  //Run various callbacks assigned from internal components.
}
GameBoyAdvanceEmulator.prototype.runStartJobs = function () {
    var length = this.startCallbacks.length | 0;
    //Loop through all jobs:
    for (var index = 0; (index | 0) < (length | 0); index = ((index | 0) + 1) | 0) {
        //Run job:
        this.startCallbacks[index | 0]();
    }
}
GameBoyAdvanceEmulator.prototype.runEndJobs = function () {
    var length = this.endCallbacks.length | 0;
    //Loop through all jobs:
    for (var index = 0; (index | 0) < (length | 0); index = ((index | 0) + 1) | 0) {
        //Run job:
        this.endCallbacks[index | 0]();
    }
}
GameBoyAdvanceEmulator.prototype.runTerminationJobs = function () {
    var length = this.terminationCallbacks.length | 0;
    //Loop through all jobs:
    for (var index = 0; (index | 0) < (length | 0); index = ((index | 0) + 1) | 0) {
        //Run job:
        this.terminationCallbacks[index | 0]();
    }
    //Remove old jobs:
    this.startCallbacks = [];
    this.endCallbacks = [];
    this.terminationCallbacks = [];
}
GameBoyAdvanceEmulator.prototype.attachROM = function (ROM) {
    this.stop();
    this.ROM = ROM;
}
GameBoyAdvanceEmulator.prototype.attachBIOS = function (BIOS) {
    this.stop();
    this.BIOS = BIOS;
}
GameBoyAdvanceEmulator.prototype.getGameName = function () {
    if ((this.emulatorStatus & 0x3) == 0x1) {
        return this.IOCore.cartridge.name;
    }
    else {
        return "";
    }
}
GameBoyAdvanceEmulator.prototype.attachSaveExportHandler = function (handler) {
    if (typeof handler == "function") {
        this.saveExportHandler = handler;
    }
}
GameBoyAdvanceEmulator.prototype.attachSaveImportHandler = function (handler) {
    if (typeof handler == "function") {
        this.saveImportHandler = handler;
    }
}
GameBoyAdvanceEmulator.prototype.attachSpeedHandler = function (handler) {
    if (typeof handler == "function") {
        this.speedCallback = handler;
    }
}
GameBoyAdvanceEmulator.prototype.attachPlayStatusHandler = function (handler) {
    if (typeof handler == "function") {
        this.playStatusCallback = handler;
    }
}
GameBoyAdvanceEmulator.prototype.importSave = function () {
    if (this.saveImportHandler) {
        var name = this.getGameName();
        if (name != "") {
            var parentObj = this;
            this.emulatorStatus = this.emulatorStatus & 0x1B;
            this.saveImportHandler(name, function (save) {
                parentObj.emulatorStatus = parentObj.emulatorStatus & 0x1B;
                parentObj.saveImportHandler("TYPE_" + name, function (saveType) {
                    if (save && saveType && (parentObj.emulatorStatus & 0x3) == 0x1) {
                        var length = save.length | 0;
                        var convertedSave = getUint8Array(length | 0);
                        if ((length | 0) > 0) {
                            for (var index = 0; (index | 0) < (length | 0); index = ((index | 0) + 1) | 0) {
                                convertedSave[index | 0] = save[index | 0] & 0xFF;
                            }
                            //We used to save this code wrong, fix the error in old saves:
                            if ((saveType.length | 0) != 1) {
                                //0 is fallthrough "UNKNOWN" aka autodetect type:
                                parentObj.IOCore.saves.importSave(convertedSave, 0);
                            }
                            else {
                                parentObj.IOCore.saves.importSave(convertedSave, saveType[0] & 0xFF);
                            }
                            parentObj.emulatorStatus = parentObj.emulatorStatus | 0x4;
                        }
                    }
                }, function (){parentObj.emulatorStatus = parentObj.emulatorStatus | 0x4;});
            }, function (){parentObj.emulatorStatus = parentObj.emulatorStatus | 0x4;});
            return;
        }
    }
    this.emulatorStatus = this.emulatorStatus | 0x4;
}
GameBoyAdvanceEmulator.prototype.exportSave = function () {
    if (this.saveExportHandler && (this.emulatorStatus & 0x3) == 0x1) {
        var save = this.IOCore.saves.exportSave();
        var saveType = this.IOCore.saves.exportSaveType() | 0;
        if (save != null) {
            this.saveExportHandler(this.IOCore.cartridge.name, save);
            this.saveExportHandler("TYPE_" + this.IOCore.cartridge.name, [saveType | 0]);
        }
    }
}
GameBoyAdvanceEmulator.prototype.setSpeed = function (speed) {
    speed = +speed;
    //Dynamic Speed overrides custom speed levels:
    if (!this.settings.dynamicSpeed) {
        this.processNewSpeed(+speed);
    }
}
GameBoyAdvanceEmulator.prototype.processNewSpeed = function (speed) {
    speed = +speed;
    //0.003 for the integer resampler limitations, 0x3F for int math limitations:
    speed = +Math.min(Math.max(+speed, 0.003), 0x3F);
    if ((+speed) != (+this.settings.emulatorSpeed)) {
        this.settings.emulatorSpeed = +speed;
        this.calculateTimings();
    }
}
GameBoyAdvanceEmulator.prototype.incrementSpeed = function (delta) {
    delta = +delta;
    this.setSpeed((+delta) + (+this.settings.emulatorSpeed));
}
GameBoyAdvanceEmulator.prototype.getSpeed = function () {
    return +this.settings.emulatorSpeed;
}
GameBoyAdvanceEmulator.prototype.invalidateMetrics = function () {
    this.clockCyclesSinceStart = 0;
    this.metricStart = 0;
}
GameBoyAdvanceEmulator.prototype.resetMetrics = function () {
    this.clockCyclesSinceStart = 0;
    this.metricStart = this.lastTimestamp >>> 0;
}
GameBoyAdvanceEmulator.prototype.calculateTimings = function () {
    this.clocksPerSecond = Math.min((+this.settings.emulatorSpeed) * 0x1000000, 0x3F000000) | 0;
    this.clocksPerMilliSecond = +((this.clocksPerSecond | 0) / 1000);
    this.CPUCyclesPerIteration = ((+this.clocksPerMilliSecond) * (+this.timerIntervalRate)) | 0;
    this.CPUCyclesTotal = this.CPUCyclesPerIteration | 0;
    this.initializeAudioLogic();
    this.reinitializeAudio();
    this.invalidateMetrics();
}
GameBoyAdvanceEmulator.prototype.setIntervalRate = function (intervalRate) {
    intervalRate = +intervalRate;
    if ((+intervalRate) > 0 && (+intervalRate) < 1000) {
        if ((+intervalRate) != (+this.timerIntervalRate)) {
            this.timerIntervalRate = +intervalRate;
            this.calculateTimings();
        }
    }
}
GameBoyAdvanceEmulator.prototype.calculateSpeedPercentage = function () {
    if ((this.metricStart >>> 0) != 0) {
        var timeDiff = Math.max(((this.lastTimestamp >>> 0) - (this.metricStart >>> 0)) | 0, 1) >>> 0;
        if ((timeDiff >>> 0) >= (this.settings.metricCollectionMinimum | 0)) {
            if (this.speedCallback) {
                var result = ((this.clockCyclesSinceStart | 0) * 100000) / ((timeDiff >>> 0) * 0x1000000);
                this.speedCallback(+result);
            }
            //Reset counter for speed check:
            this.resetMetrics();
            //Do a computation for dynamic speed this iteration:
            this.dynamicSpeedRefresh = true;
        }
        else {
            //Postpone any dynamic speed changes this iteration:
            this.dynamicSpeedRefresh = false;
        }
    }
    else {
        //Reset counter for speed check:
        this.resetMetrics();
        //Postpone any dynamic speed changes this iteration:
        this.dynamicSpeedRefresh = false;
    }
}
GameBoyAdvanceEmulator.prototype.initializeCore = function () {
    //Wrap up any old internal instance callbacks:
    this.runTerminationJobs();
    //Setup a new instance of the i/o core:
    this.IOCore = new GameBoyAdvanceIO(this.settings.SKIPBoot, this.coreExposed, this.BIOS, this.ROM);
    //Call the initalization procedure and get status code:
    var allowInit = this.IOCore.initialize() | 0;
    //Append status code as play status flag for emulator runtime:
    this.emulatorStatus = this.emulatorStatus | allowInit;
    return allowInit | 0;
}
GameBoyAdvanceEmulator.prototype.keyDown = function (keyPressed) {
    keyPressed = keyPressed | 0;
    if ((this.emulatorStatus | 0) < 0x10 && (keyPressed | 0) >= 0 && (keyPressed | 0) <= 9) {
        this.IOCore.joypad.keyPress(keyPressed | 0);
    }
}
GameBoyAdvanceEmulator.prototype.keyUp = function (keyReleased) {
    keyReleased = keyReleased | 0;
    if ((this.emulatorStatus | 0) < 0x10 && (keyReleased | 0) >= 0 && (keyReleased | 0) <= 9) {
        this.IOCore.joypad.keyRelease(keyReleased | 0);
    }
}
GameBoyAdvanceEmulator.prototype.attachGraphicsFrameHandler = function (handler) {
    if (typeof handler == "object") {
        this.coreExposed.graphicsHandle = handler;
    }
}
GameBoyAdvanceEmulator.prototype.attachAudioHandler = function (mixerInputHandler) {
    if (mixerInputHandler) {
        this.audio = mixerInputHandler;
    }
}
GameBoyAdvanceEmulator.prototype.enableAudio = function () {
    if ((this.audioFound | 0) == 0 && this.audio) {
        this.audioFound = 1;    //Set audio to 'found' by default.
        //Attempt to enable audio:
        var parentObj = this;
        this.audio.initialize(2, (this.clocksPerSecond | 0) / (this.audioResamplerFirstPassFactor | 0), Math.max((+this.clocksPerMilliSecond) * (this.settings.audioBufferSize | 0) / (this.audioResamplerFirstPassFactor | 0), 4) | 0, function () {
                //Not needed
            }, function () {
                //We manually check at the start of each timer interval, so not needed here.
            }, function () {
                //Disable audio in the callback here:
                parentObj.disableAudio();
        });
        this.audio.register();
    }
}
GameBoyAdvanceEmulator.prototype.disableAudio = function () {
    if ((this.audioFound | 0) != 0) {
        this.audio.unregister();
        this.audioFound = 0;
    }
}
GameBoyAdvanceEmulator.prototype.reinitializeAudio = function () {
    if ((this.audioFound | 0) != 0) {
        this.disableAudio();
        this.enableAudio();
    }
}
GameBoyAdvanceEmulator.prototype.initializeAudioLogic = function () {
    //Calculate the variables for the preliminary downsampler first:
    this.audioResamplerFirstPassFactor = Math.min(Math.floor((this.clocksPerSecond | 0) / 44100), Math.floor(0x7FFFFFFF / 0x3FF)) | 0;
    this.audioDownSampleInputDivider = +((2 / 0x3FF) / (this.audioResamplerFirstPassFactor | 0));
    this.initializeAudioBuffering();
    //Need to push the new resample factor:
    this.audioUpdateState = 1;
}
GameBoyAdvanceEmulator.prototype.initializeAudioBuffering = function () {
    this.audioDestinationPosition = 0;
    this.audioBufferContainAmount = Math.max((+this.clocksPerMilliSecond) * (this.settings.audioBufferUnderrunLimit | 0) / (this.audioResamplerFirstPassFactor | 0), 3) << 1;
    this.audioBufferOverclockBlockAmount = Math.max((+this.clocksPerMilliSecond) * (this.settings.overclockBlockLimit | 0) / (this.audioResamplerFirstPassFactor | 0), 3) << 1;
    this.audioBufferDynamicContainAmount = Math.max((+this.clocksPerMilliSecond) * (this.settings.audioBufferDynamicLimit | 0) / (this.audioResamplerFirstPassFactor | 0), 2) << 1;
    //Underrun logic will request at most 32 milliseconds of runtime per iteration, so set buffer size to 64 ms:
    var audioNumSamplesTotal = Math.max(((+this.clocksPerMilliSecond) / (this.audioResamplerFirstPassFactor | 0)) << 6, 4) << 1;
    if (!this.audioBuffer || ((audioNumSamplesTotal | 0) > (this.audioBuffer.length | 0))) {
        //Only regen buffer if the size is increased:
        this.audioBuffer = getFloat32Array(audioNumSamplesTotal | 0);
    }
}
GameBoyAdvanceEmulator.prototype.outputAudio = function (downsampleInputLeft, downsampleInputRight) {
    downsampleInputLeft = downsampleInputLeft | 0;
    downsampleInputRight = downsampleInputRight | 0;
    this.audioBuffer[this.audioDestinationPosition | 0] = ((downsampleInputLeft | 0) * (+this.audioDownSampleInputDivider)) - 1;
    this.audioDestinationPosition = ((this.audioDestinationPosition | 0) + 1) | 0;
    this.audioBuffer[this.audioDestinationPosition | 0] = ((downsampleInputRight | 0) * (+this.audioDownSampleInputDivider)) - 1;
    this.audioDestinationPosition = ((this.audioDestinationPosition | 0) + 1) | 0;
}
GameBoyAdvanceEmulator.prototype.submitAudioBuffer = function () {
    if ((this.audioFound | 0) != 0) {
        this.audio.push(this.audioBuffer, 0, this.audioDestinationPosition | 0);
    }
    this.audioDestinationPosition = 0;
}
GameBoyAdvanceEmulator.prototype.audioUnderrunAdjustment = function () {
    this.CPUCyclesTotal = this.CPUCyclesPerIteration | 0;
    if ((this.audioFound | 0) != 0) {
        var remainingAmount = this.audio.remainingBuffer();
        if (typeof remainingAmount == "number") {
            remainingAmount = Math.max(remainingAmount | 0, 0) | 0;
            var underrunAmount = ((this.audioBufferContainAmount | 0) - (remainingAmount | 0)) | 0;
            if ((underrunAmount | 0) > 0) {
                if (this.dynamicSpeedRefresh && this.settings.dynamicSpeed) {
                    if (((this.audioBufferDynamicContainAmount | 0) - (remainingAmount | 0)) > 0) {
                        var speed = +this.getSpeed();
                        speed = Math.max((+speed) - 0.1, 0.003);
                        this.processNewSpeed(+speed);
                    }
                }
                this.CPUCyclesTotal = Math.min(((this.CPUCyclesTotal | 0) + ((underrunAmount >> 1) * (this.audioResamplerFirstPassFactor | 0))) | 0, (+this.clocksPerMilliSecond) << 5) | 0;
            }
            else {
                if (this.dynamicSpeedRefresh && this.settings.dynamicSpeed) {
                    var speed = +this.getSpeed();
                    if ((+speed) < 1) {
                        speed = +Math.min((+speed) + 0.01, 1);
                        this.processNewSpeed(+speed);
                    }
                }
                var overrunAmount = ((remainingAmount | 0) - (this.audioBufferOverclockBlockAmount | 0)) | 0;
                if ((overrunAmount | 0) > 0) {
                    this.CPUCyclesTotal = Math.max(((this.CPUCyclesTotal | 0) - ((overrunAmount >> 1) * (this.audioResamplerFirstPassFactor | 0))) | 0, 0) | 0;
                }
            }
        }
    }
}
GameBoyAdvanceEmulator.prototype.audioPushNewState = function () {
    if ((this.audioUpdateState | 0) != 0) {
        this.IOCore.sound.initializeOutput(this.audioResamplerFirstPassFactor | 0);
        this.audioUpdateState = 0;
    }
}
GameBoyAdvanceEmulator.prototype.setBufferSpace = function () {
    if ((this.audioFound | 0) != 0) {
        //Fill the audio system with zeros for buffer stabilization on start:
        this.audio.setBufferSpace(this.audioBufferContainAmount | 0);
    }
}
GameBoyAdvanceEmulator.prototype.toggleSkipBootROM = function (SKIPBoot) {
    this.settings.SKIPBoot = !!SKIPBoot;
}
GameBoyAdvanceEmulator.prototype.toggleDynamicSpeed = function (dynamicSpeed) {
    this.settings.dynamicSpeed = !!dynamicSpeed;
    this.processNewSpeed(1);
}
GameBoyAdvanceEmulator.prototype.toggleOffthreadGraphics = function (offthreadGfxEnabled) {
    this.settings.offthreadGfxEnabled = !!offthreadGfxEnabled;
}
