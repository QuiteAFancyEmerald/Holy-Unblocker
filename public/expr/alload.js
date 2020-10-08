//AL Load
function al() {
    $('url').focus();
}

function on() {
    window.onbeforeunload = function() {
        return true;
    };
}
