// Source Code: https://github.com/BinBashBanana/webretro
// please dont use IE
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
if (!window.fetch || !indexedDB) {
	alert("Update your browser!");
	throw "Update your browser!";
}

var fsBundleDirs, fsBundleFiles, loadStatus, romName, stateReadersReady, stateReaders2Ready, saveReadersReady, isPaused, wasmReady, bundleReady, romMode, core, wIdb, romUploadCallback, latestVersion;
var bundleCdn = "https://cdn.jsdelivr.net/gh/BinBashBanana/webretro/";
var keybinds = 'input_player1_start = "enter"\ninput_player1_select = "space"\ninput_player1_l = "e"\ninput_player1_l2 = "r"\ninput_player1_r = "p"\ninput_player1_r2 = "o"\ninput_player1_a = "h"\ninput_player1_b = "g"\ninput_player1_x = "y"\ninput_player1_y = "t"\ninput_player1_up = "up"\ninput_player1_left = "left"\ninput_player1_down = "down"\ninput_player1_right = "right"\ninput_player1_l_x_minus = "a"\ninput_player1_l_x_plus = "d"\ninput_player1_l_y_minus = "w"\ninput_player1_l_y_plus = "s"\ninput_player1_l3_btn = "x"\ninput_player1_r_x_minus = "j"\ninput_player1_r_x_plus = "l"\ninput_player1_r_y_minus = "i"\ninput_player1_r_y_plus = "k"\ninput_player1_r3_btn = "comma"\ninput_menu_toggle = "f1"\ninput_save_state = "f2"\ninput_load_state = "f3"\n';
var nulKeys = 'input_ai_service = "nul"\ninput_ai_service_axis = "nul"\ninput_ai_service_btn = "nul"\ninput_ai_service_mbtn = "nul"\ninput_audio_mute = "nul"\ninput_audio_mute_axis = "nul"\ninput_audio_mute_btn = "nul"\ninput_audio_mute_mbtn = "nul"\ninput_cheat_index_minus = "nul"\ninput_cheat_index_minus_axis = "nul"\ninput_cheat_index_minus_btn = "nul"\ninput_cheat_index_minus_mbtn = "nul"\ninput_cheat_index_plus = "nul"\ninput_cheat_index_plus_axis = "nul"\ninput_cheat_index_plus_btn = "nul"\ninput_cheat_index_plus_mbtn = "nul"\ninput_cheat_toggle = "nul"\ninput_cheat_toggle_axis = "nul"\ninput_cheat_toggle_btn = "nul"\ninput_cheat_toggle_mbtn = "nul"\ninput_desktop_menu_toggle = "nul"\ninput_desktop_menu_toggle_axis = "nul"\ninput_desktop_menu_toggle_btn = "nul"\ninput_desktop_menu_toggle_mbtn = "nul"\ninput_disk_eject_toggle = "nul"\ninput_disk_eject_toggle_axis = "nul"\ninput_disk_eject_toggle_btn = "nul"\ninput_disk_eject_toggle_mbtn = "nul"\ninput_disk_next = "nul"\ninput_disk_next_axis = "nul"\ninput_disk_next_btn = "nul"\ninput_disk_next_mbtn = "nul"\ninput_disk_prev = "nul"\ninput_disk_prev_axis = "nul"\ninput_disk_prev_btn = "nul"\ninput_disk_prev_mbtn = "nul"\ninput_duty_cycle = "nul"\ninput_enable_hotkey = "nul"\ninput_enable_hotkey_axis = "nul"\ninput_enable_hotkey_btn = "nul"\ninput_enable_hotkey_mbtn = "nul"\ninput_exit_emulator = "nul"\ninput_exit_emulator_axis = "nul"\ninput_exit_emulator_btn = "nul"\ninput_exit_emulator_mbtn = "nul"\ninput_fps_toggle = "nul"\ninput_fps_toggle_axis = "nul"\ninput_fps_toggle_btn = "nul"\ninput_fps_toggle_mbtn = "nul"\ninput_frame_advance = "nul"\ninput_frame_advance_axis = "nul"\ninput_frame_advance_btn = "nul"\ninput_frame_advance_mbtn = "nul"\ninput_game_focus_toggle = "nul"\ninput_game_focus_toggle_axis = "nul"\ninput_game_focus_toggle_btn = "nul"\ninput_game_focus_toggle_mbtn = "nul"\ninput_grab_mouse_toggle = "nul"\ninput_grab_mouse_toggle_axis = "nul"\ninput_grab_mouse_toggle_btn = "nul"\ninput_grab_mouse_toggle_mbtn = "nul"\ninput_hold_fast_forward = "nul"\ninput_hold_fast_forward_axis = "nul"\ninput_hold_fast_forward_btn = "nul"\ninput_hold_fast_forward_mbtn = "nul"\ninput_hold_slowmotion = "nul"\ninput_slowmotion = "nul"\ninput_hold_slowmotion_axis = "nul"\ninput_hold_slowmotion_btn = "nul"\ninput_hold_slowmotion_mbtn = "nul"\ninput_hotkey_block_delay = "nul"\ninput_load_state_axis = "nul"\ninput_load_state_btn = "nul"\ninput_load_state_mbtn = "nul"\ninput_menu_toggle_axis = "nul"\ninput_menu_toggle_btn = "nul"\ninput_menu_toggle_mbtn = "nul"\ninput_movie_record_toggle = "nul"\ninput_movie_record_toggle_axis = "nul"\ninput_movie_record_toggle_btn = "nul"\ninput_movie_record_toggle_mbtn = "nul"\ninput_netplay_game_watch = "nul"\ninput_netplay_game_watch_axis = "nul"\ninput_netplay_game_watch_btn = "nul"\ninput_netplay_game_watch_mbtn = "nul"\ninput_netplay_host_toggle = "nul"\ninput_netplay_host_toggle_axis = "nul"\ninput_netplay_host_toggle_btn = "nul"\ninput_netplay_host_toggle_mbtn = "nul"\ninput_osk_toggle = "nul"\ninput_osk_toggle_axis = "nul"\ninput_osk_toggle_btn = "nul"\ninput_osk_toggle_mbtn = "nul"\ninput_overlay_next = "nul"\ninput_overlay_next_axis = "nul"\ninput_overlay_next_btn = "nul"\ninput_overlay_next_mbtn = "nul"\ninput_pause_toggle = "nul"\ninput_pause_toggle_axis = "nul"\ninput_pause_toggle_btn = "nul"\ninput_pause_toggle_mbtn = "nul"\ninput_player1_a_axis = "nul"\ninput_player1_a_btn = "nul"\ninput_player1_a_mbtn = "nul"\ninput_player1_b_axis = "nul"\ninput_player1_b_btn = "nul"\ninput_player1_b_mbtn = "nul"\ninput_player1_down_axis = "nul"\ninput_player1_down_btn = "nul"\ninput_player1_down_mbtn = "nul"\ninput_player1_gun_aux_a = "nul"\ninput_player1_gun_aux_a_axis = "nul"\ninput_player1_gun_aux_a_btn = "nul"\ninput_player1_gun_aux_a_mbtn = "nul"\ninput_player1_gun_aux_b = "nul"\ninput_player1_gun_aux_b_axis = "nul"\ninput_player1_gun_aux_b_btn = "nul"\ninput_player1_gun_aux_b_mbtn = "nul"\ninput_player1_gun_aux_c = "nul"\ninput_player1_gun_aux_c_axis = "nul"\ninput_player1_gun_aux_c_btn = "nul"\ninput_player1_gun_aux_c_mbtn = "nul"\ninput_player1_gun_dpad_down = "nul"\ninput_player1_gun_dpad_down_axis = "nul"\ninput_player1_gun_dpad_down_btn = "nul"\ninput_player1_gun_dpad_down_mbtn = "nul"\ninput_player1_gun_dpad_left = "nul"\ninput_player1_gun_dpad_left_axis = "nul"\ninput_player1_gun_dpad_left_btn = "nul"\ninput_player1_gun_dpad_left_mbtn = "nul"\ninput_player1_gun_dpad_right = "nul"\ninput_player1_gun_dpad_right_axis = "nul"\ninput_player1_gun_dpad_right_btn = "nul"\ninput_player1_gun_dpad_right_mbtn = "nul"\ninput_player1_gun_dpad_up = "nul"\ninput_player1_gun_dpad_up_axis = "nul"\ninput_player1_gun_dpad_up_btn = "nul"\ninput_player1_gun_dpad_up_mbtn = "nul"\ninput_player1_gun_offscreen_shot = "nul"\ninput_player1_gun_offscreen_shot_axis = "nul"\ninput_player1_gun_offscreen_shot_btn = "nul"\ninput_player1_gun_offscreen_shot_mbtn = "nul"\ninput_player1_gun_select = "nul"\ninput_player1_gun_select_axis = "nul"\ninput_player1_gun_select_btn = "nul"\ninput_player1_gun_select_mbtn = "nul"\ninput_player1_gun_start = "nul"\ninput_player1_gun_start_axis = "nul"\ninput_player1_gun_start_btn = "nul"\ninput_player1_gun_start_mbtn = "nul"\ninput_player1_gun_trigger = "nul"\ninput_player1_gun_trigger_axis = "nul"\ninput_player1_gun_trigger_btn = "nul"\ninput_player1_gun_trigger_mbtn = "nul"\ninput_player1_l2_axis = "nul"\ninput_player1_l2_btn = "nul"\ninput_player1_l2_mbtn = "nul"\ninput_player1_l3 = "nul"\ninput_player1_l3_axis = "nul"\ninput_player1_l3_mbtn = "nul"\ninput_player1_l_axis = "nul"\ninput_player1_l_btn = "nul"\ninput_player1_l_mbtn = "nul"\ninput_player1_l_x_minus_axis = "nul"\ninput_player1_l_x_minus_btn = "nul"\ninput_player1_l_x_minus_mbtn = "nul"\ninput_player1_l_x_plus_axis = "nul"\ninput_player1_l_x_plus_btn = "nul"\ninput_player1_l_x_plus_mbtn = "nul"\ninput_player1_l_y_minus_axis = "nul"\ninput_player1_l_y_minus_btn = "nul"\ninput_player1_l_y_minus_mbtn = "nul"\ninput_player1_l_y_plus_axis = "nul"\ninput_player1_l_y_plus_btn = "nul"\ninput_player1_l_y_plus_mbtn = "nul"\ninput_player1_left_axis = "nul"\ninput_player1_left_mbtn = "nul"\ninput_player1_r2_axis = "nul"\ninput_player1_r2_btn = "nul"\ninput_player1_r2_mbtn = "nul"\ninput_player1_r3 = "nul"\ninput_player1_r3_axis = "nul"\ninput_player1_r3_mbtn = "nul"\ninput_player1_r_axis = "nul"\ninput_player1_r_btn = "nul"\ninput_player1_r_mbtn = "nul"\ninput_player1_r_x_minus_axis = "nul"\ninput_player1_r_x_minus_btn = "nul"\ninput_player1_r_x_minus_mbtn = "nul"\ninput_player1_r_x_plus_axis = "nul"\ninput_player1_r_x_plus_btn = "nul"\ninput_player1_r_x_plus_mbtn = "nul"\ninput_player1_r_y_minus_axis = "nul"\ninput_player1_r_y_minus_btn = "nul"\ninput_player1_r_y_minus_mbtn = "nul"\ninput_player1_r_y_plus_axis = "nul"\ninput_player1_r_y_plus_btn = "nul"\ninput_player1_r_y_plus_mbtn = "nul"\ninput_player1_right_axis = "nul"\ninput_player1_right_mbtn = "nul"\ninput_player1_select_axis = "nul"\ninput_player1_select_btn = "nul"\ninput_player1_select_mbtn = "nul"\ninput_player1_start_axis = "nul"\ninput_player1_start_btn = "nul"\ninput_player1_start_mbtn = "nul"\ninput_player1_turbo = "nul"\ninput_player1_turbo_axis = "nul"\ninput_player1_turbo_btn = "nul"\ninput_player1_turbo_mbtn = "nul"\ninput_player1_up_axis = "nul"\ninput_player1_up_btn = "nul"\ninput_player1_up_mbtn = "nul"\ninput_player1_x_axis = "nul"\ninput_player1_x_btn = "nul"\ninput_player1_x_mbtn = "nul"\ninput_player1_y_axis = "nul"\ninput_player1_y_btn = "nul"\ninput_player1_y_mbtn = "nul"\ninput_poll_type_behavior = "nul"\ninput_recording_toggle = "nul"\ninput_recording_toggle_axis = "nul"\ninput_recording_toggle_btn = "nul"\ninput_recording_toggle_mbtn = "nul"\ninput_reset = "nul"\ninput_reset_axis = "nul"\ninput_reset_btn = "nul"\ninput_reset_mbtn = "nul"\ninput_rewind = "nul"\ninput_rewind_axis = "nul"\ninput_rewind_btn = "nul"\ninput_rewind_mbtn = "nul"\ninput_save_state_axis = "nul"\ninput_save_state_btn = "nul"\ninput_save_state_mbtn = "nul"\ninput_screenshot = "nul"\ninput_screenshot_axis = "nul"\ninput_screenshot_btn = "nul"\ninput_screenshot_mbtn = "nul"\ninput_send_debug_info = "nul"\ninput_send_debug_info_axis = "nul"\ninput_send_debug_info_btn = "nul"\ninput_send_debug_info_mbtn = "nul"\ninput_shader_next = "nul"\ninput_shader_next_axis = "nul"\ninput_shader_next_btn = "nul"\ninput_shader_next_mbtn = "nul"\ninput_shader_prev = "nul"\ninput_shader_prev_axis = "nul"\ninput_shader_prev_btn = "nul"\ninput_shader_prev_mbtn = "nul"\ninput_state_slot_decrease = "nul"\ninput_state_slot_decrease_axis = "nul"\ninput_state_slot_decrease_btn = "nul"\ninput_state_slot_decrease_mbtn = "nul"\ninput_state_slot_increase = "nul"\ninput_state_slot_increase_axis = "nul"\ninput_state_slot_increase_btn = "nul"\ninput_state_slot_increase_mbtn = "nul"\ninput_streaming_toggle = "nul"\ninput_streaming_toggle_axis = "nul"\ninput_streaming_toggle_btn = "nul"\ninput_streaming_toggle_mbtn = "nul"\ninput_toggle_fast_forward = "nul"\ninput_toggle_fast_forward_axis = "nul"\ninput_toggle_fast_forward_btn = "nul"\ninput_toggle_fast_forward_mbtn = "nul"\ninput_toggle_fullscreen = "nul"\ninput_toggle_fullscreen_axis = "nul"\ninput_toggle_fullscreen_btn = "nul"\ninput_toggle_fullscreen_mbtn = "nul"\ninput_toggle_slowmotion = "nul"\ninput_toggle_slowmotion_axis = "nul"\ninput_toggle_slowmotion_btn = "nul"\ninput_toggle_slowmotion_mbtn = "nul"\ninput_turbo_default_button = "nul"\ninput_turbo_mode = "nul"\ninput_turbo_period = "nul"\ninput_volume_down = "nul"\ninput_volume_down_axis = "nul"\ninput_volume_down_btn = "nul"\ninput_volume_down_mbtn = "nul"\ninput_volume_up = "nul"\ninput_volume_up_axis = "nul"\ninput_volume_up_btn = "nul"\ninput_volume_up_mbtn = "nul"\n';
var extraConfig = 'rgui_show_start_screen = "false"\n';
var pdKeys = [8, 9, 13, 19, 27, 32, 33, 34, 35, 36, 42, 44, 45, 91, 92, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135];
var webretroVersion = 6.3;
var updateNotice = document.getElementById("updatenotice");
var versionIndicator = document.getElementById("versionindicator");
var upload = document.getElementById("upload");
var googleDriveUpload = document.getElementById("googledriveupload");
var dropboxUpload = document.getElementById("dropboxupload");
var oneDriveUpload = document.getElementById("onedriveupload");
var startButton = document.getElementById("startbutton");
var smooth = document.getElementById("smooth");
var doubleRes = document.getElementById("doubleres");
var resModifier = 1;
var canvas = document.getElementById("canvas");
var canvasMask = document.getElementById("canvasmask");
var dateTime = new Date();
var saveState = document.getElementById("savestate");
var loadState = document.getElementById("loadstate");
var undoSaveState = document.getElementById("undosavestate");
var undoLoadState = document.getElementById("undoloadstate");
var exportState = document.getElementById("exportstate");
var importState = document.getElementById("importstate");
var ffd = document.getElementById("ffd");
var ffdContent = document.getElementById("ffdcontent");
var systemName = document.getElementById("systemname");
var consoleButton = document.getElementById("consolebutton");
var menuButton = document.getElementById("menubutton");
var pauseButton = document.getElementById("pause");
var resumeOverlay = document.getElementById("resume");
var sideAlertHolder = document.getElementById("sidealertholder");
var saveGame = document.getElementById("savegame");
var exportSave = document.getElementById("exportsave");
var importSave = document.getElementById("importsave");
var autosave = document.getElementById("autosave");
var mainArea = document.getElementById("mainarea");
var hoverMenu = document.getElementById("menu");
var hoverMenuIndicator = document.getElementById("menuindicator");
var search = decodeURIComponent(window.location.search).substring(1).split("&");
var systems = {"beetle_psx": "PS1", "citra": "Nintendo 3DS", "desmume": "Nintendo DS", "dolphin": "GC/Wii", "genesis_plus_gx": "Genesis", "mgba": "GBA", "mupen64plus_next": "Nintendo 64", "nestopia": "NES", "parallel_n64": "Nintendo 64", "ppsspp": "PSP", "snes9x": "SNES"};
var installedCores = ["genesis_plus_gx", "mgba", "mupen64plus_next", "nestopia", "snes9x"];
var fileExts = {"GBA": ".gb, .gbc, .gba", "GC/Wii": ".iso, .gcm, .dol, .tgc, .wbfs, .ciso, .gcz, .wad", "Genesis": ".mdx, .md, .smd, .gen, .sms, .gg, .sg, .68k, .chd", "NES": ".nes, .fds, .unf, .unif", "Nintendo 64": ".n64, .v64, .z64, .u1, .ndd", "Nintendo 3DS": ".3ds, .3dsx, .cci, .cxi", "Nintendo DS": ".nds, .srl", "PS1": ".ccd, .iso", "PSP": ".cso, .pbp", "SNES": ".smc, .sfc, .swc, .fig, .bs, .st"};
var allFileExts = Object.values(fileExts).join(", ");
var allValidFileExts = [];
for (var i = 0; i < installedCores.length; i++) {
	allValidFileExts.push(fileExts[systems[installedCores[i]]]);
}
allValidFileExts = allValidFileExts.join(", ");
var baseFsBundleDir = "/home/web_user/retroarch/bundle";
var awaitLogQueue = {};
var bundleErrors = 0;
var sramExt = ".srm";
var smasBrickFix = {"16a160ddd431a3db6fcd7453ffae9c4c": [80,65,84,67,72,0,127,160,0,8,169,1,133,160,141,0,22,107,1,191,182,0,4,34,160,255,0,6,189,164,0,4,34,160,255,0,69,79,70], "e87d43969bdf563d1148e3b35e8b5360": [80,65,84,67,72,0,129,160,0,8,169,1,133,160,141,0,22,107,1,193,182,0,4,34,160,255,0,6,191,164,0,4,34,160,255,0,69,79,70], "2071b049a463cefd7a0b7aeab8037ca0": [80,65,84,67,72,0,127,160,0,8,169,1,133,160,141,0,22,107,1,191,190,0,4,34,160,255,0,6,189,164,0,4,34,160,255,0,69,79,70]}; // Couldn't find SMAS+W SMC ROM [80,65,84,67,72,0,129,160,0,8,169,1,133,160,141,0,22,107,1,193,190,0,4,34,160,255,0,6,191,164,0,4,34,160,255,0,69,79,70]

