/* -----------------------------------------------
/* Author: Divide
/* MIT license: http://opensource.org/licenses/MIT
/* Cloak
/* ----------------------------------------------- */
document.onkeydown = (function(e) {
    e.preventDefault();
    if (e.which == 17) cip = true;
    if (e.which == 77 && cip) {
        var c = document.getElementById('page-holder');
        if (c.style.display == 'none') { c.style.display = 'block' } else { c.style.display = 'none' }
    }
})