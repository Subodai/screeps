/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.smallharvester.new');
 * mod.thing == 'a thing'; // true
 */

module.exports = {

};/**
 * Small Harvester Role
 */
module.exports.run = function(creep) {
    // If it's fatigued we should just return there's no need to carry on
    if (creep.fatigue > 0) {
        creep.say('💤');
        return;
    }

    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.memory.dying = true;
    }

    // If it's dying force it into delivery mode
    if (creep.memory.dying) {
        creep.say(ticks + ' 🕛');
        if (creep.carry.energy > (creep.carryCapacity/2) || ticks < 50) {
            creep.memory.delivering = true;
        } else {
            creep.memory.delivering = false;
        }
    }

    // Is the creep dropping off and empty?
    if (creep.memory.delivering && creep.carry.energy == 0) {
        creep.memory.delivering = false;
        creep.say('⛏️ harvest');
    }

    // Is the creep not delivering and full?
    if (!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
        creep.memory.delivering = true;
        creep.say('🚚 deliver');
    }

    // If we're not delivering, check if we can harvest, if not and we have half energy, go and deliver
    if (!creep.memory.delivering) {

        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= 100
        });

        if(!container) {
            creep.say('???');
            creep.moveTo(Game.spawns['Sub1'],{
                    visualizePathStyle: {
                        stroke: '#000000',
                        opacity: .1
                    },
                    reusePath:5
                });
            return;
        }
        // Can we harvest right now?
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // No do we have half our energy?
            if (creep.carry.energy <= (creep.carryCapacity/2)) {
                // No lets move to the source we want
                creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                creep.memory.delivering = true;
                creep.say('🚚 deliver');
            }
        } else {
            creep.say('⛏️');
        }
    }

    // Alright at this point if we're delivering it's time to move the Creep to a drop off
    if (creep.memory.delivering) {
        var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN
                ) && structure.energy < structure.energyCapacity;
            }
        });
        if (target) {
            creep.memory.idle = 0;
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
            } else {
                creep.say('🚚');
            }
        } else {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter : (i) => {
                    return i.structureType = STRUCTURE_STORAGE && (_.sum(i.store) < i.storeCapacity)
                }
            });
            if (target) {
                creep.memory.idle = 0;
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
                } else {
                    creep.say('🚚');
                }
            } else {
                creep.memory.idle++;
                creep.say('idle: ' + creep.memory.idle);

                if (creep.memory.idle >= 50) {
                    console.log('Creep idle too long, switching to refiller');
                    Game.notify(Game.time + ' Harvester Idle too long, switching to refiller');
                    delete creep.memory.idle;
                    delete creep.memory.delivering;
                    creep.memory.role = 'smallrefiller';
                }
            }
        }
    }
}

module.exports.parts = [WORK,WORK,MOVE,CARRY];