// make core lists
var aCoreList = '<li><b>Select a Core</b></li><li><a href="?core=autodetect" class="greyer">AutoDetect (Slower to load)</a></li>';
for (var i = 0; i < installedCores.length; i++) {
	aCoreList += '<li><a href="?core=' + installedCores[i] + '">' + installedCores[i] + ' (' + systems[installedCores[i]] + ')</a></li>';
}

// query string into object
var queries = {};
for (var i = 0; i < search.length; i++) {
	var p = search[i].split("=");
	queries[p[0]] = p[1];
}

// Binary to UTF-8
function u8atoutf8(data) {
	return new TextDecoder().decode(data);
}

function avShift(array, shift) {
	for (var i = 0; i < array.length; i++) {
		array[i] += shift;
	}
	return array;
}

// key press stuff
function fakeKey(type, info) {
	var e = new KeyboardEvent(type, {code: info.code || undefined, key: info.key || undefined, shiftKey: info.shiftKey || undefined});
	document.dispatchEvent(e);
}

function fakeKeyPress(info) {
	fakeKey("keydown", info);
	window.setTimeout(function() {
		fakeKey("keyup", info);
	}, 50);
}

function fakeCharPress(key) {
	if (charToCodeMap.hasOwnProperty(key)) fakeKeyPress({code: charToCodeMap[key].code, key: charToKeyMap.hasOwnProperty(key) ? charToKeyMap[key].key : key, shiftKey: charToCodeMap[key].hasOwnProperty("shift") ? true : false});
}

