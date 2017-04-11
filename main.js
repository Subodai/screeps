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
    var msg = Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '}'
    var debug = false;
    // Only need these once every 10 ticks
    if (Game.time % 10 == 0) {
        despawner.run(debug);
        cleaner.run(debug);
    }
    // Only need these once every 5 ticks
    if (Game.time % 5 == 0) {
        counter.run(debug);
        spawner.run(debug);
    }
    movement.run(debug);
    turret.run(debug);
    turret2.run(debug);
    msg += ' {' + Game.cpu.getUsed().toFixed(3) + '}';
    console.log(msg);
    if (Game.cpu.getUsed() > 50) {
        Game.notify(msg);
    }
}
