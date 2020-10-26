window.onload = function() {
    // similar behavior as an HTTP redirect
    var yt = `https://m.youtube.com`;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    const origin = btoa(yt);
    window.location.replace("https://" + domain + "/fetch/utils/?url=" + origin);
    document.cookie = '__alloy_cookie_auth=yes; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
}
// Cookie Auth
var host = location.hostname.split('.');
var auth = location.hostname;
if (host.length == 3) {
    auth = `${host[1]}.${host[2]}`;
}