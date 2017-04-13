/**
 * Small Refiller Role
 * @version 1.0.0
 * Used to fill up turrets and containers for now
 *
 */
module.exports.run = function(creep, debug = false) {
    // If Fatigued, just return, no point in wasting time
    if (creep.fatigue > 0) {
        if (debug) { console.log('Small Refiller Creep fatigued ignoring'); }
        creep.say('Zzz');
        return;
    }

    // If it doesn't have long to live we should dump it into harvest mode (we'll handle dying creeps there)
    if (creep.ticksToLive < 100) {
        if (debug) { console.log('Creep soon to die, switching to harvester role'); }
        creep.say('!!');
        creep.memory.role = 'smallharvester';
    }
    var towers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity;
        }
    });
    if (towers.length > 0) {
        creep.memory.fetching = true;
    } else {
        creep.memory.fetching = false;
    }

    // Is the creep dropping off and empty?
    if (creep.memory.delivering && creep.carry.energy == 0) {
        creep.memory.delivering = false;
        creep.say('GET');
    }

    // Is the creep not delivering and full?
    if (!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
        creep.memory.delivering = true;
        creep.say('PUT');
    }

    var settings = require('settings.desired');

    if (settings.emptyContainers) {
        creep.memory.fetching = true;
        creep.memory.refilSpawn = true;
    } else {
        creep.memory.refilSpawn = false;
    }


    // If we're not delivering, check if we can harvest, if not and we have half energy, go and deliver
    if (!creep.memory.delivering) {
        if (creep.memory.fetching) {
            var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER &&
                                       structure.store[RESOURCE_ENERGY] > 0
            });
            if (containersWithEnergy.length > 0) {
                if(creep.withdraw(containersWithEnergy[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containersWithEnergy[0], {
                        visualizePathStyle: {
                            stroke: global.colourPickup,
                            opacity: .9
                        }
                    });
                } else {
                    creep.say('^^');
                }
            }
        } else {
            var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

            if (resource) {
                if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                    if (creep.carry.energy <= (creep.carryCapacity/2)) {
                        creep.moveTo(resource,{
                            visualizePathStyle: {
                                stroke: global.colourResPickup,
                                opacity: .9
                            },
                            reusePath:3
                        });
                        creep.say('>>');
                    } else {
                        creep.memory.delivering = true;
                    }
                } else {
                    creep.say('^^');
                }
                return;
            }

            var target = creep.room.storage;
            if (target) {
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // No lets move to the source we want
                    creep.moveTo(target, {
                        visualizePathStyle: {
                            stroke: global.colourPickup,
                            opacity: .9
                        }
                    });
                    creep.say('>>');
                } else {
                    creep.say('^^');
                    creep.memory.delivering = true;
                }
            }
        }
    }

    // Alright at this point if we're delivering it's time to move the Creep to a drop off
    if (creep.memory.delivering) {
        if (creep.memory.refilSpawn) {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN
                    ) && structure.energy < structure.energyCapacity;
                }
            });
            if (target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {
                        visualizePathStyle: {
                            stroke: global.colourDropoff,
                            opacity: .9
                        }
                    });
                } else {
                    creep.say('\/');
                }
            } else {
                creep.say('(-_-)');
            }
            return;
        }
        var towers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity;
            }
        });
        if (towers.length > 0) {
            if(creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(towers[0], {
                    visualizePathStyle: {
                        stroke: global.colourTower,
                        opacity: .9
                    }
                });
            } else {
                creep.say('\/');
            }
            return;
        }

        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER) && (_.sum(structure.store) < structure.storeCapacity)
            }
        });
        if (containers.length > 0) {
            if(creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers[0], {
                    visualizePathStyle: {
                        stroke: global.colourDropoff,
                        opacity: .9
                    }
                });
            } else {
                creep.say('\/');
            }
            return;
        }
        // If we got here then we didn't find anything to fill
        creep.say('(-_-)');
    }
}

module.exports.parts = [WORK,WORK,MOVE,CARRY];
