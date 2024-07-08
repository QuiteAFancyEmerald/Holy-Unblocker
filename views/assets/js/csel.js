/* -----------------------------------------------
/* Authors: OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* Settings Menu
/* ----------------------------------------------- */


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