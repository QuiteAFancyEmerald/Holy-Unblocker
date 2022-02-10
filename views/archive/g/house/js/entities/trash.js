/*jshint bitwise: false*/
/*globals define*/
define([
  'entities/physics-entity',
  'entities/explosion',
  'config/colors',
  'config/material'
], function( PhysicsEntity, Explosion, Colors, Material ) {
  'use strict';

  function Trash( options, lifeTime ) {
    PhysicsEntity.call( this, options );

    // In seconds.
    this.lifeTime = lifeTime || 0;
    this.time = 0;
  }

  Trash.prototype = new PhysicsEntity();
  Trash.prototype.constructor = Trash;

  Trash.prototype.update = function( dt ) {
    PhysicsEntity.prototype.update.call( this, dt );

    this.time += dt;

    var explosion, fill;
    if ( this.time > this.lifeTime ) {
      this.game.removed.push( this );

      fill = Colors.Explosion[ Material.type( this.material ) ];

      if ( fill ) {
        explosion = new Explosion( this.x, this.y );
        explosion.fill.set( fill );
        this.game.add( explosion );
      }
    }
  };

  Trash.prototype.draw = function( ctx ) {
    ctx.lineJoin = 'round';
    PhysicsEntity.prototype.draw.call( this, ctx );
    ctx.lineJoin = 'miter';
  };

  return Trash;
});
