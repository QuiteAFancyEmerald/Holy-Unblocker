/**
 * jQuery-Plugin "preloadCssImages"
 * by Scott Jehl, scott@filamentgroup.com
 * http://www.filamentgroup.com
 * reference article: http://www.filamentgroup.com/lab/update_automatically_preload_images_from_css_with_jquery/
 * demo page: http://www.filamentgroup.com/examples/preloadImages/index_v2.php
 * 
 * Copyright (c) 2008 Filament Group, Inc
 * Dual licensed under the MIT (filamentgroup.com/examples/mit-license.txt) and GPL (filamentgroup.com/examples/gpl-license.txt) licenses.
 *
 * Version: 5.0, 10.31.2008
 * Changelog:
 * 	02.20.2008 initial Version 1.0
 *    06.04.2008 Version 2.0 : removed need for any passed arguments. Images load from any and all directories.
 *    06.21.2008 Version 3.0 : Added options for loading status. Fixed IE abs image path bug (thanks Sam Pohlenz).
 *    07.24.2008 Version 4.0 : Added support for @imported CSS (credit: http://marcarea.com/). Fixed support in Opera as well. 
 *    10.31.2008 Version: 5.0 : Many feature and performance enhancements from trixta
 * --------------------------------------------------------------------
 */jQuery.preloadCssImages=function(e){function o(){clearTimeout(s);if(r&&r.length&&r[n]){n++;if(e.statusTextEl){var t=r[n]?"Now Loading: <span>"+r[n].split("/")[r[n].split("/").length-1]:"Loading complete";jQuery(e.statusTextEl).html('<span class="numLoaded">'+n+'</span> of <span class="numTotal">'+r.length+'</span> loaded (<span class="percentLoaded">'+(n/r.length*100).toFixed(0)+'%</span>) <span class="currentImg">'+t+"</span></span>")}if(e.statusBarEl){var i=jQuery(e.statusBarEl).width();jQuery(e.statusBarEl).css("background-position",-(i-(i*n/r.length).toFixed(0))+"px 50%");n===r.length&&$("#black").animate({opacity:0},500,function(){$(this).remove()})}u()}}function u(){if(r&&r.length&&r[n]){var t=new Image;t.src=r[n];t.complete?o():jQuery(t).bind("error load onreadystatechange",o);s=setTimeout(o,e.errorDelay)}}function a(t,n){var s=!1,o=[],f=[],l,c=t.length;while(c--){var h="";if(n&&n[c])l=n[c];else{var p=t[c].href?t[c].href:"window.location.href",d=p.split("/");d.pop();l=d.join("/");l&&(l+="/")}var v=!1;try{t[c].cssRules&&(v=!0)}catch(m){var g=m}if(!v)continue;if(t[c].cssRules||t[c].rules){i=t[c].cssRules?t[c].cssRules:t[c].rules;var y=i.length;while(y--)if(i[y].style&&i[y].style.cssText){var b=i[y].style.cssText;b.toLowerCase().indexOf("url")!=-1&&(h+=b)}else if(i[y].styleSheet){o.push(i[y].styleSheet);s=!0}}var w=h.match(/[^\("]+\.(gif|jpg|jpeg|png)/g);if(w){var E=w.length;while(E--){var S=w[E].charAt(0)=="/"||w[E].match("://")?w[E]:l+w[E];jQuery.inArray(S,r)==-1&&r.push(S)}}if(!s&&t[c].imports&&t[c].imports.length)for(var x=0,T=t[c].imports.length;x<T;x++){var N=t[c].imports[x].href;N=N.split("/");N.pop();N=N.join("/");N&&(N+="/");var C=N.charAt(0)=="/"||N.match("://")?N:l+N;f.push(C);o.push(t[c].imports[x])}}if(o.length){a(o,f);return!1}var k=e.simultaneousCacheLoading;while(k--)setTimeout(u,k)}e=jQuery.extend({statusTextEl:null,statusBarEl:null,errorDelay:999,simultaneousCacheLoading:2},e);var t=[],n=0,r=[],i,s;a(document.styleSheets);return r};