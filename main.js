if(Game.cpu.bucket < 500) { throw new Error('Super Low Bucket, Recovery Mode Activated'); }
// DEFAULT
// Main imports these should be cached
require('game.constants'); // Game consts
require('global.stuff');   // Settings and stuff
require('global.colours'); // Colours various variables
require('global.speech');  // Colours various variables
require('global.friends'); // The global friend list
var Traveler = require('Traveler');

// Get the prototypes
var protoypes = [
    require('prototype.roomposition'),
    require('prototype.structures'),
    require('prototype.sources'),
    require('prototype.room'),
    require('prototype.creep'),
    require('prototype.spawn'),
];
// var i = protoypes.length;
// while(i--) {
//     protoypes[i]();
// }

var spawner     = require('work.spawn');
var movement    = require('work.movement');
var cleaner     = require('work.cleaner');
var towers      = require('work.towers');
var counter     = require('work.counter');
var screepsplus = require('screepsplus');

// Load the new Queue
const q = require('prototype.queue');
global.Queue = new q.Queue();

// const profiler = require('screeps-profiler');
// profiler.enable();
/**
 * Main game loop, call all other functions from here
 */
module.exports.loop = function () {
//profiler.wrap(function() { // Start of profiler wrapper
    var debug = false;
    // Only need these once every 10 ticks
    if (Game.time % 10 == 0) {
        cleaner.run(debug);
    }
    // Run the source setups once every 50 ticks
    if (Game.time % 50 == 0) {
        var miner = require('role.miner');
        var extractor = require('role.extractor');
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 45 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
        miner.setup();
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 47 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
        extractor.setup();
    }
    // Only need these once every 5 ticks
    if (Game.time % 5 == 0) {
        // Setup rooms before we run the spawner
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 55 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
        counter.setupRoomRoles(debug);
        console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '}' + counter.run(debug) + ' {' + Game.cpu.getUsed().toFixed(3) + '}');
        let Before = Game.cpu.getUsed();
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 59 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
        if (global.Queue.process()) { console.log('Queue spawned a creep'); } else { console.log('Running old spawner'); spawner.run(debug); }
        let After = Game.cpu.getUsed() - Before;
        console.log('Spawners used:' + After + ' CPU');
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 62 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
        global.haulerSetup();
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 64 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    }
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 66 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    movement.run(debug);
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 68 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    towers.run(debug);
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 70 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    screepsplus.collect_stats();
    Memory.stats.cpu.used = Game.cpu.getUsed();
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 73 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}');
//}); // End of profiler wrapper
}
