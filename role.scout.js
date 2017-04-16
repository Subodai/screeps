/* Specialist Miner Drone */
module.exports.roleName = 'scout';

/* SType */
module.exports.sType = 'specialist';

/* XL Cost */
module.exports.costXL = 700;
/* XL Body (Large Tougher Dude) */
module.exports.bodyXL = [
    TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,          // 5 Toughs = 50
    MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
    ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,     // 5 Attacks = 400 = 150h/t
];


/* M Cost */
module.exports.costM = 380;
/* M Body (tougher, still 1 move per turn)*/
module.exports.bodyM = [
    TOUGH,TOUGH,            // 2 Toughs = 20
    MOVE,MOVE,MOVE,MOVE,    // 4 Moves = 200
    ATTACK,ATTACK,          // 2 Attacks = 160 = 60h/t
];


/* S Cost */
module.exports.costS = 1300;
/* S Body (fast attack dog)*/
module.exports.bodyS = [
    MOVE,MOVE,              // 2 Moves = 100
    CLAIM,CLAIM             // 2 CLAIM = 1200
];

/* What we want to spawn */
module.exports.roster = {
    S : 1,  // 1 Small
    M : 0,  // 0 Mid
    XL: 0   // 0 XL
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
