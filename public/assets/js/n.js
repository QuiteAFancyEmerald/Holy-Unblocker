function $(id) {
    return document.getElementById(id);
};

$('nprox').onclick = function() {
    var url = $('url').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://nu." + domain + "/textbooks/" + url;
    return false;
};

window.onload = function() {
    $('url').focus();
}