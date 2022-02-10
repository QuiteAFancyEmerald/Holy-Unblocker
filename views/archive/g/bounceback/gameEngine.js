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
    Javascript Game Engine
    By Frank Force 2019

    Engine Features
    - Engine is separate from game code, I kept it super simple.
    - Object oriented system with base class game object.
    - Base class object handles physics, collision, rendering, shadows, etc.
    - Objects collide with level tiles and can bounce off.
    - Engine helper classes and functions like Vector2, Color, and Timer.
    - Level is composed of a grid of tiles that can optionally have objects on them (bushes/rocks)
    - Automatically tiles level based on what is there.
    - Level & ground is cached to offscreen buffer, so all the level, trees, blood splats is only 1 draw call.
    - Sound effects audio with my tiny sound lib zzfx.
    - Input processing system.
    - A simple particle effect system.
*/

"use strict"; // strict mode
///////////////////////////////////////////////////////////////////////////////
// config

let godMode = 0;
let debug = 0;
let soundEnable = 1;
let debugCollision = 0;

///////////////////////////////////////////////////////////////////////////////
// helper functions

let RGBA             = (r=0,g=0,b=0,a=1)=>(`rgba(${r*255|0},${g*255|0},${b*255|0},${a})`);
let PI               = Math.PI;
let Rand             = (m=1)=>Math.random()*m;
let RandInt          = m=>Rand(m)|0;
let RandBetween      = (a,b)=>a+Rand(b-a);
let RandIntBetween   = (a,b)=>a+RandInt(b-a+1);
let RandVector       = (scale=1)=>     (new Vector2(scale,0)).Rotate(Rand(2*PI));
let RandColorBetween = (c1,c2)=>       c1.Clone().Lerp(c2,Rand());
let IsArrayValid     = (x,y,size)=>    (x>=0 && y>=0 && x < size && y < size);

let Min=(a, b)=>                       (a<b)? a : b;
let Max=(a, b)=>                       (a>b)? a : b;
let Clamp=(v, min, max)=>              Min(Max(v, min), max);
let Percent=(v, a, b)=>                (a==b)? 0 : Clamp((v-a)/(b-a), 0, 1);
let Lerp=(p, a, b)=>                   a + Clamp(p, 0, 1) * (b-a);
let FormatTime=(t)=>                   
{
    let s = (t|0)%60;
    return (t/60|0)+':'+(s<10?'0':'')+s;
}

class Timer 
{
    constructor()           { this.endTime=0; }
    Set(timeLeft=0)         { this.endTime = time + timeLeft; }
    Get()                   { return this.IsSet()? time - this.endTime : 1e9; }
    IsSet()                 { return this.endTime > 0; }
    UnSet()                 { this.endTime = 0; }
    Elapsed()               { return !this.IsSet() || time > this.endTime; }
}
    
class Vector2 
{
    constructor(x=0, y=0) { this.x = x; this.y = y; }
    Copy(v)               { this.x = v.x; this.y = v.y; return this; }
    Clone(s=1)            { return (new Vector2(this.x, this.y)).Multiply(s); }
	Add(v)                { (v instanceof Vector2)? (this.x += v.x, this.y += v.y) : (this.x += v, this.y += v); return this;  }
	Subtract(v)           { (this.x -= v.x, this.y -= v.y) ; return this;  }
	Multiply(v)           { (v instanceof Vector2)? (this.x *= v.x, this.y *= v.y) : (this.x *= v, this.y *= v); return this;  }
	Set(x, y)             { this.x = x; this.y = y; return this;  }
    AddXY(x, y)           { this.x += x; this.y += y; return this;  }
    Normalize(scale=1)    { let l = this.Length(); return l > 0 ? this.Multiply(scale/l) : this.Set(scale,y=0); }
    ClampLength(length)   { let l = this.Length(); return l > length ? this.Multiply(length/l) : this; }
    Rotate(a)             { let c=Math.cos(a);let s=Math.sin(a);return this.Set(this.x*c - this.y*s,this.x*s - this.y*c); }
    Round()               { this.x = Math.round(this.x); this.y = Math.round(this.y); return this; }
    Length()              { return Math.hypot(this.x, this.y ); }
    Distance(v)           { return Math.hypot(this.x - v.x, this.y - v.y ); }
    Angle()               { return Math.atan2(this.y, this.x); };
    Rotation()            { return (Math.abs(this.x)>Math.abs(this.y))?(this.x>0?2:0):(this.y>0?1:3); }   
    Lerp(v,p)             { return this.Add(v.Clone().Subtract(this).Multiply(p)); }
    DotProduct(v)         { return this.x*v.x+this.y*v.y; }
}

