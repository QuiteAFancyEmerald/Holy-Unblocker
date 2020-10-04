function pm() {
    $('pmurl').focus();
}

function on() {
    window.onbeforeunload = function() {
        return true;
    };
}