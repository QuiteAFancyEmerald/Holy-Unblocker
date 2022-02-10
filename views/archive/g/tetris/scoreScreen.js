function $_GET(q) { 
    var s = window.location.search; 
    var re = new RegExp('&'+q+'(?:=([^&]*))?(?=&|$)','i'); 
    return (s=s.replace(/^\?/,'&').match(re)) ? (typeof s[1] == 'undefined' ? '' : decodeURIComponent(s[1])) : undefined; 
}

function getXmlHttp() {
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
	return new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
	return new ActiveXObject("Microsoft.XMLHTTP");
    }
}

function scoreScreenOnLoad() {
    var sessionRef = $_GET('tempRef');
    
    var xmlhttp = getXmlHttp();
    xmlhttp.onreadystatechange=function()
    {
	if (xmlhttp.readyState==4 && xmlhttp.status==200)
	{
	    var response = jsonParse(xmlhttp.responseText),
	    ranked = false;
	    output = '<br/><br/><div class="resTitle">GOOD GAME!</div><br/><br/>';

	    output += '<table class="resultsTable">';

	    output += '<tr><td class="resultsLeft">Score:</td><td class="resultsRight">' + response.userScore + '</td></tr>';
	    if (response.dailyRank > 0) {
		output += '<tr><td class="resultsLeft">Daily Rank:</td><td class="resultsRight">'
		    + response.dailyRank + '</td></tr>';
		ranked = true;
		
	    }
	    if (response.totalRank > 0) {
		output += '<tr><td class="resultsLeft">Total Rank:</td><td class="resultsRight">'
		    + response.totalRank + '</td></tr>';
		ranked = true;
	    }
	    output += '</table><br/><br/><br/>';

	    document.getElementById("scoreDiv").innerHTML = output;

	    // if ranked, prompt for a name
	    if (ranked) {
		document.getElementById("applyNameDiv").setAttribute('class', 'applyNameVisible');
	    }
	}
    }

    xmlhttp.open("POST", "/score/postGame?tempRef="+sessionRef, true);
    xmlhttp.send();
}

function nameKeyDown(e) {
    var keycode;
    if (window.event) { //IE
	keycode = e.keyCode;
    } else {
	keycode = e.which;
    }
    if (keycode === 13) { // if the enter key
	applyName();
    }
}

function applyName() {
    var sessionRef = $_GET('tempRef');
    var name = document.getElementById("nameInput").value;

    if (name.length < 1 || sessionRef.length < 1) return;

    document.getElementById("applyNameDiv").setAttribute('class', 'applyNameHidden');

    var xmlhttp = getXmlHttp();
    xmlhttp.open("POST", "/score/apply?tempRef="+sessionRef+"&name="+name, true);
    xmlhttp.send();

    return false;
}

function trySubmitName() {
    applyName();
}