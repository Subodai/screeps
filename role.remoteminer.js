/* Specialist Remote Miner Drone */
module.exports.role = 'remoteminer';
/* SType */
module.exports.sType = 'specialist';
/* Costs */
module.exports.cost = {
    1 : 0,
    2 : 0,
    3 : 750,
    4 : 750,
    5 : 750,
    6 : 750,
    7 : 750,
    8 : 750,
}
/* Body Parts at each RCL */
module.exports.body = {
    1 : [],
    2 : [],
    3 : [ WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE ],
    4 : [ WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE ],
    5 : [ WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE ],
    6 : [ WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE ],
    7 : [ WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE ],
    8 : [ WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE ],
}

/* Spawn Roster */
module.exports.roster = {
    1: 0,
    2: 0,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 2,
    8: 2,
}
/**
 * Individual check for a room to check if this creep type should be enabled or not
 */
module.exports.enabled = function (room, debug = false) {
    // Get the flags for remote
    var flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['remote']);
    // If there are no flags, just return false
    if (flags.length == 0) { return false; }
    // If there are flags, lets loop
    for (var i in flags) {
        // Grab the flag
        var _flag = flags[i];
        // Grab the room
        var _room = Game.rooms[_flag.pos.roomName];
        // If we have a room, lets check the requirements for it
        if (_room) {
            // Are there are minersNeeded here?
            if (_room.memory.minersNeeded && _room.memory.minersNeeded > 0) {
                // Now count the creeps with this role, assigned to this remoteRoom
                var list = _.filter(Game.creeps, (creep) => creep.memory.role == this.role && creep.memory.remoteRoom == _flag.pos.roomName && !creep.memory.dying);
                // If we have less than is necessary, we should spawn a new one
                if (list.length < _room.memory.minersNeeded) {
                    // Return true
                    return true;
                }
            }
        } else {
            // We have no knowledge of this room, which means we probably need creeps for it
            return true;
        }
    }
    // No need for any remote Miners as yet
    return false;
}
// Set a time for this creep to 'expire' at
module.exports.expiry = 200;
/* Run method */
module.exports.run = function (creep, debug = false) {
    // First have we been assigned a flag?
    if (!creep.memory.flagName) {
        // Lets find a remote mining flag then
        var flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['remote']);
        // If we found any
        if (flags.length > 0) {
            // Loop through the flags
            for (var i in flags) {
                // Get the flag
                var flag = flags[i];
                // Try to get the flag's room
                var _room = Game.rooms[flag.pos.roomName];
                // If we got the flag's room,
                if (_room) {
                    // Does this room need miners
                    if (_room.memory.minersNeeded && _room.memory.minersNeeded > 0) {
                        // Now count the creeps in that room
                        var list = _.filter(Game.creeps, (creep) => creep.memory.role == this.role && creep.memory.remoteRoom == flag.pos.roomName && !creep.memory.dying);
                        // Does this room have enough miners?
                        if (list.length < _room.memory.minersNeeded) {
                            // This room needs a creep!
                            creep.memory.flagName = flag.name;
                            creep.memory.remoteRoom = flag.pos.roomName;
                        }
                    }
                } else {
                    // This room doesn't seem to have visibility, we should probably send a remoteMiner over there
                    creep.memory.flagName = flag.name;
                    creep.memory.remoteRoom = flag.pos.roomName;
                }
            }
        } else {
            // console.log('Something went wrong, ' + this.role + ' creep ' + creep.name + ' cannot find a valid flag');
            return;
        }
    }
    if (!creep.memory.flagName) {
        // console.log('Something went wrong, ' + this.role + ' creep ' + creep.name + ' unhappy!');
        // No point spending more CPU just stop here
        return;
    }
    // If we're still spawning, lets stop here
    if (creep.spawning) { return; }
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say(global.sayTired);
        return;
    }

    // Okay, health check
    var ticks = creep.ticksToLive;
    if (ticks <= 150 && !creep.memory.dying) {
        if (debug) { console.log('Creep[' + creep.name + '] Remote Miner Dying Making sure we spawn a new one'); }
        // set dying to true and set the sourceId to null in room memory
        creep.memory.dying = true;
        var sourceId = creep.memory.assignedSource;
        Game.rooms[creep.memory.remoteRoom].memory.assignedSources[sourceId] = null;
    }

    // Alright if it's dying, output the timer
    if (creep.memory.dying) {
        if (debug) { console.log('Creep[' + creep.name + '] Remote Miner Dying, ticking down'); }
        creep.say(ticks);
        // If it's less than 10 ticks, drop what we have
        if (ticks < 10) {
            if (debug) { console.log('Creep[' + creep.name + '] Remote Miner about to die'); }
            creep.say('!!' + ticks + '!!');
        }
    }

    // Alright, did we already make it to the room with the flag?
    if (!creep.memory.arrived) {
        // We didn't, alright lets go get the flag's position and head to it!
        var flag = Game.flags[creep.memory.flagName];
        // If our POS is not the flags
        if (creep.pos.roomName == flag.pos.roomName) {
            // We have arrived!
            creep.memory.arrived = true;
        } else {
            // We have not arrived yet, we need to go to the flag's room
            var result = creep.moveTo(flag, {
                visualizePathStyle : {
                    stroke: global.colourFlag,
                    opacity: global.pathOpacity
                },
                reusePath:1
            });
            return;
        }
    }
    // no need to run the rest of this code until the creep has arrived in the right room
    if (creep.memory.arrived) {
        // Only do this if we don't have an assigned Source
        if (!creep.memory.assignedSource) {
            this.setup();
            if (debug) { console.log('Creep[' + creep.name + '] Miner without assigned Source, assigning'); }
            // Okay lets get the room memory for assigned sources
            var sourceId = false;
            var sources = creep.room.find(FIND_SOURCES);
            var assigned = creep.room.memory.assignedSources;
            // Can't loop through sources to just to an i = loop to get them
            for (var i=0;i<=sources.length-1;i++) {
                var source = sources[i];
                if (assigned[source.id] == null) {
                    sourceId = source.id;
                    creep.room.memory.assignedSources[sourceId] = creep.id;
                    creep.memory.assignedSource = sourceId;
                    // Make sure we break out so we don't break the next source too
                    break;
                }
            }
            // Do we have a sourceId?
            if (sourceId == false) {
                if (debug) { console.log('Creep[' + creep.name + '] Miner cannot find source!!'); }
                // Game.notify(Game.time + ' Miner Creep unable to assign a source');
            }
        }

        // @TODO Self Setup, build and repair routine for if we have energy
        if(this.containerRoutine(creep)) {
            return;
        }

        // Are we full?
        if (creep.energy == creep.carryCapacity) {
            if (debug) { console.log('Creep[' + creep.name + '] Miner full, dropping!'); }
            creep.memory.dropping = true;
        } else {
            creep.memory.dropping = false;
        }



        // Are we dropping?
        if (creep.memory.dropping) {
            // This may need to change, depends if the drop costs fatigue or if dropping goes into a container
            creep.drop(RESOURCE_ENERGY);
            creep.memory.dropping = false;
            creep.say('V');

            // DANGER we just drop resources here... This could leave a pile of resources if our transfer dudes aren't keeping up

            // // This is just here incase it's needed fast (saves me writing it in a panic)
            // var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //     filter: (i) => {
            //         return (i.structureType == STRUCTURE_CONTAINER) && (_.sum(i.store) < i.storeCapacity)
            //     }
            // });
            // if (container) {
            //     try {
            //         for (var resource in creep.carry) {
            //             creep.transfer(container, resource);
            //         }
            //     } catch (ERR_NOT_IN_RANGE) {
            //         if (debug) { console.log('Creep[' + creep.name + '] Miner cannot transfer resources'); }
            //     }
            // } else {
            //     creep.say('No Drop');
            //     if (debug) { console.log('Creep[' + creep.name + '] Miner unable to transfer resources is full!'); }
            // }
        }

        if (!creep.memory.dropping) {
            // Alright if we're not dropping, we're harvesting lets try harvesting our assigned source
            var source = Game.getObjectById(creep.memory.assignedSource);
            if (source) {
                // Okay we have a source, lets trying harvesting it!
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    if (debug) { console.log('Creep[' + creep.name + '] Miner not in range, moving into range'); }
                    // We're not at the thing! Lets go there!
                    creep.moveTo(source, {
                        visualizePathStyle: {
                            stroke: global.colourMine,
                            opacity: global.pathOpacity
                        },
                        reusePath:5
                    });
                    // @TODO Drop a road piece if we don't have one
                    this.layRoad(creep);
                    // Moving make a say
                    creep.say(global.sayMove)
                } else {
                    // Mining say we're mining
                    if (!creep.memory.dying) {
                        creep.say(global.sayMine);
                    }
                }
            } else {
                if (debug) { console.log('Creep[' + creep.name + '] Miner cannot find source!!'); }
                creep.say('WTF?');
                // Game.notify(Game.time + ' Miner Creep unable to assign a source');
            }
        }
    }
}

