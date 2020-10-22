window.onload = function() {
    var url = `https://discord.com/login`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(url)
    window.location.href = "https://" + domain + "/home/utils/?url=" + origin;
    document.cookie = '__alloy_cookie_auth=yes; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};

// Cookie Auth
var host = location.hostname.split('.');
var auth = location.hostname;
if (host.length == 3) {
    auth = `${host[1]}.${host[2]}`;
}