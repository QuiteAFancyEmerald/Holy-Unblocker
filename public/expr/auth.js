var host = location.hostname.split('.');
var auth = location.hostname;
if (host.length == 3) {
    auth = `${host[1]}.${host[2]}`;
}

function nu() {
    document.cookie = 'auth=yes; expires=' + (Date.now() + 259200) + '; sameSite=none; domain=.' + auth + '; path=/; secure;';
}