/* Refill drone */
module.exports.role = 'refill';
/* sType */
module.exports.sType = 'normal';
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
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    8 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
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
    if (creep.isTired()) { return; }
    var ticks = creep.ticksToLive;
    if (ticks < 150 && !creep.memory.dying) {
        creep.QueueReplacement();
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

    if (creep.room.name != creep.memory.roomName) {
        delete creep.memory.energyPickup;
        let pos = new RoomPosition(25,25,creep.memory.roomName);
        creep.travelTo(pos);
        creep.say('SEEK');
        return;
    }

    // Is the creep dropping off and empty?
    if (creep.memory.delivering && _.sum(creep.carry) === 0) {
        creep.memory.delivering = false;
        creep.say('GET');
    }

    // Is the creep not delivering and full?
    if (!creep.memory.delivering && _.sum(creep.carry) === creep.carryCapacity) {
        creep.memory.delivering = true;
        creep.say('PUT');
    }

    // If we're not delivering, check if we can harvest, if not and we have half energy, go and deliver
    if (!creep.memory.delivering) {
        if (creep.getNearbyEnergy(true) === ERR_FULL) {
            delete creep.memory.energyPickup;
            creep.memory.delivering = true;
        }
    }

    // Alright at this point if we're delivering it's time to move the Creep to a drop off
    if (creep.memory.delivering) {
        delete creep.memory.energyPickup;
        // Let's try putting energy in the link
        if (creep.carry.energy > 0 && creep.room.controller.level >= 5) {
            var target = false;
            // Find the link near the storage
            if (creep.room.storage) {
                // Check the storage cache
                if (!creep.room.storage.memory.linkId) {
                    // we have storage, lets find the link nearby
                    var links = creep.room.find(FIND_MY_STRUCTURES, {
                        filter:(i) => i.structureType === STRUCTURE_LINK && i.pos.inRangeTo(creep.room.storage, 3)
                    });
                    // If we found a lin
                    if (links.length > 0) {
                        creep.room.storage.memory.linkId = links[0].id;
                        target = links[0].id;
                        if (target) {
                            Game.getObjectById(links[0].id).memory.linkType = 'storage';
                        }
                    }

                }
                if (creep.room.storage.memory.linkId) {
                    target = Game.getObjectById(creep.room.storage.memory.linkId);
                    // in case this gets switched
                    if (!target) {
                        delete creep.room.storage.memory.linkId;
                    }
                }

                // If we found the link, lets fill it
                if (target && target.energy < target.energyCapacity) {
                    // Attempt transfer, unless out of range
                    if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        // Let's go to the target
                        creep.travelTo(target);
                        // Say because move
                        creep.say('>>');
                    } else {
                        // Succesful drop off
                        creep.say('V');
                    }
                    return;
                }
            }
        }
        // Do we have energy?
        if (creep.carry.energy > 0) {
            // We do, try to find a spawn or extension to fill
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN
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
                if (resourceType === RESOURCE_ENERGY) {
                    // If we're not in range
                    if (creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                        // Move to it
                        creep.travelTo(target);
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
            // First find towers
            targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter : (i) => i.structureType === STRUCTURE_TOWER && i.energy < i.energyCapacity
            });
            // No targets? try labs
            if (targets.length == 0) {
                targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter : (i) => i.structureType === STRUCTURE_LAB && i.energy < i.energyCapacity
                });
            }
            if (targets.length > 0) {
                target = _.min(targets, (t) => { return t.energy; });
            }

            // So did we find one?
            if (target) {
                // Attempt transfer, unless out of range
                if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    // Let's go to the target
                    creep.travelTo(target);
                    // Say because move
                    creep.say('>>');
                } else {
                    // Succesful drop off
                    creep.say('V');
                }
                return;
            }
        }

        // Fallback for no targets to fill
        if (!target) {
            // Okay time for some fancy maths
            var terminal = creep.room.terminal;
            var storage = creep.room.storage;

            // If we have both storage and terminal
            if (storage && terminal) {
                if (creep.room.memory.prioritise) {
                    if (creep.room.memory.prioritise === 'terminal') {
                        if (_.sum(terminal.store) < terminal.storeCapacity) {
                            var target = terminal;
                        } else {
                            var target = storage;
                        }
                    } else if (creep.room.memory.prioritise === 'storage') {
                        if (_.sum(storage.store) < storage.storeCapacity) {
                            var target = storage;
                        } else {
                            var target = terminal;
                        }
                    } else {
                        if (creep.carry.energy > 0) {
                            var target = storage;
                        } else {
                            var target = terminal;
                        }
                    }
                } else {
                    // Do we have energy?
                    if (creep.carry.energy > 0) {
                        // Lets just assume these exist and get the percentage filled
                        // We need to know the relative filled of each of these, so [filled / (capacity/100)] should give us the percentage?
                        var terminalP = (_.sum(terminal.store) / (terminal.storeCapacity / 100));
                        var storageP  = (_.sum(storage.store)  / (storage.storeCapacity  / 100));
                        // If the fill percentage is less or equal
                        if (terminalP <= storageP) {
                            var target = terminal;
                        }
                        // if it's the other way around use storage
                        if (storageP < terminalP) {
                            var target = storage;
                        }
                    } else {
                        // Prioritise the terminal for non-energy
                        var target = terminal;
                        // If we don't have one
                        if (!target || _.sum(terminal.store) === terminal.storeCapacity ) {
                            // try storage
                            var target = storage;
                        }
                    }
                }

            } else if (storage) { // Room storage?
                var target = storage;
            } else {
                // We've no targets... now what?
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
                    if (creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(target);
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
                if (creep.room.name !== creep.memory.roomName) {
                    // lets go home
                    var spawns = Game.rooms[creep.memory.roomName].find(FIND_STRUCTURES, {
                        filter: (i) => i.structureType === STRUCTURE_SPAWN
                    });
                    var spawn = spawns[0];
                    if (spawn) {
                        creep.travelTo(spawn);
                        creep.say(global.sayMove);
                    }
                }
            }
        }
    }
}
