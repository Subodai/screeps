// DEFAULT
// Main imports these should be cached
require('global.stuff');   // Settings and stuff
require('global.colours'); // Colours various variables
require('global.speech');  // Colours various variables
require('global.friends'); // The global friend list

// Get the prototypes
var protoypes = [
    require('prototype.roomposition'),
    require('prototype.structures'),
    require('prototype.sources'),
    require('prototype.room'),
    require('prototype.creep'),
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

/**
 * Main game loop, call all other functions from here
 */
module.exports.loop = function () {
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
    if (Game.time % 10 == 0) {
        // Setup rooms before we run the spawner
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 55 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
        counter.setupRoomRoles(debug);
        console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '}' + counter.run(debug) + ' {' + Game.cpu.getUsed().toFixed(3) + '}');
        let Before = Game.cpu.getUsed();
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 59 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
        spawner.run(debug);
        let After = Game.cpu.getUsed() - Before;
        console.log('Spawner used:' + After + ' CPU');
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 61 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
        this.haulerSetup();
    }
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 64 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    movement.run(debug);
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 66 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    towers.run(debug);
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 68 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    screepsplus.collect_stats();
    Memory.stats.cpu.used = Game.cpu.getUsed();
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) { console.log('Stopping At 70 To relax CPU use'); console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}'); return; }
    console.log(Game.time + ':CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '} {' + Game.cpu.getUsed().toFixed(3) + '}');
}

module.exports.haulerSetup = function () {
    console.log('Running Hauler Target setup');
    var Before = Game.cpu.getUsed();
    let remoteRooms = [];
    for (let room in Game.rooms) {
        if (_.isString(room)) {
            room = Game.rooms[room];
        }
        if (room != null) {
            if (!room.controller || !room.controller.my) {
                // Any hostiles in this room?
                var hostiles = room.find(FIND_HOSTILE_CREEPS, {
                    filter: (i) => !(global.friends.indexOf(i.owner.username) > -1)
                });
                // If there are no hostiles, send the haulers!
                if (hostiles.length <= 0) {
                    remoteRooms.push(room.name);
                }
            }
        }
    }
    remoteRooms.sort(function(a,b) {
        let aTainers = Game.rooms[a].find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER });
        let aTainergy = _.sum(aTainers, c => c.store.energy);

        let bTainers = Game.rooms[b].find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_CONTAINER });
        let bTainergy = _.sum(bTainers, c => c.store.energy);

        let aResources = Game.rooms[a].find(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType == RESOURCE_ENERGY });
        let aResourceTotal = _.sum(aResources, r => r.amount);

        let bResources = Game.rooms[b].find(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType == RESOURCE_ENERGY });
        let bResourceTotal = _.sum(bResources, r => r.amount);

        let aTotal = aTainergy + bResourceTotal;
        let bTotal = bTainergy + bResourceTotal;

        if (aTotal > bTotal) {
            return -1;
        } else if (aTotal < bTotal) {
            return 1;
        }
        return 0;
    });
    let remoteRoom = remoteRooms[0];
    Memory.remoteRoom = remoteRoom;

    // Get a list of our rooms
    let myRooms = [];
    for (let room in Game.rooms) {
        if (Game.rooms[room].controller) {
            if (Game.rooms[room].controller.my) {
                if (Game.rooms[room].storage) {
                    myRooms.push(room);
                }
            }
        }
    }
    myRooms.sort(function(a,b) {
        let A = _.sum(Game.rooms[a].storage.store);
        let B = _.sum(Game.rooms[b].storage.store);
        return A-B;
    });
    let myRoom = myRooms[0];
    Memory.myRoom = myRoom;
    var After = Game.cpu.getUsed() - Before;
    console.log('Hauler Target setup used ' + After + ' CPU');

}
