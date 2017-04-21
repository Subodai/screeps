/**
 * This runs the upgrader spawner
 */
module.exports.run = function(debug = false) {
    var upgrader = require('role.upgrader');
    if (debug) { console.log('Running upgrader spawner'); }
    if (debug) { console.log('Checking for viable upgrader Creep Spawns'); }
    var spawned = false;
    var sList  = _.filter(Game.creeps, (creep) => creep.memory.role == upgrader.roleName && creep.memory.gSize == 'S'  && !creep.memory.dying);
    var mList  = _.filter(Game.creeps, (creep) => creep.memory.role == upgrader.roleName && creep.memory.gSize == 'M'  && !creep.memory.dying);
    var lList  = _.filter(Game.creeps, (creep) => creep.memory.role == upgrader.roleName && creep.memory.gSize == 'L'  && !creep.memory.dying);
    var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == upgrader.roleName && creep.memory.gSize == 'XL' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];
    var _Room = _Spawner.room;
    var roster = upgrader.roster;

    if (_Room.energyAvailable >= upgrader.costS && sList.length < roster.S && !spawned) {
        var creepName = _Spawner.createCreep(upgrader.bodyS, undefined, {
            role : upgrader.roleName,
            gSize : 'S',
            sType : upgrader.sType
        });
        console.log('Spawning new S upgrader ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= upgrader.costM && mList.length < roster.M && !spawned) {
        var creepName = _Spawner.createCreep(upgrader.bodyM, undefined, {
            role : upgrader.roleName,
            gSize : 'M',
            sType : upgrader.sType
        });
        console.log('Spawning new M upgrader ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= upgrader.costL && lList.length < roster.L && !spawned) {
        var creepName = _Spawner.createCreep(upgrader.bodyL, undefined, {
            role : upgrader.roleName,
            gSize : 'L',
            sType : upgrader.sType
        });
        console.log('Spawning new L upgrader ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= upgrader.costXL && xlList.length < roster.XL && !spawned) {
        var creepName = _Spawner.createCreep(upgrader.bodyXL, undefined, {
            role : upgrader.roleName,
            gSize : 'XL',
            sType : upgrader.sType
        });
        console.log('Spawning new XL upgrader ' + creepName);
        spawned = true;
    }

    if (spawned) {
        console.log('upgrader Creep Spawned');
        return true;
    } else {
        console.log('No upgrader Creeps needed');
        return false;
    }
}

/**
 * Count upgrader Creeps
 */
module.exports.count = function() {
    var upgrader = require('role.upgrader');
    var list = _.filter(Game.creeps, (creep) => creep.memory.role == upgrader.roleName && !creep.memory.dying);
    console.log('upgraders[' + list.length + ']');
    return list.length;
}
