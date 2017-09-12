// Harvester Drone
module.exports.role = 'harvester';

// Core Type
module.exports.sType = 'normal';

// Spawn count roster
module.exports.roster = {
    1: 2,
    2: 2,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 2,
    8: 2,
};

// Human Readable costs (likely to be pruned)
module.exports.cost = {
    1 : 300,
    2 : 400,
    3 : 500,
    4 : 1300,
    5 : 1800,
    6 : 1800,
    7 : 1800,
    8 : 1800,
};

// Body Part array for each RCL
module.exports.body = {
    1 : [
        WORK,
        CARRY,CARRY,
        MOVE,MOVE
    ],
    2 : [
        WORK,
        CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
    3 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    4 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    5 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    6 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    7 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    8 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
};

// Multiplier for spawn use
module.exports.multiplier = 2;

// Enabled method
module.exports.enabled = function (room, debug = false) {
    const _room = Game.rooms[room];
    if (_room.controller && _room.memory.minersNeeded && _room.memory.minersNeeded > 0) {
        var list = _.filter(Game.creeps, (creep) => creep.memory.role === this.role && creep.memory.roomName === room && !creep.memory.dying);
        if (list.length < _room.memory.minersNeeded*this.multiplier) {
            return true;
        }
    }
    return false;
}

// Main run method
module.exports.run = function(creep) {
    if (creep.isTired()) { return; }
    if (!creep.memory.dying && creep.ticksToLive < 100) { creep.memory.dying = true; }
    // If it's dying force it into delivery mode
    if (creep.memory.dying) {
        creep.say(creep.ticksToLive);
        if (_.sum(creep.carry) > (creep.carryCapacity/2) || creep.ticksToLive < 50) {
            creep.memory.delivering = true;
        } else {
            creep.memory.delivering = false;
        }
    }
    // Are we not in our home room for some stupid reason
    if (creep.room.name !== creep.memory.roomName) {
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
        // Any minerals to pickup?
        // Always pickup none
        if (creep.getNearbyEnergy() === ERR_FULL) {
            delete creep.memory.energyPickup;
            creep.memory.delivering = true;
        }
    }

    // Alright at this point if we're delivering it's time to move the Creep to a drop off
    if (creep.memory.delivering) {
        delete creep.memory.energyPickup;
        var fillSpawns = false;
        if (creep.room.energyAvailable < creep.room.energyCapacityAvailable*0.75) {
            fillSpawns = true;
        }
        // only refill spawns and other things if room level below 4 after 4 we just fill storage
        // after 5 we fill storage and terminal
        // unless emergency, then we fill spawns too
        if (fillSpawns || creep.room.controller.level < 4 || creep.room.memory.emergency || !creep.room.storage) {
            var target = false;
            // Do we have energy?
            if (creep.carry.energy > 0) {
                // We do, try to find a spawn or extension to fill
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
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
                for(let resourceType in creep.carry) {
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
                var tower = false;
                // First find towers with less than 400 energy
                tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter : (i) => i.structureType === STRUCTURE_TOWER && i.energy < 400
                });

                // If we didn't find any get them with less than 800
                if (!tower) {
                    tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter : (i) =>  i.structureType === STRUCTURE_TOWER && i.energy < 800
                    });
                }

                // Okay all above 800, get any now
                if (!tower) {
                    tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter : (i) => i.structureType === STRUCTURE_TOWER && i.energy < i.energyCapacity
                    });
                }

                // If towers are full, can we dump it into a lab?
                if (!tower) {
                    tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter : (i) => i.structureType === STRUCTURE_LAB && i.energy < i.energyCapacity
                    });
                }
                // So did we find one?
                if (tower) {
                    // Attempt transfer, unless out of range
                    if(creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        // Let's go to the tower
                        creep.travelTo(tower);
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

            if (creep.memory.idle >= 10) {
                // Are we in our home room?
                //if (creep.room.name != creep.memory.roomName) {
                    // lets go home
                    var spawns = Game.rooms[creep.memory.roomName].find(FIND_STRUCTURES, {
                        filter: (i) => i.structureType === STRUCTURE_SPAWN
                    });
                    var spawn = spawns[0];
                    if (spawn) {
                        creep.travelTo(spawn);
                        creep.say(global.sayMove);
                    }
                //}
            }
        }
    }
}
