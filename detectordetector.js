/**
 * Web proxy detector detector script by OlyB
 * Last updated: 2024-10-30
 * Currently supports Securly and GoGuardian detection methods
 * Paste into browser console to use :)
 *
 * Securly detects using various query selectors and element content,
 * While GoGuardian primarly uses the page's visible text content as well as script/img source attributes, which it checks against a list of terms.
 * When detected, the script will log the matching selectors and/or terms.
 * 
 * https://gist.githubusercontent.com/BinBashBanana/a1fd7345e2d86e69d5a532f16cbdbdaa/raw/0844cc5ecb1ec888ddfa58b97871984d27088ea2/detectordetector.js
 */

// retrieved 2024-10-30
const securlyProxyData = [{"proxyName":"rammerHead","targetElements":[{"target":".chrome-tabs","content":null},{"target":".browser-tab-content","content":null}]},{"proxyName":"rammerHeadv2","targetElements":[{"target":"title","content":"Rammerhead Proxy"},{"target":"h1","content":"Rammerhead Proxy"}]},{"proxyName":"interstellar","targetElements":[{"target":".logo","content":"Interstellar"},{"target":"a[href='photography']","content":"Proxy"}]},{"proxyName":"hypertabs","targetElements":[{"target":".chrome-tab-title","content":"New Hypertab"},{"target":".chrome-tabs-content","content":null}]},{"proxyName":"hide_my_ass","targetElements":[{"target":".hma-top-logo","content":null},{"target":".hma-logo-link","content":null}]},{"proxyName":"taco","targetElements":[{"target":".black_text","content":"Ta‌co Pro‌xy"},{"target":"title","content":"Ta‌co Pr‌oxy"}]},{"proxyName":"croxy","targetElements":[{"target":"title[data-trans='yes']","content":"The Most Advanced Secure And Free Web Proxy | CroxyProxy"},{"target":"a[href='https://github.com/croxy-proxy-official/extension']","content":"manually"}]},{"proxyName":"electron","targetElements":[{"target":"title","content":"Electron"},{"target":"div#home p","content":"A student's best friend!"}]},{"proxyName":"holy_unblocker","targetElements":[{"target":"a[href='https://www.patreon.com/holyunblocker']","content":null},{"target":"a[href='https://github.com/titaniumnetwork-dev/Holy-Unblocker']","content":null}]},{"proxyName":"holy_unblockerv2","targetElements":[{"target":"input[class='_thinPadLeft_1s88o_120']","content":null},{"target":"h1","content":"Ending Internet Censorship."}]},{"proxyName":"nebula","targetElements":[{"target":"title","content":"Nebula"},{"target":"a[class='stamp']","content":" Nebula © Nebula Services 2022 "},{"target":"input[placeholder='Explore the web freely']","content":null}]},{"proxyName":"node_unblocker","targetElements":[{"target":"title","content":"Node Unblocker"},{"target":"a[href='https://github.com/nfriedly/node-unblocker']","content":"available on github"}]},{"proxyName":"shuttle","targetElements":[{"target":"title","content":"Shuttle"},{"target":"meta[content='shuttle, the fastest browser']","content":null},{"target":"a[href='https://github.com/shuttlenetwork/shuttle']","content":"Github"}]},{"proxyName":"site","targetElements":[{"target":"title","content":"siteproxy代理 - 通向墙外的世界"},{"target":"a[href='https://github.com/netptop/siteproxy']","content":null}]},{"proxyName":"ultraviolet","targetElements":[{"target":"title","content":"Genarcy"},{"target":".navbar-logo","content":"Genarcy"}]},{"proxyName":"incognito","targetElements":[{"target":"title","content":"Incognito"},{"target":"input[placeholder='Search the web']","content":null}]},{"proxyName":"aguse","targetElements":[{"target":"form[name='aguse_form']","content":null},{"target":"img[alt='aguse gateway']","content":null}]},{"proxyName":"beaver_unblocker","targetElements":[{"target":"title","content":"Beaver Unblocker"},{"target":".title","content":"Beaver Unblocker"}]},{"proxyName":"utopia","targetElements":[{"target":"title","content":"Utopia"},{"target":"meta[content='utopia, math, science, ela, social studies, school, study']","content":null}]},{"proxyName":"censor_dodge","targetElements":[{"target":"a[href='http://censordodge.com'][target='blank']","content":"Censor Dodge V1.83 BETA"},{"target":"title","content":"Censor Dodge 1.83 BETA","substringMatch":true}]},{"proxyName":"ludicrous","targetElements":[{"target":"h1.Home_main-title__WtTWV span:first-child","content":"Ludicrous"},{"target":"meta[content='Ludicrous | A School Site']","content":null}]},{"proxyName":"radar_cloud","targetElements":[{"target":"title","content":"Radar Cloud"},{"target":"meta[content='Radar Cloud']","content":null}]},{"proxyName":"surfskip","targetElements":[{"target":"meta[content='SurfSkip is the best web proxy and Web VPN , ensuring private and secure internet browsing. Unlock restricted content, play games, and visit your favorite sites seamlessly with our webproxy  Experience the freedom of SurfSkip, your go-to solution for online privacy.']","content":null},{"target":"title","content":"Surfskip | Free VPN Browser - Your Best Web Proxy"}]},{"proxyName":"Art Class","targetElements":[{"target":"a[href='https://github.com/art-class/v4']","content":"GitHub"},{"target":"a[href='https://discord.gg/tMaHQ2dyk5']","content":"Discord"},{"target":"title","content":"Art Class"}]},{"proxyName":"dodge_unblocker_v4","targetElements":[{"target":"a[href='https://github.com/dogenetwork/v4']","content":null},{"target":"a[class='title']","content":" Doge Unblocker"}]},{"proxyName":"phantom_games","targetElements":[{"target":"meta[content='Phantom Games, the BEST place to find fun unblocked games!'","content":null},{"target":"title","content":"Phantom Games"}]},{"proxyName":"tinf­0il","targetElements":[{"target":".heading > h1","content":"Tinf­0il"},{"target":"title","content":"Ti­nf0­il","substringMatch":true}]},{"proxyName":"asteroid","targetElements":[{"target":"meta[content='Math explained in easy language, plus puzzles, games, worksheets and an illustrated dictionary. For K-12 kids, teachers and parents.']","content":null},{"target":"title","content":"Inbox"}]},{"proxyName":"Equinox_v1","targetElements":[{"target":"input[placeholder='Search the web or enter a URL']","content":null},{"target":"title","content":"Equinox V1"}]},{"proxyName":"jordan_math_work","targetElements":[{"target":"meta[name='Jordansmathwork']","content":null},{"target":"title","content":"Jordan's Math Work - V6"}]},{"proxyName":"extreme_math","targetElements":[{"target":"meta[content='On ExtremeMath, you can join thousands of people worldwide on the most innovative and exquisite learning platform!']","content":null},{"target":"meta[content='ExtremeMath - The Simplest Form of Education']","content":null}]},{"proxyName":"kazwire","targetElements":[{"target":"meta[content='Play and browse for free now on Kazwire!']","content":null},{"target":"title","content":"Kazwire"}]},{"proxyName":"interstellar_v2","targetElements":[{"target":"input[placeholder='Search with Google or enter address']","content":null},{"target":".title","content":"Interstellar"},{"target":"title","content":"Home"}]},{"proxyName":"polaris","targetElements":[{"target":"meta[content='The professional unblocked gaming site.']","content":null},{"target":"title","content":"Polaris"}]},{"proxyName":"outred","targetElements":[{"target":".title","content":"OutRed"},{"target":"title","content":"OutRed","substringMatch":true}]},{"proxyName":"math_is_fun","targetElements":[{"target":"meta[content='Math explained in easy language, plus puzzles, games, worksheets and an illustrated dictionary. For K-12 kids, teachers and parents.']","content":null},{"target":"img[alt='Math is Fun']","content":null}]}];

