var uauth = {};

uauth.url = "https://binbashbanana.github.io/webretro/uauth/"; // Must have cross-domain support!!!
uauth.origins = ["http://localhost:8000", "https://binbashbanana.github.io"];

uauth.frame = document.createElement("iframe");
uauth.frame.style.display = "none";

uauth.pickerOpen = false;
uauth.callback = function(data) {}

uauth.open = function(type, exts, callback) {
	if (!uauth.pickerOpen) {
		uauth.pickerOpen = true;
		uauth.callback = callback;
		uauth.frame.src = uauth.url + "?type=" + type + "&exts=" + exts.join(",");
		document.body.appendChild(uauth.frame);
	}
}

window.addEventListener("message", function(e) {
	if (uauth.origins.includes(e.origin) && e.data.webretro) {
		uauth.pickerOpen = false;
		uauth.frame.removeAttribute("src");
		document.body.removeChild(uauth.frame);
		uauth.callback(e.data.webretro);
	}
}, false);