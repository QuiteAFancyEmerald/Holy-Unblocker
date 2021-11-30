function tryGetElement(id) {
    return document.getElementById(id) || {};
}

function getDomain() {
    return document.domain.replace(/^(www|edu|cooking)\./, "");
}

// nolag = no external js (arc widget, an-lytics, etc.
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

/* To use:
 * goProx.proxy(url-string, stealth-boolean-optional)
 *
 * Examples:
 * goProx.corrosion("https://google.com")
 * goProx.womginx("discord.com", true)
 */

goProx = {
    corrosion: function(url, stealth) {
        document.cookie = '__cor_auth=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://" + getDomain() + "/search/gateway?url=" + url, stealth);
    },
    alloy: function(url, stealth) {
        document.cookie = '__incog_prox=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://cdn." + getDomain() + "/fetch/" + url, stealth);
    },
    womginx: function(url, stealth) {
        document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://a." + getDomain() + "/go/" + url, stealth);
    },
    sysya: function(url, stealth) {
        document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://c." + getDomain() + "/gateway?url=" + btoa(url) + "&route=sp", stealth);
    },
    pydodge: function(url, stealth) {
        document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://client." + getDomain() + "/course/" + url, stealth);
    },
    train: function(stealth) {
        document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p9' + 'd9t4.ssl.hw' + 'cdn.net/html/1970' + '387/index.ht' + 'ml'), stealth);
    },
    village: function(stealth) {
        document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p' + '9d9t4.ss' + 'l.hwcd' + 'n.net/html/3' + '626475/index.html'), stealth), document.body.style.backgroundColor = "#000";
    },
    prison: function(stealth) {
        document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p' + '9d9t4.ssl.hwc' + 'dn.net/h' + 'tml/364' + '7099/index.html'), stealth), document.body.style.backgroundColor = "#000";
    },
    rpg: function(stealth) {
        document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p9d9' + 't4.ssl.hwc' + 'dn.net/html/347' + '0524/Die%20in%20the%20Du' + 'ngeon%201.1%20[WEB]/index.html'), stealth), document.body.style.backgroundColor = "#000";
    },
    speed: function(stealth) {
        document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://a." + getDomain() + "/go/" + ('v6p9' + 'd9t4.ssl.hw' + 'cdn.net/html/36' + '28752/index.html'), stealth), document.body.style.backgroundColor = "#000";
    },
    heli: function(stealth) {
        document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://" + ('v6p9d' + '9t4.ssl.h' + 'wcdn.net/ht' + 'ml/3605' + '579/Helo%20Sto' + 'rm/index.html'), stealth);
    },
    osu: function(stealth) {
        document.cookie = 'osauth=true; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
        goToUrl("https://osu." + getDomain() + "/index.html", stealth);
    }
};

// Chatbox
function goToChatbox(stealth) {
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
    goToUrl("https://c." + getDomain());
}