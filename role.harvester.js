/* Harvester drone */
module.exports.role = 'harvester';
/* sType */
module.exports.sType = 'normal';
/* Costs */
module.exports.cost = {
    1 : 200,
    2 : 300,
    3 : 500,
    4 : 1000,
    5 : 1000,
    6 : 1000,
    7 : 1000,
    8 : 1000,
}

/* Body parts */
module.exports.body = {
    1 : [
        CARRY,CARRY,
        MOVE,MOVE
    ],
    2 : [
        CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE
    ],
    3 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    4 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,
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
    1: 3,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 3,
    7: 4,
    8: 4,
}
module.exports.enabled = function (room, debug = false) {
    return true;
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
        // If we're in emergency mode, we need to start emptying the storage buffers
        if (creep.room.memory.emergency) {
            // console.log('Emergency Mode, Empty Storage');
            creep.memory.idle = 0;
            // We are in emergency mode, get energy from terminal first, then storage
            var box = creep.room.terminal;
            if (box && box.store[RESOURCE_ENERGY] == 0) {
                var box = creep.room.storage;
                if (box && box.store[RESOURCE_ENERGY] == 0) {
                    var box = false;
                }
            }
            if (box) {
                // Can we harvest right now?
                if (creep.withdraw(box, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // No do we have half our energy?
                    if (_.sum(creep.carry) <= (creep.carryCapacity/2)) {
                        // No lets move to the source we want
                        creep.moveTo(box, {
                            visualizePathStyle: {
                                stroke: global.colourPickup,
                                opacity: global.pathOpacity
                            },
                            reusePath:5
                        });
                    } else {
                        creep.memory.delivering = true;
                        creep.say('RECOVER');
                    }
                } else {
                    creep.say('^^^');
                }
                return;
            }
        }

        var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.amount >= creep.carryCapacity
        });
        if (resource) {
            creep.memory.idle = 0;
            if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                if (_.sum(creep.carry) <= (creep.carryCapacity/2)) {
                    creep.moveTo(resource,{
                        visualizePathStyle: {
                            stroke: global.colourResPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:3
                    });
                    creep.say('>>');
                } else {
                    creep.memory.delivering = true;
                }
            } else {
                creep.say('^^');
            }
            return;
        }

        // Prioritise non-standard resources
        var container = false;
        // Loop through a preset list of resources
        for (var i in global.resourceList) {
            // Grab the item from the list
            var _resource = global.resourceList[i];
            // If we haven't got a container yet
            if(!container) {
                // Try to find one
                var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[_resource] >= creep.carryCapacity/10
                });
                // Set the pickup to be this resource for later
                var pickup = _resource;
            }
        }
        // Did we find a container?
        if (container) {
            // Can we withdraw right now?
            if (creep.withdraw(container, pickup) == ERR_NOT_IN_RANGE) {
                // Reset idle state
                creep.memory.idle = 0;
                // No do we have half our energy?
                if (_.sum(creep.carry) <= (creep.carryCapacity/2)) {
                    // No lets move to the source we want
                    creep.moveTo(container, {
                        visualizePathStyle: {
                            stroke: global.colourPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:5
                    });
                } else {
                    // We're full enough, let's switch to deliver mode
                    creep.memory.delivering = true;
                    // SAY!
                    creep.say('PUT');
                }
            } else {
                // Say pickup
                creep.say('^^');
            }
            // We did a thing, return out the loop
            return;
        }

        var hasWork = false;
        for (var part in creep.body) {
            if (part == WORK) {
                hasWork = true;
                break;
            }
        }
        // Can we work?
        if (hasWork) {
            // If we got here, we didn't find a suitable container, are there any active sources?
            var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            // Did we find a source?
            if (source) {
                // Can we harvest this?
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    // Let's move to it
                    creep.moveTo(source, {
                        visualizePathStyle: {
                            stroke: global.colourPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:5
                    });
                    // Say because move
                    creep.say('>>');
                } else {
                    // We picked up, let's move on
                    creep.say('^^');
                    // Did we refill ourselves?
                    if (creep.carry.energy == creep.carryCapacity) {
                        creep.memory.delivering = true;
                    }
                }
            }
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
            // First find towers with less than 400 energy
            var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter : (i) => i.structureType == STRUCTURE_TOWER && i.energy < 400
            });

            // If we didn't find any get them with less than 800
            if (!tower) {
                var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter : (i) =>  i.structureType == STRUCTURE_TOWER && i.energy < 800
                });
            }

            // Okay all above 800, get any now
            if (!tower) {
                var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter : (i) => i.structureType == STRUCTURE_TOWER && i.energy < i.energyCapacity
                });
            }

            // So did we find one?
            if (tower) {
                // Attempt transfer, unless out of range
                if(creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // Let's go to the tower
                    creep.moveTo(tower, {
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
        // Okay time for some fancy maths
        var terminal = creep.room.terminal;
        var storage = creep.room.storage;

        // If we have both storage and terminal
        if (storage && terminal) {
            if (creep.room.memory.prioritise) {
                if (creep.room.memory.prioritise == 'terminal') {
                    if (_.sum(terminal.store) < terminal.storeCapacity) {
                        var target = terminal;
                    } else {
                        var target = storage;
                    }
                } else {
                    var target = storage;
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
                    if (!target || _.sum(terminal.store) == terminal.storeCapacity ) {
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
                // console.log('Creep idle too long, switching to refiller');
                // Game.notify(Game.time + ' Harvester Idle too long, switching to refiller');
                // delete creep.memory.idle;
                // delete creep.memory.delivering;
                // creep.memory.role = 'smallrefiller';
            }
        }

    }
}
