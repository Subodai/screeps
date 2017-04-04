/**
 * Big Upgrader Role
 */
module.exports.run = function(creep) {
    if (creep.fatigue > 0) {
        creep.say('💤');
        return;
    }

    // If we have only a few ticks to live, swap it to harvest mode so it seeks home
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        console.log('Creep soon to die, switching to harvester role');
        creep.say('♻️');
        creep.memory.role = 'bigharvester';
    }

    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        creep.say('⛏️ harvest');
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say('⛺ upgrade');
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
        } else {
            creep.say('⛺');
        }
    } else {
        var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

        if (resource) {
            if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                if (creep.carry.energy <= (creep.carryCapacity/2)) {
                    creep.moveTo(resource,{
                        visualizePathStyle: {
                            stroke: '#ff0000',
                            opacity: .9
                        },
                        reusePath:3
                    });
                    creep.say('🚓');
                } else {
                    creep.memory.delivering = true;
                }
            } else {
                creep.say('⤴️');
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
                    stroke: '#fffff',
                    opacity: .5
                },
                reusePath:0
            });
        } else {
            creep.say('⛏️');
        }
    }
}

module.exports.parts = [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE];
