/* -----------------------------------------------
/* Authors: OlyB
/* GNU Affero General Public License v3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
/* Adapted and modified by yoct.
/* Settings Menu
/* ----------------------------------------------- */


//  Determine the expiration date of a new cookie.
let date = new Date();
date.setFullYear(date.getFullYear() + 100);
date = date.toUTCString();

//  All cookies should be secure and are intended to work in iframes.
const setCookie = (name, value) => {
    document.cookie = name + `=${encodeURIComponent(value)}; expires=${date}; SameSite=None; Secure`;
},

removeCookie = name => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; ";
},

readCookie = async name => {
    for (let cookie of document.cookie.split("; "))
//      Get the first cookie that has the same name.
        if (!cookie.indexOf(name + "="))
//          Return the cookie's stored content.
            return decodeURIComponent(cookie.slice(name.length + 1));
},

//  Customize the page's title.
pageTitle = value => {
    let tag = document.getElementsByTagName("title")[0] || document.createElement("title");
    tag.innerHTML = value;
    document.head.appendChild(tag);
},

//  Set the page's favicon to a new URL.
pageIcon = value => {
    let tag = document.querySelector("link[rel*='icon']") || document.createElement("link");
    tag.rel = "icon";
    tag.href = value;
    document.head.appendChild(tag);
},

//  Make a small stylesheet to override a setting from the main stylesheet.
pageShowAds = () => {
    let advertising = document.createElement("style");
    advertising.id = "advertising";
    advertising.innerText = ".ad { display:block; }";
    document.appendChild.bind(document.head || document.body || document.documentElement || document)(advertising);
},

//  Remove the stylesheet made by the function above, if it exists.
pageHideAds = () => {
    (document.getElementById("advertising")||new Text()).remove();
};


//  Load a custom page title and favicon if it was previously stored.
readCookie("HBTitle").then(s => (s != undefined) && pageTitle(s));
readCookie("HBIcon").then(s => (s != undefined) && pageIcon(s));

//  Ads are disabled by default. Load ads if ads were enabled previously.
readCookie("HBHideAds").then(s => (s != "false") ? pageHideAds() : pageShowAds((document.getElementById("hideads") || {}).checked = 0));

//  All code below is used by the Settings UI in the navigation bar.
if (document.getElementById("csel")) {

//  Allow users to set a custom title with the UI.
    document.getElementById("titleform").addEventListener("submit", e => {
        e.preventDefault();
        e = this.firstElementChild;
        if (e.value) {
            pageTitle(e.value);
            setCookie("HBTitle", e.value);
            e.value = "";
        } else {
            alert("Please provide a title.");
        }
    }, false);

//  Allow users to set a custom favicon with the UI.
    document.getElementById("iconform").addEventListener("submit", e => {
        e.preventDefault();
        e = this.firstElementChild;
        if (e.value) {
            pageIcon(e.value);
            setCookie("HBIcon", e.value);
            e.value = "";
        } else {
            alert("Please provide an icon URL.");
        }
    }, false);

//  Allow users to reset the title and favicon to default with the UI.
    document.getElementById("cselreset").addEventListener("click", () => {
        if (confirm("Reset the title and icon to default?")) {
            removeCookie("HBTitle");
            removeCookie("HBIcon");
            pageTitle("Holy Unblocker");
            pageIcon("assets/img/icon.png");
        }
    }, false);

//  Allow users to make a new about:blank tab and view the site from there.
//  An iframe of the current page is inserted into the new tab.
    document.getElementById("cselab").addEventListener("click", () => {
        let win = window.open();
        let iframe = win.document.createElement("iframe");
        iframe.style = "width: 100%; height: 100%; border: none; overflow: hidden; margin: 0; padding: 0; position: fixed; top: 0; left: 0";
        iframe.src = location.href;
        win.document.body.appendChild(iframe);
    });

//  Allow users to enable or disable ads with the UI.
    document.getElementById("hideads").addEventListener("change", e => {
        if (e.target.checked) {
            pageHideAds();
            setCookie("HBHideAds", "true");
        } else {
            pageShowAds();
            setCookie("HBHideAds", "false");
        }
    }, false);
}



/* ----------------------------------------------- 
/* Original code written by OlyB
/* -----------------------------------------------


let date = new Date();
date.setFullYear(date.getFullYear() + 100);
date = date.toUTCString();

const setCookie = (name, value) => {
    document.cookie = name + `=${encodeURIComponent(value)}; expires=${date}; SameSite=None; Secure`;
};

const removeCookie = name => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; ";
};

const readCookie = async name => {
    for (let cookie of document.cookie.split("; "))
        if (!cookie.indexOf(name + "="))
            return decodeURIComponent(cookie.slice(name.length + 1));
};

const pageTitle = value => {
    let tag = document.getElementsByTagName("title")[0] || document.createElement("title");
    tag.innerHTML = value;
    document.head.appendChild(tag);
}

const pageIcon = value => {
    let tag = document.querySelector("link[rel*='icon']") || document.createElement("link");
    tag.rel = "icon";
    tag.href = value;
    document.head.appendChild(tag);
}


function pageHideAds() {
    (document.getElementById('advertising')||new Text()).remove();
}

function pageShowAds() {
    let advertising = document.createElement('style');
    advertising.id = "advertising";
    advertising.innerText = `.ad { display:block; }`;
    document.appendChild.bind(document.head || document.body || document.documentElement || document)(advertising);
}

readCookie("HBTitle").then(s => (s != undefined) && pageTitle(s));
readCookie("HBIcon").then(s => (s != undefined) && pageIcon(s));

readCookie("HBHideAds").then(s => (s != "false") ? pageHideAds() : pageShowAds((document.getElementById("hideads") || {}).checked = 0));

if (document.getElementById('csel')) {
    document.getElementById("titleform").addEventListener("submit", e => {
        e.preventDefault();
        e = this.firstElementChild;
        if (e.value) {
            pageTitle(e.value);
            setCookie("HBTitle", e.value);
            e.value = "";
        } else {
            alert("Please provide a title.");
        }
    }, false);

    document.getElementById("iconform").addEventListener("submit", e => {
        e.preventDefault();
        e = this.firstElementChild;
        if (e.value) {
            pageIcon(e.value);
            setCookie("HBIcon", e.value);
            e.value = "";
        } else {
            alert("Please provide an icon URL.");
        }
    }, false);

    document.getElementById("cselreset").addEventListener("click", () => {
        if (confirm("Reset the title and icon to default?")) {
            removeCookie("HBTitle");
            removeCookie("HBIcon");
            pageTitle("Holy Unblocker");
            pageIcon("assets/img/icon.png");
        }
    }, false);

    document.getElementById("cselab").addEventListener("click", () => {
        let win = window.open();
        let iframe = win.document.createElement('iframe');
        iframe.style = "width: 100%; height: 100%; border: none; overflow: hidden; margin: 0; padding: 0; position: fixed; top: 0; left: 0";
        iframe.src = location.href;
        win.document.body.appendChild(iframe);
    });

    document.getElementById("hideads").addEventListener("change", e => {
        if (e.target.checked) {
            pageHideAds();
            setCookie("HBHideAds", "true");
        } else {
            pageShowAds();
            setCookie("HBHideAds", "false");
        }
    }, false);
}
*/