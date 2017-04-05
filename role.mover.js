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

/**
 * @memory.tartgetId    int     The current id of the oject this creep is interested in
 * @memory.targetType   string  The type of target this creep is interested in
 * @memory.dying        bool    If the creep has less than 100 ticks to live
 * @memory.delivering   bool    If the creep is currently in drop-off mode
 * @memory.moving       bool    If the creep cannot perform an action it will be in moving mode
 * @memory.path         string  Serialised path for the creep to get to it's target


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
        delete creep.memory.targetType;
        delete creep.memory.path;
        creep.memory.delivering = true;
    }

    // Okay some overrides

    // Are we in emergency mode?
    if (creep.room.memory.emergency) {
        // If we are not deliverying
        if (!creep.memory.delivering) {
            // Make sure our targetId is the room storage
            if (creep.memory.targetId != creep.room.storage.id) {
                creep.memory.targetId = creep.room.storage.id;
                creep.memory.targetType = 'storage';
            }
        }
    }

    // Are we in guard mode?
    if (creep.room.memory.guard) {
        // We'll get to this later
    }

    // Override 2

    // Override 3

    // First lets try whatever action we're trying to perform
    if (creep.memory.delivering) {
        // Try dropping off
    } else {
        // Do we have a target?
        if (!creep.memory.targetId) {
            // No, lets find one
            // The priority is dropped resources
            var resource = creep.pos.findClosestyRange(FIND_DROPPED_RESOURCES, {
                filter: (i) => i.amount >= creep.carryCapacity/2
            });
            // Did we find resources?
            if (resource) {
                creep.memory.targetId = resource.id;
                creep.memory.targetType = 'resource';
            } else {
                // okay we didn't find suitable dropped res, next lets try a container
                var container = creep.pos.findClosestyRange(FIND_STRUCTURES, {
                    filter: (i) => i.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= 100
                });
                // Did we find a container?
                if (container) {
                    creep.memory.targetId = container.id;
                    creep.memory.targetType = 'container';
                } else {
                    // TODO Some kind of "Oh shit I didn't find a suitable target" code here
                }
            }
        }

        var target = Game.getObjectById(creep.memory.targetId);

        // Resource Type
        if (creep.memory.targetType == 'resource') {
            // Let's try to pick it up
            if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
                // We need to go get it
                creep.memory.moving = true;
            } else {
                // Pickup successful
            }
        }

        // Storage or Container Type
        if (creep.memory.targetType == 'storage' || creep.memory.targetType == 'container') {
            // Try to withdraw
            if (creep.withdraw(box, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // We need to go to it
                creep.memory.moving = true;
            } else {
                // Pickup successful
            }
        }
    }
};
