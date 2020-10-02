var date = new Date();
date.setMonth(date.getMonth() + 12);
date = date.toUTCString();

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Title Presets*/
var titles = [

]

/* Icon Presets*/
var icons = [

]

/* Settings Menu Variables*/
var psel, prss;

window.addEventListener('DOMContentLoaded', function() {
    psel = document.getElementById('csel');
    setPreferences();
    for (var i = 0; i < titles.length; i++) {
        if (i == 0) {
            psel.innerHTML += '<img title="(Blank)" src="./img/x.png">'
        } else {
            psel.innerHTML += '<img title="' + titles[i] + '" src="' + icons[i] + '">';
        }
    }

    /* Title Submit*/
    document.getElementById('titleform').addEventListener('submit', function(e) {
        e.preventDefault();
        if (this.firstChild.value) {
            setTitle(this.firstChild.value);
        } else {
            setTitle('&rlm;&lrm;');
        }
    }, false);

    /* Icon Submit*/
    document.getElementById('iconform').addEventListener('submit', function(e) {
        e.preventDefault();
        if (this.firstChild.value) {
            setIcon(this.firstChild.value);
        } else {
            setIcon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAC0lEQVQI12NgAAIAAAUAAeImBZsAAAAASUVORK5CYII=');
        }
    }, false);

    /* Settings Submit*/
    psel.addEventListener('click', function(e) {
        prss = Array.from(psel.children).indexOf(e.target);
        if (prss != -1) {
            setTitle(titles[prss]);
            setIcon(icons[prss]);
        }
    }, false);

    /* Settings Menu Event*/
    document.getElementById('csel').addEventListener('click', function(e) {
        if (this.checked) {
            window.onbeforeunload = function(e) {
                var message = 'Error Tab Cloak'
                e.returnValue = message;
                return message;
            };
        } else {
            window.onbeforeunload = function() {};
        }
    }, false);

    /* Fullscreen Feature Addition*/
    /* document.getElementById('fullscreen').addEventListener('click', function(e) {
         e.preventDefault();
         document.getElementById('theframe').requestFullscreen()
         return false;
     }, false); */
}, false);

/* Title and Icon Cookies... and yes this is cookie based*/
function setPreferences() {
    if (readCookie('HBTitle') != 'undefined') {
        pageTitle(readCookie('HBTitle'));
    }
    if (readCookie('HBIcon') != 'undefined') {
        pageIcon(readCookie('HBIcon'));
    }
}

/* Set Cookie Secure*/
function setCookie(name, value) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + date + '; SameSite=None; Secure';
}

/* Read Cookie*/
function readCookie(name) {
    var cookie = document.cookie.split('; ');
    var cookies = {};
    for (var i = 0; i < cookie.length; i++) {
        var cur = cookie[i].split('=');
        cookies[cur[0]] = cur[1];
    }
    return decodeURIComponent(cookies[name]);
}

/* Set Title from Input Value*/
function setTitle(value) {
    pageTitle(value);
    setCookie('HBTitle', value);
}

/* Set Icon from Input Value*/
function setIcon(value) {
    pageIcon(value);
    setCookie('HBIcon', value);
}

/* Title Attach*/
function pageTitle(value) {
    document.getElementsByTagName('title')[0].innerHTML = value;
    try {
        parent.document.getElementsByTagName('title')[0].innerHTML = value;
    } catch (e) { console.log(e); }
}

/* Icon Attach*/
function pageIcon(value) {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = value;
    document.getElementsByTagName('head')[0].appendChild(link);
    try {
        var link = parent.document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = value;
        parent.document.getElementsByTagName('head')[0].appendChild(link);
    } catch (e) { console.log(e); }
}

/* Tab Cloak*/
function autoChange() {
    if (document.getElementById('csel').checked) {
        var atci = randInt(1, 5);
        pageTitle(titles[atci]);
        pageIcon(icons[atci]);
        setTimeout(autoChange, randInt(10000, 60000));
    } else {
        setPreferences();
    }
}