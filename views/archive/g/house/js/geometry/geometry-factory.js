/*globals define*/
define(function( require ) {
  'use strict';

  var Color = require( 'color' );
  var Circle = require( 'geometry/circle' );
  var Polygon = require( 'geometry/polygon' );
  var Rect = require( 'geometry/rect' );
  var Segment = require( 'geometry/segment' );

  var classes = {
    circle: Circle,
    polygon: Polygon,
    rect: Rect,
    segment: Segment
  };

  function create( json ) {
    var attrs = JSON.parse( json );

    var type = attrs.type;
    if ( !classes[ type ] ) {
      try {
        classes[ type ] = require( 'geometry/' + type.toLowerCase() );
      } catch( error ) {
        return;
      }
    }

    // Handle color objects.
    var color, childType;
    for ( var key in attrs ) {
      childType = attrs[ key ].type;
      if ( childType && childType.toLowerCase() === 'color' ) {
        color = new Color();
        color.set( attrs[ key ] );
        attrs[ key ] = color;
      }
    }

    var geometryObject = new classes[ type ]();
    geometryObject.set( attrs );

    return geometryObject;
  }

  return {
    create: create
  };
});
