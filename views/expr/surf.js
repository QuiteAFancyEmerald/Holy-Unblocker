/* -----------------------------------------------
/* MIT license: http://opensource.org/licenses/MIT
/* How to use? : Check the documentation. Button ID attributes are used for the script below.
/* v2.0.0
/* ----------------------------------------------- */
$ = e => document.getElementById(e) || [];

//Example Navigation
$('buttonstealth').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    if (!url.startsWith('http') || !url.startsWith('https://')) {
        url = url.split('/');
        url = btoa('http://' + url[0] + '/' + url.slice(1).join('/'));
        console.log(url);
    } else url = btoa(url)
    frame.src = "https://subdomain." + domain + "/path/" + url;
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};
$('buttonclassic').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    if (!url.startsWith('http') || !url.startsWith('https://')) {
        url = url.split('/');
        url = btoa('http://' + url[0] + '/' + url.slice(1).join('/'));
        console.log(url);
    } else url = btoa(url)
    window.location.href = "https://subdomain." + domain + "/path/" + url;
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//AL
$('al').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    if (!url.startsWith('http') || !url.startsWith('https://')) {
        url = url.split('/');
        url = btoa('http://' + url[0] + '/' + url.slice(1).join('/'));
        console.log(url);
    } else url = btoa(url)
    frame.src = "https://" + domain + "/fetch/" + url;
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};
$('albp').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    if (!url.startsWith('http') || !url.startsWith('https://')) {
        url = url.split('/');
        url = btoa('http://' + url[0] + '/' + url.slice(1).join('/'));
        console.log(url);
    } else url = btoa(url)
    window.location.href = "https://" + domain + "/fetch/" + url;
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//NU
$('nprox').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://a." + domain + "/call/" + url;
    frame.style['visibility'] = "visible";
    document.cookie = 'nu_auth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('nproxbp').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://a." + domain + "/call/" + url;
    document.cookie = 'nu_auth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//PD
$('pdprox').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://cdn." + domain + "/" + url;
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('pdproxbp').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://cdn." + domain + "/" + url;
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//PM Load
$('pmprox').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    document.getElementById("frame").src = "https://c." + domain + "/prox?url=" + url;
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById("frame").style.visiblity = "visible";
    return false;
};
$('pmproxbp').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://c." + domain + "/prox?url=" + url;
    document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById("frame").style.visiblity = "visible";
    return false;
};
//YT
$('ytbtn').onclick = function() {
    var frame = document.getElementById("frame");
    var yt = `https://youtube.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(yt)
    frame.src = "https://" + domain + "/fetch/" + origin;
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('ytbtnm').onclick = function() {
    var frame = document.getElementById("frame");
    var yt = `https://m.youtube.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(yt)
    frame.src = "https://" + domain + "/fetch/" + origin;
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('ytbp').onclick = function() {
    var frame = document.getElementById("frame");
    var yt = `https://youtube.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(yt)
    window.location.href = "https://" + domain + "/fetch/" + origin;
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//D
$('dbtn').onclick = function() {
    var frame = document.getElementById("frame");
    var d = `https://discord.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(d)
    frame.src = "https://" + domain + "/fetch/" + origin + "/login";
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('dbp').onclick = function() {
    var d = `https://discord.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(d)
    window.location.href = "https://" + domain + "/fetch/" + origin + "/login";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//CH
$('ch').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://c." + domain + "/app";
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
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
