// Main imports these should be cached
require('global.stuff');   // Settings and stuff
require('global.colours'); // Colours various variables
require('global.speech');  // Colours various variables
require('global.friends'); // The global friend list

// Get the prototypes
var protoypes = [
    require('prototype.structures'),
    require('prototype.sources'),
    require('prototype.creep'),
];
// var i = protoypes.length;
// while(i--) {
//     protoypes[i]();
// }


var spawner   = require('work.spawn');
var movement  = require('work.movement');
var cleaner   = require('work.cleaner');
var towers    = require('work.towers');
var counter   = require('work.counter');
var screepsplus     = require('screepsplus');

/**
 * Main game loop, call all other functions from here
 */
module.exports.loop = function () {
    var msg = Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '}';
    var debug = false;
    // Only need these once every 10 ticks
    if (Game.time % 10 == 0) {
        cleaner.run(debug);
    }
    // Run the source setups once every 50 ticks
    if (Game.time % 50 == 0) {
        var miner = require('role.miner');
        var extractor = require('role.extractor');
        miner.setup();
        extractor.setup();
    }
    // Only need these once every 5 ticks
    if (Game.time % 10 == 0) {
        // Setup rooms before we run the spawner
        counter.setupRoomRoles(debug);
        msg += counter.run(debug);
        spawner.run(debug);
    }
    movement.run(debug);
    towers.run(debug);
    screepsplus.collect_stats();
    msg += ' {' + Game.cpu.getUsed().toFixed(3) + '}';
    console.log(msg);
    if (Game.cpu.getUsed() > 200) {
        // This isn't required anymore
        // Game.notify(msg);
    }
    Memory.stats.cpu.used = Game.cpu.getUsed();
}
