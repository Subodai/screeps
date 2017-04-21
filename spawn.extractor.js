/**
 * This runs the extractor spawner
 */
module.exports.run = function(debug = false) {
    var extractor = require('role.extractor');
    if (debug) { console.log('Running extractor spawner'); }
    if (debug) { console.log('Checking for viable extractor Creep Spawns'); }
    var spawned = false;
    var mList = _.filter(Game.creeps, (creep) => creep.memory.role == extractor.roleName && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];
    if (debug) { console.log('We have ' + mList.length + ' Active Extractors'); }
    // Loop through our rooms
    for (var name in Game.rooms) {
        var theRoom = Game.rooms[name];
        var needed = theRoom.memory.extractorsNeeded;
        if (debug) { console.log('We need ' + needed + ' Extractors in this room'); }
        // Check if our room needs a extractor
        if (needed > 0) {
            // If our needed is greater than what we have we need to spawn a extractor!
            if (needed > mList.length) {

                var newName = _Spawner.createCreep(extractor.parts, undefined, {role: extractor.roleName, sType: extractor.sType});
                console.log('Spawning new Extractor: ' + newName);
                spawned = true;
            }
        }
    }

    if (spawned) {
        console.log('Extractor Creep Spawned');
        return true;
    } else {
        if (debug) { console.log('No Extractor Creeps needed'); }
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

        delete theRoom.memory.assignedExtractors;
        delete theRoom.memory.extractorsNeeded;

        if (!theRoom.memory.assignedExtractors) {
            var extractors = theRoom.find(FIND_MINERALS, {
                filter: (i) => i.ticksToRegeneration = 0
            });
            var array = {};
            for (var i=0;i<=extractors.length-1;i++) {
                console.log(extractors[i].id);
                array[extractors[i].id] = null;
            }
            theRoom.memory.assignedExtractors = array;
            // Check for the extractorsNeeded flag
            if (!theRoom.memory.extractorsNeeded) {
                console.log('Setting extractors Needed to ' + extractors.length);
                theRoom.memory.extractorsNeeded = extractors.length;
            } else {
                console.log('Currently set to ' + theRoom.memory.extractorsNeeded);
            }
        } else {
            console.log('Assigned Extractors already exists. leaving alone!');
        }

        // First get the extractors
        var extractors = theRoom.find(FIND_MINERALS, {
            filter: (i) => i.ticksToRegeneration = 0
        });
        // Loop through the extractors
        for (var i=0;i<=extractors.length-1;i++) {
            // Get the extractors
            var extractor = extractors[i];
            // Make found false by default
            var found = false;
            var creepId = null;
            var extractorId = extractor.id;
            theRoom.memory.assignedExtractors[extractorId] = null;
            // Loop through the miners
            for (var creepName in Game.creeps) {
                // Define the creep
                var creep = Game.creeps[creepName];
                if (!creep.memory.role == 'extractor' || creep.memory.dying) {
                    continue;
                }
                // If this creep has the assigned Source, we found it
                if (creep.memory.assignedExtractor == extractorId) {
                    found = true;
                    creepId = creep.id;
                    break;
                }
            }
            if (found) {
                theRoom.memory.assignedExtractors[extractorId] = creepId;
            }
        }
    }
    return '++Extractor Setup Complete++';
}

/**
 * Count Extractor Creeps
 */
module.exports.count = function(debug = false) {
    var extractor = require('role.extractor');
    var mList = _.filter(Game.creeps, (creep) => creep.memory.role == extractor.roleName && !creep.memory.dying);
    if (debug) { console.log('Extractors [' + mList.length + ']'); }
    return mList.length;
}
