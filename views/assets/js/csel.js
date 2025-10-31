/* -----------------------------------------------
/* Authors: OlyB and Yoct
/* GNU Affero General Public License v3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
/* Adapted and modified by Yoct.
/* Settings Menu
/* ----------------------------------------------- */

// Encase everything in a new scope so that variables are not accidentally
// attached to the global scope.
(() => {
// Determine the expiration date of a new cookie.
let date = new Date();
date.setFullYear(date.getFullYear() + 100);
date = date.toUTCString();

// Cookies will not be used unless necessary. The localStorage API will be used instead.
const storageId = '{{hu-lts}}-storage',
  storageObject = () => JSON.parse(localStorage.getItem(storageId)) || {},
  setStorage = (name, value) => {
    let mainStorage = storageObject();
    mainStorage[name] = value;
    localStorage.setItem(storageId, JSON.stringify(mainStorage));
  },
  removeStorage = (name) => {
    let mainStorage = storageObject();
    delete mainStorage[name];
    localStorage.setItem(storageId, JSON.stringify(mainStorage));
  },
  readStorage = (name) => storageObject()[name],
  useStorageArgs = (name, func) => func(readStorage(name)),
  // All cookies should be secure and are intended to work in IFrames.
  setCookie = (name, value) => {
    document.cookie =
      name +
      `=${encodeURIComponent(value)}; expires=${date}; SameSite=None; Secure;`;
  },
  removeCookie = (name) => {
    document.cookie =
      name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure;';
  },
  readCookie = async (name) => {
    // Get the first cookie that has the same name.
    for (let cookie of document.cookie.split('; '))
      if (!cookie.indexOf(name + '='))
        // Return the cookie's stored content.
        return decodeURIComponent(cookie.slice(name.length + 1));
  },
  // Customize the page's title.
  pageTitle = (value) => {
    let tag =
      document.getElementsByTagName('title')[0] ||
      document.createElement('title');
    tag.innerHTML = value;
    document.head.appendChild(tag);
  },
  // Set the page's favicon to a new URL.
  pageIcon = (value) => {
    let tags = document.querySelectorAll("link[rel*='icon']") || [
      document.createElement('link'),
    ];
    tags.forEach((element) => {
      element.rel = 'icon';
      element.href = value;
      document.head.appendChild(element);
    });
  },
  // Make a small stylesheet to override a setting from the main stylesheet.
  pageShowAds = () => {
    let advertising = document.createElement('style');
    advertising.id = 'advertising';
    advertising.innerText = '.ad { display:block; }';
    (
      document.head ||
      document.body ||
      document.documentElement ||
      document
    ).appendChild(advertising);
  },
  // Remove the stylesheet made by the function above, if it exists.
  pageHideAds = () => {
    (document.getElementById('advertising') || new Text()).remove();
  },
  offStateKeywords = ['off', 'disabled', 'false', '0'],
  onStateKeywords = ['on', 'enabled', 'true', '1'],
  checkBooleanState = (element) => {
    const state =
      `${(element.querySelector('input:checked,option:checked') || []).value || element.checked}`.toLowerCase();
    return (
      onStateKeywords.includes(state) ||
      (!offStateKeywords.includes(state) && state)
    );
  },
  classEvent = (targetElementList, eventTrigger, eventConstructor = Event) =>
    new eventConstructor(eventTrigger, { target: targetElementList[0] }),
  classUpdateHandler =
    (targetElementList, stateFunction, manualEvent = false, ...params) =>
    () => {
      const state =
        'function' === typeof stateFunction
          ? `${stateFunction(...params)}`.toLowerCase()
          : `${stateFunction}`.toLowerCase();
      [...targetElementList].forEach((updateTarget) => {
        if (updateTarget.children.length > 0) {
          let children = updateTarget.querySelectorAll('input,option');
          const values = Array.from(children, (child) => {
            const childText = `${child.value}`.toLowerCase();
            return offStateKeywords.includes(childText)
              ? offStateKeywords.concat(child.value)
              : onStateKeywords.includes(childText)
                ? onStateKeywords.concat(child.value)
                : [childText];
          });
          const mappedIndex = values.findIndex((possibleValues) =>
            possibleValues.includes(state)
          );
          if ('number' === typeof updateTarget.selectedIndex)
            updateTarget.selectedIndex = mappedIndex;
          else children[mappedIndex].checked = true;
        } else updateTarget.checked = onStateKeywords.includes(state);
      });
      let eventTarget = targetElementList[0];
      if (manualEvent instanceof Event && eventTarget)
        ['input', 'select'].includes(eventTarget.tagName.toLowerCase())
          ? eventTarget.dispatchEvent(manualEvent)
          : eventTarget.querySelectorAll('input').forEach((child) => {
              child.dispatchEvent(manualEvent);
            });
    },
  // These titles and icons are used as autofill templates by settings.html.
  // The icon URLs and tab titles may need to be updated over time.
  presetIcons = Object.freeze({
    '': ' \n ',
    '{{Google}}': 'Google \n https://www.google.com/favicon.ico',
    '{{Bing}}':
      'Bing \n https://www.bing.com/sa/simg/favicon-trans-bg-blue-mg-28.ico',
    '{{Google}} Drive':
      'Home - Google Drive \n https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png',
    Gmail:
      'Inbox - Gmail \n https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
  }),
  defaultTheme = 'dark',
  // Choose the default transport mode, for proxying, based on the browser.
  // Firefox is not supported by epoxy yet, which is why this is implemented.
  defaultMode = '{{libcurl}}',
  defaultSearch = '{{defaultSearch}}';

// All code in this block is used by menu items that adjust website settings.

/* BEGIN WEBSITE SETTINGS */

if (document.getElementById('csel')) {
  const attachEventListener = (selector, ...args) =>
      (
        document.getElementById(selector) || document.querySelector(selector)
      ).addEventListener(...args),
    focusElement = document
      .getElementsByClassName('dropdown-settings')[0]
      .parentElement.querySelector("a[href='#']");

  // TODO: Add functionality to adapt listeners for the Wisp Transport List.
  // TODO: Properly comment this code.
  const attachClassEventListener = (classSelector, ...args) => {
    const eventTrigger = args[0],
      selectorList = [...document.getElementsByClassName(classSelector)];
    selectorList.forEach((element, index) => {
      let otherElements = [...selectorList];
      otherElements.splice(index, 1);
      const elementValue = () =>
        (element.querySelector('input:checked,option:checked') || []).value ||
        element.checked;
      const listeners = ['input', 'select'].includes(
        element.tagName.toLowerCase()
      )
        ? [element]
        : element.querySelectorAll('input');

      listeners.forEach((listener) => {
        listener.addEventListener(...args);
        listener.addEventListener(
          eventTrigger,
          classUpdateHandler(otherElements, elementValue)
        );
      });
    });
  };

  attachEventListener('.dropdown-settings .close-settings-btn', 'click', () => {
    document.activeElement.blur();
  });

  // Allow users to set a custom title with the UI.
  attachEventListener('titleform', 'submit', (e) => {
    e.preventDefault();
    e = e.target.firstElementChild;
    if (e.value) {
      pageTitle(e.value);
      setStorage('Title', e.value);
      e.value = '';
    } else if (confirm('Reset the title to default?')) {
      // Allow users to reset the title to default if nothing is entered.
      focusElement.focus();
      removeStorage('Title');
      pageTitle('Holy Unblocker LTS');
    }
  });

  // Allow users to set a custom favicon with the UI.
  attachEventListener('iconform', 'submit', (e) => {
    e.preventDefault();
    e = e.target.firstElementChild;
    if (e.value) {
      pageIcon(e.value);
      setStorage('Icon', e.value);
      e.value = '';
    } else if (confirm('Reset the icon to default?')) {
      //    Allow users to reset the favicon to default if nothing is entered.
      focusElement.focus();
      removeStorage('Icon');
      pageIcon('{{route}}{{assets/ico/favicon.ico}}');
    }
  });

  /*

  This is unused in the current settings menu.

  // Allow users to make a new about:blank tab and view the site from there.
  // An iframe of the current page is inserted into the new tab.
  attachEventListener("cselab", "click", () => {
    let win = window.open();
    let iframe = win.document.createElement("iframe");
    iframe.style = "width: 100%; height: 100%; border: none; overflow: hidden; margin: 0; padding: 0; position: fixed; top: 0; left: 0";
    iframe.src = location.href;
    win.document.body.appendChild(iframe);
  });
  */

  // Provides users with a handy set of title and icon autofill options.
  attachEventListener('icon-list', 'change', (e) => {
    let titleform = document.getElementById('titleform'),
      iconform = document.getElementById('iconform');
    [titleform.firstElementChild.value, iconform.firstElementChild.value] = (
      presetIcons[e.target.value] || ' \n '
    ).split(' \n ');
  });

  attachClassEventListener('search-engine-list', 'change', (e) => {
    e.target.value === defaultSearch
      ? removeStorage('SearchEngine')
      : setStorage('SearchEngine', e.target.value);
  });

  // Allow users to change the Wisp transport mode, for proxying, with the UI.
  attachClassEventListener('{{wisp-transport}}-list', 'change', (e) => {
    if (e.target.checked) {
      let wispTransportList = e.target.closest('.{{wisp-transport}}-list');
      !wispTransportList.querySelector('input:checked') ||
      e.target.value === defaultMode
        ? removeStorage('Transport')
        : setStorage('Transport', e.target.value);

      // Only the libcurl transport mode supports TOR at the moment.
      let torCheck = document.getElementsByClassName('useonion');
      if (
        e.target.value !== 'libcurl' &&
        checkBooleanState(torCheck[0]) === true
      )
        classUpdateHandler(torCheck, 'off', classEvent(torCheck, 'change'))();
    }
  });

  attachClassEventListener('theme-list', 'change', (e) => {
    if (e.target.checked) {
      let themeList = e.target.closest('.theme-list');
      if (
        !themeList.querySelector('input:checked') ||
        e.target.value === defaultTheme
      ) {
        const theme = readStorage('Theme');
        if (theme) document.documentElement.classList.toggle(theme, false);
        removeStorage('Theme');
      } else {
        setStorage('Theme', e.target.value);
        document.documentElement.classList.toggle(e.target.value, true);
      }
      (async () => {
        const shouldLoad = await new Promise((resolve) => {
          let tries = 0;
          const load = () => {
            if (!document.getElementById('background')) return resolve(false);
            if ('function' === typeof self.loadFull) {
              window.removeEventListener('load', load);
              resolve(true);
            } else if (tries < 5) {
              tries++;
              setTimeout(load, 1000);
            }
          };
          if (document.readyState === 'complete') load();
          else window.addEventListener('load', load);
        });
        if (!shouldLoad) return;
        await loadFull(tsParticles);
        const styles = getComputedStyle(document.documentElement);

        await tsParticles.load({
          id: 'background',
          options: {
            background: {
              color: {
                value: styles.getPropertyValue('--particles-bg') || '#1d232a',
              },
            },
            fullScreen: {
              enable: true,
              zIndex: -1,
            },
            detectRetina: true,
            fpsLimit: 60,
            interactivity: {
              events: {
                resize: {
                  enable: true,
                },
              },
            },
            particles: {
              color: {
                value: styles.getPropertyValue('--particles-color') || '#ffffff',
              },
              move: {
                enable: true,
                speed: parseFloat(styles.getPropertyValue('--particles-mv-spd')) || 0.3,
                direction: 'none',
                outModes: {
                  default: 'out',
                },
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 100,
              },
              opacity: {
                value: {
                  min: 0.1,
                  max: parseFloat(styles.getPropertyValue('--particles-op-max')) || 0.3,
                },
                animation: {
                  enable: true,
                  speed: parseFloat(styles.getPropertyValue('--particles-op-spd')) || 0.3,
                  sync: false,
                },
              },
              shape: {
                type: 'circle',
              },
              size: {
                value: { min: 1, max: 5 },
                animation: {
                  enable: true,
                  speed: parseFloat(styles.getPropertyValue('--particles-sz-spd')) || 0.3,
                  sync: false,
                },
              },
              links: {
                enable: true,
                distance: 150,
                color: styles.getPropertyValue('--particles-links') || '#ffffff',
                opacity: parseFloat(styles.getPropertyValue('--particles-links-opacity')) || 0.4,
                width: 1,
              },
            },
            pauseOnBlur: true,
            pauseOnOutsideViewport: true,
          },
        });
      })();
    }
  });

  // Allow users to toggle ads with the UI.
  attachClassEventListener('hideads', 'change', (e) => {
    if (checkBooleanState(e.target) === true) {
      pageHideAds();
      setStorage('HideAds', true);
    } else {
      pageShowAds();
      setStorage('HideAds', false);
    }
  });

  /* Allow users to toggle onion routing in Ultraviolet with the UI. Only
   * the libcurl transport mode supports TOR at the moment, so ensure that
   * users are aware that they cannot use TOR with other modes.
   */
  attachClassEventListener('useonion', 'change', (e) => {
    let unselectedModes = document.querySelectorAll(
      '.{{wisp-transport}}-list input:not([value={{libcurl}}]),.region-list'
    );
    const wispTransportList = document.getElementsByClassName(
        '{{wisp-transport}}-list'
      ),
      regionList = document.getElementsByClassName('region-list');
    if (checkBooleanState(e.target) === true) {
      classUpdateHandler(
        wispTransportList,
        '{{libcurl}}',
        classEvent(wispTransportList, 'change')
      )();
      classUpdateHandler(regionList, 'off', classEvent(regionList, 'change'))();
      unselectedModes.forEach((e) => {
        e.setAttribute('disabled', 'true');
      });
      setStorage('UseSocks5', 'tor');
      classUpdateHandler(document.getElementsByClassName('useonion'), 'on')();
    } else {
      unselectedModes.forEach((e) => {
        e.removeAttribute('disabled');
      });

      // Tor will likely never be enabled by default, so removing the cookie
      // here may be better than setting it to false.
      removeStorage('UseSocks5');
    }
  });

  attachClassEventListener('useac', 'change', (e) => {
    if (checkBooleanState(e.target) === false) setStorage('UseAC', false);
    else removeStorage('UseAC');
  });

  attachClassEventListener('region-list', 'change', (e) => {
    const isOff = checkBooleanState(e.target) === false;
    isOff
      ? removeStorage('UseSocks5')
      : setStorage('UseSocks5', e.target.value);

    // TOR cannot be used at the same time as a regional selection.
    // This is because they both run on the socks5 protocol.
    let torCheck = document.getElementsByClassName('useonion');
    if (!isOff && checkBooleanState(torCheck[0]) === true)
      classUpdateHandler(torCheck, 'off')();
  });

  /* The Eruda devtools are an alternative to the Chii devtools.
  attachClassEventListener('eruda', 'change', (e) => {
    const enabled = checkBooleanState(e.target) === true;

    if (enabled) {
      setStorage('ErudaEnabled', true);
      const moduleLocation = '{{route}}{{eruda/eruda.js}}';

      import(moduleLocation).then((module) => {
        if (!self.eruda || !self.eruda.init) return;
        eruda.init();
        delete eruda;
      });
    } else {
      removeStorage('ErudaEnabled');
    }
  });
  */
}

/* END WEBSITE SETTINGS */

/* LOAD USER-SAVED SETTINGS */

// Load a custom page title and favicon if it was previously stored.
useStorageArgs('Title', (s) => {
  s != undefined && pageTitle(s);
});
useStorageArgs('Icon', (s) => {
  s != undefined && pageIcon(s);
});

useStorageArgs('Theme', (s) => {
  const themeList = document.getElementsByClassName('theme-list');
  classUpdateHandler(
    themeList,
    s || defaultTheme,
    classEvent(themeList, 'change')
  )();
});

useStorageArgs('SearchEngine', (s) => {
  classUpdateHandler(
    document.getElementsByClassName('search-engine-list'),
    s || defaultSearch
  )();
});

// Load the Wisp transport mode that was last used, or use the default.
useStorageArgs('Transport', (s) => {
  classUpdateHandler(
    document.getElementsByClassName('{{wisp-transport}}-list'),
    s || defaultMode
  )();
});

// Ads are disabled by default. Load ads if ads were enabled previously.
// Change !== to === here if ads should be enabled by default.
useStorageArgs('HideAds', (s) => {
  if (s !== false) pageHideAds();
  else {
    pageShowAds();
    classUpdateHandler(document.getElementsByClassName('hideads'), 'off')();
  }
});

// TOR is disabled by default. Enable TOR if it was enabled previously.
useStorageArgs('UseSocks5', (s) => {
  const tor = document.getElementsByClassName('useonion'),
    regionList = document.getElementsByClassName('region-list');
  if (s === 'tor') classUpdateHandler(tor, 'on', classEvent(tor, 'change'))();
  else if ('string' === typeof s) classUpdateHandler(regionList, s)();
});

/*
useStorageArgs('ErudaEnabled', (s) => {
  const erudaSwitch = document.getElementsByClassName('eruda');

  if (s === true || s === 'true') {
    classUpdateHandler(erudaSwitch, 'on', classEvent(erudaSwitch, 'change'))();
  }
});
*/

useStorageArgs('UseAC', (s) => {
  if (s === false)
    classUpdateHandler(document.getElementsByClassName('useac'), 'off')();
});
})();
