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

const search = (input, template) => {
  try {
//  Return the input if it is already a valid URL.
//  eg: https://example.com, https://example.com/test?q=param
    return new URL(input).toString();
  } catch (err) {
//  Continue if it is invalid.
  }

  try {
//  Check if the input is valid when http:// is added to the start.
//  eg: example.com, https://example.com/test?q=param
    const url = new URL(`http://${input}`);
//  Return only if the hostname has a TLD or a subdomain.
    if (url.hostname.indexOf(".") != -1) return url.toString();
  } catch (err) {
//  Continue if it is invalid.
  }

//  Treat the input as a search query instead of a website.
  return template.replace("%s", encodeURIComponent(input));
};

const RammerheadEncode = async baseUrl => {
//  Hellhead
  const mod = (n, m) => ((n % m) + m) % m;
  const baseDictionary =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~-";
  const shuffledIndicator = "_rhs";
//  Return a copy of the base dictionary with a randomized character order.
//  Will be used as a Caesar cipher for URL encoding.
  const generateDictionary = () => {
    let str = "";
    const split = baseDictionary.split("");
    while (split.length > 0) {
//    Using .splice automatically rounds down to the nearest whole number.
      str += split.splice(Math.random() * split.length, 1)[0];
    }
    return str;
  };

  class StrShuffler {
    constructor(dictionary = generateDictionary()) {
      this.dictionary = dictionary;
    }

    shuffle(str) {
//    Do not reshuffle an already shuffled string.
      if (!str.indexOf(shuffledIndicator)) {
        return str;
      }

      let shuffledStr = "";
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const idx = baseDictionary.indexOf(char);

//      For URL encoded characters and characters not included in the
//      dictionary, leave untouched. Otherwise, replace with a character
//      from the dictionary.
        if (char === "%" && str.length - i >= 3) {
//        A % symbol denotes that the next 2 characters are URL encoded.
          shuffledStr += char;
          shuffledStr += str[++i];
          shuffledStr += str[++i];
        } else if (idx == -1) {
//        An unrecognized character not included in the dictionary.
          shuffledStr += char;
        } else {
//        Find the corresponding dictionary entry and use the character
//        that is i places to the right of it.
          shuffledStr += this.dictionary[
            mod(idx + i, baseDictionary.length)
          ];
        }
      }
//    Add a prefix signifying that the string has been shuffled.
      return shuffledIndicator + shuffledStr;
    }

    unshuffle(str) {
//    Do not unshuffle an already unshuffled string.
      if (str.indexOf(shuffledIndicator)) {
        return str;
      }

//    Remove the prefix signifying that the string has been shuffled.
      str = str.slice(shuffledIndicator.length);

      let unshuffledStr = "";
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const idx = this.dictionary.indexOf(char);

//      Convert the dictionary entry characters back into their base
//      characters using the base dictionary. Again, leave URL encoded
//      characters and unrecognized symbols alone.
        if (char === "%" && str.length - i >= 3) {
          unshuffledStr += char;
          unshuffledStr += str[++i];
          unshuffledStr += str[++i];
        } else if (idx == -1) {
          unshuffledStr += char;
        } else {
//        Find the corresponding base character entry and use the character
//        that is i places to the left of it.
          unshuffledStr += baseDictionary.charAt(
            mod(idx - i, baseDictionary.length)
          );
        }
      }
      return unshuffledStr;
    }
  };

//  Request information that's beiing stored elsewhere on the server.
//  Executes the callback function if the server responds as intended.
  const get = (url, callback, shush = false) => {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send();

    request.onerror = () => {
      if (!shush) console.log("Cannot communicate with the server");
    };
    request.onload = () => {
      if (request.status === 200) {
        callback(request.responseText);
      } else {
        if (!shush)
          console.log(
            `Unexpected server response to not match "200". Server says "${request.responseText}"`
          );
      }
    };
  };

//  Functions for interacting with Rammerhead backend code on the server.
  const api = {

//  Make a new Rammerhead session and do something with it.
    newsession(callback) {
      get("/newsession", callback);
    },

//  Check if a session with the specified ID exists, then do something.
    sessionexists(id, callback) {
      get("/sessionexists?id=" + encodeURIComponent(id), function (res) {
        if (res === "exists") return callback(true);
        if (res === "not found") return callback(false);
        console.log("Unexpected response from server. Received " + res);
      });
    },

//  Request a brand new encoding table to use for Rammerhead.
    shuffleDict(id, callback) {
      console.log("Shuffling", id);
      get("/api/shuffleDict?id=" + encodeURIComponent(id), res => {
        callback(JSON.parse(res));
      });
    },
  };

//  Store Rammerhead sessions in the browser's local storage.
  const localStorageKey = "rammerhead_sessionids";
  const localStorageKeyDefault = "rammerhead_default_sessionid";
  const sessionIdsStore = {
    get() {
      const rawData = localStorage.getItem(localStorageKey);
      if (!rawData) return [];
      try {
        const data = JSON.parse(rawData);
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
};

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
