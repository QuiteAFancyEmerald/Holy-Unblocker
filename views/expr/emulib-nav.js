var emulibgms = {
	"femblem": "?eg&core=mgba&rom=fire_emblem.gba"
};

emulibgms_array = Object.keys(emulibgms);

for (let i = 0; i < emulibgms_array.length; i++) {
	tryGetElement(emulibgms_array[i]).parentElement.onclick = function(e) {
		e.preventDefault();
		goFrame(emulibgms[emulibgms_array[i]], true);
	}
}
