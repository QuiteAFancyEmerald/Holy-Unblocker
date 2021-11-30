var h5gms = {
    "dino": "/archive/dino/index.html",
    "droom": "/archive/g/adarkroom/index.html",
    "doodle": "/archive/g/doodle-jump/index.html",
    "ducklife": "/archive/g/ducklife/index.html",
    "ducklife2": "/archive/g/ducklife2/index.html",
    "ducklife3": "/archive/g/ducklife3/index.html",
    "ducklife4": "/archive/g/ducklife4/index.html",
    "firewater": "/archive/g/firewater/index.html",
    "friendlyfire": "/archive/g/friendlyfire/index.html",
    "slope": "/archive/g/slope/index.html",
    "gopher": "/archive/gopher/index.html",
    "mc": "/archive/g/mcjs.html",
    "sna": "/archive/g/snake/index.html",
    "retro": "/archive/g/retrohaunt/index.html",
    "cookiec": "/archive/g/cookieclicker/index.html",
    "evilg": "/archive/g/evilglitch/index.html",
    "flab": "/archive/g/flappybird/index.html",
    "bobb": "/archive/g/bounceback/index.html",
    "chroi": "/archive/g/chromaincident/index.html",
    "sleepb": "/archive/g/sleepingbeauty/index.html",
    "tet": "/archive/g/tetris/index.html",
    "r3": "/archive/g/run3/index.html",
    "pk": "/archive/g/pacman/index.html",
    "thepond": "/archive/g/pond/index.html",
    "gameoff": "/archive/g/house/index.html",
    "thehouse": "/archive/g/househorror/index.html",
    "tzfe": "/archive/g/2048/index.html",
    "aster": "/archive/g/asteroids/index.html",
    "bre": "/archive/g/breaklock/index.html",
    "backc": "/archive/g/backcountry/index.html",
    "backout": "/archive/g/breakout/index.html",
    "ches": "/archive/g/chess/index.html",
    "nsshaft": "/archive/g/nsshaft/index.html",
    "connect3": "/archive/g/connect3/index.html",
    "towerm": "/archive/g/towermaster/index.html",
    "partclick": "/archive/g/particle-clicker/index.html",
    "geodash": "/archive/g/geometrydash/index.html",
    "hex": "/archive/g/hextris/index.html",
    "astr": "/archive/g/astray/index.html",
    "kon": "/archive/g/konnekt/index.html",
    "pushba": "/archive/g/pushback/index.html",
    "unr": "/archive/g/underrun/index.html",
    "race": "/archive/g/racer/index.html",
    "x142": "/archive/g/xx142-b2exe/index.html",
    "faball": "/archive/g/factoryballsforever/index.html",
    "trimps": "/archive/g/trimps/index.html",
    "sm64": "/archive/g/sm64/index.html#nolag",
    "zork": "/archive/g/zork1/index.html"
};

h5gms_array = Object.keys(h5gms);

for (let i = 0; i < h5gms_array.length; i++) {
    tryGetElement(h5gms_array[i]).parentElement.onclick = function(e) {
        e.preventDefault();
        goFrame(h5gms[h5gms_array[i]], h5gms[h5gms_array[i]].split("#").slice(-1)[0] == "nolag");
    }
}