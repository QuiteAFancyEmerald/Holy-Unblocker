/*jshint bitwise: false*/
/* globals requirejs, define*/
requirejs.config({
  shim: {
    box2d: {
      exports: 'Box2D'
    }
  },
  paths: {
    box2d: 'Box2dWeb/Box2dWeb-2.1.a.3.min'
  }
});

define(function( require ) {
  'use strict';

  var Game = require( 'game' );
  var Player = require( 'entities/player' );

  var Material = require( 'config/material' );

  var game = Game.instance = new Game();
  game.setPlayer( new Player() );
  game.camera.target = game.player;

  // Add game element to body.
  game.element.classList.add( 'game' );
  document.body.insertBefore( game.element, document.body.firstChild );

  // Setup input.
  var input = game.input;

  document.addEventListener( 'keydown', input.onKeyDown.bind( input ) );
  document.addEventListener( 'keyup', input.onKeyUp.bind( input ) );

  if ( typeof window.ontouchstart !== 'undefined' ) {
    game.canvas.addEventListener( 'touchstart', input.onTouchStart.bind( input ) );
    game.canvas.addEventListener( 'touchmove', input.onTouchMove.bind( input ) );
    game.canvas.addEventListener( 'touchend', input.onTouchEnd.bind( input ) );
  }

  // Toggle player material.
  var materialBtn = document.getElementById( 'material-btn' );
  function togglePlayerMaterial() {
    game.player.toggleMaterial();

    if ( game.player.material & Material.MATTER ) {
      materialBtn.innerHTML = 'matter';
      materialBtn.classList.add( 'matter' );
      materialBtn.classList.remove( 'antimatter' );
    } else if ( game.player.material & Material.ANTIMATTER ) {
      materialBtn.innerHTML = 'antimatter';
      materialBtn.classList.add( 'antimatter' );
      materialBtn.classList.remove( 'matter' );
    }
  }

  togglePlayerMaterial();
  materialBtn.addEventListener( 'click', togglePlayerMaterial );

  document.addEventListener( 'keydown', function( event ) {
    // Space.
    if ( event.which === 32 ) {
      if ( game && game.player ) {
        event.preventDefault();
        togglePlayerMaterial();
      }
    }
  });

  window.addEventListener( 'blur', function() {
    game.running = false;

    // Disable all inputs.
    Object.keys( game.input.keys ).forEach(function( key ) {
      game.input.keys[ key ] = false;
    });

    Object.keys( game.input.controls ).forEach(function( control ) {
      game.input.controls[ control ] = false;
    });
  });

  window.addEventListener( 'focus', function() {
    game.running = true;
    game.tick();
  });

  // Title view.
  var TitleView = require( 'views/title-view' );
  var titleView = new TitleView();
  document.body.insertBefore( titleView.el, document.body.firstChild );

  var SettingsView = require( 'views/settings-view' );
  var settingsView = new SettingsView();
  document.body.insertBefore( settingsView.el, document.body.firstChild );

  // Start on click.
  var startBtn = titleView.el.querySelector( '#start-btn' );
  function start() {
    titleView.remove();
    startBtn.removeEventListener( 'click', start );

    // Start game.
    game.tick();

    var level = require( 'levels/level-01' );
    level( game );
  }

  startBtn.addEventListener( 'click', start );

  // For debugging purposes.
  if ( window.localStorage.getItem( 'debug' ) ) {
    start();
    var level = require( 'levels/level-03' );
    level( game );
  }
});
