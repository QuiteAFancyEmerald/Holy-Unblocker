/* -----------------------------------------------
/* Authors: OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* Settings Menu
/* ----------------------------------------------- */

(function() {
    let date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    date = date.toUTCString();

    let csel = document.getElementById("csel");

    function setCookie(name, value) {
        document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + date + "; ";
    }

    function removeCookie(name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; ";
    }

    async function readCookie(name) {
        let cookie = document.cookie.split("; ");
        let cookies = {};
        for (let i = 0; i < cookie.length; i++) {
            let p = cookie[i].split("=");
            cookies[p[0]] = p[1];
        }
        return decodeURIComponent(cookies[name]);
    }

    function pageTitle(value) {
        let tag = document.getElementsByTagName("title")[0] || document.createElement("title");
        tag.innerHTML = value;
        document.head.appendChild(tag);
    }

    function pageIcon(value) {
        let tag = document.querySelector("link[rel*='icon']") || document.createElement("link");
        tag.rel = "icon";
        tag.href = value;
        document.head.appendChild(tag);
    }

    function setTitle(value) {
        pageTitle(value);
        setCookie("HBTitle", value);
    }

    function setIcon(value) {
        pageIcon(value);
        setCookie("HBIcon", value);
    }

    function pageHideAds() {
        document.querySelectorAll(".ad").forEach(n => n.style.display = "none");
    }

    function pageShowAds() {
        document.querySelectorAll(".ad").forEach(n => n.style.display = "block");
    }

    function hideAds() {
        pageHideAds();
        setCookie("HBHideAds", "true");
    }

    // Ghetto Default Disable Ads
    setCookie("HBHideAds", "true");

    function showAds() {
        pageShowAds();
        removeCookie("HBHideAds");
    }

    readCookie("HBTitle").then(s => (s != "undefined") && pageTitle(s));
    readCookie("HBIcon").then(s => (s != "undefined") && pageIcon(s));

    readCookie("HBHideAds").then(s => (s != "undefined") && (function() { pageHideAds(); (document.getElementById("hideads") || {}).checked = "true"; })());

    if (csel) {
        csel.innerHTML = 
decodeURIComponent(atob("JTNDcCUyMGNsYXNzJTNEJTIyY3NlbHRpdGxlJTIyJTNFVGFiJTIwQ2xvYWslM0MlMkZwJTNFJTBBJTNDcCUyMGNsYXNzJTNEJTIyY3NlbGxhYmVsJTIyJTNFQ2hhbmdlJTIwdGhlJTIwdGl0bGUlM0ElM0MlMkZwJTNFJTBBJTNDZm9ybSUyMGNsYXNzJTNEJTIyY3NlbGZvcm0lMjIlMjBpZCUzRCUyMnRpdGxlZm9ybSUyMiUzRSUwQSUyMCUyMCUyMCUyMCUzQ2lucHV0JTIwdHlwZSUzRCUyMnRleHQlMjIlMjBwbGFjZWhvbGRlciUzRCUyMlRhYiUyMFRpdGxlJTIyJTIwc3BlbGxjaGVjayUzRCUyMmZhbHNlJTIyJTNFJTNDaW5wdXQlMjBjbGFzcyUzRCUyMmNzZWxidXR0b24lMjIlMjB0eXBlJTNEJTIyc3VibWl0JTIyJTIwdmFsdWUlM0QlMjJBcHBseSUyMiUzRSUwQSUzQyUyRmZvcm0lM0UlMEElM0NwJTIwY2xhc3MlM0QlMjJjc2VsbGFiZWwlMjIlM0VDaGFuZ2UlMjB0aGUlMjAlM0NhJTIwaHJlZiUzRCUyMiUyRiUzRmklMjIlM0VpY29uJTNDJTJGYSUzRSUzQSUzQyUyRnAlM0UlMEElM0Nmb3JtJTIwY2xhc3MlM0QlMjJjc2VsZm9ybSUyMiUyMGlkJTNEJTIyaWNvbmZvcm0lMjIlM0UlMEElMjAlMjAlMjAlMjAlM0NpbnB1dCUyMHR5cGUlM0QlMjJ0ZXh0JTIyJTIwcGxhY2Vob2xkZXIlM0QlMjJJY29uJTIwVVJMJTIyJTIwc3BlbGxjaGVjayUzRCUyMmZhbHNlJTIyJTNFJTNDaW5wdXQlMjBjbGFzcyUzRCUyMmNzZWxidXR0b24lMjIlMjB0eXBlJTNEJTIyc3VibWl0JTIyJTIwdmFsdWUlM0QlMjJBcHBseSUyMiUzRSUwQSUzQyUyRmZvcm0lM0UlMEElM0NpbnB1dCUyMGlkJTNEJTIyY3NlbHJlc2V0JTIyJTIwY2xhc3MlM0QlMjJjc2VsYnV0dG9uJTIyJTIwdHlwZSUzRCUyMmJ1dHRvbiUyMiUyMHZhbHVlJTNEJTIyUmVzZXQlMjIlM0UlMEElM0NpbnB1dCUyMGlkJTNEJTIyY3NlbGFiJTIyJTIwY2xhc3MlM0QlMjJjc2VsYnV0dG9uJTIyJTIwdHlwZSUzRCUyMmJ1dHRvbiUyMiUyMHZhbHVlJTNEJTIyYWJvdXQlM0FibGFuayUyMiUzRSUwQSUzQ3AlMjBjbGFzcyUzRCUyMmNzZWxsYWJlbCUyMiUzRSUwQSUyMCUyMCUyMCUyMCUzQ2lucHV0JTIwaWQlM0QlMjJoaWRlYWRzJTIyJTIwdHlwZSUzRCUyMmNoZWNrYm94JTIyJTNFJTBBJTIwJTIwJTIwJTIwJTNDc3BhbiUzRUhpZGUlMjBBZHMlM0MlMkZzcGFuJTNFJTBBJTNDJTJGcCUzRSUwQSUzQ3AlM0VBZHMlMjBoZWxwJTIwc3VwcG9ydCUyMEglMjYlMjMxNzMlM0JvJTI2JTIzMTczJTNCbHklMjBVJTI2JTIzMTczJTNCbmIlMjYlMjMxNzMlM0Jsb2NrJTI2JTIzMTczJTNCZXIhJTNDJTJGcCUzRQ=="));
        document.getElementById("titleform").addEventListener("submit", function(e) {
            e.preventDefault();
            if (this.firstElementChild.value) {
                setTitle(this.firstElementChild.value);
                this.firstElementChild.value = "";
            } else {
                alert("Please provide a title.");
            }
        }, false);

        document.getElementById("iconform").addEventListener("submit", function(e) {
            e.preventDefault();
            if (this.firstElementChild.value) {
                setIcon(this.firstElementChild.value);
                this.firstElementChild.value = "";
            } else {
                alert("Please provide an icon URL.");
            }
        }, false);

        document.getElementById("cselreset").addEventListener("click", function() {
            if (confirm("Reset the title and icon to default?")) {
                removeCookie("HBTitle");
                removeCookie("HBIcon");
                pageTitle("H&shy;o&shy;ly Un&shy;blo&shy;ck&shy;er");
                pageIcon("assets/img/icon.png");
            }
        }, false);

        document.getElementById("cselab").addEventListener("click", function () {
            var win = window.open()
            var url = `${window.location.href}`
            var iframe = win.document.createElement('iframe')
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.style.overflow = "hidden";
            iframe.style.margin = "0";
            iframe.style.padding = "0";
            iframe.style.position = "fixed";
            iframe.style.top = "0";
            iframe.style.bottom = "0";
            iframe.style.left = "0";
            iframe.style.right = "0";
            iframe.src = url;
            win.document.body.appendChild(iframe)
        });

        document.getElementById("hideads").addEventListener("change", function(e) {
            e.target.checked ? hideAds() : showAds();
        }, false);
    }
})();