(()=>{"use strict";var e={1762:function(e,t,r){r.d(t,{Z:()=>o});let o={fmt:function(e,t,...r){let o=Error.prepareStackTrace;Error.prepareStackTrace=(e,t)=>{t.shift(),t.shift(),t.shift();let r="";for(let e=1;e<Math.min(2,t.length);e++)t[e].getFunctionName()&&(r+=`${t[e].getFunctionName()} -> `+r);return r+(t[0].getFunctionName()||"Anonymous")};let s=function(){try{throw Error()}catch(e){return e.stack}}();Error.prepareStackTrace=o,(console[e]||console.log)(`%c${s}%c ${t}`,`
		background-color: ${{log:"#000",warn:"#f80",error:"#f00",debug:"transparent"}[e]};
		color: ${{log:"#fff",warn:"#fff",error:"#fff",debug:"gray"}[e]};
		padding: ${{log:2,warn:4,error:4,debug:0}[e]}px;
		font-weight: bold;
		font-family: monospace;
		font-size: 0.9em;
	`,`${"debug"===e?"color: gray":""}`,...r)},log:function(e,...t){this.fmt("log",e,...t)},warn:function(e,...t){this.fmt("warn",e,...t)},error:function(e,...t){this.fmt("error",e,...t)},debug:function(e,...t){this.fmt("debug",e,...t)}}}},t={};function r(o){var s=t[o];if(void 0!==s)return s.exports;var n=t[o]={exports:{}};return e[o](n,n.exports,r),n.exports}r.d=function(e,t){for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},(()=>{class e{handle;origin;syncToken;promises;messageChannel;connected;constructor(e,t){this.handle=e,this.origin=t,this.syncToken=0,this.promises={},this.messageChannel=new MessageChannel,this.connected=!1,this.messageChannel.port1.addEventListener("message",e=>{"scramjet$type"in e.data&&("init"===e.data.scramjet$type?this.connected=!0:this.handleMessage(e.data))}),this.messageChannel.port1.start(),this.handle.postMessage({scramjet$type:"init",scramjet$port:this.messageChannel.port2},[this.messageChannel.port2])}handleMessage(e){let t=this.promises[e.scramjet$token];t&&(t(e),delete this.promises[e.scramjet$token])}async fetch(e){let t=this.syncToken++,r={scramjet$type:"fetch",scramjet$token:t,scramjet$request:{url:e.url,body:e.body,headers:Array.from(e.headers.entries()),method:e.method,mode:e.mode,destinitation:e.destination}},o=e.body?[e.body]:[];this.handle.postMessage(r,o);let{scramjet$response:s}=await new Promise(e=>{this.promises[t]=e});return!!s&&new Response(s.body,{headers:s.headers,status:s.status,statusText:s.statusText})}}"$scramjet"in self||(self.$scramjet={version:{build:"fe3c225",version:"1.0.2-dev"},codec:{},flagEnabled:function(e,r){let o=t.config.flags[e];for(let o in t.config.siteFlags){let s=t.config.siteFlags[o];if(new RegExp(o).test(r.href)&&e in s)return s[e]}return o}});let t=self.$scramjet,o=Function,{util:{BareClient:s,ScramjetHeaders:n,BareMuxConnection:i},url:{rewriteUrl:a,unrewriteUrl:c,rewriteBlob:l,unrewriteBlob:d},rewrite:{rewriteCss:u,unrewriteCss:h,rewriteHtml:p,unrewriteHtml:m,rewriteSrcset:f,rewriteJs:g,rewriteHeaders:y,rewriteWorkers:b,htmlRules:w},CookieStore:v}=t.shared;function k(e){return{origin:e,base:e}}async function x(e,r){let o=new URLSearchParams(new URL(e.url).search);if(o.has("url"))return Response.redirect(a(o.get("url"),k(new URL(o.get("url")))));try{let s=new URL(e.url),i="";if(s.searchParams.has("type")&&(i=s.searchParams.get("type"),s.searchParams.delete("type")),s.searchParams.has("dest")&&s.searchParams.delete("dest"),s.pathname.startsWith(this.config.prefix+"blob:")||s.pathname.startsWith(this.config.prefix+"data:")){let t,o=s.pathname.substring(this.config.prefix.length);o.startsWith("blob:")&&(o=d(o));let n=await fetch(o,{}),a=o.startsWith("blob:")?o:"(data url)";n.finalURL=a,n.body&&(t=await S(n,r?{base:new URL(new URL(r.url).origin),origin:new URL(new URL(r.url).origin)}:k(new URL(c(e.referrer))),e.destination,i,this.cookieStore));let l=Object.fromEntries(n.headers.entries());return crossOriginIsolated&&(l["Cross-Origin-Opener-Policy"]="same-origin",l["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(t,{status:n.status,statusText:n.statusText,headers:l})}let a=new URL(c(s)),l=this.serviceWorkers.find(e=>e.origin===a.origin);if(l&&l.connected&&"swruntime"!==o.get("from")){let t=await l.fetch(e);if(t)return t}if(a.origin==new URL(e.url).origin)throw Error("attempted to fetch from same origin - this means the site has obtained a reference to the real origin, aborting");let u=new n;for(let[t,r]of e.headers.entries())u.set(t,r);if(r&&new URL(r.url).pathname.startsWith(t.config.prefix)){let e=new URL(c(r.url));e.toString().includes("youtube.com")||(u.set("Referer",e.toString()),u.set("Origin",e.origin?`${e.protocol}//${e.host}`:"null"))}let h=this.cookieStore.getCookies(a,!1);h.length&&u.set("Cookie",h),u.set("Sec-Fetch-Dest",e.destination),u.set("Sec-Fetch-Site","same-origin"),u.set("Sec-Fetch-Mode","cors"===e.mode?e.mode:"same-origin");let p=new $(a,e.body,e.method,e.destination,r,u.headers);this.dispatchEvent(p);let m=p.response||await this.client.fetch(p.url,{method:p.method,body:p.body,headers:p.requestHeaders,credentials:"omit",mode:"cors"===e.mode?e.mode:"same-origin",cache:e.cache,redirect:"manual",duplex:"half"});return await R(a,i,e.destination,m,this.cookieStore,r,this)}catch(o){let r={message:o.message,url:e.url,destination:e.destination,timestamp:new Date().toISOString()};if(o.stack&&(r.stack=o.stack),console.error("ERROR FROM SERVICE WORKER FETCH: ",r),!["document","iframe"].includes(e.destination))return new Response(void 0,{status:500});return function(e,r){let o={"content-type":"text/html"};return crossOriginIsolated&&(o["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(function(e,r){let o=`
                errorTrace.value = ${JSON.stringify(e)};
                fetchedURL.textContent = ${JSON.stringify(r)};
                for (const node of document.querySelectorAll("#hostname")) node.textContent = ${JSON.stringify(location.hostname)};
                reload.addEventListener("click", () => location.reload());
                version.textContent = ${JSON.stringify(t.version.version)};
                build.textContent = ${JSON.stringify(t.version.build)};
                
                document.getElementById('copy-button').addEventListener('click', async () => {
                    const text = document.getElementById('errorTrace').value;
                    await navigator.clipboard.writeText(text);
                    const btn = document.getElementById('copy-button');
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 2000);
                });
        `;return`<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>Scramjet</title>
                    <style>
                    :root {
                        --deep: #080602;
                        --shallow: #181412;
                        --beach: #f1e8e1;
                        --shore: #b1a8a1;
                        --accent: #ffa938;
                        --font-sans: -apple-system, system-ui, BlinkMacSystemFont, sans-serif;
                        --font-monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    }

                    *:not(div,p,span,ul,li,i,span) {
                        background-color: var(--deep);
                        color: var(--beach);
                        font-family: var(--font-sans);
                    }

                    textarea,
                    button {
                        background-color: var(--shallow);
                        border-radius: 0.6em;
                        padding: 0.6em;
                        border: none;
                        appearance: none;
                        font-family: var(--font-sans);
                        color: var(--beach);
                    }

                    button.primary {
                        background-color: var(--accent);
                        color: var(--deep);
                        font-weight: bold;
                    }

                    textarea {
                        resize: none;
                        height: 20em;
                        text-align: left;
                        font-family: var(--font-monospace);
                    }

                    body {
                        width: 100vw;
                        height: 100vh;
                        justify-content: center;
                        align-items: center;
                    }

                    body,
                    html,
                    #inner {
                        display: flex;
                        align-items: center;
                        flex-direction: column;
                        gap: 0.5em;
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

                    #version-wrapper {
                        width: auto;
                        text-align: right;
                        position: absolute;
                        top: 0.5rem;
                        right: 0.5rem;
                        font-size: 0.8rem;
                        color: var(--shore)!important;
                        i {
                            background-color: color-mix(in srgb, var(--deep), transparent 50%);
                            border-radius: 9999px;
                            padding: 0.2em 0.5em;
                        }
                        z-index: 101;
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
                    <div id="inner">
                        <h1 id="errorTitle">Uh oh!</h1>
                        <p>There was an error loading <b id="fetchedURL"></b></p>
                        <!-- <p id="errorMessage">Internal Server Error</p> -->

                        <div id="info">
                            <div id="errorTrace-wrapper">
                                <textarea id="errorTrace" cols="40" rows="10" readonly></textarea>
                                <button id="copy-button" class="primary">Copy</button>
                            </div>
                            <div id="troubleshooting">
                                <p>Try:</p>
                                <ul>
                                    <li>Checking your internet connection</li>
                                    <li>Verifying you entered the correct address</li>
                                    <li>Clearing the site data</li>
                                    <li>Contacting <b id="hostname"></b>'s administrator</li>
                                    <li>Verify the server isn't censored</li>
                                </ul>
                                <p>If you're the administrator of <b id="hostname"></b>, try:</p>
                                    <ul>
                                    <li>Restarting your server</li>
                                    <li>Updating Scramjet</li>
                                    <li>Troubleshooting the error on the <a href="https://github.com/MercuryWorkshop/scramjet" target="_blank">GitHub repository</a></li>
                                </ul>
                            </div>
                        </div>
                        <br>
                        <button id="reload" class="primary">Reload</button>
                    </div>
                    <p id="version-wrapper"><i>Scramjet v<span id="version"></span> (build <span id="build"></span>)</i></p>
                    <script src="${"data:application/javascript,"+encodeURIComponent(o)}"></script>
                </body>
            </html>
        `}(String(e),r),{status:500,headers:o})}(Object.entries(r).map(([e,t])=>`${e.charAt(0).toUpperCase()+e.slice(1)}: ${t}`).join("\n\n"),c(e.url))}}async function R(e,t,r,o,s,n,i){let a;let c=y(o.rawHeaders,k(e)),l=c["set-cookie"]||[];for(let t in l)n&&n.postMessage({scramjet$type:"cookie",cookie:t,url:e.href});for(let t in await s.setCookies(l instanceof Array?l:[l],e),c)Array.isArray(c[t])&&(c[t]=c[t][0]);if(o.body&&(a=await S(o,k(e),r,t,s)),["document","iframe"].includes(r)){let e=c["content-disposition"];if(!/\s*?((inline|attachment);\s*?)filename=/i.test(e)){let t=/^\s*?attachment/i.test(e)?"attachment":"inline",[r]=new URL(o.finalURL).pathname.split("/").slice(-1);c["content-disposition"]=`${t}; filename=${JSON.stringify(r)}`}}"text/event-stream"===c.accept&&(c["content-type"]="text/event-stream"),delete c["permissions-policy"],crossOriginIsolated&&["document","iframe","worker","sharedworker","style","script"].includes(r)&&(c["Cross-Origin-Embedder-Policy"]="require-corp",c["Cross-Origin-Opener-Policy"]="same-origin");let d=new C(a,c,o.status,o.statusText,r,e,o,n);return i.dispatchEvent(d),new Response(d.responseBody,{headers:d.responseHeaders,status:d.status,statusText:d.statusText})}async function S(e,t,r,o,s){switch(r){case"iframe":case"document":if(e.headers.get("content-type")?.startsWith("text/html"))return p(await e.text(),s,t,!0);return e.body;case"script":return g(await e.arrayBuffer(),e.finalURL,t);case"style":return u(await e.text(),t);case"sharedworker":case"worker":return b(await e.arrayBuffer(),o,e.finalURL,t);default:return e.body}}t.config;class C extends Event{responseBody;responseHeaders;status;statusText;destination;url;rawResponse;client;constructor(e,t,r,o,s,n,i,a){super("handleResponse"),this.responseBody=e,this.responseHeaders=t,this.status=r,this.statusText=o,this.destination=s,this.url=n,this.rawResponse=i,this.client=a}}class $ extends Event{url;body;method;destination;client;requestHeaders;constructor(e,t,r,o,s,n){super("request"),this.url=e,this.body=t,this.method=r,this.destination=o,this.client=s,this.requestHeaders=n}response}var j=r(1762).Z;class E extends EventTarget{client;config;syncPool={};synctoken=0;cookieStore=new t.shared.CookieStore;serviceWorkers=[];constructor(){super(),this.client=new t.shared.util.BareClient;let r=indexedDB.open("$scramjet",1);r.onsuccess=()=>{let e=r.result.transaction("cookies","readonly").objectStore("cookies").get("cookies");e.onsuccess=()=>{e.result&&(this.cookieStore.load(e.result),j.log("Loaded cookies from IDB!"))}},addEventListener("message",async({data:t})=>{if("scramjet$type"in t){if("registerServiceWorker"===t.scramjet$type){this.serviceWorkers.push(new e(t.port,t.origin));return}"cookie"===t.scramjet$type&&(this.cookieStore.setCookies([t.cookie],new URL(t.url)),r.result.transaction("cookies","readwrite").objectStore("cookies").put(JSON.parse(this.cookieStore.dump()),"cookies"))}})}async loadConfig(){if(this.config)return;let e=indexedDB.open("$scramjet",1);return new Promise((r,s)=>{e.onsuccess=async()=>{let n=e.result.transaction("config","readonly").objectStore("config").get("config");n.onsuccess=()=>{this.config=n.result,t.config=n.result,t.codec.encode=o("url",t.config.codec.encode),t.codec.decode=o("url",t.config.codec.decode),r()},n.onerror=()=>s(n.error)},e.onerror=()=>s(e.error)})}route({request:e}){return!!e.url.startsWith(location.origin+this.config.prefix)}async fetch({request:e,clientId:t}){let r=await self.clients.get(t);return x.call(this,e,r)}}self.ScramjetServiceWorker=E})()})();
//# sourceMappingURL=scramjet.worker.js.map