/**
 * Small Builder Role
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
        creep.memory.role = 'smallharvester';
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
            creep.moveTo(site, {visualizePathStyle: {stroke: '#ffff00'}});
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

        var target = creep.room.storage;
        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // No lets move to the source we want
                creep.moveTo(target, {
                    visualizePathStyle: {
                        stroke: '#00FFFF',
                        opacity: .4
                    }
                });
                creep.say('>>');
            } else {
                creep.say('^^');
                creep.memory.building = true;
            }
        }

        // var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

        // if (resource) {
        //     if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
        //         if (creep.carry.energy <= (creep.carryCapacity/2)) {
        //             creep.moveTo(resource,{
        //                 visualizePathStyle: {
        //                     stroke: '#ff0000',
        //                     opacity: .9
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
        //     filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100
        // });

        // if(!container) {
        //     creep.say('???');
        // }
        // // Can we harvest right now?
        // if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //     creep.moveTo(container, {
        //         visualizePathStyle: {
        //             stroke: '#fffff',
        //             opacity: .5
        //         },
        //         reusePath:0
        //     });
        // } else {
        //     creep.say('^^');
        // }
    }
}

module.exports.parts = [WORK,WORK,MOVE,CARRY];
