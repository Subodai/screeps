/**
 * This runs the miner spawner
 */
module.exports.run = function(debug = false) {
    var miner = require('role.miner');
    if (debug) { console.log('Running miner spawner'); }
    if (debug) { console.log('Checking for viable miner Creep Spawns'); }
    var spawned = false;
    var mList = _.filter(Game.creeps, (creep) => creep.memory.role == miner.roleName && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];
    if (debug) { console.log('We have ' + mList.length + ' Active Miners'); }
    // Loop through our rooms
    for (var name in Game.rooms) {
        var needed = Game.rooms[name].memory.minersNeeded;
        console.log('We need ' + needed + ' Miners in this room');
        // Check if our room needs a miner
        if (needed > 0) {
            // If our needed is greater than what we have we need to spawn a miner!
            if (needed > mList.length) {

                var newName = _Spawner.createCreep(miner.parts, undefined, {role: miner.roleName, sType: miner.sType});
                console.log('Spawning new Miner: ' + newName);
                spawned = true;
            }
        }
    }

    if (spawned) {
        console.log('Miner Creep Spawned');
        return true;
    } else {
        if (debug) { console.log('No Miner Creeps needed'); }
        return false;
    }
}

/**
 * Run this script to setup rooms ready for assigned miners
 */
module.exports.setup = function () {
    // Loop through the game rooms we have
    for (var name in Game.rooms) {
        console.log('Setting up room ' + name);
        var theRoom = Game.rooms[name];
        // Clear Assigned Sources
        delete theRoom.memory.assignedSources;
        // Get all the sources available
        var sources = theRoom.find(FIND_SOURCES);
        // Make sure we set the minersNeeded of the room
        theRoom.memory.minersNeeded = sources.length;
        // Make an array / object thing
        var array = {};
        // Loop through sources
        for (var i=0; i<=sources.length-1; i++) {
            console.log(sources[i].id);
            // Set it to null
            array[sources[i].id] = null;
        }
        // Loop through the sources again
        for (var i=0; i<=sources.length-1; i++) {
            // Get the source so we can use it's id
            var source = sources[i];
            // Make found false by default
            var found = false;
            var creepId = null;
            var sourceId = source.id;
            // Loop through the miners
            for (var creepName in Game.creeps) {
                // Define the creep
                var creep = Game.creeps[creepName];
                if (!creep.memory.role == 'miner' || creep.memory.dying) {
                    continue;
                }
                // If this creep has the assigned Source, we found it
                if (creep.memory.assignedSource == sourceId) {
                    found = true;
                    creepId = creep.id;
                    break;
                }
            }
            // we found it
            if (found) {
                console.log(sourceId + ' set to ' + creepId);
                array[sourceId] = creepId;
            }
        }

        // Set the room's assigned Sources to be the object
        theRoom.memory.assignedSources = array;
    }
    return '++Miner Setup Complete++';
}

/**
 * Count Miner Creeps
 */
module.exports.count = function() {
    var miner = require('role.miner');
    var mList = _.filter(Game.creeps, (creep) => creep.memory.role == miner.roleName && !creep.memory.dying);
    console.log('Miners[' + mList.length + ']');
    return mList.length;
}
