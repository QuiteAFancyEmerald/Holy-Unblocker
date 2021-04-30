var emugms = {
	"vos": "vibeOS/index.html",
	"gba": "?eg&core=mgba",
	"nes": "?eg&core=nestopia",
	"snes": "?eg&core=snes9x",
	"genesis": "?eg&core=genesis_plus_gx",
	"n64": "?eg&core=mupen64plus_next"
};

emugms_array = Object.keys(emugms);

for (let i = 0; i < emugms_array.length; i++) {
	tryGetElement(emugms_array[i]).parentElement.onclick = function(e) {
		e.preventDefault();
		goFrame(emugms[emugms_array[i]], true);
	}
}
