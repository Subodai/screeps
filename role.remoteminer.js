/* Specialist Remote Miner Drone */
module.exports.role = 'remoteminer';
/* SType */
module.exports.sType = 'specialist';
/* Costs */
module.exports.cost = {
    1 : 0,
    2 : 550,
    3 : 550,
    4 : 550,
    5 : 550,
    6 : 550,
    7 : 550,
    8 : 550,
}
/* Body Parts at each RCL */
module.exports.body = {
    1 : [],
    2 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    3 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    4 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    5 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    6 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    7 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    8 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
}

/* Spawn Roster */
module.exports.roster = {
    1: 0,
    2: 2,
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
    // Get the flags
    var flags = _.filter(Game.flags, function(flag) {
        return flag.color == global.flagColor['remote'];
    });
    if (flags.length == 0) { return false; }
    for (var i in flags) {
        var flag = flags[i];
        var _room = Game.rooms[flag.room.name];
        if (_room.memory.minersNeeded && _room.memory.minersNeeded > 0) {
            // Now count the creeps
            var list = _.filter(Game.creeps, (creep) => creep.memory.role == this.role && creep.memory.roomName == flag.room.name && !creep.memory.dying);
            if (list.length < _room.memory.minersNeeded) {
                return true;
            }
        }
    }
    return false;
}
// Set a time for this creep to 'expire' at
module.exports.expiry = 200;
/* Run method */
module.exports.run = function (creep, debug = false) {
    // First have we been assigned a flag?
    if (!creep.memory.flagName) {
        // Lets find a flag without a creep assigned
        var flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['remote']);
        // If we found any
        if (flags.length > 0) {
            for (var i in flags) {
                var flag = flags[i];
                var _room = Game.rooms[flag.pos.roomName];
                // Does this room need miners
                if (_room.memory.minersNeeded && _room.memory.minersNeeded > 0) {
                    // Now count the creeps in that room
                    var list = _.filter(Game.creeps, (creep) => creep.memory.role == this.role && creep.memory.roomName == flag.pos.roomName && !creep.memory.dying);
                    if (list.length < _room.memory.minersNeeded) {
                        // This room needs a creep!
                        creep.memory.flagName = flag.name;
                        creep.memory.roomName = flag.pos.roomName;
                    }
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
    if (creep.spawning) { return; }
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say('Zzz');
        return;
    }

    // Okay, health check
    var ticks = creep.ticksToLive;
    if (ticks <= 150 && !creep.memory.dying) {
        if (debug) { console.log('Creep[' + creep.name + '] Miner Dying Making sure we spawn a new one'); }
        // set dying to true and set the sourceId to null in room memory
        creep.memory.dying = true;
        var sourceId = creep.memory.assignedSource;
        creep.room.memory.assignedSources[sourceId] = null;
    }

    // Alright if it's dying, output the timer
    if (creep.memory.dying) {
        if (debug) { console.log('Creep[' + creep.name + '] Miner Dying, ticking down'); }
        creep.say(ticks);
        // If it's less than 10 ticks, drop what we have
        if (ticks < 10) {
            if (debug) { console.log('Creep[' + creep.name + '] Miner about to die'); }
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
                Game.notify(Game.time + ' Miner Creep unable to assign a source');
            }
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
            console.log(creep.drop(RESOURCE_ENERGY));
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
                    // Moving make a say
                    creep.say('>>')
                } else {
                    // Mining say we're mining
                    if (!creep.memory.dying) {
                        creep.say('d(^-^)b');
                    }
                }
            } else {
                if (debug) { console.log('Creep[' + creep.name + '] Miner cannot find source!!'); }
                creep.say('WTF?');
                Game.notify(Game.time + ' Miner Creep unable to assign a source');
            }
        }
    }
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
