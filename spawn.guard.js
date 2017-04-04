/**
 * This runs the guard spawner
 */
module.exports.run = function(debug = false) {
    var guard = require('role.guard');
    if (debug) { console.log('Running guard spawner'); }
    console.log('Checking for viable guard Creep Spawns');
    var spawned = false;
    var sList = _.filter(Game.creeps, (creep) => creep.memory.role == guard.role && creep.memory.gSize == 'S' && !creep.memory.dying);
    var mList = _.filter(Game.creeps, (creep) => creep.memory.role == guard.role && creep.memory.gSize == 'M' && !creep.memory.dying);
    var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == guard.role && creep.memory.gSize == 'XL' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];
    var _Room = _Spawner.room;
    var roster = guard.roster;

    if (_Room.energyAvailable >= guard.costS && sList.length < roster.S && !spawned) {
        var creepName = _Spawner.createCreep(guard.bodyS, undefined, {
            role : guard.roleName,
            gSize : 'S',
            sType : 'specialist'
        });
        console.log('Spawning new S Guard ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= guard.costM && mList.length < roster.M && !spawned) {
        var creepName = _Spawner.createCreep(guard.bodyM, undefined, {
            role : guard.roleName,
            gSize : 'M',
            sType : 'specialist'
        });
        console.log('Spawning new M Guard ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= guard.costXL && xlList.length < roster.XL && !spawned) {
        var creepName = _Spawner.createCreep(guard.bodyXL, undefined, {
            role : guard.roleName,
            gSize : 'XL',
            sType : 'specialist'
        });
        console.log('Spawning new XL Guard' + creepName);
        spawned = true;
    }

    if (spawned) {
        console.log('Guard Creep Spawned');
        return true;
    } else {
        console.log('No Guard Creeps needed');
        return false;
    }
}

/**
 * Count Guard Creeps
 */
module.exports.count = function() {
    var guard = require('role.guard');
    var gList = _.filter(Game.creeps, (creep) => creep.memory.role == guard.roleName && !creep.memory.dying);
    console.log('Guards[' + gList.length + ']');
    return gList.length;
}
