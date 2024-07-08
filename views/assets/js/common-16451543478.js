/* -----------------------------------------------
/* Authors: QuiteAFancyEmerald and OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* Common functions
/* ----------------------------------------------- */

function tryGetElement(id) {
    return document.getElementById(id) || {};
}

/**
 * Get the preferred apex domain name.
 * Not exactly apex, as any subdomain other than those listed will be ignored.
 */
function getDomain() {
    return location.host.replace(/^(www|edu|cooking|beta)\./, "");
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

function search(input, template) {
    try {
        // input is a valid URL:
        // eg: https://example.com, https://example.com/test?q=param
        return new URL(input).toString();
    } catch (err) {
        // input was not a valid URL
    }

    try {
        // input is a valid URL when http:// is added to the start:
        // eg: example.com, https://example.com/test?q=param
        const url = new URL(`http://${input}`);
        // only if the hostname has a TLD/subdomain
        if (url.hostname.includes(".")) return url.toString();
    } catch (err) {
        // input was not valid URL
    }

    return template.replace("%s", encodeURIComponent(input));
}

async function RammerheadEncode(baseUrl) {
    // Hellhead
    const mod = (n, m) => ((n % m) + m) % m;
    const baseDictionary =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~-";
    const shuffledIndicator = "_rhs";
    const generateDictionary = function () {
        let str = "";
        const split = baseDictionary.split("");
        while (split.length > 0) {
            str += split.splice(Math.floor(Math.random() * split.length), 1)[0];
        }
        return str;
    };

    class StrShuffler {
        constructor(dictionary = generateDictionary()) {
            this.dictionary = dictionary;
        }
        shuffle(str) {
            if (str.startsWith(shuffledIndicator)) {
                return str;
            }
            let shuffledStr = "";
            for (let i = 0; i < str.length; i++) {
                const char = str.charAt(i);
                const idx = baseDictionary.indexOf(char);
                if (char === "%" && str.length - i >= 3) {
                    shuffledStr += char;
                    shuffledStr += str.charAt(++i);
                    shuffledStr += str.charAt(++i);
                } else if (idx === -1) {
                    shuffledStr += char;
                } else {
                    shuffledStr += this.dictionary.charAt(
                        mod(idx + i, baseDictionary.length)
                    );
                }
            }
            return shuffledIndicator + shuffledStr;
        }
        unshuffle(str) {
            if (!str.startsWith(shuffledIndicator)) {
                return str;
            }

            str = str.slice(shuffledIndicator.length);

            let unshuffledStr = "";
            for (let i = 0; i < str.length; i++) {
                const char = str.charAt(i);
                const idx = this.dictionary.indexOf(char);
                if (char === "%" && str.length - i >= 3) {
                    unshuffledStr += char;
                    unshuffledStr += str.charAt(++i);
                    unshuffledStr += str.charAt(++i);
                } else if (idx === -1) {
                    unshuffledStr += char;
                } else {
                    unshuffledStr += baseDictionary.charAt(
                        mod(idx - i, baseDictionary.length)
                    );
                }
            }
            return unshuffledStr;
        }
    }
    function get(url, callback, shush = false) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.send();

        request.onerror = function () {
            if (!shush) console.log("Cannot communicate with the server");
        };
        request.onload = function () {
            if (request.status === 200) {
                callback(request.responseText);
            } else {
                if (!shush)
                    console.log(
                        'unexpected server response to not match "200". Server says "' +
                        request.responseText +
                        '"'
                    );
            }
        };
    }
    var api = {
        newsession(callback) {
            get("/newsession", callback);
        },
        sessionexists(id, callback) {
            get("/sessionexists?id=" + encodeURIComponent(id), function (res) {
                if (res === "exists") return callback(true);
                if (res === "not found") return callback(false);
                console.log("unexpected response from server. received" + res);
            });
        },
        shuffleDict(id, callback) {
            console.log("Shuffling", id);
            get("/api/shuffleDict?id=" + encodeURIComponent(id), function (res) {
                callback(JSON.parse(res));
            });
        }
    };
    var localStorageKey = "rammerhead_sessionids";
    var localStorageKeyDefault = "rammerhead_default_sessionid";
    var sessionIdsStore = {
        get() {
            var rawData = localStorage.getItem(localStorageKey);
            if (!rawData) return [];
            try {
                var data = JSON.parse(rawData);
                if (!Array.isArray(data)) throw "getout";
                return data;
            } catch (e) {
                return [];
            }
        },
        set(data) {
            if (!data || !Array.isArray(data)) throw new TypeError("must be array");
            localStorage.setItem(localStorageKey, JSON.stringify(data));
        },
        getDefault() {
            var sessionId = localStorage.getItem(localStorageKeyDefault);
            if (sessionId) {
                var data = sessionIdsStore.get();
                data.filter(function (e) {
                    return e.id === sessionId;
                });
                if (data.length) return data[0];
            }
            return null;
        },
        setDefault(id) {
            localStorage.setItem(localStorageKeyDefault, id);
        }
    };
    function addSession(id) {
        var data = sessionIdsStore.get();
        data.unshift({ id: id, createdOn: new Date().toLocaleString() });
        sessionIdsStore.set(data);
    }
    function getSessionId() {
        return new Promise((resolve) => {
            var id = localStorage.getItem("session-string");
            api.sessionexists(id, function (value) {
                if (!value) {
                    console.log("Session validation failed");
                    api.newsession(function (id) {
                        addSession(id);
                        localStorage.setItem("session-string", id);
                        console.log(id);
                        console.log("^ new id");
                        resolve(id);
                    });
                } else {
                    resolve(id);
                }
            });
        });
    }
    var ProxyHref;

    return getSessionId().then((id) => {
        return new Promise((resolve, reject) => {
            api.shuffleDict(id, function (shuffleDict) {
                var shuffler = new StrShuffler(shuffleDict);
                ProxyHref = "/" + id + "/" + shuffler.shuffle(baseUrl);
                resolve(ProxyHref);
            });
        });
    });
}