module.exports.containerRoutine = function (creep) {
    // @TODO Self Setup, build and repair routine for if we have energy
    if (creep.carry.energy >= creep.carryCapacity) {
        var container = false;
        // We have energy, so we should be at our source, is there a container nearby?
        var objects = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos);
        if (objects.length > 0) {
            for (var i in objects) {
                if (objects[i].structureType == STRUCTURE_CONTAINER) {
                    var container = objects[i];
                    break;
                }
            }
        }
        // If there is a container does it have max hitpoints?
        if (container) {
            if (container.hits < container.hitsMax) {
                creep.repair(container);
                creep.say(global.sayRepair);
                return;
            }
        } else {
            // No container, is there a build site?
            var constructionSite = false;
            // Get sites
            var sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos);
            // If there are some
            if (sites.length > 0) {
                // Loop through
                for (var i in sites) {
                    // If this is a container constructionsite
                    if (sites[i].structureType == STRUCTURE_CONTAINER) {
                        // Set constructionSite to it
                        var constructionSite = sites[i];
                        break;
                    }
                }
            }
            // If we found a valid constructionsite
            if (constructionSite) {
                // Build it
                creep.build(constructionSite);
                creep.say(global.sayBuild);
                return true;
            } else {
                // No constructionsite we should make one!
                creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                return;
            }
        }
    }
}

