/*globals define*/
define(function() {
  'use strict';

  return {
    Glow: {
      MATTER: '#33f',
      ANTIMATTER: '#f33'
    },
    Face: '#448',
    Solid: {
      MATTER: {
        red: 96,
        green: 96,
        blue: 192,
        alpha: 1
      },
      ANTIMATTER: {
        red: 192,
        green: 96,
        blue: 96,
        alpha: 1
      }
    },
    White: {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1
    },
    Explosion: {
      MATTER: {
        red: 32,
        green: 32,
        blue: 64,
        alpha: 1
      },
      ANTIMATTER: {
        red: 64,
        green: 32,
        blue: 32,
        alpha: 1
      }
    }
  };
});
