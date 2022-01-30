/*globals define*/
define([
  'text!./../../templates/title-view.html',
  'utils'
], function( titleTemplate, Utils ) {
  'use strict';

  function TitleView( el ) {
    this.el = document.querySelector( el );
    if ( !this.el ) {
      this.el = document.createElement( 'div' );
      this.el.id = 'title-view';
      this.el.classList.add( 'title-view' );
    }
    this.template = titleTemplate;

    this.childEl = null;

    this.orientationListener = this.onDeviceOrientation.bind( this );
    this.mousemoveListener = this.onMouseMove.bind( this );

    this.initialize();
  }

  TitleView.prototype.initialize = function() {
    this.el.innerHTML = this.template;
    this.childEl = this.el.querySelector( '.titles' );

    this.el.addEventListener( 'mousemove', this.mousemoveListener );
    window.addEventListener( 'deviceorientation', this.orientationListener );
  };

  TitleView.prototype.remove = function() {
    window.removeEventListener( 'deviceorientation', this.orientationListener );
    this.el.removeEventListener( 'movemove', this.mousemoveListener );

    this.el.innerHTML = '';

    if ( this.el.parentElement ) {
      this.el.parentElement.removeChild( this.el );
    }
  };

  TitleView.prototype.onDeviceOrientation = function( event ) {
    var x = event.beta,
        y = event.gamma;

    x = Utils.clamp( x, -90, 90 );
    this.setRotation( y, x );
  };

  TitleView.prototype.onMouseMove = function( event ) {
    if ( !this.childEl ) {
      return;
    }

    var rx =  ( 0.5 - ( event.clientY / window.innerHeight ) ) * 90,
        ry = -( 0.5 - ( event.clientX / window.innerWidth  ) ) * 90;

    this.setRotation( rx, ry );
  };

  TitleView.prototype.setRotation = function( rx, ry ) {
    var transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    this.childEl.style.webkitTransform = transform;
    this.childEl.style.transform = transform;
  };

  return TitleView;
});
