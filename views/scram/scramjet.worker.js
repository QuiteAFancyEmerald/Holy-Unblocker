(()=>{var e={1762:function(e,t,r){r.d(t,{Z:()=>o});var n=r(8810);let i={log:console.log,warn:console.warn,error:console.error,debug:console.debug,info:console.info},o={fmt:function(e,t,...r){let n=Error.prepareStackTrace;Error.prepareStackTrace=(e,t)=>{t.shift(),t.shift(),t.shift();let r="";for(let e=1;e<Math.min(2,t.length);e++)t[e].getFunctionName()&&(r+=`${t[e].getFunctionName()} -> `+r);return r+(t[0].getFunctionName()||"Anonymous")};let i=function(){try{throw Error()}catch(e){return e.stack}}();Error.prepareStackTrace=n,this.print(e,i,t,...r)},print(e,t,r,...n){(i[e]||i.log)(`%c${t}%c ${r}`,`
  	background-color: ${{log:"#000",warn:"#f80",error:"#f00",debug:"transparent"}[e]};
  	color: ${{log:"#fff",warn:"#fff",error:"#fff",debug:"gray"}[e]};
  	padding: ${{log:2,warn:4,error:4,debug:0}[e]}px;
  	font-weight: bold;
  	font-family: monospace;
  	font-size: 0.9em;
  `,`${"debug"===e?"color: gray":""}`,...n)},log:function(e,...t){this.fmt("log",e,...t)},warn:function(e,...t){this.fmt("warn",e,...t)},error:function(e,...t){this.fmt("error",e,...t)},debug:function(e,...t){this.fmt("debug",e,...t)},time(e,t,r){let i;if(!(0,n.Sp)("rewriterLogs",e.base))return;let o=performance.now()-t;i=o<1?"BLAZINGLY FAST":o<500?"decent speed":"really slow",this.print("debug","[time]",`${r} was ${i} (${o.toFixed(2)}ms)`)}}},8810:function(e,t,r){r.d(t,{Sp:()=>s,h3:()=>n,t8:()=>o}),"$scramjet"in self||(self.$scramjet={version:{build:"6f14b4f",version:"1.0.2-dev"},codec:{},flagEnabled:s});let n=self.$scramjet,i=Function;function o(){n.codec.encode=i(`return ${n.config.codec.encode}`)(),n.codec.decode=i(`return ${n.config.codec.decode}`)()}function s(e,t){let r=n.config.flags[e];for(let r in n.config.siteFlags){let i=n.config.siteFlags[r];if(new RegExp(r).test(t.href)&&e in i)return i[e]}return r}},4471:function(e,t,r){r.d(t,{$O:()=>p,Ag:()=>u,KF:()=>o,Sd:()=>c,U5:()=>f,V6:()=>m,r4:()=>g});var n=r(8810);let{util:{BareClient:i,ScramjetHeaders:o,BareMuxConnection:s},url:{rewriteUrl:a,unrewriteUrl:c,rewriteBlob:l,unrewriteBlob:u},rewrite:{rewriteCss:f,unrewriteCss:d,rewriteHtml:g,unrewriteHtml:w,rewriteSrcset:h,rewriteJs:b,rewriteHeaders:m,rewriteWorkers:p,htmlRules:_},CookieStore:y}=n.h3.shared;n.h3.config},4079:function(e,t,r){r.d(t,{L:()=>a});var n=r(8810),i=r(522),o=r(1762).Z;Error.stackTraceLimit=50;let s=new TextDecoder;function a(e,t,r,c=!1){return function(e,t,r,a=!1){if((0,n.Sp)("naiiveRewriter",r.origin)){var c;let t=("string"!=typeof(c="string"==typeof e?e:new TextDecoder().decode(e))&&(c=new TextDecoder().decode(c)),`
		with (${n.h3.config.globals.wrapfn}(globalThis)) {

			${c}

		}
	`);return"string"==typeof e||(t=new TextEncoder().encode(t)),{js:t,tag:"",map:null}}return function(e,t,r,a){let[c,l]=(0,i.p)(r);try{let i,l=performance.now();try{i="string"==typeof e?c.rewrite_js(e,r.base.href,t||"(unknown)",a):c.rewrite_js_bytes(e,r.base.href,t||"(unknown)",a)}catch(r){return console.warn("failed rewriting js for",t,r.message,e),{js:e,tag:"",map:null}}o.time(r,l,`oxc rewrite for "${t||"(unknown)"}"`);let{js:u,map:f,scramtag:d,errors:g}=i;if((0,n.Sp)("sourcemaps",r.base)&&!globalThis.clients&&(globalThis[globalThis.$scramjet.config.globals.pushsourcemapfn](Array.from(f),d),f=null),(0,n.Sp)("rewriterLogs",r.base))for(let e of g)console.error("oxc parse error",e);return{js:"string"==typeof e?s.decode(u):u,tag:d,map:f}}finally{l()}}(e,t,r,a)}(e,t,r,c)}},522:function(e,t,r){r.d(t,{V:()=>o,p:()=>c});var n=r(7418),i=r(8810);async function o(){let e=await fetch(i.h3.config.files.wasm).then(e=>e.arrayBuffer());self.REAL_WASM=new Uint8Array(e)}self.WASM&&(self.REAL_WASM=Uint8Array.from(atob(self.WASM),e=>e.charCodeAt(0)));let s=new TextDecoder,a="\0asm".split("").map(e=>e.charCodeAt(0));function c(e){let t;if(!(self.REAL_WASM&&self.REAL_WASM instanceof Uint8Array))throw Error("rewriter wasm not found (was it fetched correctly?)");if(![...self.REAL_WASM.slice(0,4)].every((e,t)=>e===a[t]))throw Error("rewriter wasm does not have wasm magic (was it fetched correctly?)\nrewriter wasm contents: "+s.decode(self.REAL_WASM));(0,n.rb)({module:new WebAssembly.Module(self.REAL_WASM)}),i.h3.shared.rewriter||(i.h3.shared.rewriter=[]);let r=i.h3.shared.rewriter.findIndex(e=>!e.inUse),o=i.h3.shared.rewriter.length;return -1===r?((0,i.Sp)("rewriterLogs",e.base)&&console.log(`creating new rewriter, ${o} rewriters made already`),t={rewriter:new n.mZ(i.h3),inUse:!1},i.h3.shared.rewriter.push(t)):((0,i.Sp)("rewriterLogs",e.base)&&console.log(`using cached rewriter ${r} from list of ${o} rewriters`),t=i.h3.shared.rewriter[r]),t.inUse=!0,[t.rewriter,()=>t.inUse=!1]}},9739:function(e,t,r){r.d(t,{JN:()=>u,N0:()=>d,TE:()=>l,UX:()=>f,W_:()=>c,Wq:()=>g});let n={none:0,"same-origin":1,"same-site":2,"cross-site":3};async function i(){let e=indexedDB.open("$scramjet",1);return new Promise((t,r)=>{e.onerror=()=>r(e.error),e.onsuccess=()=>t(e.result)})}async function o(e){let t=(await i()).transaction("redirectTrackers","readonly").objectStore("redirectTrackers");return new Promise(r=>{let n=t.get(e);n.onsuccess=()=>r(n.result||null),n.onerror=()=>r(null)})}async function s(e,t){let r=(await i()).transaction("redirectTrackers","readwrite").objectStore("redirectTrackers");return new Promise((n,i)=>{let o=r.put(t,e);o.onsuccess=()=>n(),o.onerror=()=>i(o.error)})}async function a(e){let t=(await i()).transaction("redirectTrackers","readwrite").objectStore("redirectTrackers");return new Promise((r,n)=>{let i=t.delete(e);i.onsuccess=()=>r(),i.onerror=()=>n(i.error)})}async function c(e,t,r){await o(e)||await s(e,{originalReferrer:t||"",mostRestrictiveSite:r,referrerPolicy:"",chainStarted:Date.now()})}async function l(e,t,r){let n=await o(e);n&&(await a(e),r&&(n.referrerPolicy=r),await s(t,n))}async function u(e,t){let r=await o(e);if(!r)return t;let i=n[r.mostRestrictiveSite];return(n[t]??0)>i?(r.mostRestrictiveSite=t,await s(e,r),t):r.mostRestrictiveSite}async function f(e){await a(e)}async function d(e,t,r){let n=(await i()).transaction("referrerPolicies","readwrite").objectStore("referrerPolicies"),o={policy:t,referrer:r};return new Promise((t,r)=>{let i=n.put(o,e);i.onsuccess=()=>t(),i.onerror=()=>r(i.error)})}async function g(e){let t=(await i()).transaction("referrerPolicies","readonly").objectStore("referrerPolicies");return new Promise(r=>{let n=t.get(e);n.onsuccess=()=>r(n.result||null),n.onerror=()=>r(null)})}},6468:function(e,t,r){r.d(t,{$L:()=>a});let n="publicSuffixList";async function i(){let e=indexedDB.open("$scramjet",1);return new Promise((t,r)=>{e.onerror=()=>r(e.error),e.onsuccess=()=>t(e.result)})}async function o(){let e=(await i()).transaction(n,"readonly").objectStore(n);return new Promise(t=>{let r=e.get(n);r.onsuccess=()=>t(r.result||null),r.onerror=()=>t(null)})}async function s(e){let t=(await i()).transaction("publicSuffixList","readwrite").objectStore("publicSuffixList");return new Promise((r,i)=>{let o=t.put({data:e,expiry:Date.now()+36e5},n);o.onsuccess=()=>r(),o.onerror=()=>i(o.error)})}async function a(e,t,r){return t?e.origin.origin===t.origin?"same-origin":await c(e.origin,t,r)?"same-site":"cross-site":"none"}async function c(e,t,r){return await l(e,r)===await l(t,r)}async function l(e,t){let r=await u(t),n=e.hostname.toLowerCase().split("."),i="",o=!1;for(let e of r){let t=e.startsWith("!")?e.substring(1):e;if(function(e,t){if(e.length<t.length)return!1;let r=e.length-t.length;for(let n=0;n<t.length;n++){let i=e[r+n],o=t[n];if("*"!==o&&i!==o)return!1}return!0}(n,t.split("."))){if(e.startsWith("!")){i=t,o=!0;break}!o&&t.length>i.length&&(i=t)}}if(!i)return n.slice(-2).join(".");let s=i.split(".").length,a=o?s:s+1;return n.slice(-a).join(".")}async function u(e){let t,r=await o();if(r&&Date.now()<r.expiry)return r.data;try{t=await e.fetch("https://publicsuffix.org/list/public_suffix_list.dat")}catch(e){throw Error(`Failed to fetch public suffix list: ${e}`)}let n=(await t.text()).split("\n").map(e=>{let t=e.trim(),r=t.indexOf(" ");return r>-1?t.substring(0,r):t}).filter(e=>e&&!e.startsWith("//"));return await s(n),n}},4155:function(e,t,r){r.d(t,{O:()=>i});var n=r(8810);function i(e,t){let r={"content-type":"text/html"};return crossOriginIsolated&&(r["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(function(e,t){let r=`
                errorTrace.value = ${JSON.stringify(e)};
                fetchedURL.textContent = ${JSON.stringify(t)};
                for (const node of document.querySelectorAll("#hostname")) node.textContent = ${JSON.stringify(location.hostname)};
                reload.addEventListener("click", () => location.reload());
                version.textContent = ${JSON.stringify(n.h3.version.version)};
                build.textContent = ${JSON.stringify(n.h3.version.build)};
                
                document.getElementById('copy-button').addEventListener('click', async () => {
                    const text = document.getElementById('errorTrace').value;
                    await navigator.clipboard.writeText(text);
                    const btn = document.getElementById('copy-button');
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 2000);
                });
        `;return`<html>
                <head>
                    <meta charset="utf-8" />
                    <title>Scramjet</title>
                    <link
                    rel="stylesheet"
                    href="https://www.nerdfonts.com/assets/css/webfont.css"
                    />
                    <link
                    href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
                    rel="stylesheet"
                    />
                    <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                    />
                    <style>
                    *,
                    body {
                        color: #eceff4;
                        background-color: #1d232a;
                        font-family: "Figtree", sans-serif;
                        font-optical-sizing: auto;
                        background-image: radial-gradient(circle, rgba(131, 131, 131, 0.02) 1px, transparent 1px), radial-gradient(circle, rgba(148, 148, 148, 0.02) 1px, transparent 1px);
                        background-position: 0 0, 5px 5px;
                        background-size: 10px 10px;
                    }

                    h1 {
                        color: #ff5861;
                        font-size: 64px;
                        font-weight: 900;
                        margin-top: 0.8%;
                    }

                    code, i {
                        color: #e5e9f0;
                        font-size: 24px;
                        font-weight: 500;
                    }

                    .uv-small {
                        color: #e5e9f0;
                        font-size: 20px;
                        font-weight: 500;
                    }

                    i {
                        color: #e5e9f0;
                        font-size: 20px;
                        font-weight: 900;
                        text-decoration: none;
                        font-style: normal;
                    }
                    
                    .footer-spacing {
                        margin-top: 0.5%;
                    }

                    button {
                        display: inline-block;
                        text-decoration: none;
                        padding: 15px 50px;
                        border-radius: 8px;
                        margin: 10px;
                        margin-top: 20px;
                        transition: 0.3s ease-in-out;
                        -webkit-transition: 0.3s ease-in-out;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        -webkit-backdrop-filter: blur(10px);
                        backdrop-filter: blur(10px);
                    }

                    button:hover {
                        background-color: #434c5e;
                    }

                    textarea {
                        border-radius: 18px;
                        outline: none;
                        resize: none;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        padding: 25px;
                        box-sizing: border-box;
                        width: 450px;
                    }

                    .nf-fa-heart {
                        color: #ff5861;
                    }

                    body,
                    html,
                    #inner {
                        display: flex;
                        align-items: center;
                        flex-direction: column;
                        gap: 1em;
                        overflow: hidden;
                    }

                    #inner {
                        z-index: 100;
                    }

                    #cover {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        background-color: color-mix(in srgb, var(--deep) 70%, transparent);
                        z-index: 99;
                    }

                    #info {
                        display: flex;
                        flex-direction: row;
                        align-items: flex-start;
                        gap: 1em;
                    }

                    #errorTrace-wrapper {
                        position: relative;
                        width: fit-content;
                    }

                    #copy-button {
                        position: absolute;
                        top: 0.5em;
                        right: 0.5em;
                        padding: 0.23em;
                        cursor: pointer;
                        opacity: 0;
                        transition: opacity 0.4s;
                        font-size: 0.9em;
                    }

                    #errorTrace-wrapper:hover #copy-button {
                        opacity: 1;
                    }
                    </style>
                </head>
                <body>
                    <div id="cover"></div>
                    <div id="inner" class="container-fluid text-center">
                        <h1 id="errorTitle">Netwo<wbr>rk Er<wbr>ror</h1>
                        <code>Fa<wbr>iled to l<wbr>oad: <b id="fetchedURL"></b></code>
                        <br>
                        <!-- <p id="errorMessage">Internal Server Error</p> -->
                        <button id="reload">Ref<wbr>resh</button>
                        <br />
                        <div id="info">
                            <div id="errorTrace-wrapper" class="container">
                                <textarea id="errorTrace" cols="40" rows="10" readonly></textarea>
                                <button id="copy-button" class="primary">Copy</button>
                            </div>
                            <div id="troubleshooting" class="container text-wrap">
                                <p>Try:</p>
                                <ul>
                                    <li>Checking your internet connection</li>
                                    <li>In the ca<wbr>se of an I<wbr>DBData<wbr>base er<wbr>ror plea<wbr>se cle<wbr>ar your site data by click<wbr>ing on the lo<wbr>ck ic<wbr>on i<wbr>n the ad<wbr>dres<wbr>s bar an<wbr>d selec<wbr>ting "Si<wbr>te set<wbr>tings" or "Si<wbr>te d<wbr>ata" and th<wbr>en cl<wbr>ick<wbr>ing "Cl<wbr>ear sit<wbr>e d<wbr>ata"</li>
                                    <li>Verifying you entered the correct address</li>
                                    <li>Clear<wbr>ing your bro<wbr>wser or site cache data via Ctr<wbr>l+Sh<wbr>ift+<wbr>R and b<wbr>rowser setti<wbr>ngs</li>
                                    <li>In t<wbr>he case of web<wbr>site ma<wbr />inte<wbr>nan<wbr />ce or updates, please wait for the issue to be resol<wbr>ved.</li>
                                    <li>Verif<wbr>ying you ente<wbr>red the cor<wbr>rect add<wbr>ress</li>
                                    <li>Verify the server isn't censored</li>
                                    <li>If the iss<wbr>ue per<wbr>sists be su<wbr>re to m<wbr>ention t<wbr>his in the Ti<wbr />ta<wbr />nium Net<wbr />work D<wbr>is<wbr />cor<wbr />d.</li>
                                    <li>View the F<wbr />AQ page for specific si<wbr>te compa<wbr>tibility issues.</li>
                                </ul>
                            </div>
                        </div>
                        <code><i>Ref<wbr>res<wbr>h the net<wbr>work serv<wbr>ice | Scramjet v<span id="version"></span> (build <span id="build"></span>).</i></code>
                        <p class="footer-spacing">
                            <i>Ho<wbr>ly Unbloc<wbr>ke<wbr>r LT<wbr>S © 20<wbr>2<wbr>0-202<wbr>5 | Ma<wbr>de Wit<wbr>h Lov<wbr>e </i><i class="nf nf-fa-heart"></i>
                        </p>
                    </div>
                    <script src="${"data:application/javascript,"+encodeURIComponent(r)}"></script>
                </body>
            </html>
        `}(String(e),t),{status:500,headers:r})}},9022:function(e,t,r){r.d(t,{Y:()=>n});class n{handle;origin;syncToken=0;promises={};messageChannel=new MessageChannel;connected=!1;constructor(e,t){this.handle=e,this.origin=t,this.messageChannel.port1.addEventListener("message",e=>{"scramjet$type"in e.data&&("init"===e.data.scramjet$type?this.connected=!0:this.handleMessage(e.data))}),this.messageChannel.port1.start(),this.handle.postMessage({scramjet$type:"init",scramjet$port:this.messageChannel.port2},[this.messageChannel.port2])}handleMessage(e){let t=this.promises[e.scramjet$token];t&&(t(e),delete this.promises[e.scramjet$token])}async fetch(e){let t=this.syncToken++,r={scramjet$type:"fetch",scramjet$token:t,scramjet$request:{url:e.url,body:e.body,headers:Array.from(e.headers.entries()),method:e.method,mode:e.mode,destinitation:e.destination}},n=e.body?[e.body]:[];this.handle.postMessage(r,n);let{scramjet$response:i}=await new Promise(e=>{this.promises[t]=e});return!!i&&new Response(i.body,{headers:i.headers,status:i.status,statusText:i.statusText})}}},8931:function(e,t,r){r.d(t,{pd:()=>l});var n=r(4155),i=r(4471),o=r(6468),s=r(9739),a=r(8810),c=r(4079);async function l(e,t){try{let r=new URL(e.url);if(r.pathname===this.config.files.wasm)return fetch(this.config.files.wasm).then(async e=>{let t=await e.arrayBuffer(),r=btoa(new Uint8Array(t).reduce((e,t)=>(e.push(String.fromCharCode(t)),e),[]).join("")),n="";return n+=`if ('document' in self && document.currentScript) { document.currentScript.remove(); }
