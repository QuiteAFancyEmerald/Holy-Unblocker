/* -----------------------------------------------
/* Authors: OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* EmuLibrary gnav
/* ----------------------------------------------- */

var emulibgms = [
    {name: "Fire Emblem", core: "mgba", rom: "fireemblem.gba", img: "fireemblem.png", description: "Destroy your enemies in this tactical role-playing game!"},
    {name: "Final Fantasy 3", core: "snes9x", rom: "finalfantasy3.sfc", img: "finalfantasy3.png", description: "Action role-playing game, known as FF IV outside of the US."},
    {name: "Earthbound", core: "snes9x", rom: "earthbound.sfc", img: "earthbound.png", description: "what"},
    {name: "Metroid", core: "nestopia", rom: "metroid.nes", img: "metroid.png", description: "Fight alien monsters in this action-packed sidescrolling shooter!"},
    {name: "Super Metroid", core: "snes9x", rom: "supermetroid.sfc", img: "supermetroid.png", description: "Stop the space pirates before it is too late!"},
    {name: "Metroid Fusion", core: "mgba", rom: "metroidfusion.gba", img: "metroidfusion.png", description: "Stop the X parasites before they infect everything!"},
    {name: "Metroid: Zero Mission", core: "mgba", rom: "metroidzeromission.gba", img: "metroidzeromission.png", description: "Remake of the original Metroid."},
    {name: "Donkey Kong Country", core: "snes9x", rom: "donkeykongcountry.smc", img: "donkeykongcountry.png", description: "Reclaim your banana hoard with Diddy Kong at your side."},
    {name: "Pokemon Crystal", core: "mgba", rom: "pokemoncrystal.gbc", img: "pokemoncrystal.png", description: "Gotta catch 'em all!"},
    {name: "Pokemon FireRed", core: "mgba", rom: "pokemonfirered.gba", img: "pokemonfirered.png", description: "Remake of Pokemon red version."},
    {name: "Pokemon Emerald", core: "mgba", rom: "pokemonemerald.gba", img: "pokemonemerald.png", description: "Quite a Fancy Pokemon game :D"},
    {name: "Sonic the Hedgehog", core: "genesis_plus_gx", rom: "sonic.md", img: "sonic.png", description: "Save the forest from evil Dr. Eggman!"},
    {name: "Sonic 2", core: "genesis_plus_gx", rom: "sonic2.md", img: "sonic2.png", description: "Sonic the Hedgehog 2"},
    {name: "Sonic 3", core: "genesis_plus_gx", rom: "sonic3.md", img: "sonic3.png", description: "Sonic the Hedgehog 3"},
    {name: "Streets of Rage 2", core: "genesis_plus_gx", rom: "streetsofrage2.md", img: "streetsofrage2.png", description: "Fight through hordes of enemies in this side-scrolling fighting game!"},
    {name: "Mortal Kombat", core: "genesis_plus_gx", rom: "mortalkombat.md", img: "mortalkombat.png", description: "Genesis version"},
    {name: "Mortal Kombat 2", core: "genesis_plus_gx", rom: "mortalkombat2.md", img: "mortalkombat2.png", description: "Genesis version"},
    {name: "Mortal Kombat 3", core: "genesis_plus_gx", rom: "mortalkombat3.md", img: "mortalkombat3.png", description: "Genesis version"},
    {name: "Tetris", core: "mgba", rom: "tetris.gb", img: "tetris.png", description: "The original."},
    {name: "The Legend of Zelda", core: "nestopia", rom: "thelegendofzelda.nes", img: "thelegendofzelda.png", description: "The original Zelda game."},
    {name: "The Adventure of Link", core: "nestopia", rom: "theadventureoflink.nes", img: "theadventureoflink.png", description: "The sequel to The Legend of Zelda."},
    {name: "The Legend of Zelda: A Link to the Past", core: "snes9x", rom: "alinktothepast.sfc", img: "alinktothepast.png", description: "The only Zelda game on the SNES!"},
    {name: "Link's Awakening DX", core: "mgba", rom: "linksawakeningdx.gbc", img: "linksawakeningdx.png", description: "Color remake of Link's Awakening."},
    {name: "The Legend of Zelda: Oracle of Seasons", core: "mgba", rom: "oracleofseasons.gbc", img: "oracleofseasons.png", description: "The seasons have been thrown into chaos!"},
    {name: "The Legend of Zelda: Oracle of Ages", core: "mgba", rom: "oracleofages.gbc", img: "oracleofages.png", description: "The time has been thrown into chaos!"},
    {name: "The Legend of Zelda: The Minish Cap", core: "mgba", rom: "theminishcap.gba", img: "theminishcap.png", description: "Zelda comes to the GBA."},
    {name: "Super Mario Kart", core: "snes9x", rom: "supermariokart.smc", img: "supermariokart.png", description: "The original Mario Kart game."},
    {name: "Mario Kart: Super Circuit", core: "mgba", rom: "mariokartsupercircuit.gba", img: "mariokartsupercircuit.png", description: "Mario Kart comes to the GBA."},
    {name: "Super Mario Bros.", core: "nestopia", rom: "supermariobros.nes", img: "supermariobros.png", description: "The original Mario game."},
    {name: "Super Mario Bros. 2", core: "nestopia", rom: "supermariobros2.nes", img: "supermariobros2.png", description: "Doki Doki Panic."},
    {name: "Super Mario Bros. 3", core: "nestopia", rom: "supermariobros3.nes", img: "supermariobros3.png", description: "Mario gets an upgrade! Lots of them in fact."},
    {name: "Super Mario Land", core: "mgba", rom: "supermarioland.gb", img: "supermarioland.png", description: "Mario's first game on the GameBoy."},
    {name: "Super Mario Land DX", core: "mgba", rom: "supermariolanddx.gbc", img: "supermariolanddx-labelonly.png", description: "It's-a me. Mario."},
    {name: "Super Mario World", core: "snes9x", rom: "supermarioworld.smc", img: "supermarioworld.png", description: "First Mario game on the SNES, featuring Yoshi!"},
    {name: "Super Mario World 2: Yoshi's Island", core: "snes9x", rom: "supermarioworld2.smc", img: "supermarioworld2.png", description: "The first game in the Yoshi series."},
    {name: "Super Mario All Stars", core: "snes9x", rom: "supermarioallstars.sfc", img: "supermarioallstars.png", description: "Super Mario Bros., 2, 3, Lost Levels + Brick Fix"},
    {name: "Super Mario Advance", core: "mgba", rom: "supermarioadvance.gba", img: "supermarioadvance.png", description: "Super Mario Bros. 2 comes to the GBA."},
    {name: "Super Mario Advance 2", core: "mgba", rom: "supermarioadvance2.gba", img: "supermarioadvance2.png", description: "Super Mario World comes to the GBA."},
    {name: "Super Mario Advance 3", core: "mgba", rom: "supermarioadvance3.gba", img: "supermarioadvance3.png", description: "Yoshi's Island comes to the GBA."},
    {name: "Super Mario Advance 4", core: "mgba", rom: "supermarioadvance4.gba", img: "supermarioadvance4.png", description: "Super Mario Bros. 3 comes to the GBA."}
];

var glist = document.getElementById("glist");

for (let item of emulibgms) {
    let a = document.createElement("a");
    a.href = "#";
    var img = document.createElement("img");
    img.src = "/assets/img/emulib/" + item.img;
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
            goFrame("/?eg&core=" + item.core + "&rom=" + item.rom, true);
        }
    }

    glist.appendChild(a);
}
