
function TtyBlock (divName, numLines, rollOverLength, rollOverRemove) {
    var i;

    this.elem = document.getElementById(divName);

    // slow scorlling effect variables
    this.curPos = 0;
    this.cursorShown = false;

    // TODO: make these random starting values
    this.timePassedType = 0;
    this.timePassedFlash = 0;
    
    // time in ms
    this.typePeriod = 30;
    this.flashPeriod = 300;

    this.lines = [];
    for (i = 0; i < numLines; i += 1) {
	this.lines.push("");
    }
    
    this.rollOverLength = rollOverLength || 9;
    this.rollOverRemove = rollOverRemove || 3;

    this.backlog = [];
}


/**
  updates the text block
 */
TtyBlock.prototype.draw = function (dTime) {
    var i,
    outputString = "",
    lastLine;

    this.timePassedType += dTime;
    
    while (this.timePassedType > this.typePeriod) {
	this.curPos += 1;
	this.timePassedType -= this.typePeriod;
    }

    lastLine = this.lines[this.lines.length-1];
    
    if (this.curPos > lastLine.length) {
	this.timePassedFlash += dTime;
	while (this.timePassedFlash > this.flashPeriod) {
	    this.cursorShown = !this.cursorShown;
	    this.timePassedFlash -= this.flashPeriod;
	}
    }

    // if I'm past the end of the last line, and there is a backlog, shift all the lines
    if (this.curPos > lastLine.length && this.backlog.length > 0) {
	this.lines.shift();
	lastLine = this.backlog.shift();
	this.lines.push(lastLine);
	this.curPos = 0;
    }

    // print all of the lines but the last one
    for (i = 0; i < this.lines.length - 1; i += 1) {
	outputString += this.lines[i] + "<br/>";
    }
    outputString += lastLine.slice(0, Math.min(this.curPos, lastLine.length));
    if (this.cursorShown) {
	outputString += "_";
    }
    // rewirte for html gaurds
    outputString.replace('>', '&gt');
    this.elem.innerHTML = outputString;
};

TtyBlock.prototype.addLine = function(str) {
    // if the backlog is too long, then remove the last 3 values
    if (this.backlog.length > this.rollOverLength) {
	this.backlog.splice(this.backlog.length - this.rollOverRemove, this.rollOverRemove);
    }

    this.backlog.push("   > " + str);
};
