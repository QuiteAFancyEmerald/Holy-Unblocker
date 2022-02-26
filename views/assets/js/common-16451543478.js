/* -----------------------------------------------
/* Authors: QuiteAFancyEmerald and OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* Common functions
/* ----------------------------------------------- */

function tryGetElement(id) {
    return document.getElementById(id) || {};
}

function getDomain() {
    return document.domain.replace(/^(www|edu|cooking|beta)\./, "");
}

// nolag = no external js (arc widget, an-lytics, etc.)
function goFrame(url, nolag) {
    localStorage.setItem("huframesrc", url);
    window.location.href = nolag ? "?s&nolag" : "?s";
}

function goToUrl(url, stealth, nolag) {
    if (stealth) {
        goFrame(url, nolag);
    } else {
        window.location.href = url;
    }
}

function setAuthCookie(s, lax) {
    document.cookie = s + "; expires=" + (Date.now() + 259200) + "; SameSite=" + (lax ? "Lax" : "None") + "; domain=." + getDomain() + "; path=/; Secure;";
}

const sx = 'bing.com' + '/search?q=';

function omnibox(url) {
    if (url.substring(0, 4) == "http") {
        return url;
    } else if (url.includes("." || "")) {
        return "https://" + url;
    } else {
        return "https://" + sx + url;
    }
}

const xor = {
    encode(str) {
        if (!str) return str;
        return encodeURIComponent(str.toString().split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''));
    },
    decode(str) {
        if (!str) return str;
        let [input, ...search] = str.split('?');

        return decodeURIComponent(input).split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char).join('') + (search.length ? '?' + search.join('?') : '');
    },
};

/* To use:
 * goProx.proxy(url-string, stealth-boolean-optional)
 *
 * Examples:
 * goProx.corrosion("https://google.com")
 * goProx.womginx("discord.com", true) 
 */

window.goProx = {
    ultraviolet: function(url, stealth) {
        setAuthCookie("__cor_auth=1", true);
        goToUrl("https://" + getDomain() + "/service/" + xor.encode(omnibox(url)), stealth);
    },
    womginx: function(url, stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl("https://a." + getDomain() + "/main/" + omnibox(url), stealth);
    },
    searx: function(stealth) {
        setAuthCookie("oldsmobile=badcar", true);
        goToUrl("https://c." + getDomain() + "/engine/", stealth);
    },
    libreddit: function(stealth) {
        setAuthCookie("oldsmobile=badcar", true);
        goToUrl("https://c." + getDomain(), stealth);
    },
    rnav: function(stealth) {
        goToUrl("https://client." + getDomain(), stealth);
    },
    osu: function(stealth) {
        setAuthCookie("osauth=true", false);
        goToUrl("https://osu." + getDomain() + "/index.html", stealth);
    },
    mcnow: function(stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl("https://cdn." + getDomain() + "/sw/" + xor.encode('https://now.gg/play/mojang/2534/minecraft-trial'), stealth);
    },
    glife: function(stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl("https://cdn." + getDomain() + "/sw/" + xor.encode('https://now.gg/play/lunime/5767/gacha-life'), stealth);
    },
    roblox: function(stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl("https://cdn." + getDomain() + "/sw/" + xor.encode('https://now.gg/play/roblox-corporation/5349/roblox'), stealth);
    },
    amongus: function(stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl("https://cdn." + getDomain() + "/sw/" + xor.encode('https://now.gg/play/innersloth-llc/4047/among-us'), stealth);
    },
    pubg: function(stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl("https://cdn." + getDomain() + "/sw/" + xor.encode('https://now.gg/play/proxima-beta/2609/pubg-mobile-resistance'), stealth);
    },
    train: function(stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p9' + 'd9t4.ssl.hw' + 'cdn.net/html/1970' + '387/index.ht' + 'ml'), stealth);
    },
    village: function(stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p' + '9d9t4.ss' + 'l.hwcd' + 'n.net/html/3' + '626475/index.html'), stealth);
    },
    prison: function(stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p' + '9d9t4.ssl.hwc' + 'dn.net/h' + 'tml/364' + '7099/index.html'), stealth);
    },
    rpg: function(stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p9d9' + 't4.ssl.hwc' + 'dn.net/html/347' + '0524/Die%20in%20the%20Du' + 'ngeon%201.1%20[WEB]/index.html'), stealth);
    },
    speed: function(stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p9' + 'd9t4.ssl.hw' + 'cdn.net/html/36' + '28752/index.html'), stealth);
    },
    heli: function(stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl("https://" + ('v6p9d' + '9t4.ssl.h' + 'wcdn.net/ht' + 'ml/3605' + '579/Helo%20Sto' + 'rm/index.html'), stealth);
    }
};