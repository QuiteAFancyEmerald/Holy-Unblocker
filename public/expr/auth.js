function $(id) {
    return document.getElementById(id);
};

$('nprox').onclick = function nu() {
    document.cookie = 'auth=yes; expires=' + (Date.now() + 259200) + '; sameSite=none; domain=.' + auth + '; path=/; secure;';
}

$('al').onclick = function nu() {
    document.cookie = 'auth=yes; expires=' + (Date.now() + 259200) + '; sameSite=none; domain=.' + auth + '; path=/; secure;';
}

$('pmprox').onclick = function nu() {
    document.cookie = 'auth=yes; expires=' + (Date.now() + 259200) + '; sameSite=none; domain=.' + auth + '; path=/; secure;';
}

$('pdprox').onclick = function nu() {
    document.cookie = 'auth=yes; expires=' + (Date.now() + 259200) + '; sameSite=none; domain=.' + auth + '; path=/; secure;';
}

var host = location.hostname.split('.');
var auth = location.hostname;
if (host.length == 3) {
    auth = `${host[1]}.${host[2]}`;
}