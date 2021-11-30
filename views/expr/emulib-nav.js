var emulibgms = {
    "firemble": "?eg&core=mgba&rom=fireemblem.gba",
    "mkartsc": "?eg&core=mgba&rom=mariokartsupercircuit.gba",
    "metridofusion": "?eg&core=nestopia&rom=metroidfusion.gba",
    "metridomission": "?eg&core=nestopia&rom=metroidmision.gba",
    "pkmncrystal": "?eg&core=mgba&rom=pokemoncrystal.gbc",
    "pkmnemerald": "?eg&core=mgba&rom=pokemonemerald.gba",
    "pkmnfirered": "?eg&core=mgba&rom=pokemonfirered.gba",
    "pkmnsapp": "?eg&core=mgba&rom=pokemonsapp.gba",
    "supermadvance": "?eg&core=mgba&rom=supermarioadvance.gba",
    "supermadvance2": "?eg&core=mgba&rom=supermarioadvance2.gba",
    "supermadvance3": "?eg&core=mgba&rom=supermarioadvance3.gba",
    "supermadvance4": "?eg&core=mgba&rom=supermarioadvance4.gba",
    "supermland": "?eg&core=mgba&rom=supermarioland.gb",
    "tertisgb": "?eg&core=mgba&rom=tetris.gb",
    "theminishhat": "?eg&core=mgba&rom=theminishcap.gba",

    "sanic3": "?eg&core=genesis_plus_gx&rom=sonic3.md",
    "sorage2": "?eg&core=genesis_plus_gx&rom=streetsofrage2.md",

    "metrido": "?eg&core=nestopia&rom=metroid.nes",
    "supermbros": "?eg&core=nestopia&rom=supermariobros.nes",
    "supermbros2": "?eg&core=nestopia&rom=supermariobros2.nes",
    "supermbros3": "?eg&core=nestopia&rom=supermariobros3.nes",
    "theadventurelink": "?eg&core=nestopia&rom=theadventureoflink.nes",
    "thelegendz": "?eg&core=nestopia&rom=thelegendofzelda.nes",

    "alinkpast": "?eg&core=snes9x&rom=alinktothepast.sfc",
    "donkeyc": "?eg&core=snes9x&rom=donkeykongcountry.smc",
    "earthbnd": "?eg&core=snes9x&rom=earthbound.sfc",
    "finnafy3": "?eg&core=snes9x&rom=finalfantasy3.sfc",
    "supermallstar": "?eg&core=snes9x&rom=supermarioallstars.sfc",
    "supermkart": "?eg&core=snes9x&rom=supermariokart.smc",
    "supermworld": "?eg&core=snes9x&rom=supermarioworld.smc",
    "supermworld2": "?eg&core=snes9x&rom=supermarioworld2.smc",
    "supermetrido": "?eg&core=snes9x&rom=supermetroid.sfc"
};

emulibgms_array = Object.keys(emulibgms);

for (let i = 0; i < emulibgms_array.length; i++) {
    tryGetElement(emulibgms_array[i]).parentElement.onclick = function(e) {
        e.preventDefault();
        goFrame(emulibgms[emulibgms_array[i]], true);
    }
}