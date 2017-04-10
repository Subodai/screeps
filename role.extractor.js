/* Specialist Extractor Drone */
module.exports.role = 'extractor';

/* SType */
module.exports.sType = 'specialist';

/* Parts *//* ANY MORE THAN 5 WORKS WON'T LET THE SOURCE REGENERATE */
module.exports.parts = [WORK,WORK,WORK,WORK,WORK,MOVE];

/* Energy Cost */
module.exports.energyCost = 550;

/* Run method */
module.exports.run = function (creep, debug = false) {
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say('Zzz');
        return;
    }

    // Okay, health check
    var ticks = creep.ticksToLive;
    if (ticks <= 100 && !creep.memory.dying) {
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
        if (debug) { console.log('Creep[' + creep.name + '] Extractor without assigned Source, assigning'); }
        // Okay lets get the room memory for assigned sources
        var sourceId = false;
        var extractors = creep.room.find(FIND_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_EXTRACTOR
        });
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
    if (creep.energy == creep.carryCapacity) {
        if (debug) { console.log('Creep[' + creep.name + '] Extractor full, dropping!'); }
        creep.memory.dropping = true;
    } else {
        creep.memory.dropping = false;
    }

    // Are we dropping?
    if (creep.memory.dropping) {
        // This may need to change, depends if the drop costs fatigue or if dropping goes into a container
        console.log(creep.drop(RESOURCE_ENERGY));
        creep.memory.dropping = false;
        creep.say('\/');

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
            // Okay we have a extractor, lets trying harvesting it!
            if (creep.harvest(extractor) == ERR_NOT_IN_RANGE) {
                if (debug) { console.log('Creep[' + creep.name + '] Extractor not in range, moving into range'); }
                // We're not at the thing! Lets go there!
                creep.moveTo(source, {
                    visualizePathStyle: {
                        stroke: '#ff5555',
                        opacity: .5
                    },
                    reusePath:5
                });
                // Moving make a say
                creep.say('>>')
            } else {
                // Mining say we're mining
                if (!creep.memory.dying) {
                    creep.say('d(^-^)b');
                }
            }
        } else {
            if (debug) { console.log('Creep[' + creep.name + '] Extractor cannot find extractor!!'); }
            creep.say('WTF?');
            Game.notify('Extractor Creep unable to assign a extractor');
        }
    }
}
