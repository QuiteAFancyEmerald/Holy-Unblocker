/* -----------------------------------------------
/* Authors: QuiteAFancyEmerald, Yoct, and OlyB
/* GNU Affero General Public License v3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
/* MAIN Holy Unblocker LTS Common Script
/* ----------------------------------------------- */

//  Get the preferred apex domain name. Not exactly apex, as any
//  subdomain other than those listed will be ignored.
const getDomain = () => location.host.replace(/^(?:www|edu|cooking|beta)\./, "");

/* STEALTH FRAME */
const goFrame = url => {
  localStorage.setItem("huframesrc", url);
  location.href = "?s";
};

//  Used to set functions for the goProx object at the bottom.
//  See the goProx object at the bottom for some usage examples
//  on the URL handlers, omnibox functions, and the uvUrl and
//  RammerheadEncode functions.
const urlHandler = parser => typeof parser === "function"
//  Return different functions based on whether a URL has already been set.
//  Should help avoid confusion when using or adding to the goProx object.
  ? (url, mode) => {
      url = parser(url);
      mode = `${mode}`.toLowerCase();
      if (mode === "stealth" || mode == 1) goFrame(url);
      else if (mode === "window" || mode == 0) location.href = url;
      else return url;
    }
  : mode => {
      mode = `${mode}`.toLowerCase();
      if (mode === "stealth" || mode == 1) goFrame(parser);
      else if (mode === "window" || mode == 0) location.href = parser;
      else return parser;
    };

//  An asynchronous version of the function above, just in case.
const asyncUrlHandler = parser => async (url, mode) => {
  if (typeof parser === "function") url = await parser(url);
  mode = `${mode}`.toLowerCase();
  if (mode === "stealth" || mode == 1) goFrame(url);
  else if (mode === "window" || mode == 0) location.href = url;
  else return url;
};

/* COOKIE AUTH DEMO */

const setAuthCookie = (s, lax) => {
  document.cookie = s + `; expires=${Date.now() + 259200}; SameSite=${lax ? "Lax" : "None"}; domain=.${getDomain()}; path=/; Secure;`;
};

/* OMNIBOX */

//  Search engine is set to Bing. Intended to work just like the usual
//  bar at the top of a browser.
const sx = "bing.com" + "/search?q=";

/*
const omnibox = url =>
  (url.indexOf("http")
    ? "https://" + (url.indexOf(".") < 1 ? sx : "")
    : "")
  + url;
*/

//  Another omnibox function. Unsure if the version above is needed.
const search = (input, template = `https://${sx}%s`) => {
  try {
//  Return the input if it is already a valid URL.
//  eg: https://example.com, https://example.com/test?q=param
    return new URL(input) + "";
  } catch (e) {
//  Continue if it is invalid.
  }

  try {
//  Check if the input is valid when http:// is added to the start.
//  eg: example.com, https://example.com/test?q=param
    const url = new URL(`http://${input}`);
//  Return only if the hostname has a TLD or a subdomain.
    if (url.hostname.indexOf(".") != -1) return url + "";
  } catch (e) {
//  Continue if it is invalid.
  }

//  Treat the input as a search query instead of a website.
  return template.replace("%s", encodeURIComponent(input));
};

//  Parse a URL to use with Ultraviolet.
const uvUrl = url => {
  try {
    url = location.origin + __uv$config.prefix + __uv$config.encodeUrl(search(url));
  } catch (e) {
//  This is for cases where the Ultraviolet scripts have not been loaded.
    url = search(url);
  }
  return url;
};

/* RAMMERHEAD CONFIGURATION */

//  Parse a URL to use with Rammerhead. Only usable if the server is active.
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
      if (!str.indexOf(shuffledIndicator)) return str;

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
        }

//      Do not modify unrecognized characters.
        else if (idx == -1) shuffledStr += char;

//      Find the corresponding dictionary entry and use the character
//      that is i places to the right of it.
        else shuffledStr += this.dictionary[
            mod(idx + i, baseDictionary.length)
        ];
      }
//    Add a prefix signifying that the string has been shuffled.
      return shuffledIndicator + shuffledStr;
    }

//  Unshuffling is currently not done on the client side, and likely
//  won't ever be for this implementation. It is used by the server instead.
    unshuffle(str) {
//    Do not unshuffle an already unshuffled string.
      if (str.indexOf(shuffledIndicator)) return str;

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
        }

        else if (idx == -1) unshuffledStr += char;

//      Find the corresponding base character entry and use the character
//      that is i places to the left of it.
        else unshuffledStr += baseDictionary[
            mod(idx - i, baseDictionary.length)
        ];
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
      if (request.status === 200) callback(request.responseText);
      else if (!shush)
        console.log(
          `Unexpected server response to not match "200". Server says "${request.responseText}"`
        );
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
      get("/sessionexists?id=" + encodeURIComponent(id), res => {
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

//  Organize Rammerhead sessions via the browser's local storage.
//  Local data consists of session creation timestamps and session IDs.
//  The rest of the data is stored on the server.
  const localStorageKey = "rammerhead_sessionids";
  const localStorageKeyDefault = "rammerhead_default_sessionid";
  const sessionIdsStore = {

//  Get the local data of all stored sessions.
    get() {
      const rawData = localStorage.getItem(localStorageKey);
      if (!rawData) return [];
      try {
        const data = JSON.parse(rawData);

//      Catch invalidly stored Rammerhead session data.
//      Either that or it's poorly spoofed.
        if (!Array.isArray(data)) throw "getout";
        return data;
      } catch (e) {
        return [];
      }
    },

//  Store local Rammerhead session data in the form of an array.
    set(data) {
      if (!Array.isArray(data)) throw new TypeError("Must be an array.");
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    },

//  Get the default session data.
    getDefault() {
      const sessionId = localStorage.getItem(localStorageKeyDefault);
      if (sessionId) {
        let data = sessionIdsStore.get();
        data.filter(session => session.id === sessionId);
        if (data.length) return data[0];
      }
      return null;
    },

//  Set a new default session based on a given session ID.
    setDefault(id) {
      localStorage.setItem(localStorageKeyDefault, id);
    },
  };

//  Store or update local data for a Rammerhead session, which consists of
//  the session's ID and when the session was last created.
  const addSession = id => {
    let data = sessionIdsStore.get();
    data.unshift({ id: id, createdOn: new Date().toLocaleString() });
    sessionIdsStore.set(data);
  }

//  Attempt to load an existing session that has been stored on the server.
  const getSessionId = () => {
    return new Promise(resolve => {
//    Check if the browser has stored an existing session.
      const id = localStorage.getItem("session-string");
      api.sessionexists(id, value => {
        if (!value) {
//        Create a new session if Rammerhead can't find an existing session.
          console.log("Session validation failed");
          api.newsession(id => {
            addSession(id);
            localStorage.setItem("session-string", id);
            console.log(id);
            console.log("^ new id");
            resolve(id);
          });
        }
//      Load the stored session now that Rammerhead has found it.
        else resolve(id);
      });
    });
  };

//  Load the URL that was last visited in the Rammerhead session.
  return getSessionId().then((id) =>
    new Promise(resolve => {
      api.shuffleDict(id, shuffleDict => {
//      Encode the URL with Rammerhead's encoding table and return the URL.
        resolve(`/${id}/` + new StrShuffler(shuffleDict).shuffle(baseUrl));
      });
    })
  );
};

/* To use:
 * goProx.proxy(url-string, mode-as-string-or-number);
 * 
 * Key: 1 = "stealth"
 *      0 = "window"
 *      Nothing = return URL as a string
 *
 * Examples:
 * Stealth mode -
 * goProx.ultraviolet("https://google.com", 1);
 * goProx.ultraviolet("https://google.com", "stealth");
 * 
 * await goProx.rammerhead("https://google.com", 1);
 * await goProx.rammerhead("https://google.com", "stealth");
 * 
 * goProx.searx(1);
 * goProx.searx("stealth");
 * 
 * Window mode -
 * goProx.ultraviolet("https://google.com", "window");
 * 
 * await goProx.rammerhead("https://google.com", "window");
 * 
 * goProx.searx("window");
 * 
 * Return string value mode (default) -
 * goProx.ultraviolet("https://google.com");
 * 
 * await goProx.rammerhead("https://google.com");
 * 
 * goProx.searx();
 */
addEventListener("DOMContentLoaded", () => {
//  Object.freeze prevents goProx from being edited.
  self.goProx = Object.freeze({
//  `location.protocol + "//" + getDomain()` more like `location.origin`
//  setAuthCookie("__cor_auth=1", false);
    ultraviolet: urlHandler(uvUrl),

    rammerhead: asyncUrlHandler(async url => location.origin + (await RammerheadEncode(search(url)))),

    searx: urlHandler(location.protocol + `//c.${getDomain()}/engine/`),

    libreddit: urlHandler(location.protocol + "//c." + getDomain()),

    rnav: urlHandler(location.protocol + "//client." + getDomain()),

    osu: urlHandler(location.origin + "/archive/osu"),

    mcnow: urlHandler(uvUrl("https://now.gg/play/a/10010/b")),

    glife: urlHandler(uvUrl("https://now.gg/apps/lunime/5767/gacha-life.html")),

    roblox: urlHandler(uvUrl("https://now.gg/apps/roblox-corporation/5349/roblox.html")),

    amongus: urlHandler(uvUrl("https://now.gg/apps/innersloth-llc/4047/among-us.html")),

    pubg: urlHandler(uvUrl("https://now.gg/apps/proxima-beta/2609/pubg-mobile-resistance.html")),

    train: urlHandler(uvUrl("https://hby.itch.io/last-train-home")),

    village: urlHandler(uvUrl("https://kwoodhouse.itch.io/village-arsonist")),

    prison: urlHandler(uvUrl("https://vimlark.itch.io/pick-up-prison")),

    rpg: urlHandler(uvUrl("https://alarts.itch.io/die-in-the-dungeon")),

    speed: urlHandler(uvUrl("https://captain4lk.itch.io/what-the-road-brings")),

    heli: urlHandler(uvUrl("https://benjames171.itch.io/helo-storm"))
  });
});

(async () => {
//  Load in relevant JSON files used to organize large sets of data.
//  This first one is for links, whereas the rest are for navigation menus.
  const huLinks = await fetch("/assets/json/links.json", {mode: "same-origin"}).then(response => response.json());

  for (let item of Object.entries(huLinks))
//  Replace all placeholder links with the corresponding entry in huLinks.
    (document.getElementById(item[0]) || {}).href = item[1];

  const navLists = {
    "emu-nav": "emu-nav",
    "emulib-nav": "emulib-nav",
    "flash-nav": "flash-nav",
    "h5-nav": "h5-nav"
  };

  for (let [listId, filename] of Object.entries(navLists)) {

    let navList = document.getElementById(listId);

    if(navList) {
//    List items stored in JSON format will be returned as a JS object.
      const data = await fetch(`/assets/json/${filename}.json`, {mode: "same-origin"}).then(response => response.json());

//    Load the JSON lists into specific HTML parent elements as groups of
//    child elements, if the parent element is found.
      switch (filename) {
        case "emu-nav":
        case "emulib-nav":
        case "h5-nav": {
          const dirnames = {
            "emu-nav": "emu",
            "emulib-nav": "emulib",
            "h5-nav": "h5g"
          },

          dir = dirnames[filename],

//        Add a little functionality for each list item when clicked on.
          clickHandler = (parser, a) => e => {
            if (e.target == a || e.target.tagName != "A") {
              e.preventDefault();
              parser();
            }
          };

          for (let item of data) {
//          Load each item as an anchor tag with an image, heading,
//          description, and click event listener.
            let a = document.createElement("a");
            a.href = "#";

            let img = document.createElement("img");
            img.src = `/assets/img/${dir}/` + item.img;
            let title = document.createElement("h3");
            title.textContent = item.name;
            let desc = document.createElement("p");
            desc.textContent = item.description;

            if (filename === "h5-nav") {
              if (item.credits === "itch") desc.innerHTML += '<br>Credits: Game can be found <a target="_blank" href="https://itch.io">here</a>.';
              if (item.credits === "nowgg") desc.innerHTML += '<br>Credits: Game can be found <a target="_blank" href="https://now.gg">here</a>.';
            }

            a.appendChild(img);
            a.appendChild(title);
            a.appendChild(desc);

//          Which function is used for the click event is determined by
//          the corresponding location/index in the dirnames object.
            const functionsList = [
              () => goFrame(item.path),
              () => goFrame("/?eg&core=" + item.core + "&rom=" + item.rom),
              () => item.custom ? goProx[item.custom]("stealth") : goFrame("/archive/g/" + item.path)
            ];

            a.addEventListener("click", clickHandler(functionsList[Object.values(dirnames).indexOf(dir)], a));

            navList.appendChild(a);
          }
          break;
        }

        case "flash-nav":
          for (let item of data) {
//          Load each item as an anchor tag with a short title and click
//          event listener.
            let a = document.createElement("a");
            a.href = "#";
            a.textContent = item.slice(0, -4);

            a.addEventListener("click", e => {
              e.preventDefault();
              goFrame("/?fg&swf=" + item);
            });

            navList.appendChild(a);
          }
          break;

  //    No default case.
      }
    }
  }
})();