class Color
{
    constructor(r=0,g=0,b=0,a=1) { this.r=r;this.g=g;this.b=b;this.a=a; }
    Copy(c)                      { this.r=c.r;this.g=c.g;this.b=c.b;this.a=c.a; return this; }
    Clone(s=1)                   { return new Color(this.r*s, this.g*s, this.b*s, this.a*s); }
    //Add(c)                     { this.r+=c.r;this.g+=c.g;this.b+=c.b;this.a+=c.a; return this; }
    Subtract(c)                  { this.r-=c.r;this.g-=c.g;this.b-=c.b;this.a-=c.a; return this; }
    //Multiply(c)                { (c instanceof Color)? (this.r*=c.r,this.g*=c.g,this.b*=c.b,this.a*=c.a) : (this.r*=c,this.g*=c,this.b*=c,this.a*=c); return this; } 
    SetAlpha(a)                  { this.a=a; return this; } 
    Lerp(c,p)                    { return c.Clone().Subtract(c.Clone().Subtract(this).Clone(1-p)); }
    RGBA()                       { return RGBA(this.r, this.g, this.b, this.a); }
}

///////////////////////////////////////////////////////////////////////////////
// game object

class GameObject 
{
    constructor(pos,tileX,tileY,size=.5,collisionSize=0,health=1) 
    { 
        this.pos = pos.Clone();
        this.tileX = tileX;
        this.tileY = tileY;
        this.size = new Vector2(size,size);
        this.collisionSize = collisionSize;
        this.health = health;
        this.healthMax = health;
        this.damageTimer = new Timer();
        this.lifeTimer = new Timer();
        this.lifeTimer.Set();
        this.velocity = new Vector2();
        this.angle = 0;
        this.angleVelocity = 0;
        this.damping = .8;
        this.mirror = 0;
        this.height = 0;
        this.damageFlashTime = .5;
        this.differenceFlash = 1;
        
        gameObjects.push(this); 
    }
    
    Update() 
    {
        // apply velocity
        let oldPos = this.pos;
        let newPos = this.pos.Clone();
        newPos.Add(this.velocity);
        
        // check collision
        let size = this.collisionSize;
        let clear = level.IsAreaClear(newPos,size,this);
        if (!clear)
        {
            // test which side we bounced off of (or both)
            let isClearX = level.IsAreaClear(new Vector2(newPos.x,oldPos.y),size);
            let isClearY = level.IsAreaClear(new Vector2(oldPos.x,newPos.y),size);
            if (!isClearX || isClearY)
            {
                newPos.x = oldPos.x;
                this.velocity.x *= -.5;
            }
            if (!isClearY || isClearX)
            {
                newPos.y = oldPos.y;
                this.velocity.y *= -.5;
            }
        }
        this.pos = newPos;
        
        // apply physics
        this.velocity.Multiply(this.damping);
        this.angle += this.angleVelocity;
        
        if (debugCollision)
            DebugRect(this.pos,new Vector2(this.collisionSize,this.collisionSize),'#F00');
    }
       
    Render() { DrawTile(this.pos,this.size,this.tileX,this.tileY,this.angle,this.mirror,this.height);}
    
    Heal(health)
    {
        if (this.IsDead())
            return 0;
        
        // apply healing
        let startHealth = this.health;
        this.health = Min(this.health+health,this.healthMax);
        return this.health - startHealth;
    }
    
    Damage(damage) 
    {
        if (this.IsDead() || this.GetDamageTime() < .5)
            return 0;
            
        // apply damage
        this.damageTimer.Set();
        let startHealth = this.health;
        this.health = Max(this.health-damage,0);
        if (!this.health)
            this.Kill();
            
        return startHealth - this.health;
    }
    
