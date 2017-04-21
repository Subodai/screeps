/**
 * This runs the scout spawner
 */
module.exports.run = function(debug = false) {
    var scout = require('role.scout');
    if (debug) { console.log('Running scout spawner'); }
    if (debug) { console.log('Checking for viable scout Creep Spawns'); }
    var spawned = false;
    var sList  = _.filter(Game.creeps, (creep) => creep.memory.role == scout.roleName && creep.memory.gSize == 'S' && !creep.memory.dying);
    var mList  = _.filter(Game.creeps, (creep) => creep.memory.role == scout.roleName && creep.memory.gSize == 'M' && !creep.memory.dying);
    var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == scout.roleName && creep.memory.gSize == 'XL' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];
    var _Room = _Spawner.room;
    var roster = scout.roster;

    if (_Room.energyAvailable >= scout.costS && sList.length < roster.S && !spawned) {
        var creepName = _Spawner.createCreep(scout.bodyS, undefined, {
            role : scout.roleName,
            gSize : 'S',
            sType : 'specialist'
        });
        console.log('Spawning new S scout ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= scout.costM && mList.length < roster.M && !spawned) {
        var creepName = _Spawner.createCreep(scout.bodyM, undefined, {
            role : scout.roleName,
            gSize : 'M',
            sType : 'specialist'
        });
        console.log('Spawning new M scout ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= scout.costXL && xlList.length < roster.XL && !spawned) {
        var creepName = _Spawner.createCreep(scout.bodyXL, undefined, {
            role : scout.roleName,
            gSize : 'XL',
            sType : 'specialist'
        });
        console.log('Spawning new XL scout' + creepName);
        spawned = true;
    }

    if (spawned) {
        console.log('scout Creep Spawned');
        return true;
    } else {
        if (debug) { console.log('No scout Creeps needed'); }
        return false;
    }
}

/**
 * Count scout Creeps
 */
module.exports.count = function() {
    var scout = require('role.scout');
    var gList = _.filter(Game.creeps, (creep) => creep.memory.role == scout.roleName && !creep.memory.dying);
    console.log('scouts[' + gList.length + ']');
    return gList.length;
}
