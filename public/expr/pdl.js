function pd() {
    $('pdurl').focus();
}

function on() {
    window.onbeforeunload = function() {
        return true;
    };
}