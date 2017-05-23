/* Super Upgrader drone */
module.exports.role = 'supergrader';
/* sType */
module.exports.sType = 'specialist';
/* Costs */
module.exports.cost = {
    1 : 0,
    2 : 0,
    3 : 0,
    4 : 0,
    5 : 1800,
    6 : 1800,
    7 : 1800,
    8 : 1800,
}
/* Body Parts at each RCL */
module.exports.body = {
    1 : [],
    2 : [],
    3 : [],
    4 : [],
    5 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,   // 1000
        CARRY,CARRY,CARRY,CARRY,    //  200
        CARRY,CARRY,CARRY,CARRY,    //  200
        MOVE,MOVE,MOVE,MOVE,        //  200
        MOVE,MOVE,MOVE,MOVE         //  200
    ],
    6 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,   // 1000
        CARRY,CARRY,CARRY,CARRY,    //  200
        CARRY,CARRY,CARRY,CARRY,    //  200
        MOVE,MOVE,MOVE,MOVE,        //  200
        MOVE,MOVE,MOVE,MOVE         //  200
    ],
    7 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,   // 1000
        CARRY,CARRY,CARRY,CARRY,    //  200
        CARRY,CARRY,CARRY,CARRY,    //  200
        MOVE,MOVE,MOVE,MOVE,        //  200
        MOVE,MOVE,MOVE,MOVE         //  200
    ],
    8 : [
        WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,   // 1000
        CARRY,CARRY,CARRY,CARRY,    //  200
        CARRY,CARRY,CARRY,CARRY,    //  200
        MOVE,MOVE,MOVE,MOVE,        //  200
        MOVE,MOVE,MOVE,MOVE         //  200
    ],
}
/* Spawn Roster */
module.exports.roster = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 10,
    6: 10,
    7: 10,
    8: 10,
}
module.exports.enabled = function (room, debug = false) {
    // Define the room
    var _room = Game.rooms[room];
    var _storage = _room.storage;
    // No Storage, no supergraders
    if (!_storage) { return false; }

    // If we go over 4/5 full on energy storage and we're not enabled in this room, turn it on!
    if (_storage.store[RESOURCE_ENERGY] >= 800000) {
        // Flick the switch lets use all the storage to upgrade
        _room.memory.charging = false;
    }

    // If we are below 1/5th of room energy storage capacity, return false
    if (_storage.store[RESOURCE_ENERGY] <= 200000) {
        // Flick the charging switch to true
        _room.memory.charging = true;
    }

    if (_room.memory.charging) {
        return false;
    } else {
        return true;
    }
}
/**
 * Big Harvester Role
 */
module.exports.run = function(creep) {
    if (creep.spawning) { return; }
    if (creep.fatigue > 0) {
        creep.say(global.sayTired);
        return;
    }

    // If we have only a few ticks to live, swap it to harvest mode so it seeks home
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.say(global.sayWhat);
        creep.memory.dying = 'true';
    }

    if (creep.room.memory.emergency) {
        delete creep.memory.upgrading;
        delete creep.memory.idle;
        creep.memory.role = 'harvester';
        return
    }

    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        creep.say(global.sayGet);
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say(global.sayPut);
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(Game.rooms[creep.memory.roomName].controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.rooms[creep.memory.roomName].controller, {
                visualizePathStyle: {
                    stroke: global.colourUpgrade,
                    opacity: global.pathOpacity
                },
                reusePath:5
            });
            creep.say(global.sayMove);
        } else {
            creep.say(global.sayUpgrade);
        }
    } else {
        // Prioritise the room storage
        var target = creep.room.storage;
        // Is there any?
        if (target) {
            // If it's at least 1 3rd full
            if (target.store[RESOURCE_ENERGY] > target.storeCapacity/5) {
                // Withdraw or move to it
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // No lets move to the source we want
                    creep.moveTo(target, {
                        visualizePathStyle: {
                            stroke: global.colourPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:5
                    });
                    creep.say(global.sayMove);
                } else {
                    creep.say(global.sayWithdraw);
                    creep.memory.upgrading = true;
                }
                return;
            }
        }

        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 100
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
                creep.say(global.sayMove);
            } else {
                creep.say(global.sayWithdraw);
                creep.memory.upgrading = true;
            }
            return;
        }

        // If we got here.. there's a problem
        creep.say(global.sayOhno);
    }
}
