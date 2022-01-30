/*jshint bitwise: false*/
/*globals define*/
define([
  'box2d',
  'entities/explosion',
  'entities/physics-entity',
  'entities/player',
  'config/colors',
  'config/material',
  'config/settings',
  'utils',
  'world'
], function( Box2D, Explosion, PhysicsEntity, Player, Colors, Material, Settings, Utils, world ) {
  'use strict';

  var PI2 = Utils.PI2;

  var Vec2 = Box2D.Common.Math.b2Vec2;

  function Laser( x, y, material ) {
    PhysicsEntity.call( this, {
      fixture: {
        isSensor: true,
        filter: {
          categoryBits: material
        }
      },
      body: {
        position: {
          x: x,
          y: y
        }
      }
    });

    this.target = null;
    this.endpoint = null;
    this.normal = null;
    this.fraction = Number.POSITIVE_INFINITY;
  }

  Laser.prototype = new PhysicsEntity();
  Laser.prototype.constructor = Laser;

  Laser.prototype.update = function( dt ) {
    PhysicsEntity.prototype.update.call( this, dt );

    var cos = 1,
        sin = 0;

    if ( this.angle ) {
      cos = Math.cos( -this.angle );
      sin = Math.sin( -this.angle );
    }

    this.target = null;
    this.endpoint = null;
    this.fraction = Number.POSITIVE_INFINITY;

    world.RayCast(
      function( fixture, point, normal, fraction ) {
        var target = fixture.GetBody().GetUserData();
        if ( !( target.material & this.material ) ) {
          return -1;
        }

        if ( fraction < this.fraction ) {
          this.target = target;
          this.normal = normal;
          this.endpoint = point;
          this.fraction = fraction;
        }

        return fraction;
      }.bind( this ),
      new Vec2( this.x + cos, this.y + sin ),
      new Vec2( this.x + 1e4 * cos, this.y + 1e4 * sin )
    );

    if ( !this.target ) {
      return;
    }

    // Delete target.
    var target = this.target;
    if ( target !== this &&
         target.material !== Material.BIMATTER &&
         !( target instanceof Player ) &&
         target.game ) {
      this.game.removed.push( target );

      if ( Settings.explosions ) {
        var explosion, fill;
        fill = Colors.Explosion[ Material.type( target.material ) ];

        if ( fill ) {
          explosion = new Explosion( target.x, target.y );
          explosion.fill.set( fill );
          this.game.add( explosion );
        }
      }
    }
  };

  Laser.prototype.drawPath = function( ctx ) {
    // Draw laser source.
    ctx.beginPath();

    // The laser starts at a radius of 1.
    ctx.rect( -1, -0.5, 2, 1 );
    ctx.fillStyle = '#000';
    ctx.fill();

    PhysicsEntity.prototype.drawPath.call( this, ctx );
  };

  Laser.prototype.draw = function( ctx ) {
    PhysicsEntity.prototype.draw.call( this, ctx );

    // Only render beam if there is no endpoint and target,
    // or if the target has not been removed from the game.
    if ( !this.endpoint || !this.target ||
        ( this.target && !this.target.game ) ) {
      return;
    }

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'lighter';
    }

    var cos = Math.cos( -this.angle ),
        sin = Math.sin( -this.angle );

    var x0 = this.x + cos,
        y0 = this.y + sin,
        x1 = this.endpoint.x,
        y1 = this.endpoint.y;

    ctx.beginPath();
    ctx.moveTo( x0, y0 );
    ctx.lineTo( x1, y1 );

    var outerWidth = 0.4 + Math.random() * 0.2,
        innerWidth = 0.1 + Math.random() * 0.1;

    // Draw beam.
    var glowColor = Colors.Glow[ Material.type( this.material ) ];

    if ( glowColor ) {
      ctx.lineWidth = outerWidth;
      ctx.strokeStyle = glowColor;
      ctx.stroke();
    }

    ctx.lineWidth = innerWidth;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Draw endpoint glows.
    ctx.beginPath();
    ctx.arc( x0, y0, innerWidth * 2, 0, PI2 );
    ctx.moveTo( x1, y1 );
    ctx.arc( x1, y1, innerWidth * 2, 0, PI2 );

    if ( glowColor ) {
      ctx.lineWidth = outerWidth;
      ctx.strokeStyle = glowColor;
      ctx.stroke();
    }

    ctx.fillStyle = '#fff';
    ctx.fill();

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  Laser.prototype.drawNormals = function( ctx ) {
    if ( !this.endpoint || !this.normal ) {
      return;
    }

    ctx.save();

    // Counteract transofmrs in draw.
    ctx.rotate( this.angle );
    ctx.translate( -this.x, -this.y );

    ctx.beginPath();
    ctx.moveTo( this.endpoint.x, this.endpoint.y );
    ctx.lineTo( this.endpoint.x + this.normal.x, this.endpoint.y + this.normal.y );
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    ctx.restore();
  };

  Laser.prototype.aabb = function() {
    var aabb;
    if ( !this.endpoint ) {
      aabb = PhysicsEntity.prototype.aabb();
      return Utils.expandAABB( aabb, 1, 1 );
    }

    var x0 = this.x,
        y0 = this.y;

    var x1 = this.endpoint.x,
        y1 = this.endpoint.y;

    aabb = {
      xmin: Math.min( x0, x1 ),
      ymin: Math.min( y0, y1 ),
      xmax: Math.max( x0, x1 ),
      ymax: Math.max( y0, y1 )
    };

    // 1 is the pointer radius. 0.6 is the maximum glow radius.
    var radius = 1.6;
    return Utils.relativeExpandAABB( aabb, radius, radius );
  };

  return Laser;
});
