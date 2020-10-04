function nu() {
    $('url').focus();
}

function on() {
    window.onbeforeunload = function() {
        return true;
    };
}