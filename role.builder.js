// Builder Drone
module.exports.role = 'builder';

// The core type
module.exports.sType = 'normal';

// The roster of required creeps
module.exports.roster = {
    1: 2,
    2: 2,
    3: 2,
    4: 2,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
};

// Human readable costs (remove soon)
module.exports.cost = {
    1 : 300,
    2 : 550,
    3 : 800,
    4 : 800,
    5 : 800,
    6 : 800,
    7 : 800,
    8 : 800,
};

// Body part array for each RCL
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
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
    8 : [
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
    ],
};

// Is this role enabled?
module.exports.enabled = function (room, debug = false) {
    var mySites = _.filter(Game.constructionSites, (site) => site.my);
    return (mySites.length > 0);
}

// Run the builder role
module.exports.run = function(creep, debug = false) {
    if (creep.isTired()) { return; }
    // If we have only a few ticks to live, swap it to harvest mode so it seeks home
    if (!creep.memory.dying && creep.ticksToLive < 100) { creep.memory.dying = true; }
    // Functional check!
    if (!creep.canDo(WORK)) {
        if (debug) { console.log('[' +creep.name+'] Creep damaged seeking repair:' + JSON.stringify(creep.pos)); }
        return;
    }

    if(creep.memory.building && creep.carry.energy === 0) {
        creep.memory.building = false;
        creep.say('GET');
    }
    if(!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
        delete creep.memory.energyPickup;
        creep.memory.building = true;
        creep.say('CREATE');
    }


    if (!creep.memory.building) {
        if (creep.getNearbyEnergy(true) === ERR_FULL) {
            delete creep.memory.energyPickup;
            creep.memory.building = true;
            return;
        }
    }

    if(creep.memory.building) {
        delete creep.memory.energyPickup;
        // Try to get sites in current room
        var site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        // If that fails try all rooms
        if(site == null) {
            for (var _site in Game.constructionSites) {
                site = Game.getObjectById(_site);
                if (site.my) { break; }
            }
        }
        if (site) {
            if(creep.build(site) === ERR_NOT_IN_RANGE) {
                creep.travelTo(site);
                creep.say('>>');
            } else {
                creep.say('MAKE');
            }
        } else {
            // creep.memory.role = 'janitor';
            // No targets.. head back to the room spawn
            var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => i.structureType === STRUCTURE_SPAWN
            });
            if (!spawn) {
                var spawns = Game.rooms[creep.memory.roomName].find(FIND_STRUCTURES, {
                    filter: (i) => i.structureType === STRUCTURE_SPAWN
                });
                var spawn = spawns[0];
            }
            if (spawn) {
                if (spawn.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(spawn);
                    creep.say(global.sayWhat);
                }
            }
        }
    }
}
