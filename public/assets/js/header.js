var date = new Date();
date.setMonth(date.getMonth() + 12);
date = date.toUTCString();

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var titles = [

]

var icons = [

]

var csel, prss;

window.addEventListener('DOMContentLoaded', function() {
    csel = document.getElementById('csel');
    setPreferences();
    for (var i = 0; i < titles.length; i++) {
        if (i == 0) {
            csel.innerHTML += '<img title="(Blank)" src="./img/x.png">'
        } else {
            csel.innerHTML += '<img title="' + titles[i] + '" src="' + icons[i] + '">';
        }
    }
    document.getElementById('titleform').addEventListener('submit', function(e) {
        e.preventDefault();
        if (this.firstChild.value) {
            setTitle(this.firstChild.value);
        } else {
            setTitle('&rlm;&lrm;');
        }
    }, false);

    document.getElementById('iconform').addEventListener('submit', function(e) {
        e.preventDefault();
        if (this.firstChild.value) {
            setIcon(this.firstChild.value);
        } else {
            setIcon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAC0lEQVQI12NgAAIAAAUAAeImBZsAAAAASUVORK5CYII=');
        }
    }, false);

    document.getElementById('csel').addEventListener('click', autoChange, false);

    csel.addEventListener('click', function(e) {
        prss = Array.from(csel.children).indexOf(e.target);
        if (prss != -1) {
            setTitle(titles[prss]);
            setIcon(icons[prss]);
        }
    }, false);

    document.getElementById('cwbox').addEventListener('click', function(e) {
        if (this.checked) {
            window.onbeforeunload = function(e) {
                var message = 'Oopsie poopsie'
                e.returnValue = message;
                return message;
            };
        } else {
            window.onbeforeunload = function() {};
        }
    }, false);

    document.getElementById('fullscreen').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('theframe').requestFullscreen()
        return false;
    }, false);
}, false);

function setPreferences() {
    if (readCookie('HBTitle') != 'undefined') {
        pageTitle(readCookie('HBTitle'));
    }
    if (readCookie('HBIcon') != 'undefined') {
        pageIcon(readCookie('HBIcon'));
    }
}

function setCookie(name, value) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + date + '; SameSite=None; Secure';
}

function readCookie(name) {
    var cookie = document.cookie.split('; ');
    var cookies = {};
    for (var i = 0; i < cookie.length; i++) {
        var cur = cookie[i].split('=');
        cookies[cur[0]] = cur[1];
    }
    return decodeURIComponent(cookies[name]);
}

function setTitle(value) {
    pageTitle(value);
    setCookie('HBTitle', value);
}

function setIcon(value) {
    pageIcon(value);
    setCookie('HBIcon', value);
}

function pageTitle(value) {
    document.getElementsByTagName('title')[0].innerHTML = value;
    try {
        parent.document.getElementsByTagName('title')[0].innerHTML = value;
    } catch (e) { console.log(e); }
}

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