function sendText(text) {
	for (var i = 0; i < text.length; i++) {
		fakeCharPress(text.charAt(i));
	}
}

// indexedDB
function openIdb() {
	var request = indexedDB.open("webretro", 1);
	request.onsuccess = function(e) {
		wIdb = e.target.result;
	}
	request.onupgradeneeded = function(e) {
		var store = e.target.result.createObjectStore("main", {keyPath: "key"});
		store.transaction.oncomplete = function(e2) {
			wIdb = e.target.db;
		}
	}
}

openIdb();

function setIdbItem(key, value) {
	wIdb.transaction("main", "readwrite").objectStore("main").put({key: key, value: value});
}

function getIdbItem(key) {
	return new Promise(function(resolve) {
		wIdb.transaction("main", "readwrite").objectStore("main").get(key).onsuccess = function(e) {
			resolve(e.target.result ? e.target.result.value : null);
		}
	});
}

// localStorage to indexedDB
async function tryLsToIdb() {
	var ls = Object.keys(window.localStorage);
	for (var i = 0; i < ls.length; i++) {
		if (ls[i].startsWith("RetroArch_")) {
			setIdbItem(ls[i], new Uint8Array(JSON.parse(window.localStorage.getItem(ls[i]))));
			window.localStorage.removeItem(ls[i]);
		}
		if (i == ls.length - 1) return;
	}
}

