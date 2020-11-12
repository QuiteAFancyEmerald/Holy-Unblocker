window.onload = function() {
    var frame = document.getElementById("frame");
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    frame.src = "https://c." + domain + "/app";
    document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + auth + '; path=/; Secure;';
    return false;
};