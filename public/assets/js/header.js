/*Title & Icon Presets*/
let titles = icons = [];

addEventListener('DOMContentLoaded', p => {
    p = $('csel');
    setPreferences();
    titles.forEach((e, i) => p.innerHTML += i ? `<img title="${e}" src="${icons[i]}">` : '<img title=(Blank) src=./img/x.png>');

    /*Title Submit*/
    (i => i.onsubmit = e => e.preventDefault() || setTitle(i.firstChild.value || '&rlm;&lrm;'))($('titleform'));

    /*Icon Submit*/
    (i => i.onsubmit = e => e.preventDefault() || setIcon(i.firstChild.value || 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAA'))($('iconform'));

    /*Settings Submit*/
    p.onclick = (e, s) => (s = Array.from(p.children).indexOf(e.target)) + 1 && setTitle(titles[s], setIcon(icons[s]));

    /*Settings Menu Event*/
    (i => i.onclick = e => { onbeforeunload = e => { if (i.checked) return e.returnValue = 'Error Tab Cloak' } })($('csel'));

    /*Fullscreen Feature Addition*/
    //$('fullscreen').onclick=e=>e.preventDefault()||$('theframe').requestFullscreen()
}, 0);

/*Title and Icon Cookies*/
setPreferences = (e, i, a) => { e = 'HBTitle', i = 'HBIcon', a = [] + void[], readCookie(e) == a || pageTitle(readCookie(e));
    readCookie(i) == a || pageIcon(readCookie(i)) };

/*Set Secure Cookie*/
(d => { d.setMonth(d.getMonth() + 12);
    setCookie = (n, v) => { document.cookie = n + `=${encodeURIComponent(v)};expires=${d.toUTCString()};SameSite=None;Secure` } })(new Date());

/*Read Cookie*/
readCookie = n => { try { return decodeURIComponent(document.cookie.split('; ').filter(e => e.startsWith(n + '='))[0].slice(n.length + 1)) } catch { return [] } };

/*Set Title & Icon from Input Value*/
setTitle = v => pageTitle(v) || setCookie('HBTitle', v);
setIcon = v => pageIcon(v) || setCookie('HBIcon', v);

/* Title & Icon Attach*/
pageTitle = v => { document.title = v; try { parent.document.title = v } catch (e) { console.log(e) } };
pageIcon = (v, l, e) => { e = 'link[rel*=icon]', document.head.appendChild(((l = document.querySelector(e) || document.createElement('link')).rel = 'icon', l.href = v, l)); try { parent.document.head.appendChild(((l = parent.document.querySelector(e) || document.createElement('link')).rel = 'icon', l.href = v, l)) } catch (e) { console.log(e) } };

/* Tab Cloak*/
autoChange = (e, r) => { $('csel').checked ? pageTitle(titles[e = (r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a)(1, 5)], pageIcon(icons[e]), setTimeout(autoChange, r(1e4, 6e4))) : setPreferences() }