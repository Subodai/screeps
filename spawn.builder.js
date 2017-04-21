/**
 * This runs the builder spawner
 */
module.exports.run = function(debug = false) {
    var builder = require('role.builder');
    if (debug) { console.log('Running builder spawner'); }
    if (debug) { console.log('Checking for viable builder Creep Spawns'); }
    var spawned = false;
    var sList  = _.filter(Game.creeps, (creep) => creep.memory.role == builder.roleName && creep.memory.gSize == 'S'  && !creep.memory.dying);
    var mList  = _.filter(Game.creeps, (creep) => creep.memory.role == builder.roleName && creep.memory.gSize == 'M'  && !creep.memory.dying);
    var lList  = _.filter(Game.creeps, (creep) => creep.memory.role == builder.roleName && creep.memory.gSize == 'L'  && !creep.memory.dying);
    var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == builder.roleName && creep.memory.gSize == 'XL' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];
    var _Room = _Spawner.room;
    var roster = builder.roster;

    if (_Room.energyAvailable >= builder.costS && sList.length < roster.S && !spawned) {
        var creepName = _Spawner.createCreep(builder.bodyS, undefined, {
            role : builder.roleName,
            gSize : 'S',
            sType : builder.sType
        });
        console.log('Spawning new S builder ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= builder.costM && mList.length < roster.M && !spawned) {
        var creepName = _Spawner.createCreep(builder.bodyM, undefined, {
            role : builder.roleName,
            gSize : 'M',
            sType : builder.sType
        });
        console.log('Spawning new M builder ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= builder.costL && lList.length < roster.L && !spawned) {
        var creepName = _Spawner.createCreep(builder.bodyL, undefined, {
            role : builder.roleName,
            gSize : 'L',
            sType : builder.sType
        });
        console.log('Spawning new L builder ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= builder.costXL && xlList.length < roster.XL && !spawned) {
        var creepName = _Spawner.createCreep(builder.bodyXL, undefined, {
            role : builder.roleName,
            gSize : 'XL',
            sType : builder.sType
        });
        console.log('Spawning new XL builder ' + creepName);
        spawned = true;
    }

    if (spawned) {
        console.log('builder Creep Spawned');
        return true;
    } else {
        if (debug) { console.log('No builder Creeps needed'); }
        return false;
    }
}

/**
 * Count builder Creeps
 */
module.exports.count = function() {
    var builder = require('role.builder');
    var list = _.filter(Game.creeps, (creep) => creep.memory.role == builder.roleName && !creep.memory.dying);
    console.log('builders[' + list.length + ']');
    return list.length;
}
