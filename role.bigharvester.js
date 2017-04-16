/**
 * Big Harvester Role
 */
module.exports.run = function(creep) {
    // If it's fatigued we should just return there's no need to carry on
    if (creep.fatigue > 0) {
        creep.say('Zzz');
        return;
    }

    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.memory.dying = true;
    }

    // If it's dying force it into delivery mode
    if (creep.memory.dying) {
        creep.say(ticks);
        if (_.sum(creep.carry) > (creep.carryCapacity/2) || ticks < 50) {
            creep.memory.delivering = true;
        } else {
            creep.memory.delivering = false;
        }
    }

    // Is the creep dropping off and empty?
    if (creep.memory.delivering && _.sum(creep.carry) == 0) {
        creep.memory.delivering = false;
        creep.say('GET');
    }

    // Is the creep not delivering and full?
    if (!creep.memory.delivering && _.sum(creep.carry) == creep.carryCapacity) {
        creep.memory.delivering = true;
        creep.say('PUT');
    }

    // If we're not delivering, check if we can harvest, if not and we have half energy, go and deliver
    if (!creep.memory.delivering) {
        if (creep.room.memory.emergency) {
            // console.log('Emergency Mode, Empty Storage');
            creep.memory.idle = 0;
            // We are in emergency mode, lets fetch all resources from the main storage
            var box = creep.room.storage;
            // Can we harvest right now?
            if (creep.withdraw(box, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // No do we have half our energy?
                if (_.sum(creep.carry) <= (creep.carryCapacity/2)) {
                    // No lets move to the source we want
                    creep.moveTo(box, {
                        visualizePathStyle: {
                            stroke: global.colourPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:0
                    });
                } else {
                    creep.memory.delivering = true;
                    creep.say('RECOVER');
                }
            } else {
                creep.say('^');
            }
            return;
        }

        var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.amount >= creep.carryCapacity
        });
        if (resource) {
            creep.memory.idle = 0;
            if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                if (_.sum(creep.carry) <= (creep.carryCapacity/2)) {
                    creep.moveTo(resource,{
                        visualizePathStyle: {
                            stroke: global.colourResPickup,
                            opacity: global.pathOpacity
                        },
                        reusePath:3
                    });
                    creep.say('>>');
                } else {
                    creep.memory.delivering = true;
                }
            } else {
                creep.say('^');
            }
            return;
        }

        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= 100
        });

        var pickup = RESOURCE_ENERGY;

        if(!container) {
            var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_CATALYST] >= 100
            });
            var pickup = RESOURCE_CATALYST;
        }

        if(!container) {
            creep.say('???');
            creep.moveTo(Game.spawns['Sub1'],{
                    visualizePathStyle: {
                        stroke: global.colourIdle,
                        opacity: global.pathOpacity
                    },
                    reusePath:5
                });
            creep.memory.idle++;
            creep.say('idle: ' + creep.memory.idle);

            if (creep.memory.idle >= 50) {
                console.log('Creep idle too long, switching to upgrader');
                Game.notify(Game.time + ' Harvester Idle too long, switching to upgrader');
                delete creep.memory.idle;
                delete creep.memory.delivering;
                creep.memory.role = 'bigupgrader';
            }
            return;
        }
        // Can we harvest right now?
        if (creep.withdraw(container, pickup) == ERR_NOT_IN_RANGE) {
            creep.memory.idle = 0;
            // No do we have half our energy?
            if (_.sum(creep.carry) <= (creep.carryCapacity/2)) {
                // No lets move to the source we want
                creep.moveTo(container, {
                    visualizePathStyle: {
                        stroke: global.colourPickup,
                        opacity: global.pathOpacity
                    }
                });
            } else {
                creep.memory.delivering = true;
                creep.say('PUT');
            }
        } else {
            creep.say('^^');
        }
    }

    // Alright at this point if we're delivering it's time to move the Creep to a drop off
    if (creep.memory.delivering) {
        if (creep.carry.energy > 0) {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN
                    ) && structure.energy < structure.energyCapacity;
                }
            });
        }

        if (target) {
            creep.memory.idle = 0;
            for(var resourceType in creep.carry) {
                if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {
                        visualizePathStyle: {
                            stroke: global.colourDropoff,
                            opacity: global.pathOpacity
                        }
                    });
                } else {
                    creep.say('\/');
                }
            }
            // if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //     creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
            // } else {
            //     creep.say('\/');
            // }
        } else {
            if (creep.carry.energy > 0) {
                // var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                //     filter : (i) => {
                //         return i.structureType = STRUCTURE_STORAGE && (_.sum(i.store) < i.storeCapacity)
                //     }
                // });
                
                // First find towers with less than 400 energy
                var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter : (i) => { 
                        return i.structureType == STRUCTURE_TOWER && i.energy < 400
                    }
                });

                // If we didn't find any get them with less than 800
                if (!tower) {
                    var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter : (i) => { 
                            return i.structureType == STRUCTURE_TOWER && i.energy < 800
                        }
                    });
                }

                // Okay all above 800, get any now
                if (!tower) {
                    var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter : (i) => { 
                            return i.structureType == STRUCTURE_TOWER && i.energy < i.energyCapacity
                        }
                    });
                }

                // So did we find one?
                if (tower) {
                    if(creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tower, {
                            visualizePathStyle: {
                                stroke: global.colourTower,
                                opacity: global.pathOpacity
                            }
                        });
                    } else {
                        creep.say('\/');
                    }
                    return;
                }
            }

            var target = creep.room.terminal;
            if (!target) {
                var target = creep.room.storage;
            }
            if (target) {
                creep.memory.idle = 0;
                for(var resourceType in creep.carry) {
                    if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {
                            visualizePathStyle: {
                                stroke: global.colourDropoff,
                                opacity: global.pathOpacity
                            }
                        });
                    } else {
                        creep.say('\/');
                    }
                }
                // if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //     creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
                // } else {
                //     creep.say('\/');
                // }
            } else {
                creep.memory.idle++;
                creep.say('idle: ' + creep.memory.idle);

                if (creep.memory.idle >= 100) {
                    console.log('Creep idle too long, switching to refiller');
                    Game.notify(Game.time + ' Harvester Idle too long, switching to refiller');
                    delete creep.memory.idle;
                    delete creep.memory.delivering;
                    creep.memory.role = 'smallrefiller';
                }
            }
        }
    }
}

module.exports.parts = [WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
