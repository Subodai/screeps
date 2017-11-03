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
/**
 * Is this enabled
 */
module.exports.enabled = function (room, debug = false) {
    // Turn off if room is discharging with supergraders
    if (Game.rooms[room].memory.charging === false) { return false; }
    // return false;
    // Get all reserve flags without an assigned creep
    let flags = _.filter(Game.flags, (flag) => flag.color === global.flagColor['reserve']);
    // No flags, no spawns
    if (flags.length === 0) { return false; }
    var spawn = false;
    // Loop through the flags
    for (let i in flags) {
        // Get the flag
        let _flag = flags[i];
        // If it's further than 2 rooms away don't bother
        if (Game.map.getRoomLinearDistance(room, _flag.pos.roomName) > 2) { return false; }
        // Is there a creep with this flag in it's memory?
        let creeps = _.filter(Game.creeps, (c) => c.memory.reserveRoom === _flag.pos.roomName && c.memory.flagName === _flag.name && !c.memory.dying);
        // If there's a creep assigned to this, just return false
        if (creeps.length > 0) { return false; }
        // No creep, spawn one
        return true;
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
        for (let i in flags) {
            let _flag = flags[i];
            // ok we have presence, check for creeps
            let creeps = _.filter(Game.creeps, (c) => c.memory.reserveRoom === _room.name && c.memory.flagName === _flag.name && !c.memory.dying);
            if (creeps.length === 0) {
                creep.memory.flagName = _flag.name;
                creep.memory.reserveRoom = _flag.pos.roomName;
                return;
            }
        }
    }
    if (!creep.memory.flagName) {
        console.log('[CREEP][RESERVE][' + creep.name + '] Unable to assign room?');
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
