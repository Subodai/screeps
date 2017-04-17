/**
 * Big Upgrader Role with fixes chars
 */
module.exports.run = function(creep) {
    if (creep.fatigue > 0) {
        creep.say('Zzz');
        return;
    }

    // If we have only a few ticks to live, swap it to harvest mode so it seeks home
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        console.log('Creep soon to die, switching to harvester role');
        creep.say('!!');
        creep.memory.role = 'bigharvester';
    }

    if (creep.room.memory.emergency) {
        delete creep.memory.upgrading;
        delete creep.memory.idle;
        creep.memory.role = 'bigharvester';
        return
    }

    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        creep.say('GET');
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say('PUT');
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {
                visualizePathStyle: {
                    stroke: global.colourUpgrade,
                    opacity: global.pathOpacity
                }
            });
        } else {
            creep.say('(>.<)');
        }
    } else {
        var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES,{
            filter: (i) => i.resourceType == RESOURCE_ENERGY
        });

        if (resource) {
            if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                if (creep.carry.energy <= (creep.carryCapacity/2)) {
                    creep.moveTo(resource,{
                        visualizePathStyle: {
                            stroke: global.colourResPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:3
                    });
                    creep.say('>>');
                } else {
                    creep.memory.upgrading = true;
                }
            } else {
                creep.say('^^');
            }
            return;
        }

        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100
        });

        if(!container) {
            creep.say('???');
        }
        // Can we harvest right now?
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {
                visualizePathStyle: {
                    stroke: global.colourPickup,
                    opacity: global.pathOpacity
                },
                reusePath:0
            });
            creep.say('>>');
        } else {
            creep.say('^^');
        }
    }
}

module.exports.parts = [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE];
