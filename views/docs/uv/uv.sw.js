(()=>{var h=self.Ultraviolet,j=["cross-origin-embedder-policy","cross-origin-opener-policy","cross-origin-resource-policy","content-security-policy","content-security-policy-report-only","expect-ct","feature-policy","origin-isolation","strict-transport-security","upgrade-insecure-requests","x-content-type-options","x-download-options","x-frame-options","x-permitted-cross-domain-policies","x-powered-by","x-xss-protection"],C=["GET","HEAD"],g=class extends h.EventEmitter{constructor(e=self["_F4E19B#5+x1J(4x_.S[]=2"]){super(),e.prefix||(e.prefix="/service/"),this.config=e,this.bareClient=new h.BareClient}route({request:e}){return!!e.url.startsWith(location.origin+this.config.prefix)}async fetch({request:e}){let s;try{if(!e.url.startsWith(location.origin+this.config.prefix))return await fetch(e);let t=new h(this.config);typeof this.config.construct=="function"&&this.config.construct(t,"service");let w=await t.cookie.db();t.meta.origin=location.origin,t.meta.base=t.meta.url=new URL(t.sourceUrl(e.url));let i=new y(e,t,C.includes(e.method.toUpperCase())?null:await e.blob());if(t.meta.url.protocol==="blob:"&&(i.blob=!0,i.base=i.url=new URL(i.url.pathname)),e.referrer&&e.referrer.startsWith(location.origin)){let r=new URL(t.sourceUrl(e.referrer));(i.headers.origin||t.meta.url.origin!==r.origin&&e.mode==="cors")&&(i.headers.origin=r.origin),i.headers.referer=r.href}let u=await t.cookie.getCookies(w)||[],v=t.cookie.serialize(u,t.meta,!1);i.headers["user-agent"]=navigator.userAgent,v&&(i.headers.cookie=v);let f=new p(i,null,null);if(this.emit("request",f),f.intercepted)return f.returnValue;s=i.blob?"blob:"+location.origin+i.url.pathname:i.url;let c=await this.bareClient.fetch(s,{headers:i.headers,method:i.method,body:i.body,credentials:i.credentials,mode:i.mode,cache:i.cache,redirect:i.redirect}),n=new x(i,c),l=new p(n,null,null);if(this.emit("beforemod",l),l.intercepted)return l.returnValue;for(let r of j)n.headers[r]&&delete n.headers[r];if(n.headers.location&&(n.headers.location=t.rewriteUrl(n.headers.location)),["document","iframe"].includes(e.destination)){let r=n.getHeader("content-disposition");if(!/\s*?((inline|attachment);\s*?)filename=/i.test(r)){let o=/^\s*?attachment/i.test(r)?"attachment":"inline",[b]=new URL(c.finalURL).pathname.split("/").slice(-1);n.headers["content-disposition"]=`${o}; filename=${JSON.stringify(b)}`}}if(n.headers["set-cookie"]&&(Promise.resolve(t.cookie.setCookies(n.headers["set-cookie"],w,t.meta)).then(()=>{self.clients.matchAll().then(function(r){r.forEach(function(o){o.postMessage({msg:"updateCookies",url:t.meta.url.href})})})}),delete n.headers["set-cookie"]),n.body)switch(e.destination){case"script":n.body=t.js.rewrite(await c.text());break;case"worker":{let r=[t.bundleScript,t.clientScript,t.configScript,t.handlerScript].map(o=>JSON.stringify(o)).join(",");n.body=`if (!self.__uv) {
                                ${t.createJsInject(t.cookie.serialize(u,t.meta,!0),e.referrer)}
                            importScripts(${r});
                            }
`,n.body+=t.js.rewrite(await c.text())}break;case"style":n.body=t.rewriteCSS(await c.text());break;case"iframe":case"document":if(n.getHeader("content-type")&&n.getHeader("content-type").startsWith("text/html")){let r=await c.text();if(Array.isArray(this.config.inject)){let o=r.indexOf("<head>"),b=r.indexOf("<HEAD>"),m=r.indexOf("<body>"),k=r.indexOf("<BODY>"),S=new URL(s),E=this.config.inject;for(let d of E)new RegExp(d.host).test(S.host)&&(d.injectTo==="head"?(o!==-1||b!==-1)&&(r=r.slice(0,o)+`${d.html}`+r.slice(o)):d.injectTo==="body"&&(m!==-1||k!==-1)&&(r=r.slice(0,m)+`${d.html}`+r.slice(m)))}n.body=t.rewriteHtml(r,{document:!0,injectHead:t.createHtmlInject(t.handlerScript,t.bundleScript,t.clientScript,t.configScript,t.cookie.serialize(u,t.meta,!0),e.referrer)})}break;default:break}return i.headers.accept==="text/event-stream"&&(n.headers["content-type"]="text/event-stream"),crossOriginIsolated&&(n.headers["Cross-Origin-Embedder-Policy"]="require-corp"),this.emit("response",l),l.intercepted?l.returnValue:new Response(n.body,{headers:n.headers,status:n.status,statusText:n.statusText})}catch(t){return["document","iframe"].includes(e.destination)?(console.error(t),O(t,s)):new Response(void 0,{status:500})}}static Ultraviolet=h};self.UVServiceWorker=g;var x=class{constructor(e,s){this.request=e,this.raw=s,this.ultraviolet=e.ultraviolet,this.headers={};for(let t in s.rawHeaders)this.headers[t.toLowerCase()]=s.rawHeaders[t];this.status=s.status,this.statusText=s.statusText,this.body=s.body}get url(){return this.request.url}get base(){return this.request.base}set base(e){this.request.base=e}getHeader(e){return Array.isArray(this.headers[e])?this.headers[e][0]:this.headers[e]}},y=class{constructor(e,s,t=null){this.ultraviolet=s,this.request=e,this.headers=Object.fromEntries(e.headers.entries()),this.method=e.method,this.body=t||null,this.cache=e.cache,this.redirect=e.redirect,this.credentials="omit",this.mode=e.mode==="cors"?e.mode:"same-origin",this.blob=!1}get url(){return this.ultraviolet.meta.url}set url(e){this.ultraviolet.meta.url=e}get base(){return this.ultraviolet.meta.base}set base(e){this.ultraviolet.meta.base=e}},p=class{#e;#t;constructor(e={},s=null,t=null){this.#e=!1,this.#t=null,this.data=e,this.target=s,this.that=t}get intercepted(){return this.#e}get returnValue(){return this.#t}respondWith(e){this.#t=e,this.#e=!0}};function U(a,e){let s=`
        errorTrace.value = ${JSON.stringify(a)};
        fetchedURL.textContent = ${JSON.stringify(e)};
        for (const node of document.querySelectorAll('#uvHostname')) node.textContent = ${JSON.stringify(location.hostname)};
        reload.addEventListener('click', () => location.reload());
        uvVersion.textContent = ${JSON.stringify("3.2.7")};
    `;return`<!doctype html>
<html>
  <head>
    <title>InvisiProxy LTS | Error</title>
    <meta itemprop="http-status" content="404" />
    <meta
      name="description"
      content="Get past internet censorship today! Enjoy safer, private internet access bypassing filters such as Securly or iboss. Supports Discord and more! :D"
    />
    <!--HEAD-CONTENT-->
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
        font-family: 'Figtree', sans-serif;
        font-optical-sizing: auto;
        background-image:
          radial-gradient(
            circle,
            rgba(131, 131, 131, 0.02) 1px,
            transparent 1px
          ),
          radial-gradient(
            circle,
            rgba(148, 148, 148, 0.02) 1px,
            transparent 1px
          );
        background-position:
          0 0,
          5px 5px;
        background-size: 10px 10px;
      }

      h1 {
        color: #ff5861;
        font-size: 64px;
        font-weight: 900;
        margin-top: 0.8%;
      }

      code {
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

      .container {
        max-width: 650px;
      }

      .list-group-item {
        background-color: #2e3440;
        color: #eceff4;
      }

      .list-group {
        border-radius: 18px;
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
    </style>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js"><\/script>
  </head>
  <body>
    <span style="display:none" data-fact="Textpad">Start writing your next masterpiece today with this powerful and user-friendly text editor. Happy writing!</span>
    <!--ANTI-EXFIL-->
    <div class="container-fluid text-center">
      <h1>Network Error</h1>
      <code>Failed to load: <b id="fetchedURL"></b></code>
      <br />
      <button id="reload">Refresh</button>
      <br /><br />
      <h5>
        <p>
          <textarea id="errorTrace" cols="40" rows="10" readonly>test</textarea>
        </p>
      </h5>
      <code class="uv-small"
        >Refresh the network service | Ultraviolet v<span
          id="uvVersion"
        ></span
        >.</code
      >
      <br /><br />
      <div class="container text-wrap">
        <ul class="list-group text-start">
          <li class="list-group-item">
             - Verifying you entered the correct address 
          </li>
          <li class="list-group-item">
             - Clearing your browser or site cache data via
            Ctrl+Shift+R and browser settings 
          </li>
          <li class="list-group-item">
             - In the case of website maintenance or updates, please
            wait for the issue to be resolved. 
          </li>
          <li class="list-group-item">
             - If the issue persists be sure to mention this in the
            Titanium Network Discord. 
          </li>
          <li class="list-group-item">
             - View the FAQ page for specific site compatibility
            issues. 
          </li>
        </ul>
      </div>
      <br />
      <p class="footer-spacing">
        <i>InvisiProxy LTS \xA9 2020-2025 | Made With Love </i
        ><i class="nf nf-fa-heart"></i>
      </p>
      <script src="{{src}}"><\/script>
    </div>
  </body>
</html>
`.replace("{{src}}","data:application/javascript,"+encodeURIComponent(s))}function O(a,e){let s={"content-type":"text/html"};return crossOriginIsolated&&(s["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(U(String(a),e),{status:500,headers:s})}})();
//# sourceMappingURL=uv.sw.js.map
