/*
    Bounce Back ~ A boomerang roguelike for JS13k
    Copyright (C) 2019 Frank Force

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details. 
*/
/*
    Javascript Game Engine Debug
    By Frank Force 2019
    
    Debug Features
    - debug console
    - debug rendering
    - debug controls
    - save snapshot
*/

"use strict"; // strict mode
///////////////////////////////////////////////////////////////////////////////
// debug

let debugFrame = 0;
let debugConsole = 0;
let debugRects=[];
let debugConsoleTextArea;
let debugConsoleDisplayTextArea;
let downloadLink;
let debugCanvas = 0;

function DebugPrint(string)
{
    let o = '-> '+string + '\n';
    o += debugConsoleDisplayTextArea.value;
    debugConsoleDisplayTextArea.value = o;
}

function ToggleDebugConsole()
{
    debugConsole = !debugConsole;
    if (debugConsole)
    {
        debugConsoleTextArea.style.display='block';
        debugConsoleTextArea.focus();
    }
    else
        mainCanvas.focus();
}

function DebugConsoleKeyDown(e)
{
    if (e.keyCode != 13)
        return;

    e.preventDefault();
    let v = debugConsoleTextArea.value;
    let o = '-> eval('+v + ')\n';

    try { o += eval(v); }
    catch (e) 
    {
        if (e instanceof Error)
            o += e.message? 'Error: ' + e.message : e;
        else
            o += 'Unknown error';
    }

    o += '\n\n' + debugConsoleDisplayTextArea.value;

    debugConsoleTextArea.value = '';
    debugConsoleDisplayTextArea.value = o;
}
    
function InitDebug()
{ 
    debugConsoleTextArea = document.createElement('textarea');
    debugConsoleTextArea.style="height:30px;width:90%;display:none;color:#FFF;background-color:#000;"
    mainCanvas.before(debugConsoleTextArea);
    debugConsoleTextArea.onkeydown=e=>DebugConsoleKeyDown(e)
    
    debugConsoleDisplayTextArea = document.createElement('textarea');
    debugConsoleDisplayTextArea.style="height:100px;width:90%;display:none;color:#FFF;background-color:#000;"
    mainCanvas.before(debugConsoleDisplayTextArea);
    
    downloadLink = document.createElement('a');
    downloadLink.display='none';
    downloadLink.before(debugConsoleTextArea);
    
    if (debugCanvas)
    {
        document.body.style.overflow='visible';
        document.body.style.background='#400'
        mainCanvas.style.border='2px solid #F00';
        mainCanvas.style.width=mainCanvas.width+'px';
        mainCanvas.style.height=mainCanvas.height+'px';

        document.body.appendChild(levelCanvas);   
        levelCanvas.style.border='2px solid #F00';
        levelCanvas.style.width=(levelCanvas.width)+'px';
        levelCanvas.style.height=(levelCanvas.height)+'px';
        levelCanvas.style.display ='block';

        document.body.appendChild(tileMaskCanvas);  
        tileMaskCanvas.style.border='2px solid #F00';
        tileMaskCanvas.style.width=(tileMaskCanvas.width)+'px';
        tileMaskCanvas.style.height=(tileMaskCanvas.height)+'px';
        tileMaskCanvas.style.display ='block';
    }  
}

function DebugRect(pos,size,color="#F00")
{
    if (debug) debugRects.push({pos:pos.Clone(),size:size.Clone(),color:color.slice(0)});
}

function DebugPoint(pos,size=.1,color="#F00")
{
    if (debug) DebugRect(pos, new Vector2(size,size), color)
}

function RenderDebugRects()
{
    mainCanvasContext.lineWidth=1;
    function RenderDebugRect(pos,size,color)
    {
        size.Multiply(tileSize);
        let renderPos = pos.Clone();
        renderPos.Subtract(cameraPos);
        renderPos.Multiply(tileSize);
        renderPos.Subtract(size);
        renderPos.Multiply(cameraScale);
        mainCanvasContext.strokeStyle=color;
        mainCanvasContext.save();
        mainCanvasContext.translate(renderPos.x + mainCanvas.width/2|0, renderPos.y + mainCanvas.height/2|0);
        mainCanvasContext.scale(cameraScale, cameraScale);
        mainCanvasContext.strokeRect(0, 0, 2*size.x, 2*size.y);
        mainCanvasContext.restore();
    }
    
    for( let d of debugRects )
        RenderDebugRect(d.pos,d.size,d.color);
    debugRects = [];
}

function UpdateDebug()
{
    ++debugFrame;
    UpdateDebugControls();
    
    if (debugCollision)
    {
        let s = tileSize*level.size;
        DebugRect(new Vector2(s/2,s/2), new Vector2(s/2,s/2),'#F00');
    }
        
    debugConsoleTextArea.style.display=debugConsole?'block':'none';
    debugConsoleDisplayTextArea.style.display=debugConsole?'block':'none';
    
    if (!debug)
    {
        debugRects = [];
        return;
    }
    RenderDebugRects();
}

///////////////////////////////////////////////////////////////////////////////
// debug controls

function UpdateDebugControls()
{
    if (debug)
    {
        if (KeyWasPressed(50)) // 2
            SaveSnapshot();
        if (KeyWasPressed(51)) // 3
            debugCollision = !debugCollision;
        if (KeyWasPressed(52)) // 4
            debugParticles = !debugParticles;
        if (KeyWasPressed(53)) // 5
            godMode = !godMode;
        if (KeyWasPressed(145)) // scroll lock
            debug = 0;
        if (KeyWasPressed(71)) // g
            godMode=1;
    }
    
    if (KeyIsDown(70)&&KeyIsDown(82)&&KeyIsDown(65)&&KeyIsDown(78)&&KeyIsDown(75))
    {
        // dev mode - press all keys to spell "FRANK"
        if (!debug)
            PlaySound(4);
        debug = 1;
    }
}

function SaveSnapshot()
{    
    downloadLink.download="snapshot.png";
    downloadLink.href=mainCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    downloadLink.click();
}