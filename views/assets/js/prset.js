/* -----------------------------------------------
/* Authors: OlyB, QuiteAFancyEmerald
/* GNU Affero General Public License v3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
/* prSet script
/* ----------------------------------------------- */

function prSet(type) {
    var prUrl = document.getElementById("pr-url");
    var prGo1 = document.getElementById("pr-go1");
    var prGo2 = document.getElementById("pr-go2");

    prUrl.addEventListener("keydown", function(e) {
        if (e.code === "Enter" && prUrl.value.trim() !== "") {
            goProx[type](prUrl.value.trim());
        }
    });

    prGo1.addEventListener("click", function() {
        if (prUrl.value.trim() !== "") {
            goProx[type](prUrl.value.trim(), "window"); // Classic Mode
        }
    });

    prGo2.addEventListener("click", function() {
        if (prUrl.value.trim() !== "") {
            goProx[type](prUrl.value.trim(), "stealth"); // Stealth Mode
        }
    });
}
