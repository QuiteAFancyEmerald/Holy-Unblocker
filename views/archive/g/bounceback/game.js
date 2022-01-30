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
    Bounce Back Javascript Game
    By Frank Force 2019

    Game Features
    - Boomerang physics & dash ability
    - Procedural level generation
    - 3 Enemy types
    - 7 types of pickups
    - Giant and invisible enemy variants
    - Final boss battle
    - Saves gems earned and max level reached
    - Shop system for buying items
    - Minimap
    - Footsteps, blood, and persistant effects system
    - 16 Different sound effects with zzfx
    - Procedurally generated music
    - Speed run mode doesn't effect normal save
    - Low health warning system
    - Level transition effect
*/

"use strict"; // strict mode
///////////////////////////////////////////////////////////////////////////////
// debug config

//godMode=1;
//debug=1;
//debugCanvas=1;
//debugCollision=1;
//soundEnable=0;

///////////////////////////////////////////////////////////////////////////////
// init

let startLevel=0;
let level;
let levelNumber;
let nextLevel;
let warpLevel=0;
let isFinalLevel;
let isStartLevel;
let levelTimer = new Timer();
let endLevelTimer = new Timer();
let levelExit;
let loadNextLevel;
let levelMaze = [];
let levelMazeSize = 4;
let levelColor = new Color();
let levelFrame;

let boss;
let player;
let playerData;
let playerStartPos;
let winTimer = new Timer();
let healthWarning = new Timer();
let buyTimer = new Timer();
let mainCanvas = c1;
let speedRunMode;
let speedRunTime=0;
let speedRunBestTime=0;
let coinSoundTimer = new Timer();

class PlayerData
{
    // track player data between levels (when player is destroyed)
    constructor()
    {
        this.health = 3;
        this.healthMax = 3;
        this.boomerangs = 1;
        this.bigBoomerangs = 0;
        this.coins = 0;
    }
}

function Init()
{
    EngineInit();
    
    // clear canvas to black so transition starts on a black screen
    mainCanvasContext.fillRect(0,0,mainCanvasSize.x, mainCanvasSize.y);

    Reset();
    NextLevel();
    EngineUpdate();
}

function Reset()
{
    // load local storage
    playerData = new PlayerData();
    if (localStorage.kbap_coins)
        playerData.coins = parseInt(localStorage.kbap_coins, 10);
    if (localStorage.kbap_warp)
        warpLevel = parseInt(localStorage.kbap_warp, 10);
    if (localStorage.kbap_bestTime)
        speedRunBestTime = parseInt(localStorage.kbap_bestTime, 10);
    nextLevel = startLevel;
}

function NextLevel()
{
    // go to next level
    levelFrame = 0;
    levelNumber = nextLevel;
    nextLevel = (nextLevel+1)%11;
    
    // track highest level reached
    if (!speedRunMode && levelNumber>warpLevel)
        warpLevel = levelNumber;
    localStorage.kbap_warp = warpLevel;
    
    // check if is special level
    isFinalLevel = levelNumber==10;
    isStartLevel = !levelNumber;
    if (isStartLevel)
        speedRunMode = 0; // reset speed run on start level
    
    InitLevel();
}

function InitLevel()
{
    // reset level stuff
    levelTimer.Set();
    winTimer.UnSet();
    endLevelTimer.UnSet();
    cameraScale=2;
    levelExit = 0;
    boss = 0;
    
    // clear everything
    StartTransiton();
    ClearGameObjects();
    
    // prevent player being stuck with no boomerangs
    if (!playerData.boomerangs && !playerData.bigBoomerangs)
        playerData.boomerangs=1;
    
    // create the level and player
    GenerateLevel();
    player = new Player(playerStartPos);
    
    // spawn debug objects
    //new Pickup(new Vector2(13,10),0);
    //new SlimeEnemy(new Vector2(8,10),3);
    //new JumpingEnemy(new Vector2(10,10));
    //new ShieldEnemy(new Vector2(12,10));
    //SpawnPickups(playerStartPos.Clone().AddXY(3,-6),1,100);
}

function SpawnPickups(pos, chance=1, count=1)
{
    // random chance to not drop
    if (Rand()>chance)
        return;
    
    for(let i=0;i<count;++i)
    {
        let p = new Pickup(pos.Clone(), 
            RandInt(8)?        // coin or heart?
            (RandInt(20)?3:4): // small or big coin?
            (RandInt(4)?0:1)   // half or whole heart?
        );
        
        // add extra velocity to sucessive spawns when dropping multiple
        if (count>1)
            p.velocity = RandVector(.1 + Clamp(i,3,30)*.03*Rand());
    }
}

 // collide with level object if one exists and return if bounced
function DestroyLevelObject(pos,bounceRock=1)
{
    // is something solid there?
    let data = level.GetDataFromPos(pos);
    if (!data.IsSolid())
        return 0;

    // did it hit an object?
    let bounce = 1;
    let type = data.object;
    if (type==1 || type==2)
    {
        // clear out the tile
        level.GetDataFromPos(pos).object = 0;
        level.DrawTileData(pos.x,pos.y);
        
        // small chance of dropping a pickup
        SpawnPickups(pos, .05);

        if (type==1)
        {
            // bush
            PlaySound(5);
            level.DrawEllipse(pos,RandBetween(.1,.15),RGBA(0,0,0,RandBetween(.3,.6)));
            bounce=0;
        }
        else
        {
            // rock
            PlaySound(14);
            for(let i=9;i--;)
                level.DrawEllipse(pos.Clone().Add(RandVector(.2)),RandBetween(.1,.2),RGBA(.2,.1,.05,RandBetween(.3,.6)));      
            bounce = bounceRock;
        }

        // particle effects
        new ParticleEmitter
        (
            pos, .5, .1,     // pos, emitter size, particle size
            type==1 ? new Color(.4,.8,.1,1) : new Color(.4,.2,.1,1),
            type==1 ? new Color(0,.1,0,1) : new Color(0,0,0,1)
        );
    }

    return bounce;
}

///////////////////////////////////////////////////////////////////////////////
// update/render

function Update()
{
    ++levelFrame;
    UpdateAudio();
    
    // save data
    if (!speedRunMode)
        localStorage.kbap_coins = playerData.coins;
        
    // update speed run time
    if (!paused && !winTimer.IsSet() && !player.IsDead())
        speedRunTime += timeDelta;
    
    // restart if dead or won
    if ((player.IsDead() || winTimer.IsSet()) && KeyWasPressed(27))
        loadNextLevel = 2;
        
    // load next level when ready
    if (endLevelTimer.IsSet() && endLevelTimer.Elapsed())
        loadNextLevel = 1;
    
    // debug key N to load next level
    if (debug && KeyWasPressed(78))
        loadNextLevel = 1;
        
    // zoom out on final level
    if (isFinalLevel)
        cameraScale = Max(cameraScale-.001,1); 
        
    if (isStartLevel)
    {
        // title screen
        let pos = new Vector2(8,3.7);
        let t = levelTimer.Get();
        let p = Percent(t,0,3.3)
        let b = Math.abs(3-4*p)/1.7;
        let c1 =`hsla(${t*99},99%,50%)`;
        level.DrawText('BOUNCE',   pos.Clone().AddXY(0,-b), 33*p,'center',2,'#000',c1);
        level.DrawText('BACK',     pos.Clone().AddXY(0,b+1.2), 33*p,'center',2,'#000',c1);
        if (levelFrame==200)
            level.DrawText('A JS13k 2019 Game',   new Vector2(8,9.5), 14);
        if (levelFrame==260)
            level.DrawText('By Frank Force',   new Vector2(8,10.5), 14);
    }
}

function PreRender()
{
    // camera is always centered on player
    cameraPos.Copy(player.pos);
    
    // clear canvas to level color
    mainCanvasContext.fillStyle=levelColor.RGBA();
    mainCanvasContext.fillRect(0,0,mainCanvasSize.x, mainCanvasSize.y);
    
    if (isStartLevel)
    {
        // background starfield in start level
        mainCanvasContext.fillStyle='#999';
        for(let i=2e3;i--;)
            mainCanvasContext.fillRect((Math.sin(i)*1e9-time*(i+1e3)/50)%(mainCanvas.width+9)-9,i*9%mainCanvas.height,i%7,i%7);
    }
        
    // draw the level (bottom layer)
    level.Render();
}

