/* -----------------------------------------------
/* Authors: YÖCTDÖNALD'S, QuiteAFancyEmerald, and OlyB with help from MikeLime
/* MIT license: http://opensource.org/licenses/MIT
/* Hidden Links
/* ----------------------------------------------- */

var hulinks = {
    "hblink": "https://github.com/titaniumnetwork-dev/Holy-Unblocker",
    "hblink2": "https://github.com/titaniumnetwork-dev/Holy-Unblocker",
    "flooder": "/pages/misc/flooder.html",
    "bitbrowser": "/pages/misc/bitbrowser.html",
    "firebug": "javascript:var firebug=document.createElement('script');firebug.setAttribute('src','https://luphoria.com/fbl/fbl/firebug-lite-debug.js');document.body.appendChild(firebug);(function(){if(window.firebug.version){firebug.init();}else{setTimeout(arguments.callee);}})();void(firebug);",
    "inspectel": 'javascript:(function(){var a=document.createElement("script");a.src="https://x-ray-goggles.mouse.org/webxray.js";a.className="webxray";a.setAttribute("data-lang","en-US");a.setAttribute("data-baseuri","https://x-ray-goggles.mouse.org");document.body.appendChild(a);}());',
    "portasite": 'javascript:(function(){var a=document.getElementById("rusic-modal")||document.createElement("iframe");a.setAttribute("allow","fullscreen");a.src="https://example.com";a.id="rusic-modal";a.style="position:fixed;width:100vw;height:100vh;top:0px;left:0px;right:0px;bottom:0px;z-index:2147483647;background-color:white;border:none;";document.body.appendChild(a);}());',
    "ptlink": "https://www.patreon.com/holyunblocker",
    "allink": "https://github.com/titaniumnetwork-dev/Corrosion",
    "rhlink": "https://discord.gg/VNT4E7gN5Y",
    "plink": "https://github.com/sysce/proxy",
    "wnlink": "https://github.com/binary-person/womginx",
    "pylink": "https://github.com/BinBashBanana/PyDodge",
    "nulink": "https://github.com/nfriedly/node-unblocker",
    "tnlink": "https://discord.gg/CwWpdGkuWY",
    "pallink": "https://github.com/LudicrousDevelopment/Palladium",
    "nclink": "https://nodeclusters.com",
    "qrlink": "https://support.discord.com/hc/en-us/articles/360039213771-QR-Code-Login-FAQ",
    "ytnoc": "javascript:(h=>{/youtube/.test(h+=location)?location=`//www.youtube-nocookie.com/embed/${[h.match`(?<=[ve]/|u/\\w+/|embed/|v=)[^%23&?]*`]}?autoplay=1`:0})``"
};

for (var item of Object.entries(hulinks)) {
    tryGetElement(item[0]).href = item[1];
}