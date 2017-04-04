/* Specialist Mover Drone */
module.exports.role = 'miner';

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
module.exports.costS = 260;
/* S Body (fast attack dog)*/
module.exports.bodyS = [
    MOVE,MOVE,              // 1 Moves = 100
    ATTACK,ATTACK,          // 2 Attacks = 160 = 60h/t
];

/* What we want to spawn */
module.exports.roster = {
    S : 10, // 10 Small
    M : 5,  // 5 Mid
    XL: 5   // 5 XL
};

/* Run method */
module.exports.run = function (creep, debug = false) {
    // If we're fatigued, stop and go no further
    if (creep.fatigue > 0) {
        creep.say('💤');
        return;
    }

    // Are we close to dying?
    if (!creep.memory.dying && creep.ticksToLive < 100) {
        creep.memory.dying = true;
    }

    // Are we empty and done dropping off?
    if (creep.memory.delivering && creep.carry.energy == 0) {
        delete creep.memory.targetId;
        delete creep.memory.path;
        creep.memory.delivering = false;
    }

    // Is it full and NOT delivering
    if (!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
        delete creep.memory.targetId;
        delete creep.memory.path;
        creep.memory.delivering = true;
    }

    // Okay some overrides

    // Are we in emergency mode?
    if (creep.room.memory.emergency) {

    }

    // Are we in guard mode?
    if (creep.room.memory.guard) {

    }

    // Override 2

    // Override 3

    // First lets try whatever action we're trying to perform
    if (creep.memory.delivering) {
        // Try dropping off
    } else {
        // Try collecting
    }

};
