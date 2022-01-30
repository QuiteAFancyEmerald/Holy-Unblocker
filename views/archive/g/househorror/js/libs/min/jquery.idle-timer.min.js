/*!
 * jQuery idleTimer plugin
 * version 0.9.100511
 * by Paul Irish.
 *   http://github.com/paulirish/yui-misc/tree/
 * MIT license

 * adapted from YUI idle timer by nzakas:
 *   http://github.com/nzakas/yui-misc/
*/
(function(a){a.idleTimer=function(c,g,f){f=a.extend({startImmediately:true,idle:false,enabled:true,timeout:30000,events:"mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove"},f);g=g||document;var b=function(l){if(typeof l==="number"){l=undefined}var k=a.data(l||g,"idleTimerObj");k.idle=!k.idle;var i=(+new Date())-k.olddate;k.olddate=+new Date();if(k.idle&&(i<f.timeout)){k.idle=false;clearTimeout(a.idleTimer.tId);if(f.enabled){a.idleTimer.tId=setTimeout(b,f.timeout)}return}var j=jQuery.Event(a.data(g,"idleTimer",k.idle?"idle":"active")+".idleTimer");a(g).trigger(j)},e=function(i){var j=a.data(i,"idleTimerObj")||{};j.enabled=false;clearTimeout(j.tId);a(i).off(".idleTimer")},d=function(){var i=a.data(this,"idleTimerObj");clearTimeout(i.tId);if(i.enabled){if(i.idle){b(this)}i.tId=setTimeout(b,i.timeout)}};var h=a.data(g,"idleTimerObj")||{};h.olddate=h.olddate||+new Date();if(typeof c==="number"){f.timeout=c}else{if(c==="destroy"){e(g);return this}else{if(c==="getElapsedTime"){return(+new Date())-h.olddate}}}a(g).on(a.trim((f.events+" ").split(" ").join(".idleTimer ")),d);h.idle=f.idle;h.enabled=f.enabled;h.timeout=f.timeout;if(f.startImmediately){h.tId=setTimeout(b,h.timeout)}a.data(g,"idleTimer","active");a.data(g,"idleTimerObj",h)};a.fn.idleTimer=function(b,c){if(!c){c={}}if(this[0]){a.idleTimer(b,this[0],c)}return this}})(jQuery);