function PostRender()
{  
    if (loadNextLevel)
    {
        // hook to load next level is here so transition effects work!
        if (loadNextLevel==2)
            Reset();
        loadNextLevel = 0;
        NextLevel();
    }
    
    UpdateTransiton();
    
    // centered hud text
    let bigText = '';
    if (paused)
        bigText = '-paused-'
    if (winTimer.IsSet())
        bigText = 'You Win!';
    if (player.IsDead())
    {
        bigText = 'Game Over!'
        DrawText('Press Escape',mainCanvasSize.x/2, mainCanvasSize.y/2+80, 42);
    }  
    DrawText(bigText,mainCanvasSize.x/2, mainCanvasSize.y/2-80, 72, 'center', 2);
   
    {
        // hud
        let iconSize = 16;
        let y = iconSize;

        for(let i=0;i<player.healthMax;i++)
        {
            let t = 1;
            let s = iconSize;
            if (healthWarning.Get() < .5)
                s *= 1+Math.sin(2*PI*healthWarning.Get()/.5)*.2;
            if (player.health > i)
                t = player.health-i>=1?3:2;
            DrawScreenTile(iconSize+2*iconSize*i,y,s,t,5);
        }
    
        y += 2*iconSize;
        //if (playerData.boomerangs)
        {
            DrawScreenTile(iconSize,y,iconSize,0,5);
            DrawText(playerData.boomerangs, 34, y+2, 32, 'left');
        }
        if (playerData.bigBoomerangs)
        {
            DrawScreenTile(iconSize+60,y,iconSize,7,5);
            DrawText(playerData.bigBoomerangs, 34+60, y+2, 32, 'left');
        }
        //if (playerData.coins)
        {
            y += 2*iconSize;
            DrawScreenTile(iconSize,5*iconSize,iconSize,5,5);
            DrawText(playerData.coins, 34, y+2, 32, 'left');
        }
        
        if (speedRunMode)
        {
            // show time if speed run mode is activated
            let c = (player.IsDead() || winTimer.IsSet())? '#F00' : '#000';
            DrawText(FormatTime(speedRunTime), mainCanvas.width/2, 28, 40, 'center',1,c);
        }

        RenderMap();
    }
    
    // mouse cursor
    mainCanvas.style.cursor='none'; 
    let mx = mousePos.x|0;
    let my = mousePos.y|0;
    let mw = 2;
    let mh = 15;
    mainCanvasContext.globalCompositeOperation = 'difference';
    mainCanvasContext.fillStyle='#FFF'
    mainCanvasContext.fillRect(mx-mw,my-mh,mw*2,mh*2);
    mainCanvasContext.fillRect(mx-mh,my-mw,mh*2,mw*2);
    mainCanvasContext.globalCompositeOperation = 'source-over';
}

function MazeDataPos(pos)
{
    // get the index into the maze array
    let cellRatio = levelMazeSize / levelSize;
    pos = pos.Clone(cellRatio);
    return (pos.x|0) + (pos.y|0) * levelMazeSize;
}

