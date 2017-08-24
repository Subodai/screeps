var DBG = false;
/* Hauler drone */
module.exports.role = 'hauler';
/* sType */
module.exports.sType = 'remote';
/* Spawn Roster */
module.exports.roster = {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
}
/* Costs */
module.exports.cost = {
    1 : 300,
    2 : 450,
    3 : 650,
    4 : 1250,
    5 : 1250,
    6 : 1250,
    7 : 1250,
    8 : 1250,
}

/* Body parts */
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
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    4 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    5 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    6 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    7 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    8 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
}


module.exports.multiplier = 1;

module.exports.enabled = function (room, debug = false) {
    // Turn off if room is discharging with supergraders
    if (Game.rooms[room].memory.charging == false) { return false; }
    // Get the flags
    var flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['haul']);
    // No remote flags, return false
    if (flags.length == 0) { return false; }
    return true;
}
/**
 * Hauler role
 */
module.exports.run = function(creep, debug = false) {
    // Now if we're spawning just return
    if (creep.spawning) { return; }
    // If it's fatigued we should just return there's no need to carry on
    if (creep.fatigue > 0) {
        creep.say(global.sayTired);
        return;
    }
    // Check our time to live
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.memory.dying = true;
    }

    if (!creep.canDo(CARRY)) {
        if (debug) { console.log('[' +creep.name+'] Creep damaged seeking repair:' + JSON.stringify(creep.pos)); }
        return;
    }
    // Logic is as follows. If empty, head to remote room, if in remote room and empty, find resources as normal
    // if full, return to home room, if in home room drop resources off
    // If travelling with resources we should run a repair on the road we're on as we go

    // First are we empty, if we are we should be heading to remote
    if (_.sum(creep.carry) == 0) {
        // Set Seek to true
        creep.memory.seek = true;
    }

    if (_.sum(creep.carry) >= creep.carryCapacity && creep.carryCapacity > 0) {
        delete creep.memory.seek;
        delete creep.memory.arrived;
        delete creep.memory.energyPickup;
        delete creep.memory.remoteRoom;
    }

    var moved = false;
    // Are we seeking?
    if (creep.memory.seek) {
        if (creep.room.name == creep.memory.remoteRoom) {
            creep.memory.arrived = true;
        }
        if (!creep.memory.arrived) {
            DBG && console.log(creep.name + ' Creep has not arrived');
            // If we have cleared the remoteRoom (which we should after every successful pickup)
            if (!creep.memory.remoteRoom) {
                creep.memory.remoteRoom = Memory.remoteRoom;
                DBG && console.log('['+creep.name+'] setting hauler remote room ' + creep.memory.remoteRoom);
            }
            DBG && console.log('['+creep.name+'] Hauler Not in remote room ' + creep.memory.remoteRoom);
            if (creep.memory.remoteRoom == '-Infinity') { delete creep.memory.remoteRoom; }
            if (creep.memory.remoteRoom) {
                let pos = new RoomPosition(25,25,creep.memory.remoteRoom);
                // Lets head to the remoteRoom
                creep.moveTo(pos, {
                    visualizePathStyle: {
                        stroke: global.colourPickup,
                        opacity: global.pathOpacity
                    },
                    reusePath:25
                });
                var moved = true;
            }
        } else {
            DBG && console.log(creep.name + ' Creep has arrived seeking energy');
            if (creep.getNearbyEnergy() == ERR_FULL) {
                delete creep.memory.seek;
                delete creep.memory.energyPickup;
            }
        }
    }

    // Alright now the code for if we're not seeking
    if (!creep.memory.seek) {
        // If we don't have a room to deliver to yet (which we should reset after every drop off)
        if (!creep.memory.roomName) {
            creep.memory.roomName = Memory.myRoom;
            console.log('['+creep.name+'] setting hauler home room');
        }
        DBG && console.log('['+creep.name+'] Hauler full going home');
        // We need to be heading home are we in our home room yet?
        if (creep.room.name != creep.memory.roomName) {
            // We're not in the room yet, we need to seek the room's controller
            const spawns = Game.rooms[creep.memory.roomName].find(FIND_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_SPAWN
            });
            // Get the first spawn
            const spawn = spawns[0];
            // If we have one
            if (spawn) {
                // Lets go to it
                creep.moveTo(spawn, {
                    visualizePathStyle: {
                        stroke: global.colourDropoff,
                        opacity: global.pathOpacity
                    },
                    reusePath:25
                });
                var moved = true;
            }
        } else {
            // We're already in the room lets dump our resources on the storage
            const target = creep.room.storage;
            // Does it have storage?
            if (!target) {
                // no.. okay lets dump it in a container
                const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (i) => i.structureType == STRUCTURE_CONTAINER && _.sum(i.store) < i.storeCapacity
                });
            }
            // Did we find a target?
            if (target) {
                // Loop through everything we're carrying
                for (var i in creep.carry) {
                    // Do we have any?
                    if (creep.carry[i] > 0) {
                        // attempt to transfer
                        if (creep.transfer(target, i) == ERR_NOT_IN_RANGE) {
                            // Lets go to it
                            creep.moveTo(target, {
                                visualizePathStyle: {
                                    stroke: global.colourDropoff,
                                    opacity: global.pathOpacity
                                },
                                reusePath:15
                            });
                            var moved = true;
                            break;
                        } else {
                            creep.say(global.sayDrop);
                            delete creep.memory.roomName;
                        }
                    }
                }
            } else {
                // no where to drop it off. lets just dump it in this room and let the home creeps deal with it
                for (var i in creep.carry) {
                    if (creep.carry[i] > 0) {
                        creep.drop(i);
                        creep.say(global.sayDrop);
                        delete creep.memory.roomName;
                    }
                }
            }
        }
    }

    if (moved) { creep.say(global.sayMove); }

    // If we moved and we have energy we should run a repair/build/seed on any road we're standing on
    if (moved && creep.carry.energy > 0) {
        // Turn off roadCheck for haulers, they should be optimised enough without this I think (might be worth checking how swamps affect this)
        // creep.roadCheck(true);
    }
}