    ReflectDamage(direction){ return 0; }
    GetLifeTime()           { return this.lifeTimer.Get(); }
    GetDamageTime()         { return this.damageTimer.Get(); }
    GetDamageFlashPercent() { return Clamp(1- this.GetDamageTime()/this.damageFlashTime,0,1); }
    IsTouching(object)      { return this.Distance(object) < object.collisionSize + this.collisionSize; }
    IsDead()                { return !this.health; }
    Kill()                  { this.health = 0; this.Destroy(); }
    Destroy()               { gameObjects.splice(gameObjects.indexOf(this), 1); }
    Distance(object)     
    {
        // get distance between objects accounting for height 
        let p1 = this.pos; let p2 = object.pos;
        return Math.hypot(p1.x - p2.x, p1.y - p2.y, this.height - object.height); 
    }
    CollideLevel(data,pos)
    { 
        if (!data.type)
            return 1;
    
        // allow jumping over objects
        if (this.height > 1)
            return 0;
    
        return data.object; 
    }
}

///////////////////////////////////////////////////////////////////////////////
// core engine

let cameraScale = 1;
let cameraPos = new Vector2();
let frame = 0;
let time = 1;
let paused = 0;
let timeDelta = 1/60;
let shadowRenderPass = 0;
let hitRenderPass = 0;
let mainCanvasContext;
let tileMaskCanvas;
let tileMaskCanvasContext;
let hitCanvas;
let hitCanvasContext;
let levelCanvas;
let levelCanvasContext;
let mainCanvasSize = new Vector2();
let tileSize = 16;
let levelSize = 64;

function EngineInit()
{
    // set the main canvas size to half size of the window
    mainCanvasContext = mainCanvas.getContext('2d');
    mainCanvasSize.Set(window.innerWidth/2|0,window.innerHeight/2|0);
    mainCanvas.width = mainCanvasSize.x;
    mainCanvas.height = mainCanvasSize.y;
    
    // create level canvas to cache level image and groun effects
    levelCanvas = document.createElement('canvas');
    levelCanvasContext = levelCanvas.getContext('2d');
    levelCanvas.display='none';
    levelCanvasContext.imageSmoothingEnabled = 0;

    // crate tile mask used for shadows and hit effects
    tileMaskCanvas = document.createElement('canvas');
    tileMaskCanvasContext = tileMaskCanvas.getContext('2d');
    tileMaskCanvas.display='none';
    tileMaskCanvas.width = tileImage.width*2;
    tileMaskCanvas.height = tileImage.height;
    
    // draw white mask sprites
    tileMaskCanvasContext.fillStyle='#FFF';
    tileMaskCanvasContext.fillRect(0,0,tileMaskCanvas.width,tileMaskCanvas.height);
    tileMaskCanvasContext.globalCompositeOperation = 'destination-atop';
    tileMaskCanvasContext.drawImage(tileImage,0,0);
    
    // draw black mask sprites
    tileMaskCanvasContext.globalCompositeOperation = 'source-over';
    tileMaskCanvasContext.drawImage(tileMaskCanvas,tileImage.width,0);
    tileMaskCanvasContext.globalCompositeOperation = 'difference';
    tileMaskCanvasContext.drawImage(tileMaskCanvas,tileImage.width,0);
    
    InitDebug();
}

