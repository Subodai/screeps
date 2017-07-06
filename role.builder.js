/* Builder drone */
module.exports.role = 'builder';
/* sType */
module.exports.sType = 'normal';
/* Costs */
module.exports.cost = {
    1 : 300,
    2 : 550,
    3 : 800,
    4 : 800,
    5 : 800,
    6 : 800,
    7 : 800,
    8 : 800,
}
module.exports.body = {
    1 :  [
        WORK,WORK,
        CARRY,
        MOVE
    ],
    2 : [
        WORK,WORK,WORK,
        CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
    3 : [
        WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    4 : [
        WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    5 : [
        WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    6 : [
        WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    7 : [
        WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    8 : [
        WORK,WORK,WORK,WORK,
        CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
}
/* Spawn Roster */
module.exports.roster = {
    1: 3,
    2: 3,
    3: 2,
    4: 2,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
}

module.exports.enabled = function (room, debug = false) {
    var mySites = _.filter(Game.constructionSites, (site) => site.my);
    return (mySites.length > 0);
}
/**
 * Builder Role
 */
module.exports.run = function(creep) {
    if (creep.spawning) { return; }
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
        delete creep.memory.energyPickup;
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
                if (site.my) {
                    break;
                }
            }
            // console.log(JSON.stringify(site));
        }
        if (site) {
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
        } else {
            // creep.memory.role = 'janitor';
            // No targets.. head back to the room spawn
            var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_SPAWN
            });
            if (!spawn) {
                var spawns = Game.rooms[creep.memory.roomName].find(FIND_STRUCTURES, {
                    filter: (i) => i.structureType == STRUCTURE_SPAWN
                });
                var spawn = spawns[0];
            }
            if (spawn) {
                if (spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn, {
                        visualizePathStyle: {
                            stroke: global.colourRepair,
                            opacity: global.pathOpacity
                        },
                        reusePath:3
                    });
                    creep.say(global.sayWhat);
                }
            }
        }
    }
    else {
        if (creep.getNearbyEnergy() == ERR_FULL) {
            delete creep.memory.energyPickup;
            creep.memory.building = true;
            return;
        }
        // var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        //     filter: (i) => i.resourceType == RESOURCE_ENERGY && i.amount > creep.carryCapacity
        // });

        // if (resource) {
        //     if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
        //         if (creep.carry.energy <= (creep.carryCapacity/2)) {
        //             creep.moveTo(resource,{
        //                 visualizePathStyle: {
        //                     stroke: global.colourPickupRes,
        //                     opacity: global.pathOpacity
        //                 },
        //                 reusePath:3
        //             });
        //             creep.say('>>');
        //         } else {
        //             creep.memory.building = true;
        //         }
        //     } else {
        //         creep.say('^^');
        //     }
        //     return;
        // }

        // var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        //     filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 100
        // });

        // if(container) {
        //    // Can we harvest right now?
        //     if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //         creep.moveTo(container, {
        //             visualizePathStyle: {
        //                 stroke: global.colourPickup,
        //                 opacity: global.pathOpacity
        //             },
        //             reusePath:3
        //         });
        //         creep.say('>>');
        //     } else {
        //         creep.say('^^');
        //         creep.memory.building = true;
        //     }
        //     return;
        // }

        // var target = creep.room.storage;
        // if (target && target.store[RESOURCE_ENERGY] > 100) {
        //     if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //         // No lets move to the source we want
        //         creep.moveTo(target, {
        //             visualizePathStyle: {
        //                 stroke: global.colourPickup,
        //                 opacity: global.pathOpacity
        //             }
        //         });
        //         creep.say('>>');
        //     } else {
        //         creep.say('^^');
        //         creep.memory.building = true;
        //     }
        //     return;
        // }

        // var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
        //     filter: function (i) {
        //         if (i.energy > 0 || i.ticksToRegeneration < 10) {
        //             const space = global.getSpaceAtSource(i,creep);
        //             return space;
        //         } else {
        //             return false;
        //         }
        //     }
        // });
        // if (source) {
        //     // Can we harvest this?
        //     if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        //         creep.moveTo(source, {
        //             visualizePathStyle: {
        //                 stroke: global.colourPickup,
        //                 opacity: global.pathOpacity
        //             },
        //             reusePath:3
        //         });
        //         creep.say('>>');
        //     } else {
        //         creep.say('^^');
        //         if (creep.carry.energy == creep.carryCapacity) {
        //             creep.memory.building = true;
        //         }
        //     }
        // }
    }
}
