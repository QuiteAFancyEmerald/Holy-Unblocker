function nu() {
    $('url').focus();
}

function pm() {
    $('pmurl').focus();
}

function pd() {
    $('pdurl').focus();
}

function on() {
    window.onbeforeunload = function() {
        return true;
    };
}