// side alerts
function sideAlert(initialText, time) {
	var p = document.createElement("p");
	p.className = "sidealert";
	p.appendChild(document.createTextNode(initialText));
	sideAlertHolder.appendChild(p);
	window.setTimeout(function() {
		p.classList.add("on");
	}, 10);
	this.dismiss = function() {
		p.classList.remove("on");
		window.setTimeout(function() {
			p.remove();
		}, 100);
	}
	this.setText = function(text) {
		p.textContent = text;
	}
	if (time) window.setTimeout(this.dismiss, time);
}

// change background for status messages
function setStatus(message) {
	loadStatus = message;
	canvas.style.backgroundImage = 'url("data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><text style="font: 30px sans-serif;" fill="white" x="50%" y="40%" dominant-baseline="middle" text-anchor="middle">Loading</text><text style="font: 15px sans-serif;" fill="white" x="50%" y="60%" dominant-baseline="middle" text-anchor="middle">' + message + '</text></svg>') + '")';
}

// remove status messages
function removeStatus(message) {
	if (loadStatus === message) setStatus("");
}

// adjust canvas size to window
function adjustCanvasSize() {
	if (window.innerHeight >= window.innerWidth * (3/4)) {
		var s = window.innerWidth;
		var t = Math.floor(s * (3/4));
		Module.setCanvasSize(s * resModifier, t * resModifier);
		canvasMask.style.width = s + "px";
		canvasMask.style.height = t + "px";
	} else {
		var s = window.innerHeight;
		var t = Math.floor(s * (4/3));
		Module.setCanvasSize(t * resModifier, s * resModifier);
		canvasMask.style.width = t + "px";
		canvasMask.style.height = s + "px";
	}
}

