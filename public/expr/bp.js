function $(id) {
    return document.getElementById(id);
};

$('nprox').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://a." + domain + "/call/" + url;
    document.cookie = 'nu_auth=yes; expires=' + (Date.now() + 259200) + '; sameSite=none; domain=.' + auth + '; path=/; secure;';
    return false;
};

$('pdprox').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://pd." + domain + "/course/" + url;
    document.cookie = 'pd_auth=yes; expires=' + (Date.now() + 259200) + '; sameSite=none; domain=.' + auth + '; path=/; secure;';
    return false;
};

$('pmprox').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://p." + domain + "/" + url;
    document.cookie = 'pm_auth=yes; expires=' + (Date.now() + 259200) + '; sameSite=none; domain=.' + auth + '; path=/; secure;';
    return false;
};

// Cookie Auth
var host = location.hostname.split('.');
var auth = location.hostname;
if (host.length == 3) {
    auth = `${host[1]}.${host[2]}`;
}

Array.from(document.getElementsByTagName('auth')).forEach(e => {
    e.addEventListener('click', () => {
        document.cookie = 'session; max-age=259200; sameSite=lax; domain=' + auth + '; path=/; secure;';
    });
});

window.onload = function() {
    $('url').focus();
}