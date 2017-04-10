/* Specialist Mover Drone */
module.exports.roleName = 'mover';

/* SType */
module.exports.sType = 'specialist';


/* XL Cost */
module.exports.costXL = 700;
/* XL Body (Large Tougher Dude) */
module.exports.bodyXL = [
    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,         // 7 Moves = 350
    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,  // 7 Carry = 350
];


/* H Cost */
module.exports.costH = 600;
/* H Body (Creep with toughs!) */
module.exports.bodyH = [
    TOUGH,TOUGH,TOUGH,TOUGH,     // 4 Tough = 200
    MOVE,MOVE,MOVE,MOVE,         // 4 Moves = 200
    CARRY,CARRY,CARRY,CARRY,     // 4 Carry = 200
];


/* M Cost */
module.exports.costM = 500;
/* M Body*/
module.exports.bodyM = [
    MOVE,MOVE,MOVE,MOVE,MOVE,       // 5 Moves = 250
    CARRY,CARRY,CARRY,CARRY,CARRY   // 5 Carry = 250
];


/* S Cost */
module.exports.costS = 300;
/* S Body*/
module.exports.bodyS = [
    MOVE,MOVE,MOVE,     // 3 Moves = 100
    CARRY,CARRY,CARRY,  // 3 Carry = 100
];

/* What we want to spawn */
module.exports.roster = {
    S : 1, // 10 Small
    M : 1,  // 5 Mid
    XL: 1   // 5 XL
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
        // Do we have a target?
        if (!creep.memory.targetId) {
            // No lets try and find one
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => {
                    return (
                        i.structureType == STRUCTURE_EXTENSION ||
                        i.structureType == STRUCTURE_SPAWN
                    ) && i.energy < i.energyCapacity;
                }
            });

            // We found a target lets put it into memory
            if (target) {
                creep.memory.targetId = target.id;
                creep.memory.targetType = 'dropoff';
            } else {
                // Next we should look for turrets?
                var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (i) => {
                        return i.structureType == STRUCTURE_TOWER && i.energy < i.energyCapacity;
                    }
                });

                // We found a turret
                if (target) {
                    creep.memory.targetId = target.id;
                    creep.memery.targetType = 'dropoff';
                } else {
                    // Okay at this point lets just put it into storage
                    var target = creep.room.storage;
                    if (target) {
                        creep.memory.targetId = target.id;
                        creep.memory.targetType = 'dropoff';
                    }
                }
            }
        }
    } else {
        // Do we have a target?
        if (!creep.memory.targetId) {
            // No, lets find one
            // The priority is dropped resources
            var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: (i) => i.amount >= creep.carryCapacity/2
            });
            // Did we find resources?
            if (resource) {
                creep.memory.targetId = resource.id;
                creep.memory.targetType = 'resource';
            } else {
                // okay we didn't find suitable dropped res, next lets try a container
                var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] >= 100
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
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // We need to go to it
            creep.memory.moving = true;
        } else {
            // Pickup successful
        }
    }

    // If it's a drop off
    if (creep.memory.targetType == 'dropoff') {
        // Try to transfer our energy to it
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // We need to go to it
            creep.memory.moving = true;
        } else {
            // Dropoff successful
        }
    }

    // Okay at this point we probably want to move to the target
    if (creep.memory.moving) {
        // Okay lets check for a path
        if (!creep.memory.pathInUse) {
            // We need to find a path to our target
            var path = creep.room.findPath(creep.pos, target.pos, {
                maxOps: 2000, // 2000 is the default, perhaps we can lower this?
                serialize: true
            });
            creep.memory.pathInUse = path;
        }

        var movePath = Room.deserializePath(creep.memory.pathInUse);
        if(creep.moveByPath(movePath) == ERR_NO_PATH) {
            delete creep.memory.pathInUse;
            console.log('Creep Stuck deleting path');
        }
    }
};
