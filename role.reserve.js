/* Specialist Reserver Drone */
module.exports.role = 'reserve';
/* SType */
module.exports.sType = 'specialist';
/* This role requires a flag to be set */
module.exports.flagRequirement = 'reserve';
/* Spawn Roster */
module.exports.roster = {
    1: 0,
    2: 0,
    3: 0,
    4: 1,
    5: 1,
    6: 1,
    7: 2,
    8: 2,
};

/* Costs */
module.exports.cost = {
    1 : 0,
    2 : 0,
    3 : 0,
    4 : 1300,
    5 : 1300,
    6 : 1300,
    7 : 1300,
    8 : 1300,
};
/* Body Parts at each RCL */
module.exports.body = {
    1 : [],
    2 : [],
    3 : [],
    4 : [
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        MOVE,MOVE,      // 2 MOVE = 100
    ],
    5 : [
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        MOVE,MOVE,      // 2 MOVE = 100
    ],
    6 : [
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        MOVE,MOVE,      // 2 MOVE = 100
    ],
    7 : [
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        MOVE,MOVE,      // 2 MOVE = 100
    ],
    8 : [
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        MOVE,MOVE,      // 2 MOVE = 100
    ],
};
module.exports.enabled = function (room, debug = false) {
    // Turn off if room is discharging with supergraders
    if (Game.rooms[room].memory.charging === false) { return false; }
    // return false;
    // Get all reserve flags without an assigned creep
    const flags = _.filter(Game.flags, (flag) => flag.color === global.flagColor['reserve']);
    // No flags, no spawns
    if (flags.length === 0) { return false; }
    var spawn = false;
    // Loop through the flags
    for (var i in flags) {
        // Get the flag
        const _flag = flags[i];
        // Is there a creep with this flag in it's memory?
        const creeps = _.filter(Game.creeps, (creep) => creep.memory.reserveRoom === _flag.pos.roomName && creep.memory.flagName === _flag.name && !creep.memory.dying);
        const _room = Game.rooms[_flag.pos.roomName];
        if (_room) {
            // Do we need a creep?
            // Does it have a reservation
            if (_room.controller.reservation) {
                if (_room.controller.ticksToEnd) {
                    if (_room.controller.ticksToEnd < this.expiry*3) {
                       var spawn = true;
                    } else {
                        var spawn = false;
                    }
                } else {
                    var spawn = true;
                }
            } else {
                var spawn = true;
            }
        } else {
            var spawn = true;
        }

        if (spawn && creeps.length === 0) {
            return true;
        }

    }
    return false;
}

module.exports.expiry = 50;

/* Okay, lets code the creep */
module.exports.run = function (creep, debug = false) {
    // First, have we been assigned a flag?
    if (!creep.memory.flagName) {
        // Lets find a flag without a creep assigned
        var flags = _.filter(Game.flags, (flag) => flag.color === global.flagColor['reserve']);
        for (var i in flags) {
            var _flag = flags[i];
            var _room = Game.rooms[_flag.pos.roomName];
            if (_room) {
                // ok we have presence, check for creeps
                var creeps = _.filter(Game.creeps, (creep) => creep.memory.reserveRoom === _room.name && creep.memory.flagName === _flag.name && !creep.memory.dying)
                if (creeps.length === 0) {
                    creep.memory.flagName = _flag.name;
                    creep.memory.reserveRoom = _flag.pos.roomName;
                    return;
                }
            } else {
                creep.memory.flagName = _flag.name;
                creep.memory.reserveRoom = _flag.pos.roomName;
                return;
            }
        }
    }
    // Are we spawning? if so, do nothing else
    if (creep.isTired()) { return; }
    // If ticks is less than our expiry time, set creep to dying
    if (!creep.memory.dying && creep.ticksToLive <= this.expiry) {
        // Creep is dying, flag for a replacement
        creep.memory.dying = true;
    }
    // Functional check!
    if (!creep.canDo(CLAIM)) {
        if (debug) { console.log('[' +creep.name+'] Creep damaged seeking repair:' + JSON.stringify(creep.pos)); }
        return;
    }

    // Alright, did we already make it to the room with the flag?
    if (!creep.memory.arrived) {
        // We didn't, alright lets go get the flag's position and head to it!
        var flag = Game.flags[creep.memory.flagName];
        if (!flag) { return; }
        // If our POS is not the flags
        if (creep.pos.roomName === flag.pos.roomName) {
            // We have arrived!
            creep.memory.arrived = true;
        } else {
            var result = creep.travelTo(flag);
            return;
        }
    }

    // Have we arrived?
    if (creep.memory.arrived) {
        if (creep.memory.reserveRoom != creep.room.name) {
            delete creep.memory.arrived;
        }
        // Get the controller of the room we're meant to be in
        if (creep.room.controller) {
            // Okay, attempt to run reserve on the controller
            if (creep.reserveController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                // Move to the controller instead
                creep.travelTo(creep.room.controller);
                creep.roadCheck();
                creep.say(global.sayMove);
            } else {
                creep.signController(creep.room.controller, 'Room Reserved by Subodai - [Ypsilon Pact]');
                creep.say('MINE');
            }
        }
    }
}