// logging
function log(log, userInput) {
	console.log(log);
	wconsole.textContent += (userInput ? "> " + userInput + "\n\t" + JSON.stringify(log) : log) + "\n";
	wconsole.scrollTo({top: wconsole.scrollHeight});
	
	if (typeof log == "string") {
		// export state
		if (log.includes("New state file is ready to be read")) saveStateFunc();
		
		// await log queue
		if (Object.keys(awaitLogQueue).length) {
			var lq = Object.keys(awaitLogQueue);
			for (var i = 0; i < lq.length; i++) {
				if (log.toLowerCase().includes(lq[i].toLowerCase())) {
					awaitLogQueue[lq[i]](log);
					delete awaitLogQueue[lq[i]];
				}
			}
		}
	}
}

function awaitLog(contains, callback, timeout, expire) {
	awaitLogQueue[contains] = callback;
	if (timeout && !isNaN(timeout)) {
		window.setTimeout(function() {
			if (awaitLogQueue[contains]) {
				expire();
				delete awaitLogQueue[contains];
			}
		}, timeout);
	}
}

// xhr
function grab(url, type, success, fail) {
	var req = new XMLHttpRequest();
	req.open("GET", url, true);
	req.overrideMimeType("text/plain; charset=x-user-defined");
	req.responseType = type;
	req.onload = function() {
		if (req.status >= "400") {
			if (fail) fail(req.status);
		} else {
			if (success) success(this.response);
		}
	}
	req.send();
}

// file readers
function readFile(file, callback) {
	var reader = new FileReader();
	reader.onload = function() {
		callback(this.result);
	}
	reader.readAsArrayBuffer(file);
}

function downloadFile(data, name) {
	var a = document.createElement("a");
	a.download = name;
	a.href = URL.createObjectURL(new Blob([data], {type: "application/octet-stream"}));
	a.click();
	window.setTimeout(function() {
		URL.revokeObjectURL(a.href);
	}, 2000);
}

function uploadFile(accept, callback) {
	var input = document.createElement("input");
	input.type = "file";
	input.accept = accept;
	input.onchange = function() {
		readFile(this.files[0], function(data) {
			callback(data);
		});
	}
	input.click();
}

// scripts
function getScript(url, callback, err) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = url;
	script.onload = function() {
		if (callback) callback();
	}
	script.onerror = function(e) {
		document.body.removeChild(script);
		if (err) err(e);
	}
	document.body.appendChild(script);
}

function getCore(name, callback, err) {
	getScript("./" + name + "_libretro.js", callback, err);
}

// check for updates
function checkForUpdates() {
	grab("https://cdn.jsdelivr.net/gh/BinBashBanana/webretro@latest/assets/info.json", "text", function(text) {
		try {
			var updateObj = JSON.parse(text);
			if (updateObj.webretro) {
				latestVersion = updateObj.webretro;
				if (updateObj.versions[webretroVersion.toString()]) versionIndicator.title = "New features in this version:\n\n- " + updateObj.versions[webretroVersion.toString()].changeList.join("\n- ");
				if (latestVersion > webretroVersion && updateObj.versions[latestVersion.toString()]) {
					updateNotice.textContent = "New webretro version available: v" + latestVersion.toString() + ". Features:\n\n- " + updateObj.versions[latestVersion.toString()].changeList.join("\n- ") + "\n\nThe site owner(s) can apply the update.";
					updateNotice.style.display = "initial";
				}
			}
		} catch (e) {
			log(e);
		}
	});
}

// unzip file
function unzipFile(data, exts, callback, empty, notfound) {
	new zip.ZipReader(new zip.Uint8ArrayReader(data)).getEntries().then(function(entries) {
		if (entries.length) {
			for (var i = 0; i < entries.length; i++) {
				if (exts.split(", ").includes("." + u8atoutf8(entries[i].rawFilename).split(".").slice(-1)[0])) {
					let name = u8atoutf8(entries[i].rawFilename);
					entries[i].getData(new zip.Uint8ArrayWriter()).then(function(uzd) {
						callback(name, uzd);
					});
					break;
				}
				if (i == entries.length - 1 && notfound) notfound();
			}
		} else if (empty) empty();
	});
}

// uauth uploads
function handleWebFile(data) {
	if (data.message == "success") {
		ffd.style.display = "none";
		romUploadCallback(data.name, data.data);
	} else if (data.message == "error") {
		alert("There was an error with the file picker. This may mean that you have to allow popup windows.");
	}
}

function uploadWebFile(type, exts) {
	uauth.open(type, exts.split(", "), handleWebFile);
}

// rom upload
function readyRomUploads(exts) {
	upload.setAttribute("accept", exts);
	
	// when a rom is uploaded
	upload.onchange = function() {
		ffd.style.display = "none";
		let file = this.files[0];
		readFile(file, function(data) {
			log('Succesfully read ROM file "' + file.name + '"');
			romUploadCallback(file.name, data);
		});
	}
	
	// web uploads
	googleDriveUpload.onclick = function() {
		uploadWebFile("drive", exts);
	}
	dropboxUpload.onclick = function() {
		uploadWebFile("dropbox", exts);
	}
	oneDriveUpload.onclick = function() {
		uploadWebFile("onedrive", exts);
	}
	
	// file drop
	document.ondragenter = function(e) {
		if (e.dataTransfer.types.includes("Files")) ffd.classList.add("filehover");
	}
	document.ondragover = function(e) {
		e.preventDefault();
	}
	document.ondrop = function(e) {
		if (e.dataTransfer.types.includes("Files")) {
			e.preventDefault();
			ffd.style.display = "none";
			let file = event.dataTransfer.files[0];
			readFile(file, function(data) {
				log('Succesfully read ROM file "' + file.name + '"');
				romUploadCallback(file.name, data);
			});
		}
	}
}

// rom fetch
function readyRomFetch() {
	var romloc = /^(http:\/\/|https:\/\/|\/\/)/i.test(queries.rom) ? queries.rom : "roms/" + queries.rom;
	var romFilename = queries.rom.split("/").slice(-1)[0];
	grab(romloc, "arraybuffer", function(data) {
		log("Succesfully fetched ROM from " + romloc);
		romMode = "querystring";
		romUploadCallback(romFilename, data);
	}, function(error) {
		alert("Could not get ROM at " + romloc + " (Error " + error + ")");
		romMode = "upload";
		ffd.style.display = "block";
	});
}

