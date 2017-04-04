/**
 * Small Harvester Role
 */
module.exports.run = function(creep) {
    // Is the creep dropping off and empty?
    if (creep.memory.delivering && creep.carry.energy == 0) {
        creep.memory.delivering = false;
        creep.say('🔄 harvest');
    }

    // Is the creep not delivering and full?
    if (!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
        creep.memory.delivering = true;
        creep.say('🚧 deliver');
    }

    // If we're not delivering, check if we can harvest, if not and we have half energy, go and deliver
    if (!creep.memory.delivering) {
        var sources = creep.room.find(FIND_SOURCES);
        // Can we harvest right now?
        if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
            // No do we have half our energy?
            if (creep.carry.energy <= (creep.carryCapacity/2)) {
                // No lets move to the source we want
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                creep.memory.delivering = true;
                creep.say('🚧 deliver');
            }
        }
    }

    // Alright at this point if we're delivering it's time to move the Creep to a drop off
    if (creep.memory.delivering) {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER
                ) && structure.energy < structure.energyCapacity;
            }
        });
        if (targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#00ff00'}});
            }
        } else {
            creep.say('No Delivery Target');
        }
    }
}

module.exports.parts = [WORK,WORK,MOVE,CARRY];
