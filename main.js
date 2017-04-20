// Main imports these should be cached
require('global.stuff');
require('global.colours');
var despawner = require('work.despawner');
var spawner   = require('work.spawner');
var movement  = require('work.movement');
var cleaner   = require('work.cleaner');
var towers    = require('work.towers');
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
    // Run the source setups once every 50 ticks
    if (Game.time % 50 == 0) {
        var minerSpawner = require('spawn.miner');
        var extractorSpawner = require('spawn.extractor');
        minerSpawner.setup();
        extractorSpawner.setup();
    }
    // Only need these once every 5 ticks
    if (Game.time % 5 == 0) {
        msg += counter.run(debug);
        spawner.run(debug);
    }
    movement.run(debug);
    towers.run(debug);
    msg += ' {' + Game.cpu.getUsed().toFixed(3) + '}';
    console.log(msg);
    if (Game.cpu.getUsed() > 100) {
        Game.notify(msg);
    }
}
