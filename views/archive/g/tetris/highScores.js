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

function highScoresOnLoad() {
    // div called id=highScoreDiv
    var xmlhttp = getXmlHttp();
    xmlhttp.onreadystatechange=function()
    {
	if (xmlhttp.readyState==4 && xmlhttp.status==200)
	{
	    var response = jsonParse(xmlhttp.responseText),
	    dailyScoreList = response.dailyScores,
	    dailyOutput,
	    i;

	    dailyOutput= '<table class="highScoreTable"><tr class="highScoreTableHeader"><td>#</td><td>Name</td><td>Score</td></tr>';

	    for (i = 0; i < dailyScoreList.length; i += 1) {
		curScore = dailyScoreList[i];
		dailyOutput += '<tr><td>' + (i+1) + '</td><td>' + curScore.name + '</td><td>' + curScore.score + '</td></tr>';
	    }

	    dailyOutput += '</table>';

	    document.getElementById("dailyScoreDiv").innerHTML = dailyOutput;
	}
    }

    xmlhttp.open("POST", "/score/tables", true);
    xmlhttp.send();
}