function EngineUpdate()
{
    paused = !debug && !document.hasFocus()
    if (paused)
    {
        // prevent stuck input if focus is lost
        mouseIsDown = mouseWasDown = 0;
        keyInputData.map(k=>k.wasDown=k.isDown=0);
    }

    // fit canvas to window
    mainCanvasSize.Set(window.innerWidth/2,window.innerHeight/2);
    mainCanvas.width = mainCanvasSize.x;
    mainCanvas.height = mainCanvasSize.y;
    mainCanvasContext.imageSmoothingEnabled = 0;
    
    // get mouse world pos
    mousePosWorld.Copy(mousePos).Subtract(mainCanvasSize.Clone(.5)).Multiply(1/cameraScale*tileSize).Add(cameraPos);
    
    // main update
    if (!paused)
    {
        // debug speed up / slow down
        let frames = 1;
        if (debug && KeyIsDown(107))
            frames = 4;
        if (debug && KeyIsDown(109))
            frames = (debugFrame%4==0);
        while(frames--)
        {
            time = 1+ ++frame * timeDelta
            Update();
            UpdateGameObjects();
        }
    }
        
    // main render
    let SortGameObjects = (a,b)=> a.pos.y-b.pos.y;
    gameObjects.sort(SortGameObjects);
    PreRender();
    shadowRenderPass = 1;
    RenderGameObjects();
    shadowRenderPass = 0;
    RenderGameObjects();
    PostRender();
    UpdateDebug();
    
    // clear input
    mouseWasDown = mouseIsDown;
    keyInputData.map(k=>k.wasDown=k.isDown);
    requestAnimationFrame(EngineUpdate);
}

///////////////////////////////////////////////////////////////////////////////
// game object system

