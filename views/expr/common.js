function tryGetElement(id) {
    return document.getElementById(id) || {};
}

function getDomain() {
	return document.domain.replace("www.", "");
}

function goFrame(url) {
	localStorage.setItem("huframesrc", url);
	window.location.href = "?s";
}

function goToUrl(url, stealth) {
	if (stealth) {
		goFrame(url);
	} else {
		window.location.href = url;
	}
}

/* To use:
 * goProx.proxy(url-string, stealth-boolean-optional)
 *
 * Examples:
 * goProx.alloy("https://google.com")
 * goProx.womginx("discord.com", true)
*/

goProx = {
	alloy: function(url, stealth) {
		document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
		goToUrl("https://" + getDomain() + "/fetch/" + btoa(url.substring(0, 4) == "http" ? url : "https://" + url), stealth);
	},
	womginx: function(url, stealth) {
		document.cookie = 'wgauth=yes; expires=' + (Date.now() + 259200) + '; SameSite=None; domain=.' + getDomain() + '; path=/; Secure;';
		goToUrl("https://a." + getDomain() + "/go/" + url, stealth);
	},
	sysya: function(url, stealth) {
		document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
		goToUrl("https://c." + getDomain() + "/gateway?url=" + btoa(url) + "&route=sp", stealth);
	},
	pydodge: function(url, stealth) {
		document.cookie = 'oldsmobile=1; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
		goToUrl("https://c." + getDomain() + "/gateway?url=" + btoa(url) + "&route=vi", stealth);
	}
};

// Chatbox
function goToChatbox(stealth) {
	document.cookie = 'oldsmobile=badcar; expires=' + (Date.now() + 259200) + '; SameSite=Lax; domain=.' + getDomain() + '; path=/; Secure;';
	goToUrl("https://c." + getDomain() + "/app", stealth);
}