// console window
var conw = new jswindow({title: "Console", icon: "assets/terminal.svg"});

var wconsole = document.createElement("textarea");
wconsole.classList.add("console");
wconsole.setAttribute("spellcheck", "false");
wconsole.setAttribute("readonly", "");

wconsole.wconsolemarker = document.createElement("span");
wconsole.wconsolemarker.classList.add("consolemarker");

wconsole.wconsoleinput = document.createElement("input");
wconsole.wconsoleinput.type = "text";
wconsole.wconsoleinput.classList.add("consoleinput");
wconsole.wconsoleinput.title = "You can type things here as though you were using the browser console.";
wconsole.wconsoleinput.setAttribute("spellcheck", "false");
wconsole.wconsolemarker.onclick = function() { wconsole.wconsoleinput.focus(); }
wconsole.wconsoleinput.onkeydown = function(e) {
	e.stopPropagation();
	if (e.keyCode == 13) {
		log(eval(this.value), this.value);
		this.value = "";
	}
}

conw.innerWindow.appendChild(wconsole);
conw.innerWindow.appendChild(wconsole.wconsolemarker);
conw.innerWindow.appendChild(wconsole.wconsoleinput);

consoleButton.onclick = function() {
	conw.open({width: 450, height: 250, left: 100, top: 50});
	wconsole.wconsoleinput.focus();
	wconsole.scrollTo({top: wconsole.scrollHeight});
}

if (queries.hasOwnProperty("console")) conw.open({width: 450, height: 250, left: 100, top: 50});

// ---------- START LOAD ----------
(function() {
	// ?system query
	if (!queries.core && queries.system) {
		var detectedCore = Object.keys(systems).find(k => systems[k].toLowerCase() == queries.system.toLowerCase());
		if (installedCores.includes(detectedCore)) {
			queries.core = detectedCore;
		} else if (queries.system.toLowerCase() == "autodetect") {
			queries.core = "autodetect";
		} else {
			alert("Invalid core (" + detectedCore + ")");
		}
	}
	
	// ?core query
	if (queries.core) {
		if (!window.navigator.userAgent.toLowerCase().includes("chrom")) alert("Best performance on Chrome!");
		
		// show hover menu
		hoverMenu.style.display = "block";
		
		versionIndicator.textContent = "v" + webretroVersion.toString();
		checkForUpdates();
		
		if (queries.core.toLowerCase() == "autodetect") {
			romUploadCallback = autodetectCoreHandler;
			systemName.textContent = "";
			readyRomUploads(".zip, " + allFileExts);
		} else {
			romUploadCallback = initFromFile;
			core = queries.core;
			
			setStatus("Getting core");
			if (core == "desmume") sramExt = ".dsv";
			// detect system for ROM upload
			systemName.textContent = systems[core] || "";
			
			getCore(core, function() {
				removeStatus("Getting core");
				log("Got core: " + core);
				if (romMode != "querystring") document.title = core + " | webretro";
				
				readyRomUploads(".zip, .bin, " + fileExts[systems[core]]);
			}, function() {
				// core loading error
				alert('Could not load specified core "' + core + '". Here is a list of available cores.');
				ffdContent.innerHTML = "<ul>" + aCoreList + "</ul>";
				ffd.style.display = "block";
			});
		}
		
		// ?rom query
		if (queries.rom) {
			readyRomFetch();
		} else {
			// prompt user to upload ROM file
			romMode = "upload";
			ffd.style.display = "block";
		}
	} else {
		// no core specified
		ffdContent.innerHTML = "<ul>" + aCoreList + "</ul>";
		ffd.style.display = "block";
	}
})();
// ----------- END LOAD -----------

// start emulator from file name and data
function initFromFile(name, data) {
	var dataView = new Uint8Array(data);
	if (name.split(".").slice(-1)[0] == "zip") {
		log("Zip file detected, unzipping...");
		
		unzipFile(dataView, fileExts[systems[core]], function(name, contents) {
			romName = name.split(".")[0];
			readyForInit(contents);
		}, function() {
			alert("That zip file appears to be empty!");
		}, function() {
			alert("Couldn't find a valid ROM file in that zip file. Are you using the right core? This is " + systems[core] + ". (The ROM has to be at the base directory of the zip file)");
		});
	} else {
		romName = name.split(".")[0];
		readyForInit(dataView);
	}
}

// autodetect core mode
function autodetectCoreHandler(name, data) {
	var dataView = new Uint8Array(data);
	if (name.split(".").slice(-1)[0] == "zip") {
		log("Zip file detected, unzipping...");
		
		unzipFile(dataView, allFileExts, function(name, contents) {
			romName = name.split(".")[0];
			autodetectCore(name, contents);
		}, function() {
			alert("That zip file appears to be empty!");
		}, function() {
			alert("Couldn't find a valid ROM file in that zip file. (The ROM has to be at the base directory of the zip file)");
		});
	} else {
		romName = name.split(".")[0];
		autodetectCore(name, dataView);
	}
}

function autodetectCore(name, data) {
	var nameExt = "." + name.split(".").slice(-1)[0];
	var detectedCore;
	var fileExtsArray = Object.keys(fileExts);
	for (var i = 0; i < fileExtsArray.length; i++) {
		if (fileExts[fileExtsArray[i]].split(", ").includes(nameExt)) {
			detectedCore = Object.keys(systems).find(k => systems[k] == fileExtsArray[i]);
			break;
		}
	}
	
	var detectedSystem = systems[detectedCore] || "unknown";
	detectedCore = detectedCore || "unknown";
	
	if (allValidFileExts.split(", ").includes(nameExt)) {
		core = detectedCore;
		
		setStatus("Getting core");
		if (core == "desmume") sramExt = ".dsv";
		
		getCore(core, function() {
			removeStatus("Getting core");
			log("Got core: " + core);
			readyForInit(data);
		});
	} else {
		alert("That is a " + detectedSystem + " file! " + detectedCore + " (" + detectedSystem + ") is not currently supported.");
	}
}

