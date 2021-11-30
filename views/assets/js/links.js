/* -----------------------------------------------
/* Authors: YÖCTDÖNALD'S and QuiteAFancyEmerald with help from MikeLime
/* MIT license: http://opensource.org/licenses/MIT
/* Hidden Links
/* ----------------------------------------------- */

var hulinks = {
    "hblink": "https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic",
    "inspectel": 'javascript:(function(){var a=document.createElement("script");a.src="https://x-ray-goggles.mouse.org/webxray.js";a.className="webxray";a.setAttribute("data-lang","en-US");a.setAttribute("data-baseuri","https://x-ray-goggles.mouse.org");document.body.appendChild(a);}());',
    "portasite": 'javascript:(function(){var a=document.getElementById("rusic-modal")||document.createElement("iframe");a.setAttribute("allow","fullscreen");a.src="https://example.com";a.id="rusic-modal";a.style="position:fixed;width:100vw;height:100vh;top:0px;left:0px;right:0px;bottom:0px;z-index:2147483647;background-color:white;border:none;";document.body.appendChild(a);}());',
    "universaltb": "WIP",
    "universaltb2": "WIP",
    "hblink2": "https://github.com/QuiteAFancyEmerald/HolyUnblockerPublic",
    "ptlink": "https://www.patreon.com/holyunblocker",
    "allink": "https://github.com/titaniumnetwork-dev/alloy",
    "plink": "https://github.com/sysce/proxy",
    "wnlink": "https://github.com/binary-person/womginx",
    "pylink": "https://github.com/BinBashBanana/PyDodge",
    "nulink": "https://github.com/nfriedly/node-unblocker",
    "tnlink": "https://discord.gg/CwWpdGkuWY",
    "nclink": "https://nodeclusters.com",
    "qrlink": "https://support.discord.com/hc/en-us/articles/360039213771-QR-Code-Login-FAQ",
    "ilink": "https://itch.io",
    "ilink2": "https://itch.io",
    "ilink3": "https://itch.io",
    "ilink4": "https://itch.io",
    "ilink6": "https://itch.io",
    "ilink5": "https://itch.io",
    "temp1": "https://petty.gq",
    "temp2": "https://precede.design",
    "temp3": "https://duketrack.me"
};

hulinks_array = Object.keys(hulinks);

for (let i = 0; i < hulinks_array.length; i++) {
    tryGetElement(hulinks_array[i]).href = hulinks[hulinks_array[i]];
}