function uvUrl(url) {
    return location.origin + __uv$config.prefix + __uv$config.encodeUrl(url);
};

window.goProx = {
    // `location.protocol + "//" + getDomain()` more like `location.origin`
    ultraviolet: function (url, stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl(omnibox(url)), stealth);
    },
    womginx: function (url, stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl(location.protocol + "//a." + getDomain() + "/main/" + omnibox(url), stealth);
    },
    rammerhead: async function (url, stealth) {
        goToUrl(location.origin + await RammerheadEncode(omnibox(url)), stealth);
    },
    searx: function (stealth) {
        setAuthCookie("oldsmobile=badcar", false);
        goToUrl(location.protocol + "//c." + getDomain() + "/engine/", stealth);
    },
    libreddit: function (stealth) {
        setAuthCookie("oldsmobile=badcar", false);
        goToUrl(location.protocol + "//c." + getDomain(), stealth);
    },
    rnav: function (stealth) {
        goToUrl(location.protocol + "//client." + getDomain(), stealth);
    },
    osu: function (stealth) {
        setAuthCookie("osauth=true", false);
        goToUrl(location.origin + '/archive/osu', stealth);
    },
    mcnow: function (stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('https://now.gg/play/mojang/2534/minecraft-trial'), stealth);
    },
    glife: function (stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('https://now.gg/play/lunime/5767/gacha-life'), stealth);
    },
    roblox: function (stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('https://now.gg/play/roblox-corporation/5349/roblox'), stealth);
    },
    amongus: function (stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('https://now.gg/play/innersloth-llc/4047/among-us'), stealth);
    },
    pubg: function (stealth) {
        setAuthCookie("__cor_auth=1", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('https://now.gg/play/proxima-beta/2609/pubg-mobile-resistance'), stealth);
    },
    train: function (stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('v6p9' + 'd9t4.ssl.hw' + 'cdn.net/html/1970' + '387/index.ht' + 'ml'), stealth);
    },
    village: function (stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('v6p' + '9d9t4.ss' + 'l.hwcd' + 'n.net/html/3' + '626475/index.html'), stealth);
    },
    prison: function (stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('v6p' + '9d9t4.ssl.hwc' + 'dn.net/h' + 'tml/364' + '7099/index.html'), stealth);
    },
    rpg: function (stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('v6p9d9' + 't4.ssl.hwc' + 'dn.net/html/347' + '0524/Die%20in%20the%20Du' + 'ngeon%201.1%20[WEB]/index.html'), stealth);
    },
    speed: function (stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('v6p9' + 'd9t4.ssl.hw' + 'cdn.net/html/36' + '28752/index.html'), stealth);
    },
    heli: function (stealth) {
        setAuthCookie("wgauth=yes", false);
        goToUrl(location.origin + __uv$config.prefix + __uv$config.encodeUrl('v6p9d' + '9t4.ssl.h' + 'wcdn.net/ht' + 'ml/3605' + '579/Helo%20Sto' + 'rm/index.html'), stealth);
    }
};