self.WASM = '${r}';`,new Response(n,{headers:{"content-type":"text/javascript"}})});let n="";r.searchParams.has("type")&&(n=r.searchParams.get("type"),r.searchParams.delete("type")),r.searchParams.has("dest")&&r.searchParams.delete("dest");let c=new URL((0,i.Sd)(r)),l={origin:c,base:c};if(r.searchParams.has("topFrame")&&(l.topFrameName=r.searchParams.get("topFrame")),r.searchParams.has("parentFrame")&&(l.parentFrameName=r.searchParams.get("parentFrame")),r.pathname.startsWith(`${this.config.prefix}blob:`)||r.pathname.startsWith(`${this.config.prefix}data:`)){let t,o=r.pathname.substring(this.config.prefix.length);o.startsWith("blob:")&&(o=(0,i.Ag)(o));let s=await fetch(o,{});s.finalURL=o.startsWith("blob:")?o:"(data url)",s.body&&(t=await f(s,l,e.destination,n,this.cookieStore));let a=Object.fromEntries(s.headers.entries());return crossOriginIsolated&&(a["Cross-Origin-Opener-Policy"]="same-origin",a["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(t,{status:s.status,statusText:s.statusText,headers:a})}let d=this.serviceWorkers.find(e=>e.origin===c.origin);if(d?.connected&&"swruntime"!==r.searchParams.get("from")){let t=await d.fetch(e);if(t)return t}if(c.origin===new URL(e.url).origin)throw Error("attempted to fetch from same origin - this means the site has obtained a reference to the real origin, aborting");let w=new i.KF;for(let[t,r]of e.headers.entries())w.set(t,r);if(t&&new URL(t.url).pathname.startsWith(a.h3.config.prefix)){let e=new URL((0,i.Sd)(t.url));e.toString().includes("youtube.com")||(w.set("Referer",e.href),w.set("Origin",e.origin))}let h=this.cookieStore.getCookies(c,!1);h.length&&w.set("Cookie",h);let b=!1;if("iframe"===e.destination&&"navigate"===e.mode&&e.referrer&&"no-referrer"!==e.referrer){let t=e.referrer,r=await self.clients.matchAll({type:"window"});for(;t;){if(!t.includes(a.h3.config.prefix)){b=!0;break}let e=r.find(e=>e.url===t),n=await (0,s.Wq)(t);if(!n||!n.referrer){e&&t.startsWith(location.origin)&&(b=!0);break}if(e&&"nested"===e.frameType)t=n.referrer;else break}}b?(w.set("Sec-Fetch-Dest","document"),w.set("Sec-Fetch-Mode","navigate")):(w.set("Sec-Fetch-Dest",e.destination||"empty"),w.set("Sec-Fetch-Mode",e.mode));let m="none";if(e.referrer&&""!==e.referrer&&"no-referrer"!==e.referrer&&e.referrer.includes(a.h3.config.prefix)){let t=(0,i.Sd)(e.referrer);if(t){let e=new URL(t);m=await (0,o.$L)(l,e,this.client)}}await (0,s.W_)(c.toString(),e.referrer?(0,i.Sd)(e.referrer):null,m),w.set("Sec-Fetch-Site",await (0,s.JN)(c.toString(),m));let p=new g(c,w.headers,e.body,e.method,e.destination,t);this.dispatchEvent(p);let _=p.response||await this.client.fetch(p.url,{method:p.method,body:p.body,headers:p.requestHeaders,credentials:"omit",mode:"cors"===e.mode?e.mode:"same-origin",cache:e.cache,redirect:"manual",duplex:"half"});return await u(c,l,n,e.destination,e.mode,_,this.cookieStore,t,this.client,this,e.referrer)}catch(o){let t={message:o.message,url:e.url,destination:e.destination,timestamp:new Date().toISOString()};if(o.stack&&(t.stack=o.stack),console.error("ERROR FROM SERVICE WORKER FETCH: ",t),!["document","iframe"].includes(e.destination))return new Response(void 0,{status:500});let r=Object.entries(t).map(([e,t])=>`${e.charAt(0).toUpperCase()+e.slice(1)}: ${t}`).join("\n\n");return(0,n.O)(r,(0,i.Sd)(e.url))}}async function u(e,t,r,n,a,c,l,u,g,w,h){let b,m="navigate"===a&&["document","iframe"].includes(n),p=await (0,i.V6)(c.rawHeaders,t,g,{get:s.Wq,set:s.N0});if(m&&p["referrer-policy"]&&h&&await (0,s.N0)(e.href,p["referrer-policy"],h),c.status>=300&&c.status<400&&p.location){let t=new URL((0,i.Sd)(p.location));await (0,s.TE)(e.toString(),t.toString(),p["referrer-policy"]);let r=await (0,o.$L)({origin:t,base:t},e,g);await (0,s.JN)(t.toString(),r)}let _=p["set-cookie"]||[];for(let t in _)if(u){let r=w.dispatch(u,{scramjet$type:"cookie",cookie:t,url:e.href});"document"!==n&&"iframe"!==n&&await r}for(let t in await l.setCookies(_ instanceof Array?_:[_],e),p)Array.isArray(p[t])&&(p[t]=p[t][0]);if(c.body&&(b=await f(c,t,n,r,l)),["document","iframe"].includes(n)){let e=p["content-disposition"];if(!/\s*?((inline|attachment);\s*?)filename=/i.test(e)){let t=/^\s*?attachment/i.test(e)?"attachment":"inline",[r]=new URL(c.finalURL).pathname.split("/").slice(-1);p["content-disposition"]=`${t}; filename=${JSON.stringify(r)}`}}"text/event-stream"===p.accept&&(p["content-type"]="text/event-stream"),delete p["permissions-policy"],crossOriginIsolated&&["document","iframe","worker","sharedworker","style","script"].includes(n)&&(p["Cross-Origin-Embedder-Policy"]="require-corp",p["Cross-Origin-Opener-Policy"]="same-origin");let y=new d(b,p,c.status,c.statusText,n,e,c,u);return w.dispatchEvent(y),c.status>=300&&c.status<400||await (0,s.UX)(e.toString()),new Response(y.responseBody,{headers:y.responseHeaders,status:y.status,statusText:y.statusText})}async function f(e,t,r,n,o){switch(r){case"iframe":case"document":if(e.headers.get("content-type")?.startsWith("text/html"))return(0,i.r4)(await e.text(),o,t,!0);return e.body;case"script":{let{js:r,tag:i,map:o}=(0,c.L)(new Uint8Array(await e.arrayBuffer()),e.finalURL,t,"module"===n);if((0,a.Sp)("sourcemaps",t.base)&&o){r instanceof Uint8Array&&(r=new TextDecoder().decode(r));let e=`${globalThis.$scramjet.config.globals.pushsourcemapfn}([${o.join(",")}], "${i}");`,t=/^\s*(['"])use strict\1;?/;r=t.test(r)?r.replace(t,`$&
${e}`):`${e}
${r}`}return r}case"style":return(0,i.U5)(await e.text(),t);case"sharedworker":case"worker":return(0,i.$O)(new Uint8Array(await e.arrayBuffer()),n,e.finalURL,t);default:return e.body}}class d extends Event{responseBody;responseHeaders;status;statusText;destination;url;rawResponse;client;constructor(e,t,r,n,i,o,s,a){super("handleResponse"),this.responseBody=e,this.responseHeaders=t,this.status=r,this.statusText=n,this.destination=i,this.url=o,this.rawResponse=s,this.client=a}}class g extends Event{url;requestHeaders;body;method;destination;client;constructor(e,t,r,n,i,o){super("request"),this.url=e,this.requestHeaders=t,this.body=r,this.method=n,this.destination=i,this.client=o}response}},3093:function(e,t,r){function n(e,t){e.base=new URL(t,e.origin)}function i(e){return btoa(Array.from(e,e=>String.fromCodePoint(e)).join(""))}function o(e,t,r,n){return e(r,`(inline ${t} on element)`,n)}function s(e,t,r,n){return e(t,"(inline script element)",n,r)}function a(e,t,r){return e(t,r)}function c(e,t,r){let n=t.split("url=");return n[1]&&(n[1]=e(n[1].trim(),r)),n.join("url=")}function l(e){console.log("aaaaa",e)}r.d(t,{D8:()=>s,U5:()=>a,US:()=>i,Uh:()=>c,cM:()=>l,qt:()=>n,vQ:()=>o})},5442:function(e,t,r){r.d(t,{t:()=>n});function n(){return"10000000000".replace(/[018]/g,e=>(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16))}},7418:function(e,t,r){let n;r.d(t,{mZ:()=>_,rb:()=>x});var i=r(3093),o=r(5442);let s=0,a=null;function c(){return(null===a||0===a.byteLength)&&(a=new Uint8Array(n.memory.buffer)),a}let l="undefined"!=typeof TextEncoder?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}},u="function"==typeof l.encodeInto?function(e,t){return l.encodeInto(e,t)}:function(e,t){let r=l.encode(e);return t.set(r),{read:e.length,written:r.length}};function f(e,t,r){if(void 0===r){let r=l.encode(e),n=t(r.length,1)>>>0;return c().subarray(n,n+r.length).set(r),s=r.length,n}let n=e.length,i=t(n,1)>>>0,o=c(),a=0;for(;a<n;a++){let t=e.charCodeAt(a);if(t>127)break;o[i+a]=t}if(a!==n){0!==a&&(e=e.slice(a)),i=r(i,n,n=a+3*e.length,1)>>>0;let t=u(e,c().subarray(i+a,i+n));a+=t.written,i=r(i,n,a,1)>>>0}return s=a,i}let d=null;function g(){return(null===d||!0===d.buffer.detached||void 0===d.buffer.detached&&d.buffer!==n.memory.buffer)&&(d=new DataView(n.memory.buffer)),d}function w(e,t){try{return e.apply(this,t)}catch(t){let e=function(e){let t=n.__externref_table_alloc();return n.__wbindgen_export_4.set(t,e),t}(t);n.__wbindgen_exn_store(e)}}let h="undefined"!=typeof TextDecoder?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};function b(e,t){return e>>>=0,h.decode(c().subarray(e,e+t))}function m(e){let t=n.__wbindgen_export_4.get(e);return n.__externref_table_dealloc(e),t}"undefined"!=typeof TextDecoder&&h.decode();let p="undefined"==typeof FinalizationRegistry?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(e=>n.__wbg_rewriter_free(e>>>0,1));class _{__destroy_into_raw(){let e=this.__wbg_ptr;return this.__wbg_ptr=0,p.unregister(this),e}free(){let e=this.__destroy_into_raw();n.__wbg_rewriter_free(e,0)}constructor(e){let t=n.rewriter_new(e);if(t[2])throw m(t[1]);return this.__wbg_ptr=t[0]>>>0,p.register(this,this.__wbg_ptr,this),this}rewrite_js(e,t,r,i){let o=f(e,n.__wbindgen_malloc,n.__wbindgen_realloc),a=s,c=f(t,n.__wbindgen_malloc,n.__wbindgen_realloc),l=s,u=f(r,n.__wbindgen_malloc,n.__wbindgen_realloc),d=s,g=n.rewriter_rewrite_js(this.__wbg_ptr,o,a,c,l,u,d,i);if(g[2])throw m(g[1]);return m(g[0])}rewrite_js_bytes(e,t,r,i){let o=function(e,t){let r=t(+e.length,1)>>>0;return c().set(e,r/1),s=e.length,r}(e,n.__wbindgen_malloc),a=s,l=f(t,n.__wbindgen_malloc,n.__wbindgen_realloc),u=s,d=f(r,n.__wbindgen_malloc,n.__wbindgen_realloc),g=s,w=n.rewriter_rewrite_js_bytes(this.__wbg_ptr,o,a,l,u,d,g,i);if(w[2])throw m(w[1]);return m(w[0])}rewrite_html(e,t,r){let i=f(e,n.__wbindgen_malloc,n.__wbindgen_realloc),o=s,a=n.rewriter_rewrite_html(this.__wbg_ptr,i,o,t,r);if(a[2])throw m(a[1]);return m(a[0])}}async function y(e,t){if("function"==typeof Response&&e instanceof Response){if("function"==typeof WebAssembly.instantiateStreaming)try{return await WebAssembly.instantiateStreaming(e,t)}catch(t){if("application/wasm"!=e.headers.get("Content-Type"))console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",t);else throw t}let r=await e.arrayBuffer();return await WebAssembly.instantiate(r,t)}{let r=await WebAssembly.instantiate(e,t);return r instanceof WebAssembly.Instance?{instance:r,module:e}:r}}function v(){let e={};return e.wbg={},e.wbg.__wbg_base64_115e27e69612f6f9=function(e,t){let r=f((0,i.US)(t),n.__wbindgen_malloc,n.__wbindgen_realloc),o=s;g().setInt32(e+4,o,!0),g().setInt32(e+0,r,!0)},e.wbg.__wbg_buffer_609cc3eee51ed158=function(e){return e.buffer},e.wbg.__wbg_call_7cccdd69e0791ae2=function(){return w(function(e,t,r){return e.call(t,r)},arguments)},e.wbg.__wbg_call_833bed5770ea2041=function(){return w(function(e,t,r,n){return e.call(t,r,n)},arguments)},e.wbg.__wbg_call_b8adc8b1d0a0d8eb=function(){return w(function(e,t,r,n,i){return e.call(t,r,n,i)},arguments)},e.wbg.__wbg_entries_3265d4158b33e5dc=function(e){return Object.entries(e)},e.wbg.__wbg_get_67b2ba62fc30de12=function(){return w(function(e,t){return Reflect.get(e,t)},arguments)},e.wbg.__wbg_get_b9b93047fe3cf45b=function(e,t){return e[t>>>0]},e.wbg.__wbg_isArray_a1eab7e0d067391b=function(e){return Array.isArray(e)},e.wbg.__wbg_length_e2d2a49132c1b256=function(e){return e.length},e.wbg.__wbg_log_2f70bc68044d6f60=function(e,t){(0,i.cM)(b(e,t))},e.wbg.__wbg_new_405e22f390576ce2=function(){return{}},e.wbg.__wbg_new_78feb108b6472713=function(){return[]},e.wbg.__wbg_new_9ffbe0a71eff35e3=function(){return w(function(e,t){return new URL(b(e,t))},arguments)},e.wbg.__wbg_new_a12002a7f91c75be=function(e){return new Uint8Array(e)},e.wbg.__wbg_newwithbase_161c299e7a34e2eb=function(){return w(function(e,t,r,n){return new URL(b(e,t),b(r,n))},arguments)},e.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a=function(e,t,r){return new Uint8Array(e,t>>>0,r>>>0)},e.wbg.__wbg_rewriteCss_9baf28b92206542e=function(e,t,r,o,a){let c=f((0,i.U5)(t,b(r,o),a),n.__wbindgen_malloc,n.__wbindgen_realloc),l=s;g().setInt32(e+4,l,!0),g().setInt32(e+0,c,!0)},e.wbg.__wbg_rewriteHttpEquiv_36d627bb1aa1662f=function(e,t,r,o,a){let c=f((0,i.Uh)(t,b(r,o),a),n.__wbindgen_malloc,n.__wbindgen_realloc),l=s;g().setInt32(e+4,l,!0),g().setInt32(e+0,c,!0)},e.wbg.__wbg_rewriteJsAttr_0a16ff7c17c72f0f=function(e,t,r,o,a,c,l){let u=f((0,i.vQ)(t,b(r,o),b(a,c),l),n.__wbindgen_malloc,n.__wbindgen_realloc),d=s;g().setInt32(e+4,d,!0),g().setInt32(e+0,u,!0)},e.wbg.__wbg_rewriteJsInline_8094bffe5a91c442=function(e,t,r,o,a,c){let l=f((0,i.D8)(t,b(r,o),0!==a,c),n.__wbindgen_malloc,n.__wbindgen_realloc),u=s;g().setInt32(e+4,u,!0),g().setInt32(e+0,l,!0)},e.wbg.__wbg_scramtag_3a255d78b157986d=function(e){let t=f((0,o.t)(),n.__wbindgen_malloc,n.__wbindgen_realloc),r=s;g().setInt32(e+4,r,!0),g().setInt32(e+0,t,!0)},e.wbg.__wbg_setMeta_159129a766e5aee1=function(e,t,r){(0,i.qt)(e,b(t,r))},e.wbg.__wbg_set_bb8cecf6a62b9f46=function(){return w(function(e,t,r){return Reflect.set(e,t,r)},arguments)},e.wbg.__wbg_toString_5285597960676b7b=function(e){return e.toString()},e.wbg.__wbg_toString_c813bbd34d063839=function(e){return e.toString()},e.wbg.__wbindgen_boolean_get=function(e){return"boolean"==typeof e?+!!e:2},e.wbg.__wbindgen_error_new=function(e,t){return Error(b(e,t))},e.wbg.__wbindgen_init_externref_table=function(){let e=n.__wbindgen_export_4,t=e.grow(4);e.set(0,void 0),e.set(t+0,void 0),e.set(t+1,null),e.set(t+2,!0),e.set(t+3,!1)},e.wbg.__wbindgen_is_function=function(e){return"function"==typeof e},e.wbg.__wbindgen_memory=function(){return n.memory},e.wbg.__wbindgen_string_get=function(e,t){let r="string"==typeof t?t:void 0;var i=null==r?0:f(r,n.__wbindgen_malloc,n.__wbindgen_realloc),o=s;g().setInt32(e+4,o,!0),g().setInt32(e+0,i,!0)},e.wbg.__wbindgen_string_new=function(e,t){return b(e,t)},e.wbg.__wbindgen_throw=function(e,t){throw Error(b(e,t))},e}function S(e,t){return n=e.exports,k.__wbindgen_wasm_module=t,d=null,a=null,n.__wbindgen_start(),n}function x(e){if(void 0!==n)return n;void 0!==e&&(Object.getPrototypeOf(e)===Object.prototype?{module:e}=e:console.warn("using deprecated parameters for `initSync()`; pass a single object instead"));let t=v();return e instanceof WebAssembly.Module||(e=new WebAssembly.Module(e)),S(new WebAssembly.Instance(e,t),e)}async function k(e){if(void 0!==n)return n;void 0!==e&&(Object.getPrototypeOf(e)===Object.prototype?{module_or_path:e}=e:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),void 0===e&&(e=new URL("wasm_bg.wasm",""));let t=v();("string"==typeof e||"function"==typeof Request&&e instanceof Request||"function"==typeof URL&&e instanceof URL)&&(e=fetch(e));let{instance:r,module:i}=await y(await e,t);return S(r,i)}}},t={};function r(n){var i=t[n];if(void 0!==i)return i.exports;var o=t[n]={exports:{}};return e[n](o,o.exports,r),o.exports}r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=r(9022),t=r(8931),n=r(8810),i=r(522);class o extends EventTarget{client;config;syncPool={};synctoken=0;cookieStore=new n.h3.shared.CookieStore;serviceWorkers=[];constructor(){super(),this.client=new n.h3.shared.util.BareClient;let t=indexedDB.open("$scramjet",1);t.onsuccess=()=>{let e=t.result.transaction("cookies","readonly").objectStore("cookies").get("cookies");e.onsuccess=()=>{e.result&&this.cookieStore.load(e.result)}},addEventListener("message",async({data:r})=>{if("scramjet$type"in r){if("scramjet$token"in r){let e=this.syncPool[r.scramjet$token];delete this.syncPool[r.scramjet$token],e(r);return}if("registerServiceWorker"===r.scramjet$type)return void this.serviceWorkers.push(new e.Y(r.port,r.origin));"cookie"===r.scramjet$type&&(this.cookieStore.setCookies([r.cookie],new URL(r.url)),t.result.transaction("cookies","readwrite").objectStore("cookies").put(JSON.parse(this.cookieStore.dump()),"cookies")),"loadConfig"===r.scramjet$type&&(this.config=r.config)}})}async dispatch(e,t){let r,n=this.synctoken++,i=new Promise(e=>r=e);return this.syncPool[n]=r,t.scramjet$token=n,e.postMessage(t),await i}async loadConfig(){if(this.config)return;let e=indexedDB.open("$scramjet",1);return new Promise((t,r)=>{e.onsuccess=async()=>{let o=e.result.transaction("config","readonly").objectStore("config").get("config");o.onsuccess=async()=>{this.config=o.result,n.h3.config=o.result,(0,n.t8)(),await (0,i.V)(),t()},o.onerror=()=>r(o.error)},e.onerror=()=>r(e.error)})}route({request:e}){return!!e.url.startsWith(location.origin+this.config.prefix)||!!e.url.startsWith(location.origin+this.config.files.wasm)}async fetch({request:e,clientId:r}){this.config||await this.loadConfig();let n=await self.clients.get(r);return t.pd.call(this,e,n)}}self.ScramjetServiceWorker=o})()})();
//# sourceMappingURL=scramjet.worker.js.map