/* -----------------------------------------------
/* Authors: YÖCTDÖNALD'S and OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* Tab Cloak - Script
/* v2.0.0
/* ----------------------------------------------- */

/*Title & Icon Presets*/
let titles=icons=[];

(($,_)=>{

addEventListener('DOMContentLoaded',p=>{titles.forEach((e,i)=>p.innerHTML+=i?`<img title="${e}" src="${icons[i]}">`:'<img title=(Blank) src=./img/x.png>',setPreferences(p=$('csel')));

/*Submit Title & Icon*/
(i=>i.onsubmit=e=>e.preventDefault()||setTitle(i.firstChild.value||'&rlm;&lrm;'))($('titleform'));
(i=>i.onsubmit=e=>e.preventDefault()||setIcon(i.firstChild.value||'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAA'))($('iconform'));

/*Submit Settings*/
p.onclick=(e,s)=>(s=[...p.children].indexOf(e.target))+1&&setTitle(titles[s],setIcon(icons[s]));

/*Settings Menu*/
(i=>i.onclick=e=>{onbeforeunload=e=>{if(i.checked)return e.returnValue='Error Tab Cloak'}})($('csel'));

/*Unimplemented Fullscreen*/
//$('fullscreen').onclick=e=>e.preventDefault()||$('theframe').requestFullscreen()
},0);

/*Cookie Storage*/
(d=>{d.setMonth(d.getMonth()+12);setCookie=(n,v)=>{document.cookie=n+`=${([]+v).replace(/.|\n/g,p=>{try{p=/[\w\d-.!~*'()]/.test(p)?'%'+p.charCodeAt().toString(16).toUpperCase():encodeURIComponent(p)}catch{}return p})};expires=${d.toUTCString()};SameSite=None;Secure`}})(new Date());

/*Read Cookie*/
_.readCookie=n=>(document.cookie.split('; ').filter(e=>e.startsWith(n+'=')).join([])).slice(([]+n).length+1).replace(/(%[A-z\d]{2})+/g,decodeURIComponent);

/*Set Title & Icon*/
_.pageTitle=v=>{document.title=v;try{parent.document.title=v}catch(e){console.log(e)}};
_.pageIcon=(v,l,e)=>{document.head.appendChild(((l=document.querySelector(e='link[rel*=icon]')||document.createElement('link')).rel='icon',l.href=v,l));try{parent.document.head.appendChild(((l=parent.document.querySelector(e)||document.createElement('link')).rel='icon',l.href=v,l))}catch(e){console.log(e)}};

/*Store Title & Icon*/
_.setTitle=v=>pageTitle(v)||setCookie('HBTitle',v);
_.setIcon=v=>pageIcon(v)||setCookie('HBIcon',v);

/*Set Stored Title & Icon*/
_.setPreferences=(e,i)=>{readCookie(e='HBTitle')&&pageTitle(readCookie(e));readCookie(i='HBIcon')&&pageIcon(readCookie(i))};

/*Sift Tabs*/
_.autoChange=(e,r)=>{$('csel').checked?pageTitle(titles[e=(r=(a,b)=>Math.floor(Math.random()*(b-a+1))+a)(1,5)],pageIcon(icons[e]),setTimeout(autoChange,r(1e4,6e4))):setPreferences()}

})($=>document.getElementById($)||[],self)