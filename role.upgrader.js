/* Upgrader drone */
module.exports.role = 'upgrader';
/* sType */
module.exports.sType = 'normal';
/* Costs */
module.exports.cost = {
    1 : 300,
    2 : 550,
    3 : 800,
    4 : 1300,
    5 : 1300,
    6 : 1300,
    7 : 1300,
    8 : 1300,
}
/* Body Parts at each RCL */
module.exports.body = {
    1 : [
        WORK,WORK,
        MOVE,
        CARRY
    ],
    2 : [
        WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE
    ],
    3 : [
        WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    4 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
    5 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
    6 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
    7 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
    8 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
}
/* Spawn Roster */
module.exports.roster = {
    1: 2,
    2: 6,
    3: 8,
    4: 6,
    5: 3,
    6: 3,
    7: 2,
    8: 1,
}
module.exports.enabled = function (room, debug = false) {
    var _room = Game.rooms[room];
    // Turn off normal upgraders while supergraders are on
    if (_room.memory.roles['supergrader'] == true) {
        return false;
    }
    return true;
}
/**
 * Big Harvester Role
 */
module.exports.run = function(creep) {
    if (creep.spawning) { return; }
    if (creep.fatigue > 0) {
        creep.say('Zzz');
        return;
    }

    // If supergrader is enabled, switch to it, no need for upgraders while supergraders are on
    if (creep.room.memory.roles['supergrader'] == true) {
        creep.memory.role = 'supergrader';
        return;
    }

    // If we have only a few ticks to live, swap it to harvest mode so it seeks home
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.say('!!');
        creep.memory.dying = true;
    }

    // if (creep.room.memory.emergency) {
    //     delete creep.memory.upgrading;
    //     delete creep.memory.idle;
    //     creep.memory.role = 'harvester';
    //     return
    // }

    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        creep.say('GET');
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say('PUT');
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(Game.rooms[creep.memory.roomName].controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.rooms[creep.memory.roomName].controller, {
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
                        reusePath:5
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
                    reusePath:5
                });
                creep.say('>>');
            } else {
                creep.say('^^');
            }
            return;
        }

        var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
            filter: function (i) {
                if (i.energy > 0 || i.ticksToRegeneration < 10) {
                    const space = global.getSpaceAtSource(i,creep);
                    return space;
                } else {
                    return false;
                }
            }
        });
        if (source) {
            // Can we harvest this?
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: {
                        stroke: global.colourPickup,
                        opacity: global.pathOpacity
                    },
                    reusePath:5
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
