/* Specialist Reserver Drone */
module.exports.role = 'reserve';
/* SType */
module.exports.sType = 'specialist';
/* This role requires a flag to be set */
module.exports.flagRequirement = 'reserve';
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
    return false;
}
/* Okay, lets code the creep */
module.exports.run = function (creep, debug = false) {
    if (creep.spawning) { return; }
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say('Zzz');
        return;
    }

    // Okay first lets find the flag and go to it
    if (!creep.memory.scouted) {
        // Get the reserve flag
        var flag = Game.flags.reserve;
        // Move to the flag, if we've arrived it shouldn't return an OK ?
        var result = creep.moveTo(flag, {
            visualizePathStyle : {
                stroke: global.colourFlag,
                opacity: global.pathOpacity
            }
        });
        if (result == ERR_BUSY) {
            return;
        }
        if (result != OK) {
            // We must have arrived...
            creep.memory.scouted = true;
        }
    }

    // Once we've arrived at the flag
    if (creep.memory.scouted) {
        // Get the controller for the room we're in
        if (creep.room.controller) {
            // Attempt to claim it
            if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                // Move to the controller
                creep.moveTo(creep.room.controller, {
                    visualizePathStyle : {
                        stroke: global.colourClaim,
                        opacity: global.pathOpacity
                    }
                });
            } else {
                creep.signController(creep.room.controller, 'Room Reserved by Subodai');
                creep.say('MINE');
            }
        }
    }
}
