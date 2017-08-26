/* Specialist Miner Drone */
module.exports.role = 'guard';
/* SType */
module.exports.sType = 'specialist';
/* Costs */
module.exports.cost = {
    1 : 260,
    2 : 260,
    3 : 380,
    4 : 510,
    5 : 510,
    6 : 510,
    7 : 410,
    8 : 260,
    /*
    2 : 380,
    3 : 480,
    4 : 700,
    5 : 700,
    6 : 700,
    7 : 700,
    8 : 700,
    */
};

/* Body parts */
module.exports.body = {
    1 : [
        ATTACK,ATTACK,
        MOVE,MOVE,
    ],
    2 : [
        ATTACK,ATTACK,
        MOVE,MOVE,
    ],
    3 : [
        TOUGH,TOUGH,
        MOVE,MOVE,MOVE,
        ATTACK,ATTACK,
        MOVE,
    ],
    4 : [
        TOUGH,TOUGH,
        MOVE,MOVE,MOVE,MOVE,
        ATTACK,ATTACK,ATTACK,
        MOVE,
    ],
    5 : [
        TOUGH,TOUGH,
        MOVE,MOVE,MOVE,MOVE,
        ATTACK,ATTACK,ATTACK,
        MOVE,
    ],
    6 : [
        TOUGH,TOUGH,
        MOVE,MOVE,MOVE,MOVE,
        ATTACK,ATTACK,ATTACK,
        MOVE,
    ],
    7 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
        MOVE,MOVE,MOVE,
        ATTACK,ATTACK,
        MOVE,
    ],
    8 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
        MOVE,MOVE,MOVE,
        ATTACK,ATTACK,
        MOVE,
    ],
    /*
    2 : [
        TOUGH,TOUGH,            // 2 Toughs = 20
        MOVE,MOVE,MOVE,MOVE,    // 4 Moves = 200
        ATTACK,ATTACK,          // 2 Attacks = 160 = 60h/t
    ],
    3 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,  // 2 Toughs = 20
        MOVE,MOVE,MOVE,MOVE,                        // 4 Moves = 200
        ATTACK,ATTACK,                              // 2 Attacks = 160 = 60h/t
    ],
    4 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,          // 5 Toughs = 50
        MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,     // 5 Attacks = 400 = 150h/t
    ],
    5 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,          // 5 Toughs = 50
        MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,     // 5 Attacks = 400 = 150h/t
    ],
    6 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,          // 5 Toughs = 50
        MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,     // 5 Attacks = 400 = 150h/t
    ],
    7 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,          // 5 Toughs = 50
        MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,     // 5 Attacks = 400 = 150h/t
    ],
    8 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,          // 5 Toughs = 50
        MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,     // 5 Attacks = 400 = 150h/t
    ],
    */
};
/* Spawn Roster */
module.exports.roster = {
    1: 3,
    2: 3,
    3: 3,
    4: 3,
    5: 10,
    6: 10,
    7: 10,
    8: 3,
};
/**
 * Individual check for a room to check if this creep type should be enabled or not
 */
module.exports.enabled = function (room, debug = false) {
    // define the room
    var _room = Game.rooms[room];
    // Is this room in guard mode?
    if (_room.memory.mode === 'guard' || _room.memory.war) {
        // yep lets go spawn guards!
        return true;
    }
    // Nope room is not in guard mode
    return false;
}
/* Okay, lets code the creep */
module.exports.run = function (creep, debug = false) {
    if (creep.isTired()) { return; }
    // Functional check!
    if (!creep.canDo(ATTACK)) {
        if (debug) { console.log('[' +creep.name+'] Creep damaged seeking repair:' + JSON.stringify(creep.pos)); }
        return;
    }
    if (creep.memory.idle >= 100) {
        // No targets.. head back to the room spawn
        var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => i.structureType === STRUCTURE_SPAWN && i.my
        });

        if (spawn.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
            creep.travelTo(spawn);
            creep.say(global.sayWhat);
            return;
        }
    }
    // Get a target
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (i) => !(global.friends.indexOf(i.owner.username) > -1)
    });
    if (!target) {
        target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (i) => !(global.friends.indexOf(i.owner.username) > -1) && i.structureType === STRUCTURE_TOWER
        });
    }
    if (!target) {
        target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (i) => !(global.friends.indexOf(i.owner.username) > -1) && i.structureType === STRUCTURE_SPAWN
        });
    }
    if (!target) {
        target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (i) => !(global.friends.indexOf(i.owner.username) > -1) && i.structureType !== STRUCTURE_CONTROLLER
        });
    }
    // var target = false; // uncomment to override hostiles and go to flags
    if (target) {
        creep.memory.idle = 0;
        if (!creep.pos.inRangeTo(target,1)) {
            creep.travelTo(target);
            creep.say(global.sayMove);
        }

        if (creep.pos.inRangeTo(target,1)) {
            creep.attack(target);
            creep.say(global.sayAttack);
        }
    } else {
        var flag = Game.flags['attack'];
        if (!flag) {
            flag = Game.flags['stage'];
        }
        if (!flag) {
            creep.memory.idle++;
            creep.say(creep.memory.idle);
            return;
        } else {
            // If we're more than 1 tile away attempt to move there
            if (!creep.pos.inRangeTo(flag,1)) {
                creep.travelTo(flag);
            }
        }
    }
}