let gameObjects = [];
function ClearGameObjects()  { gameObjects = []; }
function UpdateGameObjects() { gameObjects.forEach(o=>o.Update()); }
function RenderGameObjects()
{ 
    gameObjects.forEach(o=>
    {
        o.Render();
        if (!shadowRenderPass)
        {
            // draw the hit flash overlay
            hitRenderPass = o.GetDamageFlashPercent();
            if (hitRenderPass)
            {
                if (o.differenceFlash)
                    mainCanvasContext.globalCompositeOperation = 'difference';
                o.Render();
                mainCanvasContext.globalCompositeOperation = 'source-over';
                hitRenderPass = 0;
            }
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
// input

let mouseIsDown = 0;
let mouseWasDown = 0;
let keyInputData = [];
let mousePos = new Vector2();
let mousePosWorld = new Vector2();

oncontextmenu = function(e) { e.preventDefault(); }
onmousedown   = function(e) { mouseIsDown=1; }
onmouseup     = function(e) { mouseIsDown=0; }
onmousemove   = function(e) 
{ 
    // convert mouse pos to canvas space
    let rect = mainCanvas.getBoundingClientRect();
    mousePos.Set
    ( 
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top) / rect.height
    ).Multiply(mainCanvasSize);
}
onkeydown = function(e) 
{ 
    if (debug && e.keyCode==192)
        e.preventDefault(),ToggleDebugConsole();
    if (debug && document.activeElement && document.activeElement.type == 'textarea')
        return;
        
    keyInputData[e.keyCode]={isDown:1};
}
onkeyup = function(e) 
{ 
    if (debug && document.activeElement && document.activeElement.type == 'textarea')
        return;
        
    if ( keyInputData[e.keyCode] ) keyInputData[e.keyCode].isDown=0;
}

function MouseWasPressed()  { return mouseIsDown && !mouseWasDown; }
function KeyIsDown(key)     { return keyInputData[key]? keyInputData[key].isDown : 0; }
function KeyWasPressed(key) { return KeyIsDown(key) && !keyInputData[key].wasDown; }
function ClearInput()       { keyInputData.map(k=>k.wasDown=k.isDown=0);mouseIsDown=mouseWasDown=0; }

///////////////////////////////////////////////////////////////////////////////
// rendering

// shadow settings
let shadowAlpha      = .5;
let shadowSkew       = .7;
let shadowScale      = .7;

function DrawScreenTile(x,y,size,tileX,tileY)
{
    mainCanvasContext.drawImage(tileImage,tileX*tileSize,tileY*tileSize,tileSize,tileSize, x-size, y-size, 2*size, 2*size);
}

function SetCanvasTransform(pos,size,angle=0,height=0)
{
    // create canvas transform from world space to screen space
    mainCanvasContext.save();
    let drawPos = pos.Clone();
    if (shadowRenderPass)
        drawPos.AddXY(-height*shadowSkew/2, -height*shadowScale/2);
    else
        drawPos.y -= height;
    drawPos.Subtract(cameraPos).Multiply(tileSize*cameraScale);
    drawPos.Add(mainCanvasSize.Clone(.5));
    mainCanvasContext.translate(drawPos.x|0, drawPos.y|0);
    
    let s = size.Clone(tileSize);
    if (shadowRenderPass)
        mainCanvasContext.transform(1,0,shadowSkew,shadowScale,-shadowSkew*cameraScale*s.x,cameraScale*(1-shadowScale)*s.y);
    if (angle)
        mainCanvasContext.rotate(angle);
    mainCanvasContext.scale(cameraScale,cameraScale);
}

function DrawTile(pos,size,tileX,tileY,angle=0,mirror=0,height=0)
{
    // render a tile at a world space position
    SetCanvasTransform(pos,size,angle,height);
    
    let image = tileImage;
    if (shadowRenderPass)
    {
        image = tileMaskCanvas;
        mainCanvasContext.globalAlpha *= shadowAlpha;
        tileX+=tileImage.width/tileSize; // shift over to shadow position
    }
    else if (hitRenderPass)
    {
        image = tileMaskCanvas;
        mainCanvasContext.globalAlpha *= hitRenderPass;
    }

    // shrink size of tile to fix bleeding on edges
    let renderTileShrink = .25;
    
    /// render the tile
    let s = size.Clone(2*tileSize);
    mainCanvasContext.scale(mirror?-s.x:s.x,s.y);
    mainCanvasContext.drawImage(image,
        tileX*tileSize+renderTileShrink,
        tileY*tileSize+renderTileShrink,
        tileSize-2*renderTileShrink,
        tileSize-2*renderTileShrink, -.5, -.5, 1, 1);
    mainCanvasContext.restore();
    mainCanvasContext.globalAlpha = 1;   
}

function DrawText(text, x, y, size,textAlign='center',lineWidth=1,color='#000',strokeColor='#FFF',context=mainCanvasContext)
{
    context.fillStyle=color;
    context.font = `900 ${size}px arial`
    context.textAlign=textAlign;
    context.textBaseline='middle';
    context.fillText(text,x,y);
    if (lineWidth)
    {
        context.lineWidth=lineWidth;
        context.strokeStyle=strokeColor;
        context.strokeText(text,x,y);
    }
}

///////////////////////////////////////////////////////////////////////////////
// tile level system

class LevelData
{
    constructor() 
    {
        
        this.type = 0;   // 0=solid, 1=grass, 2=sand
        this.object = 0; // 0=none, 1=bush, 2=rock
        this.tile = 0;
        this.rotation = 0;
    }
    
    Clear() { this.type=this.object=0; }
    IsSolid() { return !this.type || this.object; }
}

class Level
{
    constructor()
    {
        levelCanvas.height=levelCanvas.width=levelSize*tileSize;
        this.data = [];
        for(let i = 0; i<levelSize*levelSize; i++)
            this.data[i] = new LevelData();
    }
    
    GetDataFromPos(pos) { return this.GetData(pos.x,pos.y); }

    GetData(x,y)
    {
        if (!IsArrayValid(x,y,levelSize))
            return new LevelData();
        return this.data[(x|0)+(y|0)*levelSize];
    }

    IsAreaClear(pos,size,gameObject=0)
    {
        // check if there is collision in a given square area
        let y = pos.y;
        let x = pos.x;
        for(let yo = y - size; yo <= y + size; )
        {
            for(let xo = x - size; xo <= x + size;)
            {
                let p = new Vector2(Math.floor(xo)+.5,Math.floor(yo)+.5);
                let data = this.GetDataFromPos(p);
                if (gameObject)
                {
                    if (gameObject.CollideLevel(data,p))
                        return 0;
                }
                else if (data.IsSolid())
                   return 0;

                if (xo==x+size)
                    break;
                ++xo;
                if (xo > x+size)
                    xo = x+size;
            }

            if (yo==y+size)
                break;
            ++yo;
            if (yo > y+size)
                yo = y+size;
        }
        return 1;
    }

    FillCircleObject(pos,r,object) { this.FillCircleCallback(pos,r,d=>d.object=d.type?object:d.object); }
    FillCircleType(pos,r,type)     { this.FillCircleCallback(pos,r,d=>d.type=type); }
    
    FillCircleCallback(pos,r,callback)
    {
        // fill a circle of tiles using the provided callback
        for(let i=-r;i<=r;i++)
        {
            let h = (r**2-(i+.5)**2)**.5;
            for(let j=pos.y-h;j<pos.y+h;j++)
            {
                let x = pos.x+i|0;
                let y = j|0;
                if (!IsArrayValid(x,y,levelSize))
                    continue;
                    
                callback(this.GetData(x,y));
            }
        }           
    }

    ApplyTiling()
    {
        // set up tiles
        for(let y = 0; y<levelSize; y++)
        for(let x = 0; x<levelSize; x++)
        {
            // get neighbors
            let d = this.GetData(x,y);
            let dt = d.type;
            let dr = this.GetData(x+1,y).type==dt
            let dl = this.GetData(x-1,y).type==dt;
            let du = this.GetData(x,y-1).type==dt;
            let dd = this.GetData(x,y+1).type==dt;
            let neighbors = dr + dl + du + dd;
            
            let t = dt*8;
            let r = 0;
            if (dt<2)
            {
                // first 2 rows are tiled based on neighbor count
                t += neighbors;
                if (neighbors>=2)
                    t++;
                if (neighbors==1)
                {
                    if (dl) r = 1;
                    else if (du) r = 2;
                    else if (dr) r = 3;
                }
                else if (neighbors==2)
                {
                    if (dr && dl) t--, r = 1;
                    else if (du && dd) t--;
                    else if (dl && dd) r = 1;
                    else if (dl && du) r = 2;
                    else if (dr && du) r = 3;
                }
                else if (neighbors==3)
                {
                    if (!dr) r = 1;
                    else if (!dd) r = 2;
                    else if (!dl) r = 3;
                }
            }

            d.tile = t;
            d.rotation = r;
        }
        
        // add tile randomization
        for(let y = 0; y<levelSize; y++)
        for(let x = 0; x<levelSize; x++)
        {
            if (Rand() > .05)
                continue;
            
            let d = level.GetData(x,y);
            if (d.tile == 13)
            {
                d.tile++;
                d.rotation=RandInt(4);
            }
            if (d.tile == 16)
            {
                d.tile+=1;
                d.rotation=RandInt(4);
            }
        }
    }

    ClearBorder()
    {
        // set to solid around outside edge
        let w = levelSize;
        for(let i = 0; i<w; i++)
        {
            this.GetData(i,  0).Clear();
            this.GetData(i,w-1).Clear();
            this.GetData(0,  i).Clear();
            this.GetData(w-1,i).Clear();
        }
    }
    
    DrawEllipse(pos,size,color='#FFF',angle=0)
    {
        let s = new Vector2(1,1).Multiply(size).Multiply(tileSize);
        levelCanvasContext.beginPath();
        levelCanvasContext.ellipse(pos.x*tileSize,pos.y*tileSize,s.x,s.y,angle,0,7);
        levelCanvasContext.fillStyle=color;
        levelCanvasContext.fill();
    }

    DrawText(text, pos, size, textAlign='center',lineWidith=0, color='#000', strokeColor='#FFF')
    {
        DrawText(text, pos.x*tileSize, pos.y*tileSize, size,textAlign,lineWidith,color,strokeColor,levelCanvasContext);
    }

    DrawTileData(x,y)
    {
        x|=0;
        y|=0;
        let d = this.GetData(x,y);
        
        // draw the bottom layer
        let tx = d.tile%8;
        let ty = (d.tile/8|0);
        let pos = new Vector2(x+.5,y+.5);
        this.DrawTile(pos, .5, tx, ty, d.rotation*PI/2);
        
        if (d.object)
        {
            // draw the object/top layer
            tx = (d.object-1)%8;
            ty = 3+((d.object-1)/8|0);
            this.DrawTile(pos, .5, tx, ty);
        }
    }
    
    DrawTile(pos,size,tileX,tileY,angle=0)
    {
        let s = size * tileSize;
        levelCanvasContext.save();
        levelCanvasContext.translate(pos.x*tileSize,pos.y*tileSize);
        levelCanvasContext.rotate(angle);
        levelCanvasContext.drawImage(tileImage,tileX*tileSize,tileY*tileSize,tileSize,tileSize,-s,-s,2*s,2*s);
        levelCanvasContext.restore();
    }
    
    Redraw()
    {
        // cache to offscreen cavnas
        levelCanvas.width|=0;
        for(let y = 0; y<levelSize; y++)
        for(let x = 0; x<levelSize; x++)
             this.DrawTileData(x,y);
    }
    
    Render()
    {
        // draw the entire level (cached on a canvas) onto the main canvas
        let pos = cameraPos.Clone(-cameraScale*tileSize).Add(mainCanvasSize.Clone(.5));
        mainCanvasContext.drawImage
        (
            levelCanvas, 
            pos.x|0, pos.y|0,
            cameraScale*levelCanvas.width|0, cameraScale*levelCanvas.height|0
        );
    }
}

///////////////////////////////////////////////////////////////////////////////
// particle system
 
class Particle
{
    constructor(emitter,pos,velocity,size,lifeTime,startColor,endColor)
    {
        this.emitter = emitter;
        this.pos = pos;
        this.velocity = velocity;
        this.size = size;
        this.lifeTime = lifeTime;
        this.startColor = startColor;
        this.endColor = endColor;
        this.lifeTimer = new Timer();
        this.lifeTimer.Set();
    }

    Update()
    {
        // update physics
        this.pos.Add(this.velocity.Multiply(.9));
        
        // remove if dead
        if (this.lifeTimer.Get() > this.lifeTime)
             this.emitter.particles.splice(this.emitter.particles.indexOf(this),1);
        
        if (debugCollision)
            DebugRect(this.pos, new Vector2(this.size,this.size), '#0FF');
    }
    
    Render()
    {
        // get the color
        let p = Percent(this.lifeTimer.Get(), 0, this.lifeTime);
        let c = this.startColor.Clone().Lerp(this.endColor, p);
        c.a *= p<.1? p /.1 : 1; // fade in alpha
        mainCanvasContext.fillStyle=c.RGBA();
            
        // get the size
        let size = this.size * cameraScale * tileSize * Lerp(p,1,.5);
    
        // get the screen pos and render
        let pos = this.pos.Clone()
            .Subtract(cameraPos)
            .Multiply(tileSize*cameraScale)
            .Add(mainCanvasSize.Clone(.5))
            .Add(-size);
        mainCanvasContext.fillRect(pos.x, pos.y, 2*size, 2*size);
    }
}

class ParticleEmitter extends GameObject
{
    constructor( pos, emitSize, particleSize, color1, color2 ) 
    {
        super(pos,0,0,emitSize);
        this.particleSize=particleSize;
        this.color1=color1.Clone();
        this.color2=color2.Clone();
        this.particles=[];
        this.emitTimeBuffer=0;
    }
    
    Update()
    {
        // update particles
        this.particles.forEach(particle=>particle.Update());
        
        if (this.GetLifeTime() <= .05)
        {
            // emit new particles
            let secondsPerEmit = 1/200;
            this.emitTimeBuffer += timeDelta;
            while (this.emitTimeBuffer > secondsPerEmit)
            {
                this.emitTimeBuffer -= secondsPerEmit;
                this.AddParticle();
            }
        }
        else if (!this.particles.length)
        {
            // go away when all particles are gone
            this.Destroy();
        }
            
        if (debugCollision)
            DebugRect(this.pos, new Vector2(this.size,this.size), '#00F');
            
        super.Update();
    }
    
    Render() { this.particles.forEach(p=>p.Render()); }
    
    AddParticle()
    { 
        // create a new particle with random settings
        this.particles.push
        (
            new Particle
            (
                this,
                this.pos.Clone().Add(RandVector(Rand(this.size.x))),
                RandVector(Rand(.2)),
                RandBetween(this.particleSize,2*this.particleSize),
                RandBetween(.5,1),
                RandColorBetween(this.color1,this.color2),
                RandColorBetween(this.color1,this.color2).SetAlpha(0)
            )
        );
    }
}
