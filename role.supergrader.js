/* Super Upgrader drone */
module.exports.roleName = 'supergrader';
/* sType */
module.exports.sType = 'specialist';
/* Costs */
module.exports.costS  = 0;
module.exports.costM  = 0;
module.exports.costL  = 0;
module.exports.costXL = 1800;
/* Body parts */
module.exports.bodyS  = [

];
module.exports.bodyM  = [

];
module.exports.bodyL =  [

];
module.exports.bodyXL = [
    WORK,WORK,WORK,WORK,WORK,
    WORK,WORK,WORK,WORK,WORK,   // 1000
    CARRY,CARRY,CARRY,CARRY,    //  200
    CARRY,CARRY,CARRY,CARRY,    //  200
    MOVE,MOVE,MOVE,MOVE,        //  200
    MOVE,MOVE,MOVE,MOVE         //  200
];
/* Spawn Roster */
module.exports.roster = {
    S : 0,
    M : 0,
    L : 0,
    XL: 4
};
module.exports.limit = 'room';
/**
 * Big Harvester Role
 */
module.exports.run = function(creep) {
    if (creep.spawning) { return; }
    if (creep.fatigue > 0) {
        creep.say(global.sayTired);
        return;
    }

    // If we have only a few ticks to live, swap it to harvest mode so it seeks home
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.say(global.sayWhat);
        creep.memory.dying = 'true';
    }

    if (creep.room.memory.emergency) {
        delete creep.memory.upgrading;
        delete creep.memory.idle;
        creep.memory.role = 'harvester';
        return
    }

    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        creep.say(global.sayGet);
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say(global.sayPut);
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(Game.rooms[creep.memory.roomName].controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.rooms[creep.memory.roomName].controller, {
                visualizePathStyle: {
                    stroke: global.colourUpgrade,
                    opacity: global.pathOpacity
                },
                reusePath:5
            });
            creep.say(global.sayMove);
        } else {
            creep.say(global.sayUpgrade);
        }
    } else {
        // Prioritise the room storage
        var target = creep.room.storage;
        // Is there any?
        if (target) {
            // If it's at least 1 3rd full
            if (target.store[RESOURCE_ENERGY] > target.storeCapacity/3) {
                // Withdraw or move to it
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // No lets move to the source we want
                    creep.moveTo(target, {
                        visualizePathStyle: {
                            stroke: global.colourPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:5
                    });
                    creep.say(global.sayMove);
                } else {
                    creep.say(global.sayWithdraw);
                    creep.memory.upgrading = true;
                }
                return;
            }
        }

        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 100
        });

        if(container) {
            // Can we harvest right now?
            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container, {
                    visualizePathStyle: {
                        stroke: global.colourPickup,
                        opacity: global.pathOpacity
                    },
                    reusePath:5
                });
                creep.say(global.sayMove);
            } else {
                creep.say(global.sayWithdraw);
                creep.memory.upgrading = true;
            }
            return;
        }

        // If we got here.. there's a problem
        creep.say(global.sayOhno);
    }
}
