/* Janitor drone */
module.exports.role = "janitor";

/* sType */
module.exports.sType = "normal";

/* Spawn Roster */
module.exports.roster = {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
};

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
};

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
};


module.exports.enabled = function (room, debug = false) {
    var items = 0;
    // Define the room we're in
    var _room = Game.rooms[room];
    // Search for all targets that are walls or ramparts below their global max, or anything else with less hits than max
    const targets = _room.find(FIND_STRUCTURES, {
        filter: (i) => (i.structureType === STRUCTURE_RAMPART && i.hits <= global.rampartMax) ||
                       (i.structureType === STRUCTURE_WALL && i.hits <= global.wallMax) ||
                       ((i.structureType !== STRUCTURE_WALL && i.structureType != STRUCTURE_RAMPART) && i.hits < i.hitsMax)
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
        var percent = 100;
        if(item.structureType === STRUCTURE_RAMPART) {
            percent = (item.hits/global.rampartMax)*100;
        } else if (item.structureType == STRUCTURE_WALL) {
            percent = (item.hits/global.wallMax)*100;
        } else {
            percent = (item.hits/item.hitsMax)*100;
        }

        var r = Math.round(255 - ((255/100)*(percent/100)*100));
        var g = Math.round((255/100)*(percent/100)*100);
        var b = 0;
        var _color = "#" + this.tohex(r) + this.tohex(g) + this.tohex(b);
        _room.visual.circle(item.pos, {
            fill: _color,
            radius:0.35,
            opacity:0.05,
            stroke:_color
        }).text(percent.toFixed(2) + "%", item.pos, {
            color:_color,
            font:0.5,
            align:"left",
            stroke:"rgba(0,0,0,0.5)",
            opacity:0.6,
        });
    }
}

module.exports.tohex = function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) { hex = "0" + hex; }
    return hex;
}
/**
 * Janitor Role
 */
module.exports.run = function(creep) {
    // If spawning or fatigued
    if (creep.spawning || creep.fatigue > 0) { return; }
    // If we have only a few ticks to live we should set to dying
    if (creep.ticksToLive < 100) { creep.memory.dying = true; }
    // If we're sapping and have run out of energy
    if(creep.memory.sapping && creep.carry.energy == 0) {
        // clear sapping flag
        creep.memory.sapping = false;
        creep.say(global.sayGet);
    }
    // Are we full?
    if(!creep.memory.sapping && creep.carryCapacity > 0 && creep.carry.energy == creep.carryCapacity) {
        // Yes set sapping flag to true
        creep.memory.sapping = true;
        creep.say(global.sayPUT);
    }
    // Are we in pickup energy mode?
    if (!creep.memory.sapping && creep.getNearbyEnergy(true) === ERR_FULL) {
        delete creep.memory.energyPickup;
        creep.memory.sapping = true;
    }
    // Are we sapping?
    if(creep.memory.sapping) {
        delete creep.memory.energyPickup;
        let result = creep.repairStructures();
        switch (creep.repairStructures()) {
            case ERR_FULL: // We have completed this fill
                delete creep.memory.repairTarget;
                delete creep.memory.targetmaxHP;
                break;
            case ERR_NOT_ENOUGH_ENERGY: // We have run out of energy
                delete creep.memory.repairTarget;
                delete creep.memory.targetmaxHP;
                creep.memory.sapping == false;
                break;
            default: // Nothing to do here
        }
    }
}
