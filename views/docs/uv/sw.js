(()=>{importScripts("/InvisiProxy/uv/uv.bundle.js");importScripts("/InvisiProxy/uv/uv.config.js");importScripts(self["_F4E19B#5+x1J(4x_.S[]=2"].sw||"/InvisiProxy/uv/uv.sw.js");var i=new UVServiceWorker;self.addEventListener("fetch",r=>{r.respondWith((async()=>i.route(r)?await i.fetch(r):await fetch(r.request))())});})();
//# sourceMappingURL=sw.js.map
