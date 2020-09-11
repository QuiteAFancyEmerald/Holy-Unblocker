var Module = {
	preRun: [],
	postRun: [],
	canvas: (function() {
		var canvas = document.getElementById('canvas');

		canvas.addEventListener("webglcontextlost", function(e) {
			alert('WebGL context lost. You will need to reload the page.');
			e.preventDefault();
		}, false);

		return canvas;
	})(),
	totalDependencies: 0,
	monitorRunDependencies: function(left) {
		this.totalDependencies = Math.max(this.totalDependencies, left);
	}
};
frameskip = 0
snes_transparency = 1
if (window.File && window.FileReader && window.FileList && window.Blob) {} else {
	alert('The File APIs are not fully supported in this browser.');
}

function snes_readfile() {
	if(window.location.hash){
		var romloc = "./roms/" + window.location.hash.substring(1) + ".smc";
		var oReq = new XMLHttpRequest();
		oReq.open("GET", romloc, true);
		oReq.responseType = "arraybuffer";
		oReq.onload = function() {
			if(oReq.status=="404"){
				document.getElementById('ffd').style.display = "block";
				alert("Could not find " + romloc.substring(2));
			} else {
				var arrayBuffer = oReq.response;
				Module.FS_createDataFile("/", "_.smc", new Uint8Array(arrayBuffer), true, true);
				snes_main();
				ToggleDisplayFramerate();
			}
		};
		oReq.send();
	} else {
		document.getElementById('ffd').style.display = "block";
	}
}

function snes_upload(upload) {
	var f = upload.files[0]
	var reader = new FileReader()
	reader.onload = function() {
		document.getElementById('ffd').style.display = "none";
		Module.FS_createDataFile("/", "_.smc", new Uint8Array(this.result), true, true);
		snes_main();
		ToggleDisplayFramerate();
	}
	reader.readAsArrayBuffer(f)
}

function snes_main() {
	set_frameskip = Module.cwrap('set_frameskip', 'number', ['number'])
	ToggleDisplayFramerate = Module._toggle_display_framerate
	reboot_romnum = -1
	frames = 0
	frameskipped = 0
	Module._run();
}

function setSmooth(){
	var chekd = document.getElementById("smooth").checked;
	var canvi = document.getElementById("canvas");
	if (chekd == true){
		canvi.className = "textureSmooth";
	} else {
		canvi.className = "texturePixelated";
	}
}