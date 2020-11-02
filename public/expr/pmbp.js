function $(id) {
    return document.getElementById(id);
};
//PM Load
$('pmprox').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://c." + domain + "/prox?url=" + url;
    document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
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