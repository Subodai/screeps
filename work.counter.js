/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('work.counter');
 * mod.thing == 'a thing'; // true
 */

module.exports.run = function(debug = false) {
    var _cpu = Game.cpu.getUsed();
    var bigSpawner = require('spawn.big');
    var midSpawner = require('spawn.mid');
    var smallSpawner = require('spawn.small');
    var minerSpawner = require('spawn.miner');
    bigSpawner.count();
    midSpawner.count();
    smallSpawner.count();
    minerSpawner.count();

    // Loop through the rooms
    for(var name in Game.rooms) {
        var theRoom = Game.rooms[name];
        // Are there any hostiles?
        var hostiles = theRoom.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0 && !theRoom.memory.guard) {
            Game.notify('Room put into guard mode spawning guards');
            theRoom.memory.guard = true;
        }
        if (hostiles.length == 0 && theRoom.memory.guard) {
            Game.notify('Room no longer in guard mode');
            theRoom.memory.guard = false;
            delete theRoom.memory.guard;
        }
        if (theRoom.memory.guard) {
            var guardSpawner = require('spawn.guard');
            guardSpawner.count();
            console.log('We are still in guard mode');
        }
        var list = _.filter(Game.creeps, (creep) => !creep.memory.dying);
        if (list.length == 0 && !theRoom.memory.emergency){
            Game.notify('Room '+ name + ' In Emergency Mode!!');
            console.log('Emergency Activated');
            theRoom.memory.emergency = true;
            delete theRoom.memory.assignedSources;
            var miner = require('spawn.miner');
            miner.setup();

        }
        if (list.length >= 15 && theRoom.memory.emergency) {
            Game.notify('Room ' + name + ' No Longer in Emergency Mode');
            console.log('Emergency Deactivated');
            theRoom.memory.emergency = false;
            delete theRoom.memory.emergency;
        }
        if (theRoom.memory.emergency) {
            console.log('We have ' + list.length + ' total creeps still in emergency mode');
        }
        // If the room sources need resetting
        if (theRoom.memory.sourceReset) {
            Game.notify('Room ' + name + ' Resetting mining sources');
            console.log('Resetting Room Sources');
            delete theRoom.memory.assignedSources;
            var miner = require('spawn.miner');
            miner.setup();
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
            Game.notify('Room ' + name + ' Sources reset successfully.');
            console.log('Room sources reset successfully');
            delete theRoom.memory.sourceReset;
        }

        console.log(name + ':' + Game.rooms[name].energyAvailable);
    }
    console.log('Counter used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
}