// retrieved 2024-10-30
const goGuardianProxyKeywords = ["pr*xies","titaniumnetwork","d4fb685667e2629fa9fc5d88fa801800952a08d9","gxmes emulators","gxme hub","white spider","proxyium","womginx","noblocc","node unblocker","surfdoge.pro","oysterscoldtiny.com","highcpmgate.com","â© hop, inc","status.gointerstellar.app/","github.com/interstellarnetwork/interstellar","interstellarnetwork/interstellar","github.com/dogenetwork/v4","discord.gg/unblock","utopia, math, science, ela, social studies, school, study","x23azo.com","g_a_m***3s","utopia game","blog3101.mathematicstopvaz.online","play.geforcenow.com","holyunblocker","interstellarnetwork","equinox was created in 2023","home apps games","equinox v1.","82d50f63b4809b775ffdea9a75992354faa4d9e7","openresty/1.21.4.1","doge | v4","home ga mes ap ps ta bs","shadow browser","doge unblocker","inter stellar","hypertabs","holy unblocker","home games apps","rammerhead","uv.bundle.js","uv.config.js","uv.handler.js","js/cloak.js","register-uv.js","tab cloaker","proxy ultraviolet","ultraviolet proxy","dodge unblocker","discord ultraviolet","ultraviolet discord","about blank launcher","proxy vpn","proxy server","proxy network","proxy hub","proxies vpn","proxies server","proxies network","proxies hub","proxies games","games proxies","proxy game","game proxy","goguardian bypass","gg bypass","securly bypass","lightspeed bypass","bypass goguardian","bypass gg","bypass securly","bypass lightspeed","evade school censorship","stop school censorship","dogenetwork","doge network","duckhtml","duck html","titaniumnetwork","whitespider.dev","pr*xys","pr*xy","connecting to server...","https://www.googletagmanager.com/gtag/js?id=G-WKJQ5QHQTJ"];

