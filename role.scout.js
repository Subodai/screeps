/* Specialist Miner Drone */
module.exports.roleName = 'scout';
/* SType */
module.exports.sType = 'specialist';
/* This role requires a flag to be set */
module.exports.flagRequirement = 'scout';
/* Costs */
module.exports.costS  = 0;
module.exports.costM  = 0;
module.exports.costL  = 0;
module.exports.costXL = 1300;
/* Body Parts */
module.exports.bodyS  = [];
module.exports.bodyM  = [];
module.exports.bodyL  = [];
module.exports.bodyXL = [
    MOVE,MOVE,      // 2 Moves = 100
    CLAIM,CLAIM     // 2 CLAIM = 1200
];
/* Spawn Roster */
module.exports.roster = {
    S : 0,  // 1 Small
    M : 0,  // 0 Mid
    L : 0,  // 0 L
    XL: 1   // 0 XL
};
/* Okay, lets code the creep */
module.exports.run = function (creep, debug = false) {
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say('Zzz');
        return;
    }

    // Okay first lets find the flag and go to it
    if (!creep.memory.scouted) {
        // Get the scout flag
        var flag = Game.flags.scout;
        // Move to the flag, if we've arrived it shouldn't return an OK ?
        if (creep.moveTo(flag, {
            visualizePathStyle : {
                stroke: global.colourFlag,
                opacity: global.pathOpacity
            }
        }) != OK) {
            // We must have arrived...
            creep.memory.scouted = true;
        }
    }

    // Once we've arrived at the flag
    if (creep.memory.scouted) {
        // Get the controller for the room we're in
        if (creep.room.controller) {
            // Attempt to claim it
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                // Move to the controller
                creep.moveTo(creep.room.controller, {
                    visualizePathStyle : {
                        stroke: global.colourClaim,
                        opacity: global.pathOpacity
                    }
                });
            }
        }
    }
}