// if the ROM is specified in the querystring, we will need to wait until the user has clicked to start the emulator
function readyForInit(data) {
	document.title = romName + " | webretro";
	
	// do I want to put this in the docs?
	if (queries.romshift) data = avShift(data, parseInt(queries.romshift));
	
	if (romMode == "querystring") {
		startButton.style.display = "initial";
		startButton.onclick = function() {
			startButton.style.display = "none";
			initFromData(data);
		}
	} else {
		initFromData(data);
	}
}

// prepare FS with bundle
function prepareBundle() {
	setStatus("Getting assets");
	log("Starting bundle fetch");
	let bundleSTime = performance.now();
	fsBundleDirs = [['', 'assets'], ['/assets', 'menu_widgets'], ['/assets', 'ozone'], ['/assets/ozone', 'png'], ['/assets/ozone/png', 'dark'], ['/assets/ozone/png', 'sidebar'], ['/assets', 'xmb'], ['/assets/xmb', 'monochrome'], ['/assets/xmb/monochrome', 'png']]
	FS.createPath("/", "home/web_user/retroarch/bundle", true, true);
	for (var i = 0; i < fsBundleDirs.length; i++) {
		FS.createPath(baseFsBundleDir + fsBundleDirs[i][0], fsBundleDirs[i][1], true, true);
	}
	
	grab(bundleCdn + "bundle/indexedfiles.txt", "text", function(data) {
		fsBundleFiles = data.split("\n");
		for (let i = 0; i < fsBundleFiles.length; i++) {
			grab(bundleCdn + "bundle" + fsBundleFiles[i], "arraybuffer", function(data) {
				FS.writeFile(baseFsBundleDir + fsBundleFiles[i], new Uint8Array(data));
				if (i == fsBundleFiles.length - 1) donePreparingBundle(performance.now() - bundleSTime);
			}, function() {
				bundleErrors += 1;
				if (i == fsBundleFiles.length - 1) donePreparingBundle(performance.now() - bundleSTime);
			});
		}
	}, function() {
		log("Failed to get asset bundle, skipping");
		bundleReady = true;
		removeStatus("Getting assets");
	});
}

function donePreparingBundle(tooktime) {
	bundleReady = true;
	removeStatus("Getting assets");
	log("Finished bundle fetch in " + (tooktime / 1000).toFixed(1) + " seconds, " + bundleErrors + " errors");
}

// tell the user to not rename the rom
function doNotRename() {
	if (romMode == "upload" && !window.localStorage.getItem("webretro_settings_pastFirstSave")) {
		alert("WARNING: Do not rename your ROM file after this! The save data is specific to the ROM name!");
		window.localStorage.setItem("webretro_settings_pastFirstSave", "true");
	}
}

// save game
function saveSRAM() {
	Module._cmd_savefiles();
	window.setTimeout(function() {
		if (FS.analyzePath("/home/web_user/retroarch/userdata/saves/rom" + sramExt).exists) {
			setIdbItem("RetroArch_saves_" + romName, FS.readFile("/home/web_user/retroarch/userdata/saves/rom" + sramExt));
			new sideAlert("Saved", 3000);
			readySaveReaders();
			
			doNotRename();
		} else {
			autosave.checked = false;
			new sideAlert("This game does not save!", 3000);
		}
	}, 1000);
}

// save state
function saveStateFunc() {
	window.setTimeout(function() {
		if (FS.analyzePath("/home/web_user/retroarch/userdata/states/rom.state").exists) {
			setIdbItem("RetroArch_states_" + romName, FS.readFile("/home/web_user/retroarch/userdata/states/rom.state"));
			
			doNotRename();
		} else {
			new sideAlert("There was an error saving state. Please try again.", 5000);
		}
	}, 100);
}

// autosaving
function autosaveSRAM() {
	if (autosave.checked && !document.hidden && !isPaused) {
		new sideAlert("Autosaving...", 3000);
		saveSRAM();
	}
	window.setTimeout(function() {
		autosaveSRAM();
	}, 300000);
}

// more functions for state buttons
function readyStateReaders() {
	if (!stateReadersReady) {
		stateReadersReady = true;
		
		loadState.classList.remove("disabled");
		exportState.classList.remove("disabled");
		undoSaveState.classList.remove("disabled");
		
		loadState.onclick = function() {
			Module._cmd_load_state();
			readyStateReaders2();
		}
		exportState.onclick = function() {
			downloadFile(FS.readFile("/home/web_user/retroarch/userdata/states/rom.state"), "game-state-"+romName+"-"+dateTime.getFullYear().toString()+"-"+(dateTime.getMonth()+1).toString()+"-"+dateTime.getDate().toString()+"-"+dateTime.getHours().toString()+"-"+dateTime.getMinutes().toString() + ".state");
		}
		undoSaveState.onclick = function() {
			Module._cmd_undo_save_state();
		}
		// also allow statereaders2 on F3 press
		document.addEventListener("keydown", function(e) {
			if (e.key == "F3") readyStateReaders2();
		}, false);
	}
}

// even more functions for state buttons
function readyStateReaders2() {
	if (!stateReaders2Ready) {
		stateReaders2Ready = true;
		
		undoLoadState.classList.remove("disabled");
		undoLoadState.onclick = function() {
			Module._cmd_undo_load_state();
		}
	}
}

// more functions for save buttons
function readySaveReaders() {
	if (!saveReadersReady) {
		saveReadersReady = true;
		
		exportSave.classList.remove("disabled");
		
		exportSave.onclick = function() {
			downloadFile(FS.readFile("/home/web_user/retroarch/userdata/saves/rom" + sramExt), "game-sram-"+romName+"-"+dateTime.getFullYear().toString()+"-"+(dateTime.getMonth()+1).toString()+"-"+dateTime.getDate().toString()+"-"+dateTime.getHours().toString()+"-"+dateTime.getMinutes().toString() + sramExt);
		}
	}
}

