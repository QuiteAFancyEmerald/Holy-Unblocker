(()=>{"use strict";class e{handle;origin;syncToken;promises;messageChannel;connected;constructor(e,t){this.handle=e,this.origin=t,this.syncToken=0,this.promises={},this.messageChannel=new MessageChannel,this.connected=!1,this.messageChannel.port1.addEventListener("message",e=>{"scramjet$type"in e.data&&("init"===e.data.scramjet$type?this.connected=!0:this.handleMessage(e.data))}),this.messageChannel.port1.start(),this.handle.postMessage({scramjet$type:"init",scramjet$port:this.messageChannel.port2},[this.messageChannel.port2])}handleMessage(e){let t=this.promises[e.scramjet$token];t&&(t(e),delete this.promises[e.scramjet$token])}async fetch(e){let t=this.syncToken++,r={scramjet$type:"fetch",scramjet$token:t,scramjet$request:{url:e.url,body:e.body,headers:Array.from(e.headers.entries()),method:e.method,mode:e.mode,destinitation:e.destination}},s=e.body?[e.body]:[];this.handle.postMessage(r,s);let{scramjet$response:i}=await new Promise(e=>{this.promises[t]=e});return!!i&&new Response(i.body,{headers:i.headers,status:i.status,statusText:i.statusText})}}"$scramjet"in self||(self.$scramjet={version:{build:"4821fed",version:"1.0.2-dev"},codec:{},flagEnabled:function(e,r){let s=t.config.flags[e];for(let s in t.config.siteFlags){let i=t.config.siteFlags[s];if(new RegExp(s).test(r.href)&&e in i)return i[e]}return s}});let t=self.$scramjet,r=Function,{util:{BareClient:s,ScramjetHeaders:i,BareMuxConnection:o},url:{rewriteUrl:n,unrewriteUrl:a,rewriteBlob:c,unrewriteBlob:l},rewrite:{rewriteCss:d,unrewriteCss:h,rewriteHtml:u,unrewriteHtml:p,rewriteSrcset:m,rewriteJs:f,rewriteHeaders:g,rewriteWorkers:y,htmlRules:b},CookieStore:w}=t.shared;function v(e){return{origin:e,base:e}}async function x(e,r){let s=new URLSearchParams(new URL(e.url).search);if(s.has("url"))return Response.redirect(n(s.get("url"),v(new URL(s.get("url")))));try{let o=new URL(e.url),n="";if(o.searchParams.has("type")&&(n=o.searchParams.get("type"),o.searchParams.delete("type")),o.searchParams.has("dest")&&o.searchParams.delete("dest"),o.pathname.startsWith(this.config.prefix+"blob:")||o.pathname.startsWith(this.config.prefix+"data:")){let t,s=o.pathname.substring(this.config.prefix.length);s.startsWith("blob:")&&(s=l(s));let i=await fetch(s,{}),c=s.startsWith("blob:")?s:"(data url)";i.finalURL=c,i.body&&(t=await R(i,r?{base:new URL(new URL(r.url).origin),origin:new URL(new URL(r.url).origin)}:v(new URL(a(e.referrer))),e.destination,n,this.cookieStore));let d=Object.fromEntries(i.headers.entries());return crossOriginIsolated&&(d["Cross-Origin-Opener-Policy"]="same-origin",d["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(t,{status:i.status,statusText:i.statusText,headers:d})}let c=new URL(a(o)),d=this.serviceWorkers.find(e=>e.origin===c.origin);if(d&&d.connected&&"swruntime"!==s.get("from")){let t=await d.fetch(e);if(t)return t}if(c.origin==new URL(e.url).origin)throw Error("attempted to fetch from same origin - this means the site has obtained a reference to the real origin, aborting");let h=new i;for(let[t,r]of e.headers.entries())h.set(t,r);if(r&&new URL(r.url).pathname.startsWith(t.config.prefix)){let e=new URL(a(r.url));e.toString().includes("youtube.com")||(h.set("Referer",e.toString()),h.set("Origin",e.origin?`${e.protocol}//${e.host}`:"null"))}let u=this.cookieStore.getCookies(c,!1);u.length&&h.set("Cookie",u),h.set("Sec-Fetch-Dest",e.destination),h.set("Sec-Fetch-Site","same-origin"),h.set("Sec-Fetch-Mode","cors"===e.mode?e.mode:"same-origin");let p=new S(c,e.body,e.method,e.destination,r,h.headers);this.dispatchEvent(p);let m=p.response||await this.client.fetch(p.url,{method:p.method,body:p.body,headers:p.requestHeaders,credentials:"omit",mode:"cors"===e.mode?e.mode:"same-origin",cache:e.cache,redirect:"manual",duplex:"half"});return await k(c,n,e.destination,m,this.cookieStore,r,this)}catch(s){let r={message:s.message,url:e.url,destination:e.destination,timestamp:new Date().toISOString()};if(s.stack&&(r.stack=s.stack),console.error("ERROR FROM SERVICE WORKER FETCH: ",r),!["document","iframe"].includes(e.destination))return new Response(void 0,{status:500});return function(e,r){let s={"content-type":"text/html"};return crossOriginIsolated&&(s["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(function(e,r){let s=`
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
                    <script src="${"data:application/javascript,"+encodeURIComponent(s)}"></script>
                </body>
            </html>
        `}(String(e),r),{status:500,headers:s})}(Object.entries(r).map(([e,t])=>`${e.charAt(0).toUpperCase()+e.slice(1)}: ${t}`).join("\n\n"),a(e.url))}}async function k(e,t,r,s,i,o,n){let a;let c=g(s.rawHeaders,v(e)),l=c["set-cookie"]||[];for(let t in l)o&&o.postMessage({scramjet$type:"cookie",cookie:t,url:e.href});for(let t in await i.setCookies(l instanceof Array?l:[l],e),c)Array.isArray(c[t])&&(c[t]=c[t][0]);if(s.body&&(a=await R(s,v(e),r,t,i)),["document","iframe"].includes(r)){let e=c["content-disposition"];if(!/\s*?((inline|attachment);\s*?)filename=/i.test(e)){let t=/^\s*?attachment/i.test(e)?"attachment":"inline",[r]=new URL(s.finalURL).pathname.split("/").slice(-1);c["content-disposition"]=`${t}; filename=${JSON.stringify(r)}`}}"text/event-stream"===c.accept&&(c["content-type"]="text/event-stream"),delete c["permissions-policy"],crossOriginIsolated&&["document","iframe","worker","sharedworker","style","script"].includes(r)&&(c["Cross-Origin-Embedder-Policy"]="require-corp",c["Cross-Origin-Opener-Policy"]="same-origin");let d=new C(a,c,s.status,s.statusText,r,e,s,o);return n.dispatchEvent(d),new Response(d.responseBody,{headers:d.responseHeaders,status:d.status,statusText:d.statusText})}async function R(e,t,r,s,i){switch(r){case"iframe":case"document":if(e.headers.get("content-type")?.startsWith("text/html"))return u(await e.text(),i,t,!0);return e.body;case"script":return f(await e.arrayBuffer(),e.finalURL,t,"module"===s);case"style":return d(await e.text(),t);case"sharedworker":case"worker":return y(await e.arrayBuffer(),s,e.finalURL,t);default:return e.body}}t.config;class C extends Event{responseBody;responseHeaders;status;statusText;destination;url;rawResponse;client;constructor(e,t,r,s,i,o,n,a){super("handleResponse"),this.responseBody=e,this.responseHeaders=t,this.status=r,this.statusText=s,this.destination=i,this.url=o,this.rawResponse=n,this.client=a}}class S extends Event{url;body;method;destination;client;requestHeaders;constructor(e,t,r,s,i,o){super("request"),this.url=e,this.body=t,this.method=r,this.destination=s,this.client=i,this.requestHeaders=o}response}class j extends EventTarget{client;config;syncPool={};synctoken=0;cookieStore=new t.shared.CookieStore;serviceWorkers=[];constructor(){super(),this.client=new t.shared.util.BareClient;let r=indexedDB.open("$scramjet",1);r.onsuccess=()=>{let e=r.result.transaction("cookies","readonly").objectStore("cookies").get("cookies");e.onsuccess=()=>{e.result&&this.cookieStore.load(e.result)}},addEventListener("message",async({data:t})=>{if("scramjet$type"in t){if("registerServiceWorker"===t.scramjet$type){this.serviceWorkers.push(new e(t.port,t.origin));return}"cookie"===t.scramjet$type&&(this.cookieStore.setCookies([t.cookie],new URL(t.url)),r.result.transaction("cookies","readwrite").objectStore("cookies").put(JSON.parse(this.cookieStore.dump()),"cookies")),"loadConfig"===t.scramjet$type&&(this.config=t.config)}})}async loadConfig(){if(this.config)return;let e=indexedDB.open("$scramjet",1);return new Promise((s,i)=>{e.onsuccess=async()=>{let o=e.result.transaction("config","readonly").objectStore("config").get("config");o.onsuccess=()=>{this.config=o.result,t.config=o.result,t.codec.encode=r("url",t.config.codec.encode),t.codec.decode=r("url",t.config.codec.decode),s()},o.onerror=()=>i(o.error)},e.onerror=()=>i(e.error)})}route({request:e}){return!!e.url.startsWith(location.origin+this.config.prefix)}async fetch({request:e,clientId:t}){let r=await self.clients.get(t);return x.call(this,e,r)}}self.ScramjetServiceWorker=j})();
//# sourceMappingURL=scramjet.worker.js.map