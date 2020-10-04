//PM Load
function pm() {
    $('url').focus();
}

function on() {
    window.onbeforeunload = function() {
        return true;
    };
}