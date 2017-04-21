/* Upgrader drone */
module.exports.roleName = 'upgrader';

/* sType */
module.exports.sType = 'specialist';

/* Body setups */
module.exports.bodyS  = [
                            WORK,WORK,MOVE,CARRY
                        ];
module.exports.bodyM  = [
                            WORK,WORK,MOVE,CARRY
                        ];
module.exports.bodyL =  [
                            WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE
                        ];

module.exports.bodyXL = [
                            WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE
                        ];

/* Body Costs */
module.exports.costS  = 300;
module.exports.costM  = 300;
module.exports.costL  = 650;
module.exports.costXL = 650;

/* Desired Roster */
module.exports.roster = {
    S : 1,
    M : 0,
    L : 2,
    XL: 0
};

/**
 * Big Harvester Role
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
        creep.memory.role = 'harvester';
    }

    if (creep.room.memory.emergency) {
        delete creep.memory.upgrading;
        delete creep.memory.idle;
        creep.memory.role = 'harvester';
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

        if(container) {
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
            return;
        }
        
        var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        if (source) {
            // Can we harvest this?
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: {
                        stroke: global.colourPickup,
                        opacity: global.pathOpacity
                    },
                    reusePath:3
                });
                creep.say('>>');
            } else {
                creep.say('^^');
                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.upgrading = true;
                }
            }
        }
    }
}
