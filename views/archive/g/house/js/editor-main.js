/*globals requirejs, define*/
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

  var Polygon = require( 'geometry/polygon' );
  var Editor = require( 'editor/editor' );


  var editor = new Editor({
    el: '#editor',
    scaleEl: '#scale',
    historyEl: '#history'
  });

  document.addEventListener( 'keydown', editor.onKeyDown.bind( editor ) );
  document.addEventListener( 'keyup', editor.onKeyUp.bind( editor ) );

  // Disable all keys on blur.
  window.addEventListener( 'blur', function() {
    Object.keys( editor.keys ).forEach(function( key ) {
      editor.keys[ key ] = false;
    });
  });

  var polygon = new Polygon();
  polygon.vertices = [ 100, 50, -100, 50, 0, -100 ];
  polygon.angle = 0.5 * Math.PI;
  editor.add( polygon );
  editor.draw();

  // Translate all.
  var translateXEl = document.getElementById( 'translate-x' ),
      translateYEl = document.getElementById( 'translate-y' );

  var translateBtn = document.getElementById( 'translate-btn' );
  translateBtn.addEventListener( 'click', function() {
    var tx = parseFloat( translateXEl.value ),
        ty = parseFloat( translateYEl.value );

    editor.translateAll( tx, ty );
    editor.draw();
  });

  // History buttons.
  var loadHistoryBtn = document.getElementById( 'load-history-btn' );
  loadHistoryBtn.addEventListener( 'click', editor.loadSelected.bind( editor ) );

  var removeHistoryBtn = document.getElementById( 'remove-history-btn' );
  removeHistoryBtn.addEventListener( 'click', editor.removeSelected.bind( editor ) );

  var clearBtn = document.getElementById( 'clear-history-btn' );
  clearBtn.addEventListener( 'click', editor.clearHistory.bind( editor ) );

  // Text area buttons.
  function loadDataFn( fnName ) {
    return function() {
      var data = editor.textarea.value;
      var scale = parseFloat( document.getElementById( 'load-scale' ).value );
      if ( data.length ) {
        editor[ fnName ]( data, scale );
      }
    };
  }

  var loadDataBtn = document.getElementById( 'load-data-btn' );
  loadDataBtn.addEventListener( 'click', loadDataFn( 'loadData' ) );

  var loadBatchBtn = document.getElementById( 'load-batch-btn' );
  loadBatchBtn.addEventListener( 'click', loadDataFn( 'loadBatchData' ) );
});
