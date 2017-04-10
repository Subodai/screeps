/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawn.small');
 * mod.thing == 'a thing'; // true
 */
/**
 * Run this script to setup rooms ready for assigned miners
 */
module.exports.setup = function () {
    // Loop through the game rooms we have
    for (var name in Game.rooms) {
        console.log('Setting up room ' + name);

        var theRoom = Game.rooms[name];

        delete theRoom.memory.assignedSources;
        delete theRoom.memory.minersNeeded;
        
        if (!theRoom.memory.assignedSources) {
            var sources = theRoom.find(FIND_SOURCES);
            var array = {};
            for (var i = 0; i <= sources.length -1; i++) {
                console.log(sources[i].id);
                array[sources[i].id] = null;
            }
            theRoom.memory.assignedSources = array;
            // Check for the minersNeeded flag
            if (!theRoom.memory.minersNeeded) {
                console.log('Setting miners Needed to ' + sources.length);
                theRoom.memory.minersNeeded = sources.length;
            } else {
                console.log('Currently set to ' + theRoom.memory.minersNeeded);
            }
        } else {
            console.log('Assigned Sources already exists. leaving alone!');
        }

        // First get the sources
        var sources = theRoom.find(FIND_SOURCES);
        // Loop through the sources
        for (var i=0; i<=sources.length-1; i++) {
            // Get the sources
            var source = sources[i];
            // Make found false by default
            var found = false;
            var creepId = null;
            var sourceId = source.id;
            theRoom.memory.assignedSources[sourceId] = null;
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
            if (found) {
                theRoom.memory.assignedSources[sourceId] = creepId;
            }
        }
    }
    return '++Miner Setup Complete++';
}

/**
 * This runs the miner spawner
 */
module.exports.run = function(debug = false) {
    var miner = require('role.miner');
    if (debug) { console.log('Running miner spawner'); }
    console.log('Checking for viable miner Creep Spawns');
    var spawned = false;
    var mList = _.filter(Game.creeps, (creep) => creep.memory.role == miner.role && !creep.memory.dying);
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

                var newName = _Spawner.createCreep(miner.parts, undefined, {role: miner.role, sType: miner.sType});
                console.log('Spawning new Miner: ' + newName);
                spawned = true;
            }
        }
    }

    if (spawned) {
        console.log('Miner Creep Spawned');
        return true;
    } else {
        console.log('No Miner Creeps needed');
        return false;
    }
}

/**
 * Count Miner Creeps
 */
module.exports.count = function() {
    var miner = require('role.miner');
    var mList = _.filter(Game.creeps, (creep) => creep.memory.role == miner.role && !creep.memory.dying);
    console.log('Miners[' + mList.length + ']');
    return mList.length;
}
