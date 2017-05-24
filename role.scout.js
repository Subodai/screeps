/* Specialist Miner Drone */
module.exports.role = 'scout';
/* SType */
module.exports.sType = 'specialist';
/* This role requires a flag to be set */
module.exports.flagRequirement = 'scout';
/* Costs */
module.exports.cost = {
    1 : 0,
    2 : 0,
    3 : 0,
    4 : 0,
    5 : 1400,
    6 : 1400,
    7 : 1400,
    8 : 1400,
}
/* Body Parts at each RCL */
module.exports.body = {
    1 : [],
    2 : [],
    3 : [],
    4 : [],
    5 : [
        MOVE,MOVE,      // 2 MOVE = 100
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        WORK            // 1 WORK = 100
    ],
    6 : [
        MOVE,MOVE,      // 2 MOVE = 100
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        WORK            // 1 WORK = 100
    ],
    7 : [
        MOVE,MOVE,      // 2 MOVE = 100
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        WORK            // 1 WORK = 100
    ],
    8 : [
        MOVE,MOVE,      // 2 MOVE = 100
        CLAIM,CLAIM,    // 2 CLAIM = 1200
        WORK            // 1 WORK = 100
    ],
}
/* Spawn Roster */
module.exports.roster = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
}

module.exports.enabled = function (room, debug = false) {
    // Get all reserve flags without an assigned creep
    var flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['claim'] && !flag.memory.assignedCreep);
    // If we don't have any return a false
    return (flags.length > 0);
}

module.exports.expiry = 300;

/* Okay, lets code the creep */
module.exports.run = function (creep, debug = false) {
    // First, have we been assigned a flag?
    if (!creep.memory.flagName) {
        // Lets find a flag without a creep assigned
        var flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['claim'] && !flag.memory.assignedCreep);
        // If we found any
        if (flags.length > 0) {
            // Get the first one
            var flag = flag[0];
            flag.memory.assignedCreep = creep.id;
            creep.memory.flagName = flag.name;
            creep.memory.roomName = flag.pos.roomName;
        } else {
            console.log('Something went wrong, ' + this.role + ' creep ' + creep.name + ' cannot find a valid flag');
            return;
        }
    }
    if (creep.spawning) { return; }
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say('Zzz');
        return;
    }
    // Get ticks remaining
    var ticks = creep.ticksToLive;
    // If ticks is less than our expiry time, set creep to dying
    if (ticks <= this.expiry && !creep.memory.dying) {
        // Creep is dying, flag for a replacement
        creep.memory.dying = true;
        var flag = Game.flags[creep.memory.flagName];
        delete flag.memory.assignedCreep;
    }
    // Alright, did we already make it to the room with the flag?
    if (!creep.memory.arrived) {
        // We didn't, alright lets go get the flag's position and head to it!
        var flag = Game.flags[creep.memory.flagName];
        // If our POS is not the flags
        if (creep.pos.roomName == flag.pos.roomName) {
            // We have arrived!
            creep.memory.arrived = true;
        } else {
            var result = creep.moveTo(flag, {
                visualizePathStyle : {
                    stroke: global.colourFlag,
                    opacity: global.pathOpacity
                }
            });
            return;
        }
    }

    // Have we arrived?
    if (creep.memory.arrived) {
        // Get the controller of the room we're meant to be in
        if (creep.room.controller) {
            // Okay, attempt to run reserve on the controller
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                // Move to the controller instead
                creep.moveTo(creep.room.controller, {
                    visualizePathStyle : {
                        stroke: global.colourClaim,
                        opacity: global.pathOpacity
                    }
                });
            } else {
                creep.signController(creep.room.controller, 'Room Claimed by Subodai');
                creep.say('MINE');
                creep.memory.role = 'upgrader';
            }
        }
    }
}
