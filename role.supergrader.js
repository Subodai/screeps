/* Super Upgrader drone */
module.exports.role = 'supergrader';

/* sType */
module.exports.sType = 'specialist';

/* Spawn Roster */
module.exports.roster = {
    1: 0,
    2: 0,
    3: 0,
    4: 8,
    5: 8,
    6: 8,
    7: 8,
    8: 8,
}
/* Costs */
module.exports.cost = {
    1 : 0,
    2 : 0,
    3 : 0,
    4 : 1300,
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
    4 : [
        WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,
        CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
        ],
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

module.exports.enabled = function (room, debug = false) {
    // Define the room
    var _room = Game.rooms[room];
    var _storage = _room.storage;
    // No Storage, no supergraders
    if (!_storage || _room.controller.level <= 3) { return false; }
    if (_room.memory.charging || _room.controller.level <= 3) {
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

    // If supergrader is enabled, switch to it, no need for upgraders while supergraders are on
    if (creep.room.memory.roles['supergrader'] == false) {
        creep.memory.role = 'upgrader';
        return;
    }

    // If we have only a few ticks to live, swap it to harvest mode so it seeks home
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.say(global.sayWhat);
        creep.memory.dying = 'true';
    }

    // if (creep.room.memory.emergency) {
    //     delete creep.memory.upgrading;
    //     delete creep.memory.idle;
    //     //creep.memory.role = 'harvester';
    //     return
    // }

    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        creep.say(global.sayGet);
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say(global.sayPut);
    }

    if (!creep.memory.upgrading) {
        if (creep.getNearbyEnergy(true) == ERR_FULL) {
            delete creep.memory.energyPickup;
            creep.memory.upgrading = true;
        }
    }

    if(creep.memory.upgrading) {
        delete creep.memory.energyPickup;
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
    }
}
