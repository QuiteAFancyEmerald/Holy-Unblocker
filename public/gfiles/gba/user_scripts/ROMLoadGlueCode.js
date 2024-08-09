"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function fileThings() {
	if(window.location.hash){
		downloadBIOS();
		downloadROM();
	} else {
		document.getElementById('ffd').style.display = "block";
		downloadBIOS();
	}
}
function yayPlay() {
	document.getElementById("play").click();
}
function gba_upload(upload) {
	document.getElementById('ffd').style.display = "none";
	fileLoadShimCode(upload.files, attachROM);
}
function downloadBIOS() {
	downloadFile("bios.bin", "BIOS");
}
function downloadROM() {
	var romloc = "./roms/" + window.location.hash.substring(1) + ".gba";
	downloadFile(romloc, "ROM");
}
function attachBIOS(BIOS) {
	try {
		IodineGUI.Iodine.attachBIOS(new Uint8Array(BIOS));
	}
	catch (error) {
		IodineGUI.Iodine.attachBIOS(BIOS);
	}
}
function attachROM(ROM) {
	try {
		IodineGUI.Iodine.attachROM(new Uint8Array(ROM));
	}
	catch (error) {
		IodineGUI.Iodine.attachROM(ROM);
	}
}
function fileLoadShimCode(files, ROMHandler) {
	if (typeof files != "undefined") {
		if (files.length >= 1) {
			//Gecko 1.9.2+ (Standard Method)
			try {
				var binaryHandle = new FileReader();
				binaryHandle.onloadend = function () {
					ROMHandler(this.result);
					yayPlay();
				}
				binaryHandle.readAsArrayBuffer(files[files.length - 1]);
			}
			catch (error) {
				try {
					var result = files[files.length - 1].getAsBinary();
					var resultConverted = [];
					for (var index = 0; index < result.length; ++index) {
						resultConverted[index] = result.charCodeAt(index) & 0xFF;
					}
					ROMHandler(resultConverted);
					yayPlay();
				}
				catch (error) {
					alert("Could not load the processed ROM file!");
				}
			}
		}
	}
}
function fileLoadBIOS() {
	fileLoadShimCode(this.files, attachBIOS);
}
function fileLoadROM() {
	fileLoadShimCode(this.files, attachROM);
}
function downloadFile(fileName, reg) {
	var ajax = new XMLHttpRequest();
	ajax.onload = function(){
		if(ajax.status=="404"){
			document.getElementById('ffd').style.display = "block";
			alert("Could not find " + fileName.substring(2));
		} else {
				if(reg=="BIOS"){
				processDownload(this, attachBIOS);
			} else if(reg=="ROM"){
				processDownload(this, attachROM);
				yayPlay();
			}
		}
	}
	ajax.open("GET", "./" + fileName, true);
	ajax.responseType = "arraybuffer";
	ajax.overrideMimeType("text/plain; charset=x-user-defined");
	ajax.send(null);
}
function processDownload(parentObj, attachHandler) {
	try {
		attachHandler(new Uint8Array(parentObj.response));
	}
	catch (error) {
		var data = parentObj.responseText;
		var length = data.length;
		var dataArray = [];
		for (var index = 0; index < length; index++) {
			dataArray[index] = data.charCodeAt(index) & 0xFF;
		}
		attachHandler(dataArray);
	}
}