// Main imports these should be cached
var despawner = require('work.despawner');
var spawner   = require('work.spawner');
var movement  = require('movement.creeps');
var cleaner   = require('work.cleaner');
var turret    = require('work.turret');
var turret2   = require('work.turret2');
var counter   = require('work.counter');

/**
 * Main game loop, call all other functions from here
 */
module.exports.loop = function () {
    var msg = 'CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '}'
    var debug = false;
    despawner.run(debug);
    cleaner.run(debug);
    if (Game.time % 5 == 0) { // Every 5 ticks
        counter.run(debug);
        spawner.run(debug);
    }
    movement.run(debug);
    turret.run(debug);
    turret2.run(debug);
    console.log(msg + ' {' + Game.cpu.getUsed().toFixed(3) + '}');
}
