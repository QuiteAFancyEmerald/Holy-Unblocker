var alloy_data = document.querySelector('#_alloy_data');

var url = alloy_data.getAttribute('url');

var prefix = alloy_data.getAttribute('prefix');

url = new URL(atob(url))

rewrite_url = (str) => {
    proxied_url = '';
    if (str.startsWith(window.location.origin + '/') && !str.startsWith(window.location.origin + prefix)) {
        str =  '/' + str.split('/').splice(3).join('/');
    }
    if (str.startsWith('//')) {
        str = 'http:' + str;
    } else if (str.startsWith('/') && !str.startsWith(prefix)) {
        str = url.origin + str
    }
    if (str.startsWith('https://') || str.startsWith('http://')) {
         path = "/" + str.split('/').splice(3).join('/');
         origin = btoa(str.split('/').splice(0, 3).join('/'));
         return proxied_url = prefix + origin + path 
    } else {
       proxied_url = str;
    }
    return  proxied_url;
  } 
  

let fetch_rewrite = window.fetch;  window.fetch = function(url, options) {
    url = rewrite_url(url);
    return fetch_rewrite.apply(this, arguments);
}

let xml_rewrite = window.XMLHttpRequest.prototype.open;window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
       url = rewrite_url(url);
       return xml_rewrite.apply(this, arguments);
    }
     
let createelement_rewrite = document.createElement; document.createElement = function(tag) {
    var element = createelement_rewrite.call(document, tag);
    if (tag.toLowerCase() === 'script' || tag.toLowerCase() === 'iframe' || tag.toLowerCase() === 'embed') {
        Object.defineProperty(element.__proto__, 'src', {
            set: function(value) {
                value = rewrite_url(value)
                element.setAttribute('src', value)
            }
        }); 
    } else if (tag.toLowerCase() === 'link') {
        Object.defineProperty(element.__proto__, 'href', {
            set: function(value) {
                value = rewrite_url(value)
                element.setAttribute('href', value)
            }
        }); 
    } else if (tag.toLowerCase() === 'form') {
        Object.defineProperty(element.__proto__, 'action', {
            set: function(value) {
                value = rewrite_url(value)
                element.setAttribute('action', value)
            }
        }); 
    }
    return element;
}

let setattribute_rewrite = window.Element.prototype.setAttribute; window.Element.prototype.setAttribute = function(attribute, href) {
    if (attribute == ('src') || attribute == ('href') || attribute == ('action')) {
        href = rewrite_url(href)
    } else href = href;
    return setattribute_rewrite.apply(this, arguments)
 } 

var previousState = window.history.state;
setInterval(function() {
       if (!window.location.pathname.startsWith(`${prefix}${btoa(url.origin)}/`)) {
        history.replaceState('', '', `${prefix}${btoa(url.origin)}/${window.location.href.split('/').splice(3).join('/')}`);
    }
}, 0.1);