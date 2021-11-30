/* -----------------------------------------------
/* MIT license: http://opensource.org/licenses/MIT
/* How to use? : Check the documentation. Button ID attributes are used for the script below.
/* v2.0.7
/* ----------------------------------------------- */

var url = tryGetElement('url');

try {
    url.focus();
} catch (e) {
    console.log("No url box: " + e);
}

// Corrosion
tryGetElement('q').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.corrosion(url.value, true);
}
tryGetElement('qbp').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.corrosion(url.value);
}

// Alloy
tryGetElement('al').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.alloy(url.value, true);
}
tryGetElement('albp').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.alloy(url.value);
}

// Womginx
tryGetElement('wn').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.womginx(url.value, true);
}
tryGetElement('wnbp').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.womginx(url.value);
}

// Sysya
tryGetElement('pmprox').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.sysya(url.value, true);
}
tryGetElement('pmproxbp').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.sysya(url.value);
}

tryGetElement('lasttrain').onclick = function(e) {
    e.preventDefault();
    goProx.train(true);
}

tryGetElement('village').onclick = function(e) {
    e.preventDefault();
    goProx.village(true);
}

tryGetElement('prison').onclick = function(e) {
    e.preventDefault();
    goProx.prison(true);
}

tryGetElement('rp').onclick = function(e) {
    e.preventDefault();
    goProx.rpg(true);
}

tryGetElement('os').onclick = function(e) {
    e.preventDefault();
    goProx.osu(true);
}

tryGetElement('speed').onclick = function(e) {
    e.preventDefault();
    goProx.speed(true);
}

tryGetElement('heli').onclick = function(e) {
    e.preventDefault();
    goProx.heli(true);
}

// Pydodge
tryGetElement('pdprox').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.pydodge(url.value, true);
}
tryGetElement('pdproxbp').onclick = function(e) {
    e.preventDefault();
    if (url.value) goProx.pydodge(url.value);
}

// Links - Chatbox
tryGetElement('ch').onclick = function(e) {
    e.preventDefault();
    goToChatbox(true);
}

// Links - Discord
tryGetElement('wndp').onclick = function(e) {
    e.preventDefault();
    goProx.womginx("https://discord.com/app", true);
}
tryGetElement('wndpbp').onclick = function(e) {
    e.preventDefault();
    goProx.womginx("https://discord.com/app");
}
tryGetElement('qdp').onclick = function(e) {
    e.preventDefault();
    goProx.corrosion("discord.com", true);
}

// Links - YouTube 
tryGetElement('ytbtn').onclick = function(e) {
    e.preventDefault();
    goProx.corrosion("https://youtube.com", true);
}
tryGetElement('ytbp').onclick = function(e) {
    e.preventDefault();
    goProx.corrosion("https://youtube.com");
}