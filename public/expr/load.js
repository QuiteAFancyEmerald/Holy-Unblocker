function() {
    $('url').focus();
}

function on() {
    window.onbeforeunload = function() {
        return true;
    };
}