function RenderMap()
{
    if ((isStartLevel || isFinalLevel) && !debug)
        return;

    let iconSize = 16;
    let y = iconSize;
    let w = 24;
    let o = mainCanvasSize.x-levelMazeSize*w-10;

    // show level number
    y += 2*iconSize;
    if (!isStartLevel)
        DrawText('L-'+ levelNumber, o-10, 24, 32,'right');

    // mark room player is in as visited
    if (levelMaze[MazeDataPos(player.pos)])
        levelMaze[MazeDataPos(player.pos)] = -1;

    let cellWidth = levelSize / levelMazeSize;
    let playerMazeX = player.pos.x / cellWidth | 0;
    let playerMazeY = player.pos.y / cellWidth | 0;

    // render minimap
    mainCanvasContext.strokeStyle='#000';
    mainCanvasContext.lineWidth=2;
    mainCanvasContext.strokeRect(o,10,w*levelMazeSize,w*levelMazeSize);
    for(let y=levelMazeSize;y--;)
    for(let x=levelMazeSize;x--;)
    {
        let m = levelMaze[x+y*levelMazeSize];

        let c = '#0004'; // unexplored invalid
        if (m>0)
            c = '#333'; // unexplored valid
        if (m==-1) 
            c = '#FFF'; // explored
        if (x == playerMazeX && y == playerMazeY)
            c = '#F00'; // player location

        mainCanvasContext.fillStyle=c;
        mainCanvasContext.fillRect(o+x*w,10+y*w,w,w);
        if (m)
            mainCanvasContext.strokeRect(o+x*w,10+y*w,w,w);
    }
    
    // draw the objects on the minimap
    gameObjects.forEach(object=>
    {
        let r = object.radarSize;
        if (r && levelMaze[MazeDataPos(object.pos)]<0)
        {
            let p = object.pos.Clone(w/cellWidth).AddXY(o,10).Round();
            mainCanvasContext.fillStyle=object==player?'#FFF':'#000';
            mainCanvasContext.fillRect(p.x-r-1,p.y-r-1,2*r+2,2*r+2);
            mainCanvasContext.fillStyle=object==player?'#000':object.isEnemy?'#F00':'#FFF';
            mainCanvasContext.fillRect(p.x-r,p.y-r,2*r,2*r);
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
// game objects

class MyGameObject extends GameObject
{
    constructor(pos,tileX=0,tileY=0,size=.5,collisionSize=0,health=1)
    {
        super(pos,tileX,tileY,size,collisionSize,health);
        this.walkFrame=0;
        this.rotation=1;
        this.radarSize=1;
        this.isInvisible = 0;
        this.bloodColor = new Color(.8,0,.05,.5);
        this.bloodAdditive = 0;
    }
    
    UpdateWalk()
    {
        // footprints
        let lastWalkFrame = this.walkFrame;
        this.walkFrame += 1.5*this.velocity.Length();
        if (lastWalkFrame%2 < 1 && this.walkFrame%2 >1 || this.walkFrame%2 < lastWalkFrame%2)
        {
            let isOnSand = this.IsOnSand();
            let angle = this.rotation * PI/2;
            let side = this.walkFrame%2 < lastWalkFrame%2? 1 : -1
            let offset = (new Vector2(0,side/8)).Rotate(angle);
            let footPos = this.pos.Clone().Add(offset);
            let c = isOnSand?'#4215':'#2223';
            let s = new Vector2(.2,isOnSand?.2:.1);
            if (isOnSand)
            {
                s.y*=RandBetween(1,1.5);
                s.x*=RandBetween(1,1.5);
            }
            footPos.y+=.3;
            level.DrawEllipse(footPos,s,c,angle);
        }
    }
    
    BloodSplat(scale=1,particles=1)
    {
        // draw a bunch of random ellipses
        if (this.bloodAdditive)
            levelCanvasContext.globalCompositeOperation='screen';
        for(let i=30;i--;)
        {
            let pos = this.pos.Clone().Add(RandVector(Rand(scale*this.size.x)));
            let size = new Vector2(this.size.x*RandBetween(.2,.5),this.size.y*RandBetween(.2,.5))
            let angle = RandBetween(0,2*PI);
            level.DrawEllipse(pos,size.Multiply(scale),this.bloodColor.RGBA(),angle); 
        }  
        levelCanvasContext.globalCompositeOperation='source-over';

        // kick off a particle effect
        if (particles)
        {
            let s = scale*this.size.x;
            let p = new ParticleEmitter
            (
                this.pos, s*.6, s*.2, // pos, emitter size, particle size
                this.bloodColor.Clone().SetAlpha(1), 
                this.bloodColor.Clone(this.bloodAdditive?3:.5).SetAlpha(1)
            );
        }
    }
    
    Kill()
    {
        this.BloodSplat();
        PlaySound(9);
        super.Kill();
    }
    
    Render()
    {
        // invisible objects become visible when damaged
        if (this.isInvisible && !shadowRenderPass && !hitRenderPass)
            mainCanvasContext.globalAlpha= .1 + this.GetDamageFlashPercent();
        super.Render();
    }
    
    IsOnSand() { return level.GetDataFromPos(this.pos).type == 2; }
}
    
class Player extends MyGameObject
{
    constructor(pos) 
    {
        super(pos,0,4,.5,.4,playerData.healthMax);
        this.health = playerData.health;
        this.dashTimer = new Timer();
        this.throwTimer = new Timer();
        this.inputTimer = new Timer();
        this.playerDamageTimer = new Timer();
        this.inputTimer.Set();
        this.throwRotation = 0;
        this.posBuffer = [];
        this.dashWaitTime = 3;
        this.radarSize=2;
    }
    
    IsDashing() { return !this.dashTimer.Elapsed(); }
    
    CollideLevel(data, pos)
    {
        // destroy level if dashing
        if (this.IsDashing())
            return DestroyLevelObject(pos);
        else
            return super.CollideLevel(data, pos);
    }
    
    IsIntro() { return (levelTimer.Get() < 1.5) }
    
    Update() 
    {
        // keep player data updated
        playerData.health = this.health;
        if (this.IsDead() || endLevelTimer.IsSet() || this.IsIntro())
        {
            // stop and do no more
            return;
        }
        
        if (this.health <= 1 && healthWarning.Get() > this.health)
        {
            // health warning
            healthWarning.Set();
            PlaySound(11);
        }
    
        if (MouseWasPressed() && (playerData.boomerangs|| playerData.bigBoomerangs))
        {
            // throw boomerang
            let isBig = 0;
            if (playerData.bigBoomerangs)
            {
                --playerData.bigBoomerangs;
                isBig = 1;
            }
            else
                --playerData.boomerangs;
            let b = new Boomerang(this.pos,isBig);
            this.throwRotation= b.Throw(this, mousePosWorld);
            this.throwTimer.Set(.4);
        }
    
        // move input
        let acceleration = new Vector2();
        if (KeyIsDown(65))
            acceleration.x -= 1,this.rotation=0;
        if (KeyIsDown(68))
            acceleration.x += 1,this.rotation=2;
        if (KeyIsDown(87))
            acceleration.y -= 1,this.rotation=3;
        if (KeyIsDown(83))
            acceleration.y += 1,this.rotation=1;

        let isOnSand = this.IsOnSand();
        if (this.IsDashing())
        {
            // update dash
            if (!acceleration.x && !acceleration.y)
                acceleration.Set(-1,0).Rotate(-this.rotation*PI/2);
        
            // no damage or slow from sand while dashing
            this.damageTimer.Set();
            isOnSand = 0;
            
            // track players position for the dash render effect
            if (frame%3==0)
                this.posBuffer.push(this.pos.Clone());
            if (this.posBuffer.length > 20)
                this.posBuffer.shift();
        }
        else
        {
            // update non dash
            this.posBuffer = [];
            
            if (this.dashTimer.IsSet() && this.dashTimer.Get()>this.dashWaitTime)
            {
                // play sound when dash is ready again
                this.dashTimer.UnSet();
                PlaySound(16);
            }
        
            if ((KeyWasPressed(32)||KeyWasPressed(16)) && !this.dashTimer.IsSet())
            {
                // start dash
                PlaySound(12);
                this.dashTimer.Set(.5);
            }
        }
        
        if (acceleration.x || acceleration.y)
        {
            // apply acceleration
            acceleration.Normalize(.016*(isOnSand?.5:1));
            if (this.IsDashing())
                acceleration.Multiply(2);
            this.velocity.Add(acceleration);
            this.inputTimer.Set();
        }
        
        // reset walk frame when input isnt pressed for a while
        if (this.inputTimer.Get() > 1)
            this.walkFrame = 0;
             
        // update walk if not throwing or dashing
        if (this.throwTimer.Elapsed() && !this.IsDashing())
           this.UpdateWalk();
        
        super.Update();
    }
    
    Render()
    {
        if (endLevelTimer.IsSet())
            return;
    
        if (this.IsDead() || this.IsIntro() && isStartLevel)
        {
            // set to dead tile
            this.tileX = 7;
            this.tileY = 3;
            super.Render();
            return;
        }   
        
        // figure out the tile, rotation and mirror
        this.tileY = 4;
        if (this.rotation&1)
        {
            // facing left or right
            // walk by toggling betwen 2 frames and mirror to face direction
            this.tileX = this.rotation==1?2:3;
            this.mirror = this.walkFrame%2|0;
            if (!this.throwTimer.Elapsed()||!this.dashTimer.Elapsed())
                this.tileX += 3; // throw/dash frame
            else if (this.inputTimer.Get() > 1 && this.rotation==1)
            {
                // idle
                this.tileX = 7;
                this.mirror = (this.inputTimer.Get()/2|0)&1;
            }
        }
        else
        {
            // facing up or down
            // walk by toggling mirror and select frame to face direction
            this.mirror = this.rotation!=2;
            this.tileX = this.walkFrame%2|0;
            if (!this.throwTimer.Elapsed()||!this.dashTimer.Elapsed())
                this.tileX = 4; // throw/dash frame
        }
           
        let hit = hitRenderPass;
        if (!this.throwTimer.Elapsed())
        {
            // use the throw rotation if throwing
            this.rotation = this.throwRotation;
            if (this.rotation&1)
                this.mirror = this.rotation==1;
        }
        if (!shadowRenderPass && hit)
        {
            // draw the position buffer during the hit render pass when dashing
            mainCanvasContext.globalCompositeOperation = 'screen';
            for(let i=this.posBuffer.length;i--;)
            {
                hitRenderPass = hit*(i/this.posBuffer.length + .01);
                DrawTile(this.posBuffer[i],this.size,this.tileX,this.tileY,this.angle,this.mirror,this.height);
            }
            hitRenderPass = hit;
            mainCanvasContext.globalCompositeOperation = 'difference';
        }
    
        let d = this.dashTimer.Get();
        if (!shadowRenderPass && d<this.dashWaitTime+.5)
        {
            // show a white outline around the player when dash is charging
            hitRenderPass = d<this.dashWaitTime?d/this.dashWaitTime:Math.sin((d-this.dashWaitTime)*PI*4);
            DrawTile(this.pos,this.size.Clone(1.1),this.tileX,this.tileY,this.angle,this.mirror,this.height);
            hitRenderPass = hit;
        }
        
        super.Render();
        
        if (playerData.boomerangs || playerData.bigBoomerangs)
        {
            // draw boomerang on player's back
            let x = playerData.bigBoomerangs?7:0;
            if (this.rotation == 3)
                DrawTile(this.pos,this.size,x,5);
            if (this.rotation%2==0)
                DrawTile(this.pos.Clone().AddXY(-(this.rotation-1)*.2,0),this.size.Clone(new Vector2(.6,1)),x,5);
        }
    }
    
    Damage(damage) 
    {
        // extra long damage timer for player
        if (!this.playerDamageTimer.Elapsed())
            return 0;
    
        // prepvent damage during intro/outro
        if (godMode || endLevelTimer.IsSet() || this.IsIntro() || winTimer.IsSet())
            return 0;
    
        // try to apply damage
        let damageDone = super.Damage(damage);
        if (!damageDone)
            return 0;
            
        this.BloodSplat();
        PlaySound(1);
        this.playerDamageTimer.Set(1);
        return damageDone;
    }
    
    Kill()                  
    {  
        this.BloodSplat(2);
        PlaySound(2);
    }
}

///////////////////////////////////////////////////////////////////////////////

class Boomerang  extends MyGameObject
{
    constructor(pos,isBig=0) 
    {
        super(pos,isBig?7:0,5,.5,isBig?.45:.4);
            
        this.damping = .98;
        this.angle = 0;
        this.canDamageLevel = 1;
        this.heldPickup = 0;
        this.throwAccel = 0;
        this.throwFrames = 0;
        this.bounceObject = 0;
        this.isBig = isBig;
    }
    
    Throw(owner, targetPos)
    {
        PlaySound(7)
        this.throwFrames = this.isBig?9:8;
        this.throwAccel = targetPos.Clone().Subtract(owner.pos);
        this.throwAccel.Normalize(.04);
        this.angleVelocity = .5;
        this.height = this.angleVelocity/2;
        this.velocity = owner.velocity.Clone();
        return this.throwAccel.Rotation();
    }
    
    CollideLevel(data, pos)
    {
        if (data.object)
            this.damageTimer.Set(); // flash when it hits an object
        return DestroyLevelObject(pos,!this.isBig);
    }
    
    Update() 
    {
        if (this.throwFrames)
            this.throwFrames--;
    
        if (!this.angleVelocity)
        {
            // boomerang is on the ground
            this.radarSize=3;
            this.damageFlashTime = .8;
            this.differenceFlash = 0;
            if (this.heldPickup)
                this.heldPickup.isHeld=0;
            this.heldPickup=0;
            if (Rand() < .005 && this.damageTimer.Get() > 4*this.damageFlashTime)
                this.damageTimer.Set(-this.damageFlashTime/2); // sparkle
        }
        else
        {
            if (endLevelTimer.IsSet())
                endLevelTimer.Set(1); // wait for boomerang to end level
        
            // apply throw acceleration
            let a = this.GetLifeTime();
            if (!mouseIsDown || !this.throwFrames)
                this.throwAccel=0;
            else if (this.throwAccel)
                this.velocity.Add(this.throwAccel);
        
            // reduce angular velocity
            this.angleVelocity -= .002;
            if (this.angleVelocity < .1)
            {
                // slow it down even faster
                this.angleVelocity -= .005;
                this.velocity.Multiply(.8);
                if (this.angleVelocity < 0)
                    this.angleVelocity = 0;
            }
            
            // height is proportional to angular velocity
            this.height = this.angleVelocity/2;
            if (!this.throwAccel && this.height > 0)
            {
                // pull to player
                let d = player.pos.Clone();
                d.Subtract(this.pos).Multiply(0.004 * this.angleVelocity);
                this.velocity.Add(d);
            }
            
            gameObjects.forEach(o=>
            {
                if (!this.isBig && o.isSmallPickup && o.GetLifeTime() > .5 && !o.isHeld && !this.heldPickup && o.IsTouching(this))
                {
                    // grab object
                    o.isHeld = 1;
                    this.heldPickup = o;
                }
                else if ((o.isEnemy||o.isStore) && o.IsTouching(this))
                {
                    // hit object
                    if (this.bounceObject == o || o.ReflectDamage(this.velocity))
                    {
                        if (this.bounceObject != o)
                        {
                            // reflect
                            PlaySound(15);
                            this.bounceObject = o;
                            this.velocity.Multiply(-.4);
                            this.angleVelocity*=.4;
                            this.damageTimer.Set();
                            this.throwAccel=0;
                        }
                    }
                    else if (o.Damage(1+this.isBig))
                    {
                        // apply damage
                        if (!isStartLevel) // dont push in hub
                            o.velocity.Add(this.velocity.Clone(.5));
                        this.damageTimer.Set();
                    }
                }
            });
        }
        
        // let player pick it up
        if ((!this.angleVelocity || this.GetLifeTime() > .5) && !player.IsDead() && player.Distance(this) < .6)
            this.Pickup();
        
        super.Update();

        // set all pickups to match our position
        if (this.heldPickup)
            this.heldPickup.pos.Copy(this.pos).AddXY(0,-.001);
    }
    
    Pickup()
    {
        PlaySound(6);
        if (this.isBig)
            playerData.bigBoomerangs++;
        else
            playerData.boomerangs++;
        player.throwTimer.Set(.3);
        player.throwRotation=this.pos.Clone().Subtract(player.pos).Rotation();
        this.Destroy();
    }
}

///////////////////////////////////////////////////////////////////////////////

class Pickup extends MyGameObject
{
    // type: 0=half, 1=whole, 2=container, 3=coin, 4=large coin
    
    constructor(pos, type=0) 
    { 
        super(pos,2+type,5,.5,.3); 
        this.type = type;
        this.timeOffset = Rand(9);
        this.isSmallPickup = type != 2;
        this.isHeld=0;
        this.differenceFlash = 0;
        this.damageFlashTime = .8;
        this.radarSize = this.isSmallPickup?1:3;
    }
    
    Update() 
    {
        // random sparkles
        if (Rand() < .005 && this.damageTimer.Get() > 4*this.damageFlashTime)
            this.damageTimer.Set(-this.damageFlashTime/2);
        
        // bob up and down
        this.height = .1+.1*Math.sin(2*time+this.timeOffset);
        
        // let player pick it up
        if (!player.IsDead() && player.IsTouching(this))
            this.Pickup();
        else if (boss && boss.IsTouching(this))
        {
            // boss destroys pickups
            PlaySound(14);
            this.Destroy();
        }
        
        super.Update();
    }
    
    Pickup()
    {
        if (this.type==2)
        {
            // heart container
            ++playerData.healthMax;
            player.healthMax = playerData.healthMax;
            player.Heal(1);
            PlaySound(4);
        }
        else if (this.type==3)
        {
            // 1 coin
            PlaySound(10);
            ++playerData.coins;
        }
        else if (this.type==4)
        {
            // 5 coin
            PlaySound(10);
            playerData.coins+=5;
        }
        else
        {
            // half or whole heart
            player.Heal(.5+ this.type/2)
            PlaySound(3);
        }
        this.Destroy();
    }
}

///////////////////////////////////////////////////////////////////////////////

class Enemy extends MyGameObject
{
    constructor(pos,tileX=0,tileY=0,size=.5,collisionSize=0,health=1,big=0)
    { 
        super(pos,tileX,tileY,size,collisionSize,health); 
        this.isEnemy = 1
        this.spawnPickup = 1;
        this.bloodAdditive = 1;
        this.isBig = big;
        this.radarSize=big?2:1;
    }
    
    Damage(damage) 
    {
        let damageDone = super.Damage(damage);
        if (damageDone && !this.IsDead())
        {
            this.BloodSplat(.5);
            PlaySound(8);
        }
        
        return damageDone;
    }
    
    Update()
    {
        if (player.IsTouching(this))
        if (player.Damage(.5))
        {
            // push player when damaged
            let accel = player.pos.Clone();
            accel.Subtract(this.pos).Normalize(.1);
            player.velocity.Add(accel);
        }

        super.Update();
    }
    
    Kill()
    {
        super.Kill();
        
        // spawn portal if no enemies left
        if (!levelExit && !isFinalLevel && !player.IsDead())
        {
            if (!gameObjects.some(o=>o.isEnemy))
            {
                levelExit = new LevelExit(this.pos);
                if (!this.isBig)
                    this.spawnPickup = 0;
            }
        }

        // spawn pickups
        let count = 1;
        if (this.isBig)
            count = RandIntBetween(3, 5);
        if (this.isInvisible)
            count = count * 2;
        SpawnPickups(this.pos, this.spawnPickup, count);
    }
}

///////////////////////////////////////////////////////////////////////////////

class SlimeEnemy extends Enemy
{
    constructor(pos,healthLevel,difficulty=1)
    { 
        let size = .25*healthLevel;
        super(pos,5+difficulty,0,size,size*.8,healthLevel*difficulty,healthLevel>3); 
        this.bloodColor = difficulty>1?new Color(1,0,.5,.5):new Color(0,.5,1,.5);
        this.randMoveTimer = new Timer();
        this.randAccel = new Vector2();
        this.spawnPickup = healthLevel == 1? difficulty/2 : 0;
        this.difficulty = difficulty;
        this.healthLevel = healthLevel;
        this.baseSize = size;
        this.damping = .9;
    }
    
    Update()
    {
        let playerDistance = player.pos.Distance(this.pos);
        if (playerDistance > 20)
            return;
        
        // draw additive trail
        levelCanvasContext.globalCompositeOperation='screen';
        let trailColor = this.bloodColor.Clone().SetAlpha(.05).RGBA();
        level.DrawEllipse(this.pos,(new Vector2(.6,.4)).Multiply(this.size),trailColor);
        levelCanvasContext.globalCompositeOperation='source-over';
     
        // random movement
        if (this.randMoveTimer.Elapsed())
        {
            this.randMoveTimer.Set(RandBetween(.5,1));
            this.randAccel = RandVector(1.3);
        }
    
        // calculate acceleration
        let accel = new Vector2();
        if (!player.IsDead() && playerDistance < 15)
            accel.Copy(player.pos)
                .Subtract(this.pos)
                .Normalize();
        accel.Add(this.randAccel)
            .Multiply(this.difficulty>1?.004:.003)
            .Multiply(this.IsOnSand()?.5:1);
        this.velocity.Add(accel);
    
        // change shape as it moves
        let s = Math.sin(10 * this.GetLifeTime());
        let sx = .9+.1*(1-s);
        let sy = .9+.1*s;
        this.size.Set(this.baseSize*sx,this.baseSize*sy);
        
        super.Update();
    }
       
    Kill() 
    {
        if (this.healthLevel > 1)
        {
            // spawn baby slimes
            for(let i=2;i--;)
            {
                let s = new SlimeEnemy(this.pos, this.healthLevel-1, this.difficulty);
                s.damageTimer.Set(); // prevent them taking damage right away
                s.isInvisible = this.isInvisible;
                s.velocity = this.velocity.Clone();
            }
        }
        
        super.Kill();
    }
}

///////////////////////////////////////////////////////////////////////////////

class JumpingEnemy extends Enemy
{
    constructor(pos,isBig=0)
    { 
        super(pos,2,2,isBig?1:.5,isBig?.8:.4,isBig?12:4,isBig); 
        this.landTimer = new Timer();
        this.jumpWaitTimer = new Timer();
        this.jumpWaitTimer.Set(RandBetween(1,3));
        this.zVelocity = 0;
        this.randOffset = new Vector2();
        this.bloodColor = new Color(1,.5,0,.1);
        this.speed = isBig?.012:.01;
    }
    
    Update()
    {
        let playerDistance = player.pos.Distance(this.pos);
        if (playerDistance > 20)
            return;
        
        if (this.jumpWaitTimer.Elapsed() && this.height <= 0)
        {
            // jump
            this.zVelocity = RandBetween(.15,.2);
            if (this.isBig)
                 this.zVelocity *= 1.2;
            this.jumpWaitTimer.Set(RandBetween(1.5,3));
            this.randOffset = RandVector(RandBetween(0,1));
            this.landTimer.UnSet();
        }
    
        // update jump
        this.height += this.zVelocity;
        this.zVelocity -= .005;
        if (this.height <= 0)
        {
            // is on ground
            if (!this.landTimer.IsSet())
            {
                // just landed
                this.landTimer.Set(.3);
                this.BloodSplat(.8,0);
            }
            this.height = this.zVelocity = 0;
        }
        else
        {
            // is in the air
            let accel = new Vector2();
            if (!player.IsDead() && playerDistance < 15)
            {
                // move towards player
                accel.Copy(player.pos)
                    .Subtract(this.pos)
                    .ClampLength(1)
                    .Add(this.randOffset);
            }
            else
                accel.Copy(this.randOffset);
            this.velocity.Add(accel.Multiply(this.speed));
            
            //DebugPoint(player.pos.Clone().Add(this.randOffset));
        }
    
        // set draw tile when jumping or landed
        this.tileX = 2;
        if (this.jumpWaitTimer.Get() > -.25 || !this.landTimer.Elapsed())
            ++this.tileX;
            
        super.Update();
    }
}

///////////////////////////////////////////////////////////////////////////////

class ShieldEnemy extends Enemy
{
    constructor(pos, type=0, isBig=0)
    { 
        super(pos,4,2,isBig?1:.5,isBig?.8:.4,type?50:isBig?6:2,isBig); 
        this.moveTimer = new Timer();
        this.dashTimer = new Timer();
        this.damping=.8;
        this.bumped=0;
        this.type = type;
        this.moveBackwards = 0;
        this.speed = isBig?.015:.012;
        if (type)
        {
            boss = this;
            this.speed = .018;
            this.bloodAdditive = 0;
        }
        else
            this.bloodColor = new Color(.3,1,0,.5);
            
        this.bossIntro = this.type && !isStartLevel;
    }
    
    ReflectDamage(direction)
    { 
        if (this.damageTimer.Get() < .5)
            return 0;
    
        // figure out if damge should be reflected
        let d = new Vector2(1,0).Rotate(this.rotation*PI/2);
        let a = direction.Clone().Normalize().DotProduct(d);
        return this.type? (a > .4) : (a < -.4);
    }
    
    CollideLevel(data, pos)
    {
        let small = !this.isBig && !this.type;
        if (data.IsSolid())
        {
            if (small)
            {
                if (this.dashTimer.Elapsed()) // change direction if not dashing
                    this.rotation = (this.rotation+2)%4;
            }
            this.velocity.Multiply(0);
        }
        
        // break level objects
        return DestroyLevelObject(pos, !this.type);
    }
    
    Damage(damage) 
    {
        // prevent player killing the boss after dying
        if (this.type && player.IsDead())
            return 0;
    
        return super.Damage(damage);
    }
    
    Update()
    {
        let lifeTime = this.GetLifeTime();
        let isOnSand = !this.type && this.IsOnSand();
        let playerDistance = player.pos.Distance(this.pos);
        
        if (this.type && isStartLevel)
        {
            // title screen - run towards the level exit
            let d = this.pos.x - levelExit.pos.x;
            this.rotation = Math.abs(d) < .5? 1: 0;
            if (this.Distance(levelExit) < 1)
                this.Destroy();
        }
        else if (this.bossIntro)
        {
            // boss intro, run left and up
            if (this.pos.x>24)
            {
                this.pos.x = 24
                this.rotation = 3;
            }
            else
                this.rotation = 0;
        }
        else
        {
            if (playerDistance > 20 && !this.type)
                return;

            // update ai
            if (this.moveTimer.Elapsed() && this.dashTimer.Elapsed())
            {
                this.moveBackwards = 0;
                if (!player.IsDead() && (playerDistance < 15 || this.type))
                {
                    // get player direction
                    let d = player.pos.Clone().Subtract(this.pos);
                    let r = d.Rotation();
                    if (!(r&1))
                        r=(r+2)%4; // left/right is backwards
                    this.rotation = r;
                    
                    // boss can randomly move backwards
                    if (this.type)
                        this.moveBackwards = Rand()<.5;
                    if (this.moveBackwards)
                        this.rotation = (this.rotation+2)%4

                    // randomly decide to dash
                    if (Rand()<.2)
                        this.dashTimer.Set(2);
                }
                else
                    this.rotation = RandInt(4);
                this.moveTimer.Set(RandBetween(.8,2));
            }
        }

        // apply move acceleration
        let moveAccel = new Vector2(this.speed*(isOnSand?.5:1),0).Rotate(this.rotation*PI/2);
        if (!this.dashTimer.Elapsed())
            moveAccel.Multiply((this.dashTimer.Get() < -1)?0:2);
        
        if (this.type && isStartLevel)
        {
            // title screen 
            if (playerDistance > 10.5)
                moveAccel.Multiply(0);
        }
        else if (this.type)
        {
            // boss fight
            if (lifeTime > 10 && this.health < this.healthMax || lifeTime > 20 && playerDistance < 10 )
                this.bossIntro = 0;
        
            if (this.bossIntro)
            {
                if (playerDistance > 14)
                    moveAccel.Multiply(0);
                if (this.pos.y < 21)
                {
                    // wait to get hit
                    moveAccel.Multiply(0);
                    this.rotation = 1;
                    this.walkFrame += .021;
                }
            }
            else
            {
                this.bossIntro = 0;
                if (this.size.x<2)
                {
                    // grow giant
                    this.size.AddXY(.005,.005);
                    this.collisionSize = this.size.x*.8;
                    moveAccel.Multiply(0);
                    this.walkFrame += .1;
                    if (frame%10==0)
                        this.rotation = (this.rotation+1)%4;
                    moveAccel.Multiply(0);
                }
                else
                    this.size.Set(2,2);
            }
        }
        
        // apply acceleration
        this.velocity.Add(moveAccel.Multiply(this.moveBackwards?-1:1));
    
        // set the tile and mirror
        if (this.rotation&1)
        {
            // facing left or right
            this.tileX = (this.rotation==1)?6:7;
            this.mirror = this.walkFrame%2|0;
        }
        else
        {
            // facing up or down
            this.mirror = this.rotation;
            this.tileX = 4 + (this.walkFrame%2|0);
        }
        
        if (this.type)
        {
            // if boss, offset the tile position
            this.tileY=3;
            this.tileX-=2;
        }
        
        this.UpdateWalk();
        super.Update();
    }
    
    Kill()
    {
        super.Kill();
        
        if (this.type)
        {
            boss = 0;
            if (isFinalLevel)
            {
                // player win
                new Pickup(this.pos, 2);
                SpawnPickups(this.pos,1,40);
                winTimer.Set();
                localStorage.kbap_warp=0;
                localStorage.kbap_won=1;
                speedRunTime=speedRunTime|0;
                if (speedRunMode && (!speedRunBestTime || speedRunTime < speedRunBestTime))
                {
                    // track best speed run time
                    speedRunBestTime = speedRunTime;
                    localStorage.kbap_bestTime=speedRunBestTime;
                }
                PlaySound(2);
            }
        }
    }
}

///////////////////////////////////////////////////////////////////////////////

class Store extends MyGameObject
{
    constructor(pos) 
    {
        super(pos,7,1,.5,.5);
        
        // spawn random items
        this.count = isStartLevel||isFinalLevel?3:2 + RandInt(2);
        let o = 1-this.count;
        for(let i=this.count;i--;)
        {
            let item = RandInt(4);
            if (isStartLevel || isFinalLevel)
                item = i+1;
            else
            {
                if (i==0)
                    item = RandIntBetween(0,1);
                else if (i==1)
                    item = RandIntBetween(2,3);
            }
            new StoreItem(pos.Clone().AddXY(i*2+o,0),item,this);
        }
            
        this.pos.y-=2;
        this.isStore = 1;
        level.FillCircleType(pos,3,1); // clear area
        level.FillCircleObject(pos,5,0); // clear area
    }
    
    Kill()
    {
        SpawnPickups(this.pos);
        super.Kill();
    }
    
    Update()
    {        
        // draw carpet after being spawned
        if (this.GetLifeTime()<.1)
        {
            let p = this.pos.Clone().AddXY(0,2).Multiply(tileSize);
            let w = this.count*16;
            levelCanvasContext.fillStyle='#CCC';
            levelCanvasContext.fillRect(p.x-w-2,p.y-30-2,w*2+4,40+4);
            levelCanvasContext.fillStyle='#329';
            levelCanvasContext.fillRect(p.x-w,p.y-30,w*2,40);
        }
    
        this.mirror = player.pos.x<this.pos.x; // allways face player
        if (!buyTimer.Elapsed())
        {
            // jump on buy
            let b = buyTimer.Get();
            this.height = -b*(.5-.5*Math.cos(6*PI*b))/2;
        }
        
        // check enemy hits
        gameObjects.forEach(o=>{if (o.isEnemy && o.IsTouching(this))this.Kill();}); 
        
        super.Update();
    }
}

class StoreItem extends MyGameObject
{
    constructor(pos,type,owner) 
    { 
        // 0 = whole heart
        // 1 = heart container
        // 2 = boomerang
        // 3 = big boomerang
        
        super(pos,type+3,5,.5,.2); 
        this.owner = owner;
        this.type = type;
        this.cost = 5;
        this.wasTouching=0;
        
        // set up tile and cost
        if (this.type == 1)
            this.cost = 50;
        if (this.type == 2)
        {
            this.cost = 40;
            this.tileX = 0;
        }
        if (this.type == 3)
        {
            this.cost = 90;
            this.tileX = 7;
        }
    
        // randomize cost
        if (!isStartLevel)
            this.cost *= RandBetween(.5,1.5);
        this.cost = Clamp(this.cost, 1, 99);
        this.cost |= 0;
    }
    
    Update()
    {
        // let player pickup
        if (!player.IsDead() && player.IsTouching(this))
        {
            if (!this.wasTouching)
                this.Pickup();
            this.wasTouching = 1;
        }
        else
            this.wasTouching = 0;
            
        if (this.owner && this.owner.IsDead())
            this.Destroy();
            
        super.Update();
    }
    
    Pickup()
    {
        if (this.cost>playerData.coins)
        {
            // player doesn't have enough money
            PlaySound(15);
            this.damageTimer.Set();
            return;
        }
        
        // give player the item
        if (this.type < 2)
            (new Pickup(this.pos,this.type+1)).Pickup();
        else 
            (new Boomerang(this.pos,this.type == 3)).Pickup();
            
        buyTimer.Set(1);
        playerData.coins-=this.cost;
        this.Destroy();
    }
    
    Render()
    {
        if (!shadowRenderPass && !hitRenderPass)
        {
            // draw the price
            SetCanvasTransform(this.pos.Clone().AddXY(0,-1), this.size);
            DrawText(this.cost,-6,0,14,'left',.5,this.GetDamageTime()<.5?"#F00":"#000");
            DrawScreenTile(-10,-1,4,5,5);
            mainCanvasContext.restore();
        }
        
        super.Render(); 
    } 
}

///////////////////////////////////////////////////////////////////////////////

class LevelExit extends MyGameObject
{
    constructor(pos,type=0) 
    { 
        super(pos,0,0,0,.5); 
        this.type=type; 
        this.radarSize=2;
        this.closeTimer = new Timer();
        this.pos.y+=.01;
    }
       
    Update() 
    {
        // bob and spin
        this.height =.1+.1*Math.sin(5*time);
        this.angleVelocity =.05/(this.size+.1); 
        
        let playerOffset = this.pos.Clone().Subtract(player.pos);
        let playerDistance = playerOffset.Length();
        let radius = this.size.x;
        if (this.type==1)
        {
            // incomming portal as player spawns in
            if (levelFrame==60)
                PlaySound(13);
        
            // get smaller and go away
            radius = Max(0,1 - levelTimer.Get()/2);
            if (radius <= 0)
                this.Destroy();
        }
        else if (this.closeTimer.IsSet())
        {
            // get smaller if closing
            radius = -this.closeTimer.Get();
        }
        else if (this.GetLifeTime() < 1)
        {
            // open up when it first appears
            let t = this.GetLifeTime();
            radius = Min(t*2,1);
        }
        else if (!player.IsDead() && playerDistance < 3 && player.dashTimer.Elapsed())
        {
            // player is close to portal
            if (playerDistance < .5)
            {
                // player entered portal
                if (isStartLevel && this.type == 3)
                {
                    // speed run portal
                    speedRunMode = 1;
                    speedRunTime = 0;
                    playerData = new PlayerData();
                }
                if (this.type == 2)
                {
                    // warp portal
                    nextLevel = warpLevel; 
                }
                PlaySound(13);
                endLevelTimer.Set(1);
                this.closeTimer.Set(1);
            }
            else
            {
                // pull player into portal
                player.velocity.Add(playerOffset.Normalize(.005/playerDistance));
            }
        }
        
        radius = Max(0,radius);
        this.size.Set(radius,radius);
        
        super.Update();
    }
       
    Render() 
    {
        SetCanvasTransform(this.pos,this.size,this.angle,this.height);
        
        // draw wrap portal effect
        mainCanvasContext.lineWidth=1;
        let color;
        for(let i=19;i--;mainCanvasContext.stroke())
        {
            mainCanvasContext.beginPath();
            color=`hsla(${i*9+time*99},99%,${shadowRenderPass?0:50}%,${shadowRenderPass?.5:1})`;
            mainCanvasContext.strokeStyle=color;
            for(let j=8;j--;)
            {
                let a=time-j*PI/3+5*Math.sin(i/2+time*2)/19;
                mainCanvasContext.arc(0,0,i*this.size.x,a,a)
            }
        }   
        
        if (this.type > 1 && !shadowRenderPass  && !this.closeTimer.IsSet())
        { 
            // render warp or speed run text
            let text = (this.type == 2)? 'Warp '+warpLevel : 'Speed Run';
            DrawText(text,0,-24,14,'center',1,color,'#000');
            if (this.type == 3 && speedRunBestTime)
                DrawText('Best '+FormatTime(speedRunBestTime),0,-36,12,'center',1,color,'#000');
            
        }
        mainCanvasContext.restore();
    }
}

///////////////////////////////////////////////////////////////////////////////
// level builder
    
function GenerateMaze(cellCount)
{
    // 2d maze
    let size = levelMazeSize;
    let cells = [];
    cells.length = size*size;
    cells.fill(0);
    let GetCell=(x,y)=>cells[x+y*size];
    let SetCell=(x,y,v=1)=>cells[x+y*size]=v;
    
    // set start pos (it may change when generating the level)
    let xStart=RandInt(levelMazeSize);
    let yStart=RandInt(levelMazeSize);
    
    if (isStartLevel)
    {
        // hub level
        xStart=yStart=0;
        SetCell(0,0);
        SetCell(1,0);
    }
    if (isFinalLevel)
    {
        // boss level
        xStart=0;
        yStart=3;
        SetCell(0,3);
        SetCell(1,3);
        SetCell(2,3);
        SetCell(1,2);
        for(let i=4;i--;)
        for(let j=2;j--;)
            SetCell(i,j);
    }
    
    playerStartPos = new Vector2(xStart, yStart);
    if (isStartLevel || isFinalLevel)
        return cells;
        
    // depth first search style maze generation
    // https://en.wikipedia.org/wiki/Maze_generation_algorithm#Depth-first_search
    let IsOpen=(x,y)=>(IsArrayValid(x,y,size)? cells[x+y*size] : 0);
    let OpenNeighborCount=(xo,yo)=>
    {
        let n = 0;
        n += IsOpen(xo+1,yo);
        n += IsOpen(xo-1,yo);
        n += IsOpen(xo,yo+1);
        n += IsOpen(xo,yo-1);
        return n;
    }
    
    let CheckMove=(xo,yo,xd,yd)=>
    !(
        !IsArrayValid(xo+xd,yo+yd,size) || // must be valid cell
        IsOpen(xo+xd,yo+yd) ||             // must be solid

        // surrounding cells in that direction must be solid
        IsOpen(xo+xd*2,yo+yd*2) ||
        IsOpen(xo+xd*2+yd,yo+yd*2+xd) ||
        IsOpen(xo+xd*2-yd,yo+yd*2-xd) ||
        IsOpen(xo+xd+yd,yo+yd+xd) ||
        IsOpen(xo+xd-yd,yo+yd-xd)
    );
    
    let x=xStart;
    let y=yStart;
    SetCell(x,y);
        
    // generate a maze
    let stack = [];
    let endCount = 0;
    for(let i=0; i<cellCount*1.5; ++i)
    {
        // check which neighbors are valid moves
        let neighbors = 0;
        if (CheckMove(x,y,-1,0))
            ++neighbors;
        if (CheckMove(x,y,1,0))
            ++neighbors;
        if (CheckMove(x,y,0,-1))
            ++neighbors;
        if (CheckMove(x,y,0,1))
            ++neighbors;
            
        if (neighbors && i!=cellCount && (i<cellCount || Rand() < .5))
        {  
            // pick a random neighbor to open
            let xd = 0;
            let yd = 0;
            let r=RandInt(neighbors);
            if (CheckMove(x,y,-1,0) && !r--)
                xd=-1,yd=0;
            else if (CheckMove(x,y,1,0) && !r--)
                xd=1,yd=0;
            else if (CheckMove(x,y,0,-1) && !r--)
                xd=0,yd=-1;
            else
                xd=0,yd=1;
                
            stack.push({x:x,y:y});
            SetCell(x+=xd,y+=yd);
        }
        else if (stack.length)
        {
            // track dead ends (to put stores and powerups there)
            if (OpenNeighborCount(x,y)<=1)
                SetCell(x,y,2+endCount++);
            else if (Rand() < .5) // change up start pos
                playerStartPos.Set(x,y);
            
            // pop cell from stack and make current
            let c = stack.pop();
            x = c.x;
            y = c.y;
        }
        else
            break;
    }
    
    return cells;
}

function GenerateLevel()
{
    // randomize background color
    levelColor=new Color(Rand(.1),Rand(.1),Rand(.1));
    if (isStartLevel)
        levelColor=new Color(.1,0,.2);
    
    // loop incase level generation fails
    while(!GenerateLevelInternal()){}
}

function GenerateLevelInternal()
{
    level = new Level();
    ClearGameObjects();
    
    // generate maze and draw to level data
    levelMaze = GenerateMaze(levelNumber);
    for(let x=levelMazeSize;x--;)
    for(let y=levelMazeSize;y--;)
    {
        if (!levelMaze[x+y*levelMazeSize])
            continue;

        // for each open maze cell, fill out a circle of open space
        let pos = (new Vector2(x+.5,y+.5)).Multiply(levelSize/levelMazeSize);
        let radius = isFinalLevel?12:9;
        level.FillCircleType(pos,radius,1);
        for(let i=RandInt(4);i--;) // add extra randomness
            level.FillCircleType(pos.Clone().Add(RandVector(Rand(8))),RandBetween(2,6),1+RandInt(2));
    }
    
    // convert player pos to world pos
    playerStartPos.Add(.5).Multiply(levelSize/levelMazeSize);
    
    if (isFinalLevel)
    {
        // place a ton of objects everywhere
        let r = levelSize/levelMazeSize;
        for(let i=30;i--;)
            level.FillCircleObject(new Vector2(RandIntBetween(0,64),RandIntBetween(0,50)),RandIntBetween(4,14),1+RandInt(2));  
        level.FillCircleObject(playerStartPos,12,0);  
        level.FillCircleType(playerStartPos.Clone().AddXY(16,-20),12,1);
        level.FillCircleType(playerStartPos.Clone().AddXY(16,-14),12,1);

        // draw a heart
        let centerPos = new Vector2(24,18);
        level.FillCircleType(centerPos,9,2);
        level.FillCircleObject(centerPos,10,0);
        levelCanvasContext.fillStyle='#F00'
        levelCanvasContext.fillRect(0,0,mainCanvasSize.x,mainCanvasSize.y)
        levelCanvasContext.drawImage(tileImage,0,0);
        for(let x=16;x--;)
        for(let y=16;y--;)
        {
            let d = levelCanvasContext.getImageData(x+64, y+80, 1, 1).data;
            level.GetDataFromPos(centerPos.Clone().AddXY(x-8,y-7)).object=d[1]?2:d[0]?0:1;
        }
    }
    else if (isStartLevel)
    {
        // set up start level area
        level.FillCircleType(playerStartPos,8,1); // start on grass
        level.FillCircleType(playerStartPos.Clone().AddXY(16,0),7,1);
        level.FillCircleObject(playerStartPos.Clone().AddXY(8,-2),3,1); 
        level.FillCircleObject(playerStartPos.Clone().AddXY(8,2),3,1); 
    }
    else
    {
        // place random objects
        for(let i=levelMazeSize*levelMazeSize*4;i--;)
            level.FillCircleObject(new Vector2(RandIntBetween(0,64),RandIntBetween(0,64)),RandIntBetween(1,10),RandInt(3));  
        
        // clear player start
        level.FillCircleObject(playerStartPos,RandBetween(2,5),0);

        // spawn enemies with a controled amount of total power
        let totalEnemyPower = levelNumber*5;
        let tries = 0;
        while(totalEnemyPower>0)
        {
            if (++tries>1e4)
                return 0;

            // pick random pos
            let pos = new Vector2(RandBetween(0,levelSize),RandBetween(0,levelSize));

            // must be open maze cell except level 1
            let m = levelMaze[MazeDataPos(pos)]
            if (!m || (m==2 && levelNumber>1))
                continue; 

            // must not be near player
            if (pos.Distance(playerStartPos) < 15)
                continue;

            // must be clear
            if (tries > 500)
                level.FillCircleObject(pos,2,0); // clear area if necessary
            if (!level.IsAreaClear(pos,2))
                continue;

            // spawn enemy
            let enemyPower = 0;
            let e;
            if (Rand() < .33 || levelNumber<=1)
            {
                // slime enemy
                let healthLevel = RandIntBetween(1,3);
                if (Rand() < .1 && levelNumber > 5)
                    healthLevel = 4;
                
                let difficulty = levelNumber<5||Rand()<.5?1:2;
                e = new SlimeEnemy(pos,healthLevel,difficulty);
                enemyPower = difficulty*healthLevel;
            }
            else if (levelNumber != 3 && (Rand() < .5 || levelNumber<=2))
            {
                // jumping enemy
                let isBig = Rand() < .1 && levelNumber > 3;
                e = new JumpingEnemy(pos,isBig);
                enemyPower = isBig?6:2;
            }
            else // shield enemy
            {
                let isBig = Rand() < .1 && levelNumber > 4;
                e = new ShieldEnemy(pos,0,isBig);
                enemyPower = isBig?9:3;
            }
            if (levelNumber > 4 && Rand()<.1)
            {
                 // random invisible enemy
                e.isInvisible = 1;
                enemyPower *= 2;
            }
                
            totalEnemyPower -= enemyPower;
        }
    }
    
    // spawn stores and other special objects
    if (isStartLevel)
    {
        // title screen
        new Store(new Vector2(24,3.5));
        new ShieldEnemy(playerStartPos.Clone(), 1);
        new Pickup(playerStartPos.Clone().Add(new Vector2(16,0)), 2);
        levelExit = new LevelExit(new Vector2(24,13));
        
        if (warpLevel>1)
            new LevelExit(new Vector2(29.5,8),2); // warp
        if (localStorage.kbap_won)
            new LevelExit(new Vector2(29.5,13),3); // speed run
    }
    else if (isFinalLevel)
    {
        // boss level
        new Store(new Vector2(43,47));
        new ShieldEnemy(playerStartPos.Clone().Add(new Vector2(.5,0)), 1);
        new Pickup(new Vector2(24,19.5), 2);
    }
    else
    {
        // spawn stores and special powerups
        for(let x=levelMazeSize;x--;)
        for(let y=levelMazeSize;y--;)
        {
            let m = levelMaze[x+y*levelMazeSize];
            if (m==2 && levelNumber > 1)
            {
                let p = new Vector2(x+.5,y+.5).Multiply(levelSize/levelMazeSize);
                let d = p.Distance(playerStartPos);
                if (d>30&&Rand()<.3)
                {
                    // random powerup spawn
                    if (Rand()>.5)
                        new Pickup(p, 2);
                    else
                        new Boomerang(p);  
                         
                    level.FillCircleType(p,RandIntBetween(2,4),1);
                    level.FillCircleObject(p,RandIntBetween(3,5),0); 
                }
                else
                    new Store(p);
            }
        }

        new LevelExit(playerStartPos,1);
    }
    
    // draw the level
    level.ClearBorder();
    level.ApplyTiling();
    level.Redraw();
    
    return 1;
}

///////////////////////////////////////////////////////////////////////////////
// level transition system

let transitionTimer = new Timer();
let transitionCanvas = c2;
let transitionCanvasContext = transitionCanvas.getContext('2d');
function StartTransiton()
{
    // copy main canvas to transition canvas
    transitionTimer.Set();
    transitionCanvas.width = mainCanvasSize.x;
    transitionCanvas.height = mainCanvasSize.y;
    transitionCanvasContext.drawImage(mainCanvas,0,0);
}

function UpdateTransiton()
{
    let transitionTime = transitionTimer.Get();
    if (transitionTime > 2)
        return;
        
    // render stored main canvas with circle transition effect
    mainCanvasContext.save();
    mainCanvasContext.beginPath();
    let r = transitionTime*mainCanvasSize.x/2;
    mainCanvasContext.rect(0,0,mainCanvasSize.x,mainCanvasSize.y);
    mainCanvasContext.arc(mainCanvasSize.x/2,mainCanvasSize.y/2,r,0,7);
    mainCanvasContext.clip('evenodd');
    mainCanvasContext.drawImage(transitionCanvas,0,0);
    mainCanvasContext.restore();
}

///////////////////////////////////////////////////////////////////////////////
// ZzFXmicro - Zuper Zmall Zound Zynth - MIT License - Copyright 2019 Frank Force
let zzfx_v=.2;
let zzfx_x=0;
let zzfx=(e,f,a,b=1,d=.1,g=0,h=0,k=0,l=0)=>{if(!zzfx_x)return;let S=44100;a*=2*PI/S;a*=1+RandBetween(-f,f);g*=1E3*PI/(S**2);b=S*b|0;d=d*b|0;k*=2*PI/S;l*=PI;f=[];for(let m=0,n=0,c=0;c<b;++c)f[c]=e*zzfx_v*Math.cos(m*a*Math.cos(n*k+l))*(c<d?c/d:1-(c-d)/(b-d)),m+=1+RandBetween(-h,h),n+=1+RandBetween(-h,h),a+=g;e=zzfx_x.createBuffer(1,b,S);a=zzfx_x.createBufferSource();e.getChannelData(0).set(f);a.buffer=e;a.connect(zzfx_x.destination);a.start();return a}

let beatTimer = new Timer();
let beatCount = 0;
let lastNote;
function UpdateAudio()
{
    if (!zzfx_x && MouseWasPressed() && soundEnable)
        zzfx_x = new AudioContext;

    if (coinSoundTimer.IsSet() && coinSoundTimer.Elapsed())
    {
        // coin sound plays twice quickly with higher pitch the second time
        PlaySound(10, 800)
        coinSoundTimer.UnSet();
    }

    if (!(isStartLevel || winTimer.IsSet()))
        return;
        
    // update music
    let scale = [-5,0,2,4,7,12,-5,-8]; // major pentatonic scale
    if (beatTimer.Elapsed())
    {
        ++beatCount;
        beatTimer.Set(.5);
        
        // melody
        if (beatCount>15 && (!(beatCount&1) || RandInt(2)))
        {
            if (beatCount%8==0)
                lastNote = 1; // return to root note every 8 beats
            
            // play the note
            zzfx(.4,0,220*2**(scale[lastNote]/12), (RandInt(2)+1)/2, .05, 0, .4);
            
            // random walk to another note in the scale
            lastNote = (lastNote + (RandInt(6)-2)+scale.length)%scale.length;
        }
        
        // precussion
        if (beatCount%2==0||beatCount&18||!RandInt(20))
        {
            if (beatCount%4==0)
                zzfx(.3,.2,1e3,.08,.05,.8,21,51); // ZzFX  highhat
            else
                zzfx(.8,.2,150,.04,.002,.1,1,.5,.15); // ZzFX 17553 kick
        }
    }
}

function PlaySound(sound, p=0)
{
    switch(sound)
    {
        case 1: // player hit
        zzfx(1,.1,4504,.3,.1,-30,.5,.5,.33); // ZzFX 36695
        break;
        
        case 2: // player die
        zzfx(.7,0,500,4,.01,-0.2,3,3,0); // ZzFX 23250
        break;
        
        case 3: // get heart
        zzfx(1,0,1504,.3,.17,1.7,.5,.4,.33); // ZzFX 36695
        break;
        
        case 4: // get heart container
        zzfx(1,0,805,1.1,.71,.5,1.5,.5);  // ZzFX 16886
        break;
        
        case 5: // boomerang cut
        zzfx(.3,.2,370,.2,.1,3.9,13,27,.12); // ZzFX 23473
        break;
        
        case 6: // boomerang catch
        zzfx(1,.1,0,.2,.23,2,.4,.6,.9); // ZzFX 20183
        break;
        
        case 7: // boomerang throw
        zzfx(1,.1,53,.2,.26,0,.1,7.5,.58); // ZzFX 24904
        break;
        
        case 8: // enemy hit
        zzfx(1,.2,370,.1,.23,4.5,2.8,27.4,.12); // ZzFX 23473
        break;

        case 9: // enemy kill
        zzfx(1,.1,1138,.2,.02,0,4,1.2,.1); // ZzFX 10015
        break;

        case 10: // coin
        if (!coinSoundTimer.IsSet())
            coinSoundTimer.Set(.05); // trigger coin sound to play again
        zzfx(1,.01,800+p,.2,.05); // ZzFX 98600
        break;
        
        case 11: // low health
        zzfx(.4,.1,418,.1,.79,5,0,1.9,.74); // ZzFX 7364
        break;

        case 12: // dash
        zzfx(1,.1,319,.4,.08,6.6,3.2,2.6,.59); // ZzFX 79527
        break;

        case 13: // teleport
        zzfx(1,.1,7,1,.97,0,.6,21.7,.5); // ZzFX 60532
        break;

        case 14: // boomerang hit solid
        zzfx(.8,.1,70,.1,.23,4.5,2.8,27,.12); // ZzFX 23473
        break;

        case 15: // boomerang reflect
        zzfx(1,.1,800,.2,.02,-0.3); // ZzFX 14772
        break;

        case 16: // dodge recharge
        zzfx(1,.1,0,.1,.1,1,.1,100); // ZzFX 88949
        break;
    }
}

// load texture and kick off init!
let tileImage = new Image();
tileImage.onload=_=>Init();
tileImage.src = 'tiles.png';