/* Refill drone */
module.exports.role = 'refill';
/* sType */
module.exports.sType = 'normal';
/* Costs */
module.exports.cost = {
    1 : 0,
    2 : 0,
    3 : 0,
    4 : 500,
    5 : 1000,
    6 : 1000,
    7 : 1000,
    8 : 1000,
}

/* Body parts */
module.exports.body = {
    1 : [],
    2 : [],
    3 : [],
    4 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    5 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    6 : [
       CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    7 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    8 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
}
/* Spawn Roster */
module.exports.roster = {
    1: 0,
    2: 0,
    3: 0,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
}
module.exports.enabled = function (room, debug = false) {
    const _room = Game.rooms[room];
    if (_room.controller) {
        if(_room.controller.level >= 4 && _room.storage) {
            return true;
        }
    }
    return false;
}
/**
 * Harvester Role
 */
module.exports.run = function(creep) {
    if (creep.spawning) { return; }
    // If it's fatigued we should just return there's no need to carry on
    if (creep.fatigue > 0) {
        creep.say('Zzz');
        return;
    }

    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.memory.dying = true;
    }

    // If it's dying force it into delivery mode
    if (creep.memory.dying) {
        creep.say(ticks);
        if (_.sum(creep.carry) > (creep.carryCapacity/2) || ticks < 50) {
            creep.memory.delivering = true;
        } else {
            creep.memory.delivering = false;
        }
    }

    // Is the creep dropping off and empty?
    if (creep.memory.delivering && _.sum(creep.carry) == 0) {
        creep.memory.delivering = false;
        creep.say('GET');
    }

    // Is the creep not delivering and full?
    if (!creep.memory.delivering && _.sum(creep.carry) == creep.carryCapacity) {
        creep.memory.delivering = true;
        creep.say('PUT');
    }

    // If we're not delivering, check if we can harvest, if not and we have half energy, go and deliver
    if (!creep.memory.delivering) {

        if (creep.getNearbyEnergy(true) == ERR_FULL) {
            delete creep.memory.energyPickup;
            creep.memory.delivering = true;
            return;
        }
    }

    // Alright at this point if we're delivering it's time to move the Creep to a drop off
    if (creep.memory.delivering) {
        // Do we have energy?
        if (creep.carry.energy > 0) {
            // We do, try to find a spawn or extension to fill
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN
                    ) && structure.energy < structure.energyCapacity;
                }
            });
        }
        // Did we find a spawn or extension?
        if (target) {
            // Yep, so reset idle
            creep.memory.idle = 0;
            // Loop through our carry
            for(var resourceType in creep.carry) {
                // Only try to delivery energy to spawn and exention
                if (resourceType == RESOURCE_ENERGY) {
                    // If we're not in range
                    if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                        // Move to it
                        creep.moveTo(target, {
                            visualizePathStyle: {
                                stroke: global.colourDropoff,
                                opacity: global.pathOpacity
                            },
                            reusePath: 5
                        });
                         // Say because move
                        creep.say('>>');
                    } else {
                        // Successful drop off
                        creep.say('V');
                    }
                }
            }

            // We're done, next
            return;
        }
        // We didn't find a target yet, do we still have energy to use?
        if (creep.carry.energy > 0) {
            var target = false;
            // First find towers with less than 400 energy
            var targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter : (i) => i.structureType == STRUCTURE_TOWER && i.energy < i.energyCapacity
            });
            // No targets? try labs
            if (targets.length == 0) {
                var targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter : (i) => i.structureType == STRUCTURE_LAB && i.energy < i.energyCapacity
                });
            }
            if (targets.length > 0) {
                // Sort the targets
                targets.sort(function(a,b){
                    if (a.energy < b.energy) {
                        return -1;
                    } else if (b.energy > a.energy) {
                        return 1;
                    }
                    return 0;
                });
                // Get the first one
                target = targets[0];
            }

            // So did we find one?
            if (target) {
                // Attempt transfer, unless out of range
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // Let's go to the target
                    creep.moveTo(target, {
                        visualizePathStyle: {
                            stroke: global.colourTower,
                            opacity: global.pathOpacity
                        },
                        reusePath: 5
                    });
                    // Say because move
                    creep.say('>>');
                } else {
                    // Succesful drop off
                    creep.say('V');
                }
                return;
            }
        }

        // Did we find a target?
        if (target) {
            // reset idle
            creep.memory.idle = 0;
            // Loop through our resources
            for(var resourceType in creep.carry) {
                // Attempt to transfer them
                if (creep.carry[resourceType] > 0) {
                    if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {
                            visualizePathStyle: {
                                stroke: global.colourDropoff,
                                opacity: global.pathOpacity
                            }
                        });
                        // Say because move
                        creep.say('>>');
                        // if we failed, we don't need to keep trying
                        break;
                    } else {
                        creep.say('V');
                    }
                }
            }
            return;
        } else {
            creep.memory.idle++;
            creep.say('idle: ' + creep.memory.idle);

            if (creep.memory.idle >= 100) {
                // Are we in our home room?
                if (creep.room.name != creep.memory.roomName) {
                    // lets go home
                    var spawns = Game.rooms[creep.memory.roomName].find(FIND_STRUCTURES, {
                        filter: (i) => i.structureType == STRUCTURE_SPAWN
                    });
                    var spawn = spawns[0];
                    if (spawn) {
                        creep.moveTo(spawn, {
                            visualizePathStyle: {
                                stroke: global.colourIdle,
                                opacity: global.pathOpacity
                            },
                            reusePath:3
                        });
                        creep.say(global.sayMove);
                    }
                }
            }
        }
    }
}
