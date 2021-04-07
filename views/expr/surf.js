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

// Links - YouTube (Broken until new pydodge is implemented :trol:)
tryGetElement('ytbtn').onclick = function(e) {
    e.preventDefault();
    // goProx.pydodge("https://youtube.com", true);
}
tryGetElement('ytbp').onclick = function(e) {
    e.preventDefault();
    // goProx.pydodge("https://youtube.com");
}
