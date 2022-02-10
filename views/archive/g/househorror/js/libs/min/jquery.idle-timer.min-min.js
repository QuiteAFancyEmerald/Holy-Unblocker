/*!
 * jQuery idleTimer plugin
 * version 0.9.100511
 * by Paul Irish.
 *   http://github.com/paulirish/yui-misc/tree/
 * MIT license

 * adapted from YUI idle timer by nzakas:
 *   http://github.com/nzakas/yui-misc/
*/(function(e){e.idleTimer=function(t,n,r){r=e.extend({startImmediately:!0,idle:!1,enabled:!0,timeout:3e4,events:"mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove"},r);n=n||document;var i=function(t){typeof t=="number"&&(t=undefined);var s=e.data(t||n,"idleTimerObj");s.idle=!s.idle;var o=+(new Date)-s.olddate;s.olddate=+(new Date);if(s.idle&&o<r.timeout){s.idle=!1;clearTimeout(e.idleTimer.tId);r.enabled&&(e.idleTimer.tId=setTimeout(i,r.timeout));return}var u=jQuery.Event(e.data(n,"idleTimer",s.idle?"idle":"active")+".idleTimer");e(n).trigger(u)},s=function(t){var n=e.data(t,"idleTimerObj")||{};n.enabled=!1;clearTimeout(n.tId);e(t).off(".idleTimer")},o=function(){var t=e.data(this,"idleTimerObj");clearTimeout(t.tId);if(t.enabled){t.idle&&i(this);t.tId=setTimeout(i,t.timeout)}},u=e.data(n,"idleTimerObj")||{};u.olddate=u.olddate||+(new Date);if(typeof t=="number")r.timeout=t;else{if(t==="destroy"){s(n);return this}if(t==="getElapsedTime")return+(new Date)-u.olddate}e(n).on(e.trim((r.events+" ").split(" ").join(".idleTimer ")),o);u.idle=r.idle;u.enabled=r.enabled;u.timeout=r.timeout;r.startImmediately&&(u.tId=setTimeout(i,u.timeout));e.data(n,"idleTimer","active");e.data(n,"idleTimerObj",u)};e.fn.idleTimer=function(t,n){n||(n={});this[0]&&e.idleTimer(t,this[0],n);return this}})(jQuery);