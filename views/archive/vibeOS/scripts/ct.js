/*
    ctaetcsh's Personal Script
    For questions, please ask me in Discord

    DO NOT MODIFY WITHOUT PRIOR NOTICE & PERMISSION
    This script is backed up as it is updated.

    Last updated: August 3, 2020
*/

// Random
var ok = 'ok';
console.log("Loaded ct.js");
ct_getcat(); // easiest fix to make cpaitc work


// Fast way to initalize a webview for testing. DO NOT USE THIS IN SCRIPTS!
// This is only for usage in the Javascript terminal.
// 2020 07 18
function ct_initweb(url, proxy) {
    initWebView('CT QWC', 'mimetypes/16/html.png', url, 800, 600, proxy);
    return 'Initialized Webview. Proxy: ' + proxy + ' | URL: ' + url;
}

// Function to test that ct.js loaded successfully, used for debugging.
// 2020 07 18
function ct_test() {
    return ok;
}


initcpaitc = () => { cpaitc() };

function cpaitc() {
    ct_getcat();
    initWebView(
        'CPAITC (Internet Cat Picture System) | ID: ' + ct_getcat_return.id,
        'apps/16/pix.png',
        ct_getcat_return.url,
        ct_getcat_return.width + 30,
        ct_getcat_return.height + 30,
        false
    );
}


// Function to get a url to a cat (along with other data).
// Run this function and it will set the values of the object ct_getcat_return.
// In this varible contains .url, which is the image url; .id, which is the
// image ID from The Cat API; as well as .height and .width, for, you know.
// 2020 08 03
function ct_getcat() {
    let ctgc_headers = new Headers({
        'x-api-key': '2b032810-c828-48e7-8c8c-c7a83907e312',
    });
    let ctgc_request = new Request('https://api.thecatapi.com/v1/images/search', {
        method: 'GET',
        headers: ctgc_headers,
        mode: 'cors',
        cache: 'default',
    });
    fetch(ctgc_request)
        .then(function(response) { return response.json() })
        .then(json => {
            ct_getcat_return = json[0];
        })
}

function ctt_getcat() {
    ct_getcat()
    return ct_getcat_return;
}

// [BROKEN] Function to import and apply profile data
// not done yet, maybe some of you can figure this shit out cause i cant
// 2020 07 18
function ct_importprofile() {
    fetch('https://hastebin.com/raw/mojohavode') // testing json
        .then(response => response.json())
        .then(data => console.log(data))
}



// CT PopupBox Testing function.
function ctt_popupbox() { ct_popupbox("err", "Test popup box. The quick brown fox jumps over the lazy dog. Something something that is really long. Sprinkles on kittens and raindrops on noses something idk. Test popup box. The quick brown fox jumps over the lazy dog. Something something that is really long. Sprinkles on kittens and raindrops on noses something idk. Test popup box. The quick brown fox jumps over the lazy dog. Something something that is really long. Sprinkles on kittens and raindrops on noses something idk.") };

// Function to show a popup box to the user.
// Must be completed by PrB2, almost to a working state.
// 2020 08 03
function ct_popupbox(type, l1, l2, l3) {
    /*
        type: Type of popup; Can be Error (err), Warning (wrn) or Information (inf). PARSE AS STRING! "err","inf","wrn"
        msg: Message shown to user, parse as string.
    */

    switch (type) {
        case 'err':
            var typereadable = "Error"; // type of popup as readable text, used in titlebar; "err" = "Error"
            var pubicon = 'status/16/error.png'; // Icon for popupbox movebar
            break;
        case 'wrn':
            var typereadable = "Warning";
            var pubicon = 'status/16/important.png';
            break;
        case 'inf':
            var typereadable = "Information";
            var pubicon = 'status/16/info.png';
            break;
        default:
            console.error("Did not parse type of popupbox correctly when called!"); // happens when you dont enter options correctly
            return 1;
    }

    var dnctv_ctpopupbox = new cwindow('ctpopupbox', 50, 50, (ele) => {
        var blines = [], // temp
            clines = [l1, l2, l3];
        var textSize = 16;
        var lineHeight = 18;

        clines.forEach((e, i) => {
            wordWrap(e, dnctv_ctpopupbox.width / 7.2).split('\n').forEach((ee, ii) => {
                blines.push(ee);
            });
        });

        blines.forEach((e, i) => {
            mctx.fillStyle = '#000';
            mctx.font = textSize + 'px Open Sans';
            mctx.fillText(e, dnctv_ctpopupbox.x + 20, dnctv_ctpopupbox.y + 60 + i * lineHeight);
        });

        var newHeight = textSize + 12 + blines.length * lineHeight;
        if (dnctv_ctpopupbox.minHeight <= newHeight) dnctv_ctpopupbox.height = newHeight
        else dnctv_ctpopupbox.height = dnctv_ctpopupbox.minHeight
    });

    // properties of titlebar of box
    dnctv_ctpopupbox.title = typereadable + " | CT PopupBox";
    dnctv_ctpopupbox.icon = pubicon;
    // Size of box
    dnctv_ctpopupbox.width = 400;
    dnctv_ctpopupbox.minHeight = 100;
    // setting the location of the box to the center of the enviornment
    dnctv_ctpopupbox.x = msize.w / 2 - dnctv_ctpopupbox.width / 2;
    dnctv_ctpopupbox.y = msize.h / 2 - dnctv_ctpopupbox.height / 2;


    return 0;

}

// Auto-Resolution Function
// Finds the ideal resolution for any given monitor

function ctAutoRes() {
    switch (screen.width) {
        case 1280:
            msize.w = 1280;
            msize.h = 720;
            break;
        case 1366:
            msize.w = 1366;
            msize.h = 768;
            if (screen.availHeight < msize.h) {
                resetRes()
            }
            break;
        case 1920:
            msize.w = 1920;
            msize.h = 1080;
            if (screen.availHeight < msize.h) {
                resetRes()
            }
            break;
        default:
            console.log("Auto Resolution could not find valid resolution for this monitor!");
            break;
    }
}

function resetRes(size) {
    switch (size) {
        case "720p":
            msize.w = 1280;
            msize.h = 720;
            break;
        case "768p":
            msize.w = 1366;
            msize.h = 720;
            break;
        case "1080p":
            msize.w = 1920;
            msize.h = 1080;
            break;
        default:
            msize.w = 1280;
            msize.h = 720;
            break;
    }
    if (size == undefined) {
        console.log("Reset resolution to default.");
    } else {
        console.log("Reset resolution to " + size);
    }
}


var initLicenceViewer = () => {
    var lines = [
            'vibeOS License (BSD 3)',
            'Introduced: AUGUST 8, 2020 | Last Revised: AUGUST 8, 2020',
            ' ',
            'vibeOS is licensed under the BSD 3-Clause License.',
            'vibeOS Development Team is the organization which develops and maintains the vibeOS Source Code.',
            ' ',
            'The following are members of the vibeOS Development team as of the printed "Last Revised" date above.',
            '  * Divide',
            '  * Nathan Mendenhall (ctaetcsh) <contact@ctaetcsh.xyz>',
            '  * Ryan Wilson (LinuxTerm) <contact@linuxterm.net>',
            ' ',
            'Copyright 2020 vibeOS Development Team',
            ' ',
            'Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:',
            '1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.',
            '2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.',
            '3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.',
            ' ',
            'THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.'

        ],
        window = new cwindow('licenceviewer', 600, 250, (window) => {
            // after render

            var blines = [], // temp
                clines = [];

            clines = lines;

            clines.forEach((e, i) => {
                wordWrap(e, window.width / 7.2).split('\n').forEach((ee, ii) => {
                    blines.push(ee);
                });
            });

            blines.forEach((e, i) => {
                // if(clines.length >= window.height / textSize - 4 + (textSize - lineHeight) )clines.shift();
                mctx.fillStyle = '#000';
                mctx.font = textSize + 'px Open Sans';
                mctx.fillText(e, window.x + 15, window.y + 50 + i * lineHeight);
            });

            var newHeight = textSize + 12 + blines.length * lineHeight;
            if (window.minHeight <= newHeight) window.height = newHeight
            else window.height = window.minHeight
        }),
        textSize = 14,
        lineHeight = 16;

    window.width = 700;
    window.minHeight = 400;

    window.x = msize.w / 2 - window.width / 2; // center of screen
    window.y = msize.h / 2 - window.height / 2; // middle of screen

    window.icon = 'mimetypes/24/text-x-generic.png';

    window.title = 'vibeOS Licence';

    window.bgColor = 'white'
}

var initReadmeViewer = () => {
    var lines = [
            'vibeOS Readme',
            ' ',
            '> About vibeOS',
            'vibeOS is a JavaScript based Desktop Enviornment that runs in your browser. It can run applications made in JavaScript using our custom Constructor or load web applications with our WebView soulution. ',
            'This repository contains the current source code for vibeOS. It does not need to be compiled, just extracted and index.html opened. It can also be deployed on a Web Server, for easy access. vibeOS is entirely portable, requiring no server backend.',
            ' ',
            '> Contributing',
            'If you would like to contribute to vibeOS, feel free to make a Pull Request with your changes and we will take a look. If you want to join our team, get in touch.',
            ' ',
            '> Bug Reports & Feedback',
            'If you encounter a bug or problem with vibeOS, do not hesitate to open an Issue on our GitHub (https://github.com/vibedivde/vibeOS/issues). If said bug is of a critical nature, please get in touch as soon as possible.',
            'Feedback & Suggestions are welcome!',
            ' ',
            '> Contact',
            'The easiest way to get in touch is via Discord. Send a friend request to `ctaetcsh#8411` or join our Discord Server.',
            'Additionally, you can email `vibeos.contact@ctaetcsh.xyz`. Communications are managed by ctaetcsh under Divide.',
            ' ',
            '>  Credits',
            'Creator: Divide',
            'Developers: ctaetcsh, LinuxTerm, sexyduceduce',
            'Assistance: Cat Lady, Eli, IStealYourMemes',
            'Beta Testers: Alfias, ShadowFr0st, IStealYourMemes, Nautica, Hat'

        ],
        window = new cwindow('readmeviewer', 600, 250, (window) => {
            // after render

            var blines = [], // temp
                clines = [];

            clines = lines;

            clines.forEach((e, i) => {
                wordWrap(e, window.width / 7.2).split('\n').forEach((ee, ii) => {
                    blines.push(ee);
                });
            });

            blines.forEach((e, i) => {
                // if(clines.length >= window.height / textSize - 4 + (textSize - lineHeight) )clines.shift();
                mctx.fillStyle = '#000';
                mctx.font = textSize + 'px Open Sans';
                mctx.fillText(e, window.x + 15, window.y + 50 + i * lineHeight);
            });

            var newHeight = textSize + 12 + blines.length * lineHeight;
            if (window.minHeight <= newHeight) window.height = newHeight
            else window.height = window.minHeight
        }),
        textSize = 14,
        lineHeight = 16;

    window.width = 700;
    window.minHeight = 400;

    window.x = msize.w / 2 - window.width / 2; // center of screen
    window.y = msize.h / 2 - window.height / 2; // middle of screen

    window.icon = 'mimetypes/24/text-x-generic.png';

    window.title = 'vibeOS Readme';

    window.bgColor = 'white'
}