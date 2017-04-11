/* Specialist Miner Drone */
module.exports.roleName = 'guard';

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


/* Okay, lets code the creep */
module.exports.run = function (creep, debug = false) {
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say('Zzz');
        return;
    }
    if (creep.memory.idle >= 200) {
        Game.notify(Game.time + ' Despawning Guard');
        creep.suicide();
    }
    // Get a target
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (target) {
        creep.memory.idle = 0;
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            creep.say('>>');
            return;
        } else {
            creep.say('FU!');
            return;
        }
    } else {
        creep.memory.idle++;
        creep.say(creep.memory.idle);
        return;
    }
}
