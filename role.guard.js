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
    8 : 410,
    /*
    2 : 380,
    3 : 480,
    4 : 700,
    5 : 700,
    6 : 700,
    7 : 700,
    8 : 700,
    */
}

/* Body parts */
module.exports.body = {
    1 : [
        MOVE,MOVE,              // 1 Moves = 100
        ATTACK,ATTACK,          // 2 Attacks = 160 = 60h/t
    ],
    2 : [
        MOVE,MOVE,              // 1 Moves = 100
        ATTACK,ATTACK,          // 2 Attacks = 160 = 60h/t
    ],
    3 : [
        TOUGH,TOUGH,                                // 2 Toughs = 20
        MOVE,MOVE,MOVE,MOVE,                        // 4 Moves = 200
        ATTACK,ATTACK,                              // 2 Attacks = 160 = 60h/t
    ],
    4 : [
        TOUGH,TOUGH,                            // 2 Toughs = 20
        MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
        ATTACK,ATTACK,ATTACK,                   // 3 Attacks = 240 = 150h/t
    ],
    5 : [
        TOUGH,TOUGH,                            // 2 Toughs = 20
        MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
        ATTACK,ATTACK,ATTACK,                   // 3 Attacks = 240 = 150h/t
    ],
    6 : [
        TOUGH,TOUGH,                            // 2 Toughs = 20
        MOVE,MOVE,MOVE,MOVE,MOVE,               // 5 Moves = 250
        ATTACK,ATTACK,ATTACK,                   // 3 Attacks = 240 = 150h/t
    ],
    7 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,  // 5 Toughs = 50
        MOVE,MOVE,MOVE,MOVE,                        // 4 Moves = 200
        ATTACK,ATTACK,                              // 2 Attacks = 160 = 60h/t
    ],
    8 : [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,  // 5 Toughs = 50
        MOVE,MOVE,MOVE,MOVE,                        // 4 Moves = 200
        ATTACK,ATTACK,                              // 2 Attacks = 160 = 60h/t
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
}
/* Spawn Roster */
module.exports.roster = {
    1: 3,
    2: 3,
    3: 3,
    4: 3,
    5: 10,
    6: 10,
    7: 5,
    8: 3,
}
/**
 * Individual check for a room to check if this creep type should be enabled or not
 */
module.exports.enabled = function (room, debug = false) {
    // define the room
    var _room = Game.rooms[room];
    // Is this room in guard mode?
    if (_room.memory.mode == 'guard' || _room.memory.war) {
        // yep lets go spawn guards!
        return true;
    }
    // Nope room is not in guard mode
    return false;
}
/* Okay, lets code the creep */
module.exports.run = function (creep, debug = false) {
    if (creep.spawning) { return; }
    // Fatigue Check
    if (creep.fatigue > 0) {
        if (debug) { console.log('Creep[' + creep.name + '] Fatgiued ' + creep.fatigue); }
        creep.say(global.sayTired);
        return;
    }
    if (creep.memory.idle >= 100) {
        // No targets.. head back to the room spawn
        var spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_SPAWN
        });

        if (spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, {
                sualizePathStyle: {
                    stroke: global.colorRepair,
                    opacity: global.pathOpacity
                },
                reusePath:3
            });
            creep.say(global.sayWhat);
            return;
        }
    }
    // Get a target
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (i) => !(global.friends.indexOf(i.owner.username) > -1)
    });
    // var target = false;
    if (target) {
        creep.memory.idle = 0;
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {
                visualizePathStyle : {
                    stroke: '#FF0000',
                    opacity: global.pathOpacity
                },reusePath:0
            });
            creep.say(global.sayMove);
            return;
        } else {
            creep.say(global.sayAttack,true);
            return;
        }
    } else {
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (i) => !(global.friends.indexOf(i.owner.username) > -1) && i.structureType == STRUCTURE_TOWER
        });
        if (!target) {
            var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (i) => !(global.friends.indexOf(i.owner.username) > -1) && i.structureType == STRUCTURE_SPAWN
            });
        }
        if (!target) {
            var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (i) => !(global.friends.indexOf(i.owner.username) > -1) && i.structureType != STRUCTURE_CONTROLLER
            });
        }
        //var target = false;
        if (target) {
            creep.memory.idle = 0;
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                        visualizePathStyle : {
                            stroke: '#FF0000',
                            opacity: global.pathOpacity
                        },
                        reusePath:0
                    });
                creep.say(global.sayMove);
                return;
            } else {
                creep.say(global.sayAttack,true);
                return;
            }
        } else {
            var flag = Game.flags['attack'];
            if (!flag) {
                var flag = Game.flags['stage'];
                if (!flag) {
                    creep.memory.idle++;
                    creep.say(creep.memory.idle);
                    return;
                } else {
                    var result = creep.moveTo(flag, {
                        visualizePathStyle : {
                            stroke: global.colourFlag,
                            opacity: global.pathOpacity
                        },
                        reusePath:0
                    });
                    return;
                }

            }
            // If our POS is not the flags
            if (creep.pos.roomName == flag.pos.roomName) {
                // We have arrived!
                creep.memory.arrived = true;
                var result = creep.moveTo(flag, {
                    visualizePathStyle : {
                        stroke: global.colourFlag,
                        opacity: global.pathOpacity
                    },
                    reusePath:0
                });
            } else {
                var result = creep.moveTo(flag, {
                    visualizePathStyle : {
                        stroke: global.colourFlag,
                        opacity: global.pathOpacity
                    },
                    reusePath:0
                });
                return;
            }
        }

    }
}
