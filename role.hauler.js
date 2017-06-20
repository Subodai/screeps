/* Hauler drone */
module.exports.role = 'hauler';
/* sType */
module.exports.sType = 'remote';
/* Costs */
module.exports.cost = {
    1 : 300,
    2 : 400,
    3 : 600,
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
        MOVE,MOVE,MOVE
    ],
    3 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    4 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    5 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    6 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    7 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    8 : [
        WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
}
/* Spawn Roster */
module.exports.roster = {
    1: 2,
    2: 2,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 2,
    8: 2,
}

module.exports.enabled = function (room, debug = false) {
    // Get the flags
    var flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['remote']);
    // No remote flags, return false
    if (flags.length == 0) { return false; }
    // Loop through the flags
    for (var i in flags) {
        // Get the flag
        var _flag = flags[i];
        // Get the room
        var _room = Game.rooms[_flag.pos.roomName];
        // Do we have the room?
        if (_room) {
            // How many sources are in the room, we only need 1 per source
            const sources = _room.find(FIND_SOURCES);
            const req = sources.length;
            const list = _.filter(Game.creeps, (creep) => creep.memory.role == this.role && creep.memory.remoteRoom == _flag.pos.roomName && !creep.memory.dying);
            const got = list.length;
            if (got < req) { return true; }
        }

        // probably false.. if we don't have anyone in there we don't have vision
        return false;
    }
    return false;
}
/**
 * Hauler role
 */
module.exports.run = function(creep) {
    // First thing we need to do, is be assigned a flag and remote Room
    if (!creep.memory.remoteRoom) {
        // Get all the remote room flags
        var flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['remote']);
        // if there's no remote flags, just turn this into a harvester
        if (flags.length == 0) {
            creep.memory.role = 'harvester';
            return;
        }
        // Loop through the flags
        for (var i in flags) {
            // Get the flag
            var _flag = flags[i];
            // get the room
            var _room = Game.rooms[_flag.pos.roomName];
            // Do we have the room?
            if (_room) {
                const sources = _room.find(FIND_SOURCES);
                const req = sources.length;
                const list = _.filter(Game.creeps, (creep) => creep.memory.role == this.role && creep.memory.remoteRoom == _flag.pos.roomName && !creep.memory.dying);
                const got = list.length;
                if (got < req) {
                    // This room needs a creep!
                    creep.memory.remoteRoom = _flag.pos.roomName;
                    creep.memory.flagName = _flag.name;
                    creep.memory.seek = true;
                }
            }
        }
    }
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

    // Logic is as follows. If empty, head to remote room, if in remote room and empty, find resources as normal
    // if full, return to home room, if in home room drop resources off
    // If travelling with resources we should run a repair on the road we're on as we go

    // First are we empty, if we are we should be heading to remote
    if (_.sum(creep.carry) == 0) {
        // Set Seek to true
        creep.memory.seek = true;
    }
    var moved = false;
    // Are we seeking?
    if (creep.memory.seek) {
        // Are we in the room yet?
        if (creep.room.name != creep.memory.remoteRoom) {
            // No get the position of the flag we have in memory and go there
            const _flag = Game.flags[creep.memory.flagName];
            // Lets head to the flag
            creep.moveTo(_flag, {
                visualizePathStyle: {
                    stroke: global.colourPickup,
                    opacity: global.pathOpacity
                },
                reusePath:5
            });
            var moved = true;
        } else {
            // At this point we're in the room with the resources we want to find lets go find them
            const resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: (res) => res.amount >= creep.carryCapacity
            });
            // Did we find one?
            if (resource) {
                // Attempt to pickup
                if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                    // move to the resource
                    creep.moveTo(resource, {
                        visualizePathStyle: {
                            stroke: global.colourPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:5
                    });
                    var moved = true;
                } else {
                    // Clear the seek flag we've picked up some resources!
                    delete creep.memory.seek;
                    creep.say(global.sayWithdraw);
                }
            } else {
                // lets try a container
                const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] >= creep.carryCapacity/2
                });
                // Did we find one?
                if (container) {
                    // Lets try to withdraw
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move to the container
                        creep.moveTo(container, {
                            visualizePathStyle: {
                                stroke: global.colourPickup,
                                opacity: global.pathOpacity
                            },
                            reusePath:5
                        });
                        var moved = true;
                    } else {
                        // Clear the seek flag we picked up stuff
                        delete creep.memory.seek;
                        creep.say(global.sayWithdraw);
                    }
                }
            }
        }
    }

    // Alright now the code for if we're not seeking
    if (!creep.memory.seek) {
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
                    reusePath:5
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
                                reusePath:5
                            });
                            var moved = true;
                            break;
                        } else {
                            creep.say(global.sayDrop);
                        }
                    }
                }
            } else {
                // no where to drop it off. lets just dump it in this room and let the home creeps deal with it
                for (var i in creep.carry) {
                    if (creep.carry[i] > 0) {
                        creep.drop(i);
                        creep.say(global.sayDrop);
                    }
                }
            }
        }
    }

    if (moved) { creep.say(global.sayMove); }

    // If we moved and we have energy we should run a repair/build/seed on any road we're standing on
    if (moved && creep.carry.energy > 0) {
        this.roadRoutine(creep);
    }
}

/**
 * Road repair/build/seed subroutine
 */
module.exports.roadRoutine = function (creep) {
    var road = false;
    const objects = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos);
    if (objects.length > 0) {
        for (var i in objects) {
            if (objects[i].structureType == STRUCTURE_ROAD) {
                var road = objects[i];
                break;
            }
        }
    }
    // Is there a road here?
    if (road) {
        if (road.hits < road.hitsMax) {
            creep.repair(road);
            creep.say(global.sayRepair);
            return;
        }
    } else {
        // is there a constructionsite, if so we could build it on the way past
        var constructionSite = false;
        const sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos);
        if (sites.length > 0) {
            for (var i in sites) {
                if (sites[i].structureType == STRUCTURE_ROAD) {
                    var constructionSite = sites[i];
                    break;
                }
            }
        }
        // Is there a construction site?
        if (constructionSite) {
            creep.build(constructionSite);
            creep.say(global.sayBuild);
        } else {
            // Add remote road seeding?
            if (global.seedRemoteRoads === true) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
            }
        }
    }
}