/**
 * Road Layer remote Miner sub function
 */
module.exports.layRoad = function (creep) {
    var road = false;
    var objects = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos);
    if (objects.length > 0) {
        for (var i in objects) {
            if (objects[i].structureType == STRUCTURE_ROAD) {
                var road = objects[i];
                break;
            }
        }
    }
    // No road?
    if (!road) {
        // Check for construction site
        var site = false;
        // Get sites
        var sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos);
        // If there are some
        if (sites.length > 0) {
            // Loop through
            for (var i in sites) {
                // If this is a road site
                if (sites[i].structureType == STRUCTURE_ROAD) {
                    // Set site to it
                    var site = sites[i];
                    break;
                }
            }
        }
        // If no site, make a road site
        if (!site) {
            creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
        }
    }
    return;
}

/**
 * Run this script to setup rooms ready for assigned miners
 */
module.exports.setup = function (debug = false) {
    // Loop through the game rooms we have
    for (var name in Game.rooms) {
        if (debug) { console.log('Setting up room ' + name); }
        var theRoom = Game.rooms[name];
        // Clear Assigned Sources
        delete theRoom.memory.assignedSources;
        // Get all the sources available
        var sources = theRoom.find(FIND_SOURCES);
        // Make sure we set the minersNeeded of the room
        theRoom.memory.minersNeeded = sources.length;
        // Make an array / object thing
        var array = {};
        // Loop through sources
        for (var i=0; i<=sources.length-1; i++) {
            if (debug) { console.log(sources[i].id); }
            // Set it to null
            array[sources[i].id] = null;
        }
        // Loop through the sources again
        for (var i=0; i<=sources.length-1; i++) {
            // Get the source so we can use it's id
            var source = sources[i];
            // Make found false by default
            var found = false;
            var creepId = null;
            var sourceId = source.id;
            // Loop through the miners
            for (var creepName in Game.creeps) {
                // Define the creep
                var creep = Game.creeps[creepName];
                if (!creep.memory.role == 'miner' || creep.memory.dying) {
                    continue;
                }
                // If this creep has the assigned Source, we found it
                if (creep.memory.assignedSource == sourceId) {
                    found = true;
                    creepId = creep.id;
                    break;
                }
            }
            // we found it
            if (found) {
                if (debug) { console.log(sourceId + ' set to ' + creepId); }
                array[sourceId] = creepId;
            }
        }

        // Set the room's assigned Sources to be the object
        theRoom.memory.assignedSources = array;
    }
    return '++Miner Setup Complete++';
}
