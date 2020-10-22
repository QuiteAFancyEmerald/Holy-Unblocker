window.onload = function() {
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://c." + domain + "/app";
    document.cookie = '__chauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};

// Cookie Auth
var host = location.hostname.split('.');
var auth = location.hostname;
if (host.length == 3) {
    auth = `${host[1]}.${host[2]}`;
}