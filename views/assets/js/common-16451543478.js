/* -----------------------------------------------
/* Authors: QuiteAFancyEmerald, Yoct, and OlyB
/* GNU Affero General Public License v3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
/* MAIN Holy Unblocker LTS Common Script
/* ----------------------------------------------- */

//  Used in scripts outside this file.
const tryGetElement = id => document.getElementById(id) || {};

/**
 * Get the preferred apex domain name.
 * Not exactly apex, as any subdomain other than those listed will be ignored.
 **/

const getDomain = () => location.host.replace(/^(?:www|edu|cooking|beta)\./, "");

/* STEALTH FRAME */
const goFrame = url => {
  localStorage.setItem("huframesrc", url);
  location.href = "?s";
};

const goToUrl = (url, stealth, nolag) => {
  stealth ? goFrame(url, nolag) : location.href = url;
};

/* COOKIE AUTH DEMO */

const setAuthCookie = (s, lax) => {
  document.cookie = s + `; expires=${Date.now() + 259200}; SameSite=${lax ? "Lax" : "None"}; domain=.${getDomain()}; path=/; Secure;`;
};

/* OMNIBOX */

const sx = "bing.com" + "/search?q=";

const omnibox = url =>
  (url.indexOf("http")
    ? "https://" + (url.indexOf(".") < 1 ? sx : "")
    : "")
  + url;

const uvUrl = url => location.origin + __uv$config.prefix + __uv$config.encodeUrl(omnibox(url));

/* RAMMERHEAD CONFIGURATION */

search = (input, template) => {
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
    if (url.hostname.indexOf(".") != -1) return url.toString();
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
    },
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
    },
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

/* To use:
 * goProx.proxy(url-string, stealth-boolean-optional)
 *
 * Examples:
 * goProx.corrosion("https://google.com")
 * goProx.womginx("discord.com", true)
 */

window.goProx = {
  // `location.protocol + "//" + getDomain()` more like `location.origin`
  ultraviolet: function (url, stealth) {
    //setAuthCookie("__cor_auth=1", false);
    goToUrl(uvUrl(url), stealth);
  },
  rammerhead: async function (url, stealth) {
    goToUrl(location.origin + (await RammerheadEncode(omnibox(url))), stealth);
  },
  searx: function (stealth) {
    goToUrl(location.protocol + "//c." + getDomain() + "/engine/", stealth);
  },
  libreddit: function (stealth) {
    goToUrl(location.protocol + "//c." + getDomain(), stealth);
  },
  rnav: function (stealth) {
    goToUrl(location.protocol + "//c." + getDomain(), stealth);
  },
  osu: function (stealth) {
    goToUrl(location.origin + "/archive/osu", stealth);
  },
  mcnow: function (stealth) {
    goToUrl(uvUrl("https://now.gg/play/a/10010/b"), stealth);
  },
  glife: function (stealth) {
    goToUrl(uvUrl("https://now.gg/apps/lunime/5767/gacha-life.html"), stealth);
  },
  roblox: function (stealth) {
    goToUrl(
      uvUrl("https://now.gg/apps/roblox-corporation/5349/roblox.html"),
      stealth
    );
  },
  amongus: function (stealth) {
    goToUrl(
      uvUrl("https://now.gg/apps/innersloth-llc/4047/among-us.html"),
      stealth
    );
  },
  pubg: function (stealth) {
    goToUrl(
      uvUrl(
        "https://now.gg/apps/proxima-beta/2609/pubg-mobile-resistance.html"
      ),
      stealth
    );
  },
  train: function (stealth) {
    goToUrl(uvUrl("https://hby.itch.io/last-train-home"), stealth);
  },
  village: function (stealth) {
    goToUrl(uvUrl("https://kwoodhouse.itch.io/village-arsonist"), stealth);
  },
  prison: function (stealth) {
    goToUrl(uvUrl("https://vimlark.itch.io/pick-up-prison"), stealth);
  },
  rpg: function (stealth) {
    goToUrl(uvUrl("https://alarts.itch.io/die-in-the-dungeon"), stealth);
  },
  speed: function (stealth) {
    goToUrl(uvUrl("https://captain4lk.itch.io/what-the-road-brings"), stealth);
  },
  heli: function (stealth) {
    goToUrl(uvUrl("https://benjames171.itch.io/helo-storm"), stealth);
  },
};
