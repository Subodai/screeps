/**
 * This runs the harvester spawner
 */
module.exports.run = function(debug = false) {
    var harvester = require('role.harvester');
    if (debug) { console.log('Running harvester spawner'); }
    console.log('Checking for viable harvester Creep Spawns');
    var spawned = false;
    var sList  = _.filter(Game.creeps, (creep) => creep.memory.role == harvester.roleName && creep.memory.gSize == 'S'  && !creep.memory.dying);
    var mList  = _.filter(Game.creeps, (creep) => creep.memory.role == harvester.roleName && creep.memory.gSize == 'M'  && !creep.memory.dying);
    var lList  = _.filter(Game.creeps, (creep) => creep.memory.role == harvester.roleName && creep.memory.gSize == 'L'  && !creep.memory.dying);
    var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == harvester.roleName && creep.memory.gSize == 'XL' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];
    var _Room = _Spawner.room;
    var roster = harvester.roster;

    if (_Room.energyAvailable >= harvester.costS && sList.length < roster.S && !spawned) {
        var creepName = _Spawner.createCreep(harvester.bodyS, undefined, {
            role : harvester.roleName,
            gSize : 'S',
            sType : harvester.sType
        });
        console.log('Spawning new S harvester ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= harvester.costM && mList.length < roster.M && !spawned) {
        var creepName = _Spawner.createCreep(harvester.bodyM, undefined, {
            role : harvester.roleName,
            gSize : 'M',
            sType : harvester.sType
        });
        console.log('Spawning new M harvester ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= harvester.costL && mList.length < roster.L && !spawned) {
        var creepName = _Spawner.createCreep(harvester.bodyL, undefined, {
            role : harvester.roleName,
            gSize : 'L',
            sType : harvester.sType
        });
        console.log('Spawning new L harvester ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= harvester.costXL && xlList.length < roster.XL && !spawned) {
        var creepName = _Spawner.createCreep(harvester.bodyXL, undefined, {
            role : harvester.roleName,
            gSize : 'XL',
            sType : harvester.sType
        });
        console.log('Spawning new XL harvester' + creepName);
        spawned = true;
    }

    if (spawned) {
        console.log('harvester Creep Spawned');
        return true;
    } else {
        console.log('No harvester Creeps needed');
        return false;
    }
}

/**
 * Count harvester Creeps
 */
module.exports.count = function() {
    var harvester = require('role.harvester');
    var list = _.filter(Game.creeps, (creep) => creep.memory.role == harvester.roleName && !creep.memory.dying);
    console.log('harvesters[' + list.length + ']');
    return list.length;
}
