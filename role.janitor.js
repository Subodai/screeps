/* Janitor drone */
module.exports.role = 'janitor';
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
    1: 1,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 3,
    7: 3,
    8: 3,
}

module.exports.enabled = function (room, debug = false) {
    var items = 0;
    // Define the room we're in
    var _room = Game.rooms[room];
    // Search for all targets that are walls or ramparts below their global max, or anything else with less hits than max
    const targets = _room.find(FIND_STRUCTURES, {
        filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits <= global.rampartMax) ||
                       (i.structureType == STRUCTURE_WALL && i.hits <= global.wallMax) ||
                       ((i.structureType != STRUCTURE_WALL && i.structureType != STRUCTURE_RAMPART) && i.hits < i.hitsMax)
    });
    // Do we have any?
    if (targets.length > 0) {
        return true;
    }
    return false;
}

module.exports.visuals = function (items, room, debug = false) {
    var _room = Game.rooms[room];
    // _room.visual.clear();
    for (var i in items) {
        var item = items[i];
        if(item.structureType == STRUCTURE_RAMPART) {
            var percent = (item.hits/global.rampartMax)*100;
        } else if (item.structureType == STRUCTURE_WALL) {
            var percent = (item.hits/global.wallMax)*100;
        } else {
            var percent = (item.hits/item.hitsMax)*100;
        }

        var r = Math.round(255 - ((255/100)*(percent/100)*100));
        var g = Math.round((255/100)*(percent/100)*100);
        var b = 0;
        var _color = '#' + this.tohex(r) + this.tohex(g) + this.tohex(b);
        _room.visual.circle(item.pos, {
            fill: _color,
            radius:0.35,
            opacity:0.05,
            stroke:_color
        }).text(percent + '%', item.pos, {
            color:_color,
            font:0.5,
            align:'left',
            stroke:'rgba(0,0,0,0.5)',
            opacity:0.6,
        });;
    }
}

module.exports.tohex = function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}
/**
 * Janitor Role
 */
module.exports.run = function(creep) {
    if (creep.spawning) { return; }
    if (creep.fatigue > 0) {
        creep.say(global.sayTired);
        return;
    }

    // If we have only a few ticks to live we should set to dying
    var ticks = creep.ticksToLive;
    if (ticks < 100) {
        creep.say(global.sayWhat);
        creep.memory.dying = true;
    }

    if(creep.memory.sapping && creep.carry.energy == 0) {
        creep.memory.sapping = false;
        creep.say(global.sayGet);
    }
    if(!creep.memory.sapping && creep.carry.energy == creep.carryCapacity) {
        creep.memory.sapping = true;
        creep.say(global.sayPUT);
    }
    // Are we sapping?
    if(creep.memory.sapping) {
        // Yep, okay.. first things first, any ramparts or walls on 1 energy?
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (i) => (i.structureType == STRUCTURE_RAMPART || i.structureType == STRUCTURE_WALL) && i.hits == 1
        });

        // Next lets start pumping energy into the walls and ramparts to juicy em up in stages
        if (targets.length == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART || i.structureType == STRUCTURE_WALL) && i.hits <= 600
            });
        }

        // Next lets worry about other non-road stuctures below max

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (i) => (i.structureType != STRUCTURE_RAMPART && i.structureType != STRUCTURE_WALL && i.structureType != STRUCTURE_ROAD) && i.hits < i.hitsMax
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 5, {
                filter: (i) => (i.structureType != STRUCTURE_RAMPART && i.structureType != STRUCTURE_WALL && i.structureType != STRUCTURE_ROAD) && i.hits < i.hitsMax
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: (i) => (i.structureType != STRUCTURE_RAMPART && i.structureType != STRUCTURE_WALL && i.structureType != STRUCTURE_ROAD) && i.hits < i.hitsMax
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 20, {
                filter: (i) => (i.structureType != STRUCTURE_RAMPART && i.structureType != STRUCTURE_WALL && i.structureType != STRUCTURE_ROAD) && i.hits < i.hitsMax
            });
        }

        // Next lets worry about other non-road stuctures below max
        if (targets.length == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType != STRUCTURE_RAMPART && i.structureType != STRUCTURE_WALL && i.structureType != STRUCTURE_ROAD) && i.hits < i.hitsMax
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits < i.hitsMax
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 5, {
                filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits < i.hitsMax
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits < i.hitsMax
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 20, {
                filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits < i.hitsMax
            });
        }

        // Next lets do roads
        if (targets.length == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits < i.hitsMax
            });
        }

        // Next walls and ramparts below 1/4 of their max
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.25)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.25))
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 5, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.25)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.25))
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.25)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.25))
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 20, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.25)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.25))
            });
        }
        if (targets.length == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.25)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.25))
            });
        }

        // Next walls and ramparts below 1/2 their max
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.5)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.5))
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 5, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.5)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.5))
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.5)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.5))
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 20, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.5)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.5))
            });
        }
        if (targets.length == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.5)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.5))
            });
        }

        // Next walls and ramparts below 3/4 their max
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.75)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.75))
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 5, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.75)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.75))
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.75)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.75))
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 20, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.75)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.75))
            });
        }
        if (targets.length == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < (global.rampartMax*0.75)) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < (global.wallMax*0.75))
            });
        }

        // Next walls and ramparts below their max
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < global.rampartMax) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < global.wallMax)
            });
        }

        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 5, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < global.rampartMax) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < global.wallMax)
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < global.rampartMax) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < global.wallMax)
            });
        }
        if (targets.length == 0) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 20, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < global.rampartMax) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < global.wallMax)
            });
        }
        if (targets.length == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART && i.hits < global.rampartMax) ||
                               (i.structureType == STRUCTURE_WALL && i.hits < global.wallMax)
            });
        }
        // Do we have any targets?
        if (targets.length > 0) {
            this.visuals(targets, creep.room.name);
            // Sort by hits (may need to check this)
            targets.sort((a,b) => ((a.hits/a.hitsMax)*100) - ((b.hits/b.hitsMax)*100) );
            // Get the first target on the list
            var target = targets[0];
            // Attempt to repair it
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {
                        stroke: global.colorRepair,
                        opacity: global.pathOpacity
                    },
                    reusePath:3
                });
                creep.say(global.sayMove);
            } else {
                creep.say(global.sayRepair);
            }
            return;
        } else {
            // No targets.. head back to the room spawn
            var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_SPAWN
            });
            if (spawn) {
                if (spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn, {
                        sualizePathStyle: {
                            stroke: global.colorRepair,
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
                    creep.say(global.sayMove);
                } else {
                    creep.memory.sapping = true;
                }
            } else {
                creep.say(global.sayWithdraw);
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
                creep.say(global.sayMove);
            } else {
                creep.say(global.sayWithdraw);
                creep.memory.sapping = true;
            }
            return;
        }

        // Don't use room storage or harvest resources yet


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
        //         creep.say(global.sayMove);
        //     } else {
        //         creep.say(global.sayWithdraw);
        //         creep.memory.sapping = true;
        //     }
        //     return;
        // }

        // var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
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
        //         creep.say(global.sayMove);
        //     } else {
        //         creep.say(global.sayWithdraw);
        //         if (creep.carry.energy == creep.carryCapacity) {
        //             creep.memory.sapping = true;
        //         }
        //     }
        // }
    }
}
