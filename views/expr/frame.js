window.onload = function() {
    var frame = document.getElementById("frame");
    var url = "https://krunker.io";
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    if (!url.startsWith('http') || !url.startsWith('https://')) {
        url = url.split('/');
        url = ('http://' + url[0] + '/' + url.slice(1).join('/'));
    }
    document.getElementById("frame").src = "https://c." + domain + '/gateway?url=' + encodeURIComponent(btoa(url)) + '&route=sp';
    frame.style['visibility'] = "visible";
    frame.setAttribute('allow', 'fullscreen');
    frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
    document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    document.getElementById("frame").style.visiblity = "visible";
    return false;
};