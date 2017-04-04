/**
 * Small Builder Role
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
        creep.memory.role = 'smallharvester';
    }

    if(creep.memory.building && creep.carry.energy == 0) {
        creep.memory.building = false;
        creep.say('⛏️ harvest');
    }
    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
        creep.memory.building = true;
        creep.say('🔨 build');
    }

    if(creep.memory.building) {
        var site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if(!site) {
            creep.say('N2 🔨');
        }
        if(creep.build(site) == ERR_NOT_IN_RANGE) {
            creep.moveTo(site, {visualizePathStyle: {stroke: '#ffff00'}});
        } else {
            creep.say('🔨');
        }
        // var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        // if(targets.length) {
        //     if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
        //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
        //     }
        // } else {
        //     creep.say('🔨');
        // }
    }
    else {
        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
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

module.exports.parts = [WORK,WORK,MOVE,CARRY];
