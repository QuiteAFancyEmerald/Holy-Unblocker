function redir(type) {
    if (type == "cd") {
        var burl = btoa(document.getElementById('url').value);
        if (burl == "") {
            document.getElementById("empty").setAttribute("style", "display:inline");
        } else {
            document.getElementById("special").setAttribute("src", "./algebra/equation.php?cdURL=" + burl);
            document.getElementById("magic").setAttribute("style", "display:block");
            document.getElementById("empty").setAttribute("style", "display:none");
        }
    } else if (type == "php") {
        var burl = document.getElementById('url').value;
        if (burl == "") {
            document.getElementById("empty").setAttribute("style", "display:inline");
        } else {
            document.getElementById("special").setAttribute("src", "/sci/?prou=" + burl);
            document.getElementById("magic").setAttribute("style", "display:block");
            document.getElementById("empty").setAttribute("style", "display:none");
            document.cookie = 'option=pm; expires=' + (Date.now() + 259200) + '; sameSite=lax; domain=.' + purl + '; path=/; secure;';
        }
    } else if (type == "via") {
        var burl = document.getElementById('url').value;
        if (burl == "") {
            document.getElementById("empty").setAttribute("style", "display:inline");
        } else {
            document.getElementById("special").setAttribute("src", "https://c." + location.hostname + '/' + burl);
            document.getElementById("magic").setAttribute("style", "display:block");
            document.getElementById("empty").setAttribute("style", "display:none");
            document.cookie = 'oldsmobile=Y; expires=' + (Date.now() + 259200) + '; sameSite=lax; domain=.' + purl + '; path=/; secure;';

        }
    } else if (type == "pm") {
        var burl = document.getElementById('url').value;
        if (burl == "") {
            document.getElementById("empty").setAttribute("style", "display:inline");
        } else {
            document.getElementById("special").setAttribute("src", "https://cdn." + location.hostname + '/' + burl);
            document.getElementById("magic").setAttribute("style", "display:block");
            document.getElementById("empty").setAttribute("style", "display:none");
            document.cookie = 'opt=pm; expires=' + (Date.now() + 259200) + '; sameSite=lax; domain=.' + purl + '; path=/; secure;';
        }
    } else if (type == "nc") {
        var burl = document.getElementById('url').value;
        if (burl == "") {
            document.getElementById("empty").setAttribute("style", "display:inline");
        } else {
            const origin = btoa(burl)
            document.getElementById("special").setAttribute("src", "https://cdn." + location.hostname + '/alloy?url=' + origin);
            document.getElementById("magic").setAttribute("style", "display:block");
            document.getElementById("empty").setAttribute("style", "display:none");
            document.cookie = 'opt=ap; expires=' + (Date.now() + 259200) + '; sameSite=lax; domain=.' + purl + '; path=/; secure;';
        }
    }
}

var host = location.hostname.split('.');
var purl = location.hostname;
if (host.length == 3) {
    purl = `${host[1]}.${host[2]}`;
}
Array.from(document.getElementsByTagName('button')).forEach(e => {
    e.addEventListener('click', () => {
        document.cookie = 'oldsmobile=owo; max-age=259200; sameSite=lax; domain=' + purl + '; path=/; secure;';
    });
});

function invalid() {
    document.getElementById("invalid").setAttribute("style", "display:inline");
}



function pm_select() {
    document.getElementsByClassName("material-icons")[0].setAttribute("onclick", "redir('pm')");
    document.getElementById("pm-info").setAttribute("style", "display:inline");
    document.getElementById("via-info").setAttribute("style", "display:none");
    document.getElementById("php-info").setAttribute("style", "display:none");
    document.getElementById("nc-info").setAttribute("style", "display:none");
    document.getElementById("invalid").setAttribute("style", "display:none");


}

function via_select() {
    document.getElementsByClassName("material-icons")[0].setAttribute("onclick", "redir('via')");
    document.getElementById("pm-info").setAttribute("style", "display:none");
    document.getElementById("via-info").setAttribute("style", "display:inline");
    document.getElementById("php-info").setAttribute("style", "display:none");
    document.getElementById("nc-info").setAttribute("style", "display:none");
    document.getElementById("invalid").setAttribute("style", "display:none");

}

function nc_select() {
    document.getElementsByClassName("material-icons")[0].setAttribute("onclick", "redir('nc')");
    document.getElementById("pm-info").setAttribute("style", "display:none");
    document.getElementById("via-info").setAttribute("style", "display:none");
    document.getElementById("php-info").setAttribute("style", "display:none");
    document.getElementById("nc-info").setAttribute("style", "display:inline");
    document.getElementById("invalid").setAttribute("style", "display:none");

}

function php_select() {
    document.getElementsByClassName("material-icons")[0].setAttribute("onclick", "redir('php')");
    document.getElementById("pm-info").setAttribute("style", "display:none");
    document.getElementById("via-info").setAttribute("style", "display:none");
    document.getElementById("php-info").setAttribute("style", "display:inline");
    document.getElementById("nc-info").setAttribute("style", "display:none");
    document.getElementById("invalid").setAttribute("style", "display:none");
}