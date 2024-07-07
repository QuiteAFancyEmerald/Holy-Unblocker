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

function RammerheadEncode(baseUrl) {
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