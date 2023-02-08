/* -----------------------------------------------
/* Authors: OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* Emulator gnav
/* ----------------------------------------------- */

var emugms = [
    {name: "GBA Emulator", path: "/?eg&core=mgba", img: "gba.png", description: "Emulate GBA, GB, and GBC games! Click to upload a ROM."},
	{name: "NES Emulator", path: "/?eg&core=nestopia", img: "nes.png", description: "Emulate NES games! Click to upload a ROM."},
	{name: "SNES Emulator", path: "/?eg&core=snes9x", img: "snes.png", description: "Emulate SNES games! Click to upload a ROM."},
	{name: "Genesis Emulator", path: "/?eg&core=genesis_plus_gx", img: "genesis.png", description: "Emulate Genesis games! Click to upload a ROM."},
	{name: "N64 Emulator (BROKEN)", path: "/?eg&core=mupen64plus_next", img: "nintendo64.png", description: "Emulate N64 games! Click to upload a ROM. (Currently Broken)"},
	{name: "VibeOS", path: "/?vos", img: "vibeos.svg", description: "JavaScript based Desktop Enviornment that runs in your browser."}
];

var glist = document.getElementById("glist");

for (let item of emugms) {
    let a = document.createElement("a");
    a.href = "#";
    var img = document.createElement("img");
    img.src = "/assets/img/emu/" + item.img;
    a.appendChild(img);
    var title = document.createElement("h3");
    title.textContent = item.name;
    a.appendChild(title);
    var desc = document.createElement("p");
    desc.textContent = item.description;
    a.appendChild(desc);

    a.onclick = function(e) {
        if (e.target == a || e.target.tagName != "A") {
            e.preventDefault();
            goFrame(item.path, true);
        }
    }

    glist.appendChild(a);
}
