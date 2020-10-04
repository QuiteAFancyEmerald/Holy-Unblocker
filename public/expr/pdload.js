//PD Load
function pd() {
    $('url').focus();
}

function on() {
    window.onbeforeunload = function() {
        return true;
    };
}