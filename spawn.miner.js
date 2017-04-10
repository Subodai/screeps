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
        
        if (!Game.rooms[name].memory.assignedSources) {
            var sources = Game.rooms[name].find(FIND_SOURCES);
            var array = {};
            for (var i = 0; i <= sources.length -1; i++) {
                console.log(sources[i].id);
                array[sources[i].id] = null;
            }
            Game.rooms[name].memory.assignedSources = array();
            // Check for the minersNeeded flag
            if (!Game.rooms[name].memory.minersNeeded) {
                console.log('Setting miners Needed to ' + sources.length);
                Game.rooms[name].memory.minersNeeded = sources.length;
            } else {
                console.log('Currently set to ' + Game.rooms[name].memory.minersNeeded);
            }
        } else {
            console.log('Assigned Sources already exists. leaving alone!');
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
