/* Specialist Extractor Drone */
module.exports.roleName = 'extractor';
/* SType */
module.exports.sType = 'specialist';
/* Which room memory item should this be checked against */
module.exports.roomRequirement = 'extractorsNeeded';
/* Costs */
module.exports.costS  = 0;
module.exports.costM  = 0;
module.exports.costL  = 0;
module.exports.costXL = 2050;
/* Body parts */
module.exports.bodyS  = [];
module.exports.bodyM  = [];
module.exports.bodyL  = [];
module.exports.bodyXL = [
    WORK,WORK,WORK,WORK,WORK,
    WORK,WORK,WORK,WORK,WORK,
    WORK,WORK,WORK,WORK,WORK,
    WORK,WORK,WORK,WORK,WORK,
    MOVE
];
/* Spawn Roster */
module.exports.roster = {
    S : 0,
    M : 0,
    L : 0,
    XL: 1
}
module.exports.limit = 'room';
// Set a time for this creep to 'expire' at
module.exports.expiry = 200;
/* Run method */
module.exports.run = function (creep, debug = false) {
    if (creep.spawning) { return; }
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say('Zzz');
        return;
    }

    // Okay, health check
    var ticks = creep.ticksToLive;
    if (ticks <= 200 && !creep.memory.dying) {
        if (debug) { console.log('Creep[' + creep.name + '] Extractor Dying Making sure we spawn a new one'); }
        // set dying to true and set the sourceId to null in room memory
        creep.memory.dying = true;
        var extractorId = creep.memory.assignedSExtractor;
        creep.room.memory.assignedExtractors[extractorId] = null;
    }

    // Alright if it's dying, output the timer
    if (creep.memory.dying) {
        if (debug) { console.log('Creep[' + creep.name + '] Extractor Dying, ticking down'); }
        creep.say(ticks);
        // If it's less than 10 ticks, drop what we have
        if (ticks < 10) {
            if (debug) { console.log('Creep[' + creep.name + '] Extractor about to die'); }
            creep.say('!!' + ticks + '!!');
        }
    }

    // Only do this if we don't have an assigned Source
    if (!creep.memory.assignedExtractor) {
        this.setup();
        if (debug) { console.log('Creep[' + creep.name + '] Extractor without assigned Source, assigning'); }
        // Okay lets get the room memory for assigned sources
        var sourceId = false;
        var extractors = creep.room.find(FIND_MINERALS);
        var assigned = creep.room.memory.assignedExtractors;
        // Can't loop through extractors to just to an i = loop to get them
        for (var i=0;i<=extractors.length-1;i++) {
            var extractor = extractors[i];
            if (assigned[extractor.id] == null) {
                extractorId = extractor.id;
                creep.room.memory.assignedExtractors[extractorId] = creep.id;
                creep.memory.assignedExtractor = extractorId;
                // Make sure we break out so we don't break the next extractor too
                break;
            }
        }
        // Do we have a extractorId?
        if (extractorId == false) {
            if (debug) { console.log('Creep[' + creep.name + '] Extractor cannot find extractor!!'); }
            if (!creep.room.memory.extractorReset) {
                creep.room.memory.extractorReset = true;
            }
            Game.notify('Extractor Creep unable to assign a extractor');
        }
    }

    // Are we full?
    if (_.sum(creep.carry) == creep.carryCapacity) {
        if (debug) { console.log('Creep[' + creep.name + '] Extractor full, dropping!'); }
        creep.memory.dropping = true;
    } else {
        creep.memory.dropping = false;
    }

    // Are we dropping?
    if (creep.memory.dropping) {
        // // This may need to change, depends if the drop costs fatigue or if dropping goes into a container
        // console.log(creep.drop(RESOURCE_CATALYST));
        creep.memory.dropping = false;
        // creep.say('V');

        // DANGER we just drop resources here... This could leave a pile of resources if our transfer dudes aren't keeping up

        // // This is just here incase it's needed fast (saves me writing it in a panic)
        // var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        //     filter: (i) => {
        //         return (i.structureType == STRUCTURE_CONTAINER) && (_.sum(i.store) < i.storeCapacity)
        //     }
        // });
        // if (container) {
        //     try {
        //         for (var resource in creep.carry) {
        //             creep.transfer(container, resource);
        //         }
        //     } catch (ERR_NOT_IN_RANGE) {
        //         if (debug) { console.log('Creep[' + creep.name + '] Miner cannot transfer resources'); }
        //     }
        // } else {
        //     creep.say('No Drop');
        //     if (debug) { console.log('Creep[' + creep.name + '] Miner unable to transfer resources is full!'); }
        // }
    }

    if (!creep.memory.dropping) {
        // Alright if we're not dropping, we're harvesting lets try harvesting our assigned source
        var extractor = Game.getObjectById(creep.memory.assignedExtractor);
        if (extractor) {
            if (creep.harvest(extractor) == ERR_TIRED) {
                creep.say('q(-_-)p');
                return;
            } else if (creep.harvest(extractor) == ERR_NOT_IN_RANGE) {
                if (debug) { console.log('Creep[' + creep.name + '] Extractor not in range, moving into range'); }
                // We're not at the thing! Lets go there!
                creep.moveTo(extractor, {
                    visualizePathStyle: {
                         stroke: global.colourMine,
                        opacity: global.pathOpacity
                    },
                    reusePath:5
                });
                // Moving make a say
                creep.say('>>');
                return;
            }

            // Mining say we're mining
            if (!creep.memory.dying) {
                creep.say('d(^-^)b');
            }
        } else {
            if (debug) { console.log('Creep[' + creep.name + '] Extractor cannot find extractor!!'); }
            creep.say('WTF?');
            Game.notify('Extractor Creep unable to assign a extractor');
        }
    }
}

/**
 * Run this script to setup rooms ready for assigned extractors
 */
module.exports.setup = function (debug = false) {
    // Loop through the game rooms we have
    for (var name in Game.rooms) {
        if (debug) { console.log('Setting up room ' + name); }
        var theRoom = Game.rooms[name];

        delete theRoom.memory.assignedExtractors;

        if (!theRoom.memory.assignedExtractors) {
            var extractors = theRoom.find(FIND_MINERALS, {
                filter: (i) => i.ticksToRegeneration = 0
            });
            var array = {};
            for (var i=0;i<=extractors.length-1;i++) {
                if (debug) { console.log(extractors[i].id); }
                array[extractors[i].id] = null;
            }
            theRoom.memory.assignedExtractors = array;
            // Check for the extractorsNeeded flag
            if (!theRoom.memory.extractorsNeeded) {
                if (debug) { console.log('Setting extractors Needed to ' + extractors.length); }
                theRoom.memory.extractorsNeeded = extractors.length;
            } else {
                if (debug) { console.log('Currently set to ' + theRoom.memory.extractorsNeeded); }
            }
        } else {
            if (debug) { console.log('Assigned Extractors already exists. leaving alone!'); }
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
