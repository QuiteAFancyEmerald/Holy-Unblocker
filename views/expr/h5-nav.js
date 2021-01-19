/* -----------------------------------------------
/* MIT license: http://opensource.org/licenses/MIT
/* How to use? : Check the documentation. Button ID attributes are used for the script below.
/* v2.0.5
/* ----------------------------------------------- */
$ = e => document.getElementById(e) || [];

//GP (Developmental Addition)
$('vos').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://" + domain + "/vibeOS/index.html";
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};
$('dino').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://" + domain + "/archive/dino/index.html";
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};
$('gopher').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://" + domain + "/archive/gopher/index.html";
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};
$('mc').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://" + domain + "/archive/mc/index.html";
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};

// Cookie Auth
var host = location.hostname.split('.');
var auth = location.hostname;
if (host.length == 3) {
    auth = `${host[1]}.${host[2]}`;
}

window.onload = function() {
    $('url').focus();
}