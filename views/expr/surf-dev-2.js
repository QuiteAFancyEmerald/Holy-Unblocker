/* -----------------------------------------------
/* MIT license: http://opensource.org/licenses/MIT
/* How to use? : Check the documentation. Button ID attributes are used for the script below.
/* v2.0.7
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
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};
/* TODO: Remove dependence on JQuery and clean things up

document.querySelector('#al').addEventListener('click', () => {
  var frame = document.querySelector('#frame'),
    url = document.querySelector('#url').value,
    domain = document.domain;

  if (domain.split('.').length > 2) domain = domain.split('.').slice(-2).join('.');

  frame.src = "https://cdn." + domain + "/session/?url=" + btoa(url);
  frame.style['visibility'] = "visible";
  frame.setAttribute('allow', 'fullscreen');
  
  document.cookie = '_incog_prox=alloy; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
  document.querySelector('#frame').contentWindow.focus();    
});
*/
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
    frame.src = "https://cdn." + domain + "/session/?url=" + url;
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = '_incog_prox=alloy; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
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
    window.location.href = "https://cdn." + domain + "/session/?url=" + url;
    document.cookie = '_incog_prox=alloy; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//NU
$('wn').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://a." + domain + "/main/" + url;
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('wnbp').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://a." + domain + "/main/" + url;
    document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//PD
$('pdprox').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    document.getElementById("frame").src = "https://c." + domain + '/gateway?url=' + encodeURIComponent(btoa(url)) + '&route=vi';
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('pdproxbp').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://c." + domain + '/gateway?url=' + encodeURIComponent(btoa(url)) + '&route=vi';
    document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//PM Load
$('pmprox').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    if (!url.startsWith('http') || !url.startsWith('https://')) {
        url = url.split('/');
        url = ('http://' + url[0] + '/' + url.slice(1).join('/'));
    }
    document.getElementById("frame").src = "https://c." + domain + '/gateway?url=' + encodeURIComponent(btoa(url)) + '&route=sp';
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById("frame").style.visiblity = "visible";
    return false;
};
$('pmproxbp').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    if (!url.startsWith('http') || !url.startsWith('https://')) {
        url = url.split('/');
        url = ('http://' + url[0] + '/' + url.slice(1).join('/'));
    }
    window.location.href = "https://c." + domain + '/gateway?url=' + encodeURIComponent(btoa(url)) + '&route=sp';
    document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById("frame").style.visiblity = "visible";
    return false;
};
//D-W
$('wndp').onclick = function() {
    var frame = document.getElementById("frame");
    var origin = `https://discord.com/login`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://a." + domain + "/main/" + origin;
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('wndpbp').onclick = function() {
    var frame = document.getElementById("frame");
    var origin = `https://discord.com/login`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://a." + domain + "/main/" + origin;
    document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//YT
$('ytbtn').onclick = function() {
    var frame = document.getElementById("frame");
    var yt = `https://youtube.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(yt)
    frame.src = "https://cdn." + domain + "/session/?url=" + origin;
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = '_incog_prox=alloy; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};
$('ytbtnm').onclick = function() {
    var frame = document.getElementById("frame");
    var yt = `https://m.youtube.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(yt)
    frame.src = "https://cdn." + domain + "/session/?url=" + origin;
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = '_incog_prox=alloy; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById('frame').contentWindow.focus();
    return false;
};
$('ytbp').onclick = function() {
    var frame = document.getElementById("frame");
    var yt = `https://youtube.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(yt)
    window.location.href = "https://cdn." + domain + "/session/?url=" + origin;
    document.cookie = '_incog_prox=alloy; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//D
$('dbtn').onclick = function() {
    var frame = document.getElementById("frame");
    var d = `https://discord.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(d)
    frame.src = "https://cdn." + domain + "/session/?url=" + origin;
    frame.style['visibility'] = "visible";
    document.cookie = '_incog_prox=alloy; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('docean').onclick = function() {
    var frame = document.getElementById("frame");
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://d." + domain + "/login";
    frame.style['visibility'] = "visible";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
$('dbp').onclick = function() {
    var d = `https://discord.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(d)
    window.location.href = "https://cdn." + domain + "/session/?url=" + origin;
    document.cookie = '_incog_prox=alloy; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
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
    frame.setAttribute('allow', 'fullscreen');
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};
//GP (Developmental Addition)
$('gp').onclick = function() {
    var frame = document.getElementById("frame");
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://" + domain + "/?g";
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
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