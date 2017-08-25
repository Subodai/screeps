// Remote Miner
module.exports.role = 'remoteminer';

// Core Type
module.exports.sType = 'specialist';

// Creep Count per RCL
module.exports.roster = {
    1: 0,
    2: 0,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 2,
    8: 2,
};

// Human readable costs (not used)
module.exports.cost = {
    1 : 0,
    2 : 0,
    3 : 750,
    4 : 900,
    5 : 1050,
    6 : 1050,
    7 : 1050,
    8 : 1050,
};

// Body layout at different RCL's
module.exports.body = {
    1 : [],
    2 : [],
    3 : [
        WORK,WORK,WORK,WORK,WORK,
        CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
    4 : [
        WORK,WORK,WORK,WORK,WORK,WORK,
        CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    5 : [
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    6 : [
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    7 : [
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    8 : [
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
}

// Is Enabled Check
module.exports.enabled = function (room, debug = false) {
    // Turn off if room is discharging with supergraders
    if (Game.rooms[room].memory.charging == false) { return false; }
    // Get the flags for remote
    var flags = _.filter(Game.flags, (flag) => flag.color === global.flagColor['remote']);
    // If there are no flags, just return false
    if (flags.length === 0) { return false; }
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
                var list = _.filter(Game.creeps, (creep) => creep.memory.role === this.role && creep.memory.remoteRoom === _flag.pos.roomName && !creep.memory.dying);
                // If we have less than is necessary, we should spawn a new one
                if (list.length < _room.memory.minersNeeded) {
                    // Return true
                    return true;
                }
            }
        } else {
            var list = _.filter(Game.creeps, (creep) => creep.memory.role === this.role && creep.memory.remoteRoom === _flag.pos.roomName && !creep.memory.dying);
            // If we have less than is necessary, we should spawn a new one
            if (list.length < 2) {
                // Return true
                return true;
            }
        }
    }
    // No need for any remote Miners as yet
    return false;
}

// Set a time for this creep to 'expire' at
module.exports.expiry = 200;

// Main run code for this creep type
module.exports.run = function (creep, debug = false) {
    // First have we been assigned a flag?
    if (!creep.memory.flagName) {
        // Lets find a remote mining flag then
        var flags = _.filter(Game.flags, (flag) => flag.color === global.flagColor['remote']);
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
                        var list = _.filter(Game.creeps, (creep) => creep.memory.role === this.role && creep.memory.remoteRoom === flag.pos.roomName && !creep.memory.dying);
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
    if (creep.spawning || creep.fatigue > 0) {
        new RoomVisual(creep.pos.roomName).circle(creep.pos, {
            radius: .45, fill: "transparent", stroke: 'aqua', strokeWidth: .15, opacity: .3
        });
        return;
    }

    if (!creep.canDo(WORK)) {
        if (debug) { console.log('[' +creep.name+'] Creep damaged seeking repair:' + JSON.stringify(creep.pos)); }
        return;
    }

    // Okay, health check
    var ticks = creep.ticksToLive;
    if (!creep.memory.dying && ticks <= 200) {
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
        if (flag) {
            // If our POS is not the flags
            if (creep.pos.roomName === flag.pos.roomName) {
                // We have arrived!
                creep.memory.arrived = true;
            } else {
                // We have not arrived yet, we need to go to the flag's room
                creep.travelTo(flag);
                return;
            }
        } else {
            creep.suicide();
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
            var _room = Game.rooms[creep.memory.remoteRoom];
            // If we don't have the room, we're not there yet.. remove the arrived flag and return
            if (!_room) {
                delete creep.memory.arrived;
                return;
            }
            var sources = _room.find(FIND_SOURCES);
            var assigned = _room.memory.assignedSources;
            // Can't loop through sources to just to an i = loop to get them
            for (var i=0;i<=sources.length-1;i++) {
                var source = sources[i];
                if (assigned[source.id] == null) {
                    sourceId = source.id;
                    _room.memory.assignedSources[sourceId] = creep.id;
                    creep.memory.assignedSource = sourceId;
                    // Make sure we break out so we don't break the next source too
                    break;
                }
            }
            // Do we have a sourceId?
            if (sourceId === false) {
                if (debug) { console.log('Creep[' + creep.name + '] Miner cannot find source!!'); }
                // Game.notify(Game.time + ' Miner Creep unable to assign a source');
            }
        }

        // @TODO Self Setup, build and repair routine for if we have energy
        if(creep.containerCheck()) {
            return;
        }

        // Are we full?
        if (creep.energy === creep.carryCapacity) {
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
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    if (debug) { console.log('Creep[' + creep.name + '] Miner not in range, moving into range'); }
                    // We're not at the thing! Lets go there!
                    creep.travelTo(source);
                    creep.roadCheck(true);
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
                creep.suicide();
                // Game.notify(Game.time + ' Miner Creep unable to assign a source');
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
                if (!creep.memory.role === 'miner' || creep.memory.dying) { // Possible bug?
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
