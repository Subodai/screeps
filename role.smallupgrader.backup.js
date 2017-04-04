/**
 * Small Upgrader Role
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
    }
    else {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            creep.say('⛏️');
        }
    }
}

module.exports.parts = [WORK,WORK,MOVE,CARRY];
