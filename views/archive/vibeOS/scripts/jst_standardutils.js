/*
    JavaScript Terminal Standard Utilities
    --------------------------------------
    General command line tools for the JS
    Terminal in vibeOS. Documentation is
    available in /docs/ct/jsterm.md.
    --------------------------------------
            Written by ctaetcsh
*/
console.log("Loaded jst_standardutils.js"); 

// vsu_clock()
// Returns Time and Date.
// --> Section 1: Vars
var vsuc_readablemonths = [
    'January','Febuary','March','April','May','June','July','August','September','October','November','December'
]
var vsuc_dateobj = new Date();
if (vsuc_dateobj.getHours() > 12) {
    vsuc_newhour = vsuc_dateobj.getHours() - 12;
    vsuc_ampm = "PM";
} else {
    vsuc_newhour = vsuc_dateobj.getHours();
    vsuc_ampm = "AM";
}
// --> Section 2: Function
function vsu_clock() {
    return `It's ${vsuc_newhour}:${vsuc_dateobj.getMinutes()}:${vsuc_dateobj.getSeconds()} ${vsuc_ampm} on ${vsuc_readablemonths[vsuc_dateobj.getMonth()]} ${vsuc_dateobj.getDate()}, ${vsuc_dateobj.getFullYear()}`;
}

// vsu_help()
// Basic help function
function vsu_help() {
    return "vsu_clock(), vsu_help(), vsu_simon()";
}

// vsu_simon(msg)
// Repeats what is inputted (simon says)
function vsu_simon(msg) {
    return msg;
}