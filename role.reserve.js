/* Specialist Reserver Drone */
module.exports.roleName = 'reserve';
/* SType */
module.exports.sType = 'specialist';
/* This role requires a flag to be set */
module.exports.flagRequirement = 'reserve';
/* Costs */
module.exports.costS  = 0;
module.exports.costM  = 0;
module.exports.costL  = 0;
module.exports.costXL = 1400;
/* Body Parts */
module.exports.bodyS  = [];
module.exports.bodyM  = [];
module.exports.bodyL  = [];
module.exports.bodyXL = [
    MOVE,MOVE,      // 2 MOVE = 100
    CLAIM,CLAIM,    // 2 CLAIM = 1200
    WORK            // 1 WOKR = 100
];
/* Spawn Roster */
module.exports.roster = {
    S : 0,  // 1 Small
    M : 0,  // 0 Mid
    L : 0,  // 0 L
    XL: 1   // 0 XL
};
module.exports.limit = 'global';
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
                // Switch him to a builder
                creep.memory.role = 'harvester';
            }
        }
    }
}
