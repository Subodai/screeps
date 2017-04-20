/* Builder drone */
module.exports.roleName = 'builder';
/* sType */
module.exports.sType = 'normal';
/* Body Costs */
module.exports.costS  = 200;
module.exports.costM  = 300;
module.exports.costL  = 450;
module.exports.costXL = 650;
/* Body setups */
module.exports.bodyS  = [
    WORK,
    CARRY,
    MOVE
];
module.exports.bodyM  = [
    WORK,WORK,MOVE,CARRY
];
module.exports.bodyL = [
    WORK,WORK,WORK,CARRY,MOVE,MOVE
];
module.exports.bodyXL = [
    WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE
];
/* Desired Roster */
module.exports.roster = {
    S : 4,
    M : 0,
    L : 0,
    XL: 0
};
/**
 * Builder Role
 */
module.exports.run = function(creep) {
    if (creep.fatigue > 0) {
        creep.say('Zzz');
        return;
    }

    // If we have only a few ticks to live, swap it to harvest mode so it seeks home
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        console.log('Creep soon to die, switching to harvester role');
        creep.say('!!');
        creep.memory.role = 'harvester';
    }

    if(creep.memory.building && creep.carry.energy == 0) {
        creep.memory.building = false;
        creep.say('GET');
    }
    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
        creep.memory.building = true;
        creep.say('CREATE');
    }

    if(creep.memory.building) {
        var site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if(!site) {
            creep.say('?');
        }
        if(creep.build(site) == ERR_NOT_IN_RANGE) {
            creep.moveTo(site, {
                visualizePathStyle: {
                    stroke: global.colourBuild,
                    opacity: global.pathOpacity
                }
            });
        } else {
            creep.say('MAKE');
        }
        // var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        // if(targets.length) {
        //     if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
        //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
        //     }
        // } else {
        //     creep.say('🔨');
        // }
    }
    else {

        var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: (i) => i.resourceType == RESOURCE_ENERGY
        });

        if (resource) {
            if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                if (creep.carry.energy <= (creep.carryCapacity/2)) {
                    creep.moveTo(resource,{
                        visualizePathStyle: {
                            stroke: global.colourPickupRes,
                            opacity: global.pathOpacity
                        },
                        reusePath:3
                    });
                    creep.say('>>');
                } else {
                    creep.memory.building = true;
                }
            } else {
                creep.say('^^');
            }
            return;
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
                    reusePath:3
                });
            } else {
                creep.say('^^');
                creep.memory.building = true;
            }
        }

        var target = creep.room.storage;
        if (target && target.store[RESOURCE_ENERGY] > 100) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // No lets move to the source we want
                creep.moveTo(target, {
                    visualizePathStyle: {
                        stroke: global.colourPickup,
                        opacity: global.pathOpacity
                    }
                });
                creep.say('>>');
            } else {
                creep.say('^^');
                creep.memory.building = true;
            }
        }
    }
}
