// Small Harvester Backup
/**
 * Small Harvester Role
 */
module.exports.run = function(creep) {
    var dropoff = false;
    // Check if creep is full of energy right now
    if(creep.carry.energy < creep.carryCapacity) {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
            if (creep.carry.energy <= (creep.carryCapacity/2)) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
               dropoff = true;
            }
        }
    } else {
        dropoff = true;
    }

    if (dropoff == true) {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });
        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#00ff00'}});
            }
        }
    }
}

module.exports.parts = [WORK,WORK,MOVE,CARRY];
// End of Small Harvester Backup
