/* Builder drone */
module.exports.roleName = 'builder';
/* sType */
module.exports.sType = 'normal';
/* Room requirement */
module.exports.counter = FIND_CONSTRUCTION_SITES;
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
    S : 3,
    M : 0,
    L : 0,
    XL: 3
};
module.exports.limit = 'global';
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
        creep.say('!!');
        creep.memory.dying = true;
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
        // Try to get sites in current room
        var site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        // If that fails try all rooms
        if(site == null) {
            for (var _site in Game.constructionSites) {
                var site = Game.getObjectById(_site);
                break;
            }
            // console.log(JSON.stringify(site));
        }

        if(creep.build(site) == ERR_NOT_IN_RANGE) {
            creep.moveTo(site, {
                visualizePathStyle: {
                    stroke: global.colourBuild,
                    opacity: global.pathOpacity
                }
            });
            creep.say('>>');
        } else {
            creep.say('MAKE');
        }
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
                creep.say('>>');
            } else {
                creep.say('^^');
                creep.memory.building = true;
            }
            return;
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
            return;
        }

        var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        if (source) {
            // Can we harvest this?
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: {
                        stroke: global.colourPickup,
                        opacity: global.pathOpacity
                    },
                    reusePath:3
                });
                creep.say('>>');
            } else {
                creep.say('^^');
                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.building = true;
                }
            }
        }
    }
}