// runs after emulator starts
function afterStart() {
	// remove loading text
	canvas.style.background = "none";
	
	adjustCanvasSize();
	
	// functions for save and state buttons
	saveState.classList.remove("disabled");
	importState.classList.remove("disabled");
	saveGame.classList.remove("disabled");
	importSave.classList.remove("disabled");
	autosave.removeAttribute("disabled");
	autosave.parentElement.classList.remove("disabled");
	
	saveState.onclick = function() {
		Module._cmd_save_state();
		readyStateReaders();
	}
	importState.onclick = function() {
		uploadFile(".bin, .state, .save, .dat, .gam, .sav, application/*", function(data) {
			setIdbItem("RetroArch_states_" + romName, new Uint8Array(data));
			FS.writeFile("/home/web_user/retroarch/userdata/states/rom.state", new Uint8Array(data));
			new sideAlert("Imported state", 3000);
			readyStateReaders();
		});
	}
	
	saveGame.onclick = function() {
		new sideAlert("Saving...", 3000);
		saveSRAM();
	}
	importSave.onclick = function() {
		uploadFile(".bin, .srm, .sram, .ram, .gam, .sav, .dsv, application/*", function(data) {
			autosave.checked = false;
			setIdbItem("RetroArch_saves_" + romName, new Uint8Array(data));
			if (confirm("Save imported. Reloading now for changes to take effect.")) {
				window.onbeforeunload = function() {}
				window.location.reload();
			}
		});
	}
	
	// also allow state readers on F2 press
	document.addEventListener("keydown", function(e) {
		if (e.key == "F2") readyStateReaders();
	}, false);
	
	// start autosave loop
	window.setTimeout(function() {
		autosaveSRAM();
	}, 300000);
	
	// toggle between sharp and smooth canvas graphics
	smooth.removeAttribute("disabled");
	smooth.parentElement.classList.remove("disabled");
	smooth.onclick = function() {
		if (this.checked) {
			canvas.className = "textureSmooth";
		} else {
			canvas.className = "texturePixelated";
		}
	}
	
	// higher resolution
	doubleRes.removeAttribute("disabled");
	doubleRes.parentElement.classList.remove("disabled");
	doubleRes.onclick = function() {
		if (this.checked) {
			resModifier = 2;
			adjustCanvasSize();
		} else {
			resModifier = 1;
			adjustCanvasSize();
		}
	}
	
	// pause and resume
	pause.classList.remove("disabled");
	pause.onclick = function() {
		if (this.textContent.trim() == "Pause") {
			Module.pauseMainLoop();
			isPaused = true;
			this.textContent = "Resume";
			document.body.classList.add("paused");
		} else {
			Module.resumeMainLoop();
			isPaused = false;
			this.textContent = "Pause";
			document.body.classList.remove("paused");
		}
	}
	resumeOverlay.onclick = function() {
		pause.click();
	}
	
	// toggle menu
	menuButton.classList.remove("disabled");
	menuButton.onclick = function() {
		Module._cmd_toggle_menu();
	}
	
	// flash the menu on first use
	if (!window.localStorage.getItem("webretro_settings_pastFirstStart")) {
		hoverMenu.classList.add("show");
		hoverMenuIndicator.classList.add("show");
		window.setTimeout(function() {
			hoverMenu.classList.remove("show");
			hoverMenuIndicator.classList.remove("show");
		}, 3000);
		window.localStorage.setItem("webretro_settings_pastFirstStart", "true");
	}
	
	// ctrl+v inside canvas
	document.addEventListener("keydown", function(e) {
		if (e.ctrlKey && e.key == "v") {
			navigator.clipboard.readText().then(function(text) {
				fakeKeyPress({code: "Backspace"});
				sendText(text);
			});
		}
	}, false);
}

// start
function initFromData(data) {
	window.onbeforeunload = function() { return true; }
	async function waitForReady() {
		if (wasmReady && bundleReady) {
			setStatus("Waiting for emulator");
			log("Initializing with " + data.byteLength + " bytes of data");
			updateNotice.style.display = "none";
			canvas.addEventListener("contextmenu", function(e) {
				e.preventDefault();
			}, false);
			window.addEventListener("resize", adjustCanvasSize, false);
			adjustCanvasSize();
			
			// prevent defaults for key presses
			document.addEventListener("keydown", function(e) {
				if (pdKeys.includes(e.which)) e.preventDefault();
			}, false);
			
			// move the saves and states from the old version (localStorage) to indexedDB
			await tryLsToIdb();
			
			// rom
			FS.writeFile("/rom.bin", data);
			
			// SMAS brick fix
			if (systems[core] == "SNES") {
				var hash = md5(u8atoutf8(data));
				if (smasBrickFix.hasOwnProperty(hash)) {
					FS.writeFile("/rom.ips", new Uint8Array(smasBrickFix[hash]));
					new sideAlert("SMAS Bricks Fixed!", 5000);
				}
			}
			
			// load save
			var cSave = await getIdbItem("RetroArch_saves_" + romName);
			if (cSave) {
				FS.createPath("/", "home/web_user/retroarch/userdata/saves", true, true);
				FS.writeFile("/home/web_user/retroarch/userdata/saves/rom" + sramExt, cSave);
				new sideAlert("Save loaded for " + romName, 5000);
				log("Save loaded for " + romName);
				readySaveReaders();
			}
			
			// import state
			var cState = await getIdbItem("RetroArch_states_" + romName);
			if (cState) {
				FS.createPath("/", "home/web_user/retroarch/userdata/states", true, true);
				FS.writeFile("/home/web_user/retroarch/userdata/states/rom.state", cState);
				new sideAlert("State imported for " + romName, 5000);
				log("State imported for " + romName);
				readyStateReaders();
			}
			
			// config
			FS.createPath("/", "home/web_user/retroarch/userdata", true, true);
			FS.writeFile("/home/web_user/retroarch/userdata/retroarch.cfg", nulKeys + keybinds + extraConfig);
			
			// start
			Module.callMain(Module.arguments);
			adjustCanvasSize();
			
			window.setTimeout(afterStart, 2000);
		} else {
			window.setTimeout(waitForReady, 1000);
		}
	}
	waitForReady();
}

var Module = {
	canvas: canvas,
	noInitialRun: true,
	arguments: ["/rom.bin", "--verbose"],
	onRuntimeInitialized: function() {
		wasmReady = true;
		log("WASM compiled");
		
		// fetch asset bundle
		if (queries.hasOwnProperty("nobundle")) {
			bundleReady = true;
			log("Skipping bundle");
		} else {
			prepareBundle();
		}
	},
	print: function(text) {
		log("stdout: " + text);
	},
	printErr: function(text) {
		log("stderr: " + text);
	}
};