// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// BuildAMonster
//
// A template for building a monster using a series of assets from
// a sprite atlas.
// 
// Art assets from Kenny Assets "Monster Builder Pack" set:
// https://kenney.nl/assets/monster-builder-pack

"use strict"

// game config
let config = {
    parent: 'phaser-game',
    fps: { forceSetTimeOut: true, target: 30 },
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
           gravity: {y: 300},
           debug: false
        }
    },
    scene: [Gameplay]
}

const game = new Phaser.Game(config);