function securlyFindProxy(t, n) {
	for (const e of n) {
		let n = !0;
		for (const o of e.targetElements) {
			const e = t.querySelector(o.target);
			let r;
			if (!e) {
				n = !1;
				break
			}
			if (!(r = o.content ? o && o.substringMatch ? e.textContent && e.textContent.includes(o.content) : e.textContent === o.content : !!e)) {
				n = !1;
				break
			}
		}
		if (n) return e
	}
}

function goGuardianPageMine(t, e, n) {
	"use strict";
	const r = ["a", "article", "audio", "button", "canvas", "caption", "dialog", "div", "embed", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "iframe", "img", "input", "label", "li", "main", "meta", "nav", "object", "option", "p", "script", "section", "select", "span", "table", "td", "textarea", "th", "title", "track", "video"];

	function i(t, e, n) {
		const r = [];
		for (let i = 0; i < t.length; i++) {
			const c = t[i];
			if (!e || a(c)) switch (n) {
				case "innerText":
					o(c, r);
					break;
				case "src":
					u(c, r);
					break;
				default:
					s(c, r, n)
			}
		}
		return r
	}

	function o(t, e) {
		const n = void 0 !== t.innerText ? t.innerText : t.textContent;
		if (!n) return;
		const r = f(n);
		r && function(t) {
			for (const e of t.childNodes)
				if (e.nodeType === Node.TEXT_NODE && e.nodeValue && !c.test(e.nodeValue)) return !0;
			return !1
		}(t) && e.push(r)
	}

	function u(t, e) {
		const n = t.src;
		n && 0 === n.lastIndexOf("http", 0) && e.push(n)
	}

	function s(t, e, n) {
		const r = f(t[n]);
		r && e.push(r)
	}

	function a(t) {
		return !!(t.offsetWidth || t.offsetHeight || t.getClientRects()
			.length)
	}

	const c = /^[\s\xa0]*$/,
		l = /[^0-9]/;

	function f(t) {
		return c.test(t) || !l.test(t) ? "" : function(t) {
				return t.replace(/[\s\xa0]+/g, " ")
					.replace(/^\s+|\s+$/g, "")
			}(t)
			.toLowerCase()
	}

	class PageMine {
		constructor() {
			const t = {};
			r.forEach(e => {
				t[e] = document.getElementsByTagName(e)
			}), this.a = i(t.a, !0, "innerText"), this.aCount = t.a.length, this.article = i(t.article, !0, "innerText"), this.articleCount = t.article.length, this.audioCount = t.audio.length, this.button = i(t.button, !0, "innerText"), this.buttonCount = t.button.length, this.canvas = i(t.canvas, !0, "innerText"), this.canvasCount = t.canvas.length, this.caption = i(t.caption, !0, "innerText"), this.captionCount = t.caption.length, this.dialog = i(t.dialog, !0, "innerText"), this.dialogCount = t.dialog.length, this.div = i(t.div, !0, "innerText"), this.divCount = t.div.length, this.embedCount = t.embed.length, this.footer = i(t.footer, !0, "innerText"), this.footerCount = t.footer.length, this.formCount = t.form.length, this.fullText = function() {
				if (window.location.href && window.location.href.startsWith("https://docs.google.com/document")) {
					const t = Array.from(document.querySelectorAll("svg g rect[aria-label]")),
						e = t.map(t => {
							const e = t.getAttribute("aria-label");
							return e && 0 !== e.length ? e : ""
						})
						.join("\n");
					if (0 !== e.length) return e
				}
				const t = document.documentElement;
				return t && a(t) ? f(t.innerText) : ""
			}(), this.h1 = i(t.h1, !0, "innerText"), this.h1Count = t.h1.length, this.h2 = i(t.h2, !0, "innerText"), this.h2Count = t.h2.length, this.h3 = i(t.h3, !0, "innerText"), this.h3Count = t.h3.length, this.h4 = i(t.h4, !0, "innerText"), this.h4Count = t.h4.length, this.h5 = i(t.h5, !0, "innerText"), this.h5Count = t.h5.length, this.h6 = i(t.h6, !0, "innerText"), this.h6Count = t.h6.length, this.header = i(t.header, !0, "innerText"), this.headerCount = t.header.length, this.iframeCount = t.iframe.length, this.imgAlt = i(t.img, !0, "alt"), this.imgCount = t.img.length, this.imgSrc = i(t.img, !0, "src"), this.inputCount = t.input.length, this.inputValue = i(t.input, !0, "value"), this.label = i(t.label, !0, "innerText"), this.labelCount = t.label.length, this.li = i(t.li, !0, "innerText"), this.liCount = t.li.length, this.main = i(t.main, !0, "innerText"), this.mainCount = t.main.length, this.metaContent = i(t.meta, !1, "content"), this.metaCount = t.meta.length, this.nav = i(t.nav, !0, "innerText"), this.navCount = t.nav.length, this.objectCount = t.object.length, this.option = i(t.option, !1, "innerText"), this.optionCount = t.option.length, this.p = i(t.p, !0, "innerText"), this.pCount = t.p.length, this.scriptSrc = i(t.script, !1, "src"), this.scriptCount = t.script.length, this.section = i(t.section, !0, "innerText"), this.sectionCount = t.section.length, this.selectCount = t.select.length, this.span = i(t.span, !0, "innerText"), this.spanCount = t.span.length, this.tableCount = t.table.length, this.td = i(t.td, !0, "innerText"), this.tdCount = t.td.length, this.textareaCount = t.textarea.length, this.textareaValue = i(t.textarea, !0, "value"), this.th = i(t.th, !0, "innerText"), this.thCount = t.th.length, this.title = i(t.title, !1, "innerText"), this.titleCount = t.title.length, this.trackCount = t.track.length, this.trackSrc = i(t.track, !0, "src"), this.videoCount = t.video.length
		}
	}

	return new PageMine();
}

function goGuardianJoinContentArrays(e) {
	if (e === null || typeof e != "object" || !("content" in e)) {
		return "";
	}
	let t = "";
	const n = e.content;
	for (let e in n) {
		if (Array.isArray(n[e])) {
			t += n[e].join(" ");
		}
	}
	return t;
}

function goGuardianFindProxy() {
	var page = goGuardianPageMine();
	var content = goGuardianJoinContentArrays({content: page});
	var match = [];
	for (var i = 0; i < goGuardianProxyKeywords.length; i++) {
		if (content.includes(goGuardianProxyKeywords[i])) {
			match.push(goGuardianProxyKeywords[i]);
		}
	}
	if (match.length) return match;
}

console.log("Securly detections:");
console.log(securlyFindProxy(document, securlyProxyData));

console.log("GoGuardian detections:");
console.log(goGuardianFindProxy());