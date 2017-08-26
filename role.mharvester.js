/* Mineral Harvester drone */
module.exports.role = 'mharvester';
/* sType */
module.exports.sType = 'normal';
/* Spawn Roster */
module.exports.roster = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 1,
    7: 1,
    8: 1,
};
/* Costs */
module.exports.cost = {
    1 : 300,
    2 : 400,
    3 : 500,
    4 : 1300,
    5 : 1800,
    6 : 1800,
    7 : 1800,
    8 : 1800,
};

/* Body parts */
module.exports.body = {
    1 : [
        WORK,
        CARRY,CARRY,
        MOVE,MOVE
    ],
    2 : [
        WORK,
        CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE
    ],
    3 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    4 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ],
    5 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    6 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    7 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    8 : [
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
};

module.exports.enabled = function (room, debug = false) {
    // define the room
    var theRoom = Game.rooms[room];
    // Find the mineral site in the room
    var mineral = theRoom.find(FIND_MINERALS);
    // does it have minerals?
    if (theRoom.controller && theRoom.controller.level >= 6 && mineral[0].mineralAmount > 0) { return true; }
    // This should be disabled
    return false;
}
/**
 * Harvester Role
 */
module.exports.run = function(creep) {
    if (creep.isTired()) { return; }
    if (!creep.memory.dying && creep.ticksToLive < 100) { creep.memory.dying = true; }
    // If it's dying force it into delivery mode
    if (creep.memory.dying) {
        creep.say(creep.ticksToLive);
        if (_.sum(creep.carry) > (creep.carryCapacity/2) || creep.ticksToLive < 50) {
            creep.memory.delivering = true;
        } else {
            creep.memory.delivering = false;
        }
    }

    if (creep.room.name != creep.memory.roomName) {
        delete creep.memory.energyPickup;
        let pos = new RoomPosition(25,25,creep.memory.roomName);
        creep.travelTo(pos);
        creep.say('SEEK');
        return;
    }

    // Is the creep dropping off and empty?
    if (creep.memory.delivering && _.sum(creep.carry) === 0) {
        creep.memory.delivering = false;
        creep.say('GET');
    }

    // Is the creep not delivering and full?
    if (!creep.memory.delivering && _.sum(creep.carry) === creep.carryCapacity) {
        creep.memory.delivering = true;
        creep.say('PUT');
    }

    // If we're not delivering, check if we can harvest, if not and we have half energy, go and deliver
    if (!creep.memory.delivering) {
        // Any minerals to pickup?
        let mineralResult = creep.getNearbyMinerals();
        if (mineralResult === ERR_NOT_FOUND) {
            // Go and empty storage instead
            creep.getNearbyMinerals(true);
        } else if (mineralResult === ERR_FULL) {
            delete creep.memory.mineralPickup;
            creep.memory.delivering = true;
        }
    }

    // Alright at this point if we're delivering it's time to move the Creep to a drop off
    if (creep.memory.delivering) {
        delete creep.memory.mineralPickup;
        // mineral harvester should always use the terminal
        var target = creep.room.terminal;
        // Did we find a target?
        if (target) {
            // Are we in range of the target
            if (!creep.pos.inRangeTo(target,1)) {
                creep.travelTo(target);
                // Say because move
                creep.say('>>');
            }

            if (creep.pos.inRangeTo(target,2)) {
                // Loop through our resources
                for(var resourceType in creep.carry) {
                    // Attempt to transfer them
                    if (creep.carry[resourceType] > 0) {
                        if (creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                            // something went wrong
                            break;
                        } else {
                            creep.say('V');
                        }
                    }
                }
                return;
            }
        } else {
            creep.memory.idle++;
            creep.say('idle: ' + creep.memory.idle);

            if (creep.memory.idle >= 10) {
                // Are we in our home room?
                //if (creep.room.name != creep.memory.roomName) {
                    // lets go home
                    var spawns = Game.rooms[creep.memory.roomName].find(FIND_STRUCTURES, {
                        filter: (i) => i.structureType == STRUCTURE_SPAWN
                    });
                    var spawn = spawns[0];
                    if (spawn) {
                        creep.travelTo(spawn);
                        creep.say(global.sayMove);
                    }
                //}
            }
        }
    }
}
