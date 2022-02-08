/* -----------------------------------------------
/* Authors: QuiteAFancyEmerald and OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* HTML5 gnav
/* ----------------------------------------------- */

var h5gms = [
    {name: "A Dark Room", path: "adarkroom/", img: "darkroom.png", description: "A player lights a fire in a dark room."},
    {name: "osu!", custom: "osu", img: "os1.png", description: "Rhythm is just a *click* away! If you experience any input lag be sure to read over the osu! FAQ page."},
    {name: "T-Rex Game (chrome://dino)", path: "dino/", img: "dino.jpg", description: "The T-Rex Runner game, an Easter Egg in Google Chrome."},
    {name: "Last Train Home", custom: "train", img: "train.png", description: "This is a short horror-adventure game about being stuck on a train. May take awhile to load.", credits: "itch"},
    {name: "Village Arsonist", custom: "village", img: "village.png", description: "Village Arsonist is a 2D physics-based puzzle game. May take awhile to load... a long while.", credits: "itch"},
    {name: "Minecraft JS", path: "mcjs/", img: "mc.png", description: "Minecraft but made in Javascript."},
    {name: "What the Road Brings", custom: "speed", img: "speed.png", description: "A pseudo, vaporwave 3d racer with an epic soundtrack and art style. May take awhile to load.", credits: "itch"},
    {name: "Snake", path: "snake/", img: "snake.png", description: "Eat the apples in this classic retro game. But don't hit the wall, or eat your own tail! How long can you survive?"},
    {name: "Super Mario 64", path: "sm64/", img: "sm64.png", description: "A classic. Super Mario 64 is a 1996 platform game for the Nintendo 64 and the first Super Mario game to feature 3D gameplay.", nolag: true},
    {name: "Zork Clone", path: "zork1/", img: "zork.png", description: "Zork is an interactive fiction computer game."},
    {name: "Pick Up Prison", custom: "prison", img: "prison.png", description: "At the beginning... There was nothing... There is a prisoner in a cell with nothing. May take awhile to load.", credits: "itch"},
    {name: "Helo Storm", custom: "heli", img: "helo.png", description: "Endless helicopter and Jeep shoot 'em up based on the 80's arcade classic 'Silkworm'.", credits: "itch"},
    {name: "Retrohaunt", path: "retrohaunt/", img: "retrohaunt.png", description: "A creepy retro horror game with interesting graphics and mood."},
    {name: "Run 3", path: "run3/", img: "r3.png", description: "Use the arrow keys to run and jump. Land on a side wall to rotate the world. (Working Version)"},
    {name: "Die in the Dungeon", custom: "rpg", img: "dd.png", description: "Die in the Dungeon is a deck-building, turn-based roguelite. May take awhile to load.", credits: "itch"},
    {name: "Trimps", path: "trimps/", img: "trimps.png", description: "Pure grind."},
    {name: "Gopher Cart", path: "gopher/", img: "gopher2.png", description: "Fun driving side scroller game with epic gophers."},
    {name: "Cookie Clicker", path: "cookieclicker/", img: "cookie.png", description: "You feel like making cookies but no one wants to eat them. Click on the cookie to bake and eat."},
    {name: "Particle Clicker", path: "particle-clicker/", img: "pclick.png", description: "An addictive incremental game that teaches players the history of high energy particle physics."},
    {name: "Evil Glitch", path: "evilglitch/", img: "glitch2.png", description: "Strange glitches appear in your dimension, can you stop them before they assimilate your world?"},
    {name: "Pac-man", path: "pacman/", img: "pcma.png", description: "The classic."},
    {name: "Flappy Bird", path: "flappybird/", img: "flappybird.png", description: "Click on the screen, or use your spacebar to get started. Fly as far as you can without hitting a pipe."},
    {name: "Bounce Back", path: "bounceback/", img: "bounceback.png", description: "A charming and addictive little Zelda inspired roguelike adventure game."},
    {name: "The Chroma Incident", path: "chromaincident/", img: "chroma.png", description: "The Achromats have taken the world's color offline!"},
    {name: "Sleeping Beauty", path: "sleepingbeauty/", img: "sleep.png", description: "Into a profound slumber she sank, surrounded only by dense brambles, thorns and roses."},
    {name: "Tetris", path: "tetris/", img: "tet.png", description: "Tetris ® is the addictive puzzle game that started it all, embracing our universal desire to create order out of chaos."},
    {name: "The House", path: "househorror/", img: "thehouse.png", description: "An interesting horror style game."},
    {name: "The Pond", path: "pond/", img: "thepond.png", description: "Use Mouse1 to move around. A game like Slither.io."},
    {name: "NS Shaft", path: "nsshaft/", img: "nsshaft.png", description: "A fun platformer."},
    {name: "Game Off", path: "house/", img: "gameoff.png", description: "A collection of really fun games, particularly anti-matter which is inspired by Portal."},
    {name: "2048", path: "2048/", img: "2048.png", description: "Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one. Try to beat your high score!"},
    {name: "Asteroids", path: "asteroids/", img: "asteroids.png", description: "Asteroids is a space-themed multidirectional shooter arcade game!"},
    {name: "Breaklock", path: "breaklock/", img: "breaklock.png", description: "Link the dots to find the lock pattern. After every attempt the game will tell you how many dots you got right."},
    {name: "Backcountry", path: "backcountry/", img: "backcountry.png", description: "Taking place in the wild west mine and do jobs to earn money! Use your mouse to navigate by clicking."},
    {name: "Breakout", path: "breakout/", img: "breakout.png", description: "Break all the bricks and volley the ball back and forth in this skill-based classic styled game!"},
    {name: "Chess", path: "chess/", img: "chess2.png", description: "Chess is a two-player strategy board game played on a checkered board with 64 squares arranged in an 8x8 square grid."},
    {name: "Connect 3", path: "connect3/", img: "connect.png", description: "Basically like bejeweled."},
    {name: "Towermaster", path: "towermaster/", img: "tower.png", description: "Build a tower! Stack objects on top of each other without the building falling. How high can you go?"},
    {name: "Geometry Dash", path: "geometrydash/", img: "geometrydash.png", description: "Jump and fly your way through danger in this rhythm-based action platformer!"},
    {name: "Hextris", path: "hextris/", img: "hextris.png", description: "An addictive puzzle game inspired by Tetris."},
    {name: "Astray", path: "astray/", img: "astray.png", description: "A WebGL maze game built with Three.js and Box2dWeb."},
    {name: "Konnekt", path: "konnekt/", img: "konnekt.png", description: "Fight against nodes and viruses! An interesting puzzle game developed by MONSTERKODI."},
    {name: "Push Back", path: "pushback/", img: "pushback.png", description: "A cool physics game!"},
    {name: "Underrun", path: "underrun/", img: "underrun.png", description: "Explore deep underground in this doom-like game. Kill enemies, explore and progress. Use WASD to move and Mouse1 to shoot."},
    {name: "JS Racer", path: "racer/", img: "racer.png", description: "Want to race online? Enjoy an old age like racing game!"},
    {name: "xx142-b2.exe", path: "xx142-b2exe/", img: "142.png", description: "It's the year 2413, and aliens have enslaved humanity."},
    {name: "Factory Balls Forever", path: "factoryballsforever/", img: "factory.png", description: "A puzzle game where you have to color the balls correctly! Use different tools to cover up the ball before start painting over it."}
];

var glist = document.getElementById("glist");

for (let item of h5gms) {
    let a = document.createElement("a");
    a.href = "#";
    var img = document.createElement("img");
    img.src = "/assets/img/h5g/" + item.img;
    a.appendChild(img);
    var title = document.createElement("h3");
    title.textContent = item.name;
    a.appendChild(title);
    var desc = document.createElement("p");
    desc.textContent = item.description;
    if (item.credits == "itch") desc.innerHTML += '<br>Credits: game can be found <a target="_blank" href="https://itch.io">here</a>.';
    a.appendChild(desc);

    a.onclick = function(e) {
        if (e.target == a || e.target.tagName != "A") {
            e.preventDefault();
            item.custom ? goProx[item.custom](true) : goFrame("/archive/g/" + item.path, item.nolag);
        }
    }

    glist.appendChild(a);
}
