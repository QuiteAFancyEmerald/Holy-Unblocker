function nu() {
    $(id);
    return document.getElementById(id);
};

$('nprox').onclick = function() {
    var url = $('nu').value;
    var det = document.domain;
    var domain = det.replace('www.', '').split(/[/?#]/)[0];
    window.location.href = "https://a. " + domain + "/call/ " + url;
    return false;
};
window.onload = function() {
    $('nu').focus();
}