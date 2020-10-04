function $(id) {
    return document.getElementById(id);
};

//NU
$('nprox').onclick = function() {
    document.cookie = 'nu_auth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + auth + '; path=/; Secure;';
    return false;
};

// Cookie Auth
var host = location.hostname.split('.');
var auth = location.hostname;
if (host.length == 3) {
    auth = `${host[1]}.${host[2]}`;
}

Array.from(document.getElementsByTagName('button')).forEach(e => {
    e.addEventListener('click', () => {
        document.cookie = 'session; max-age=259200; SameSite=None; domain=' + auth + '; path=/; Secure;';
    });
});

window.onload = function() {
    $('url').focus();
}