/**
 * This runs the mover spawner
 */
module.exports.run = function(debug = false) {
    var mover = require('role.mover');
    if (debug) { console.log('Running mover spawner'); }
    console.log('Checking for viable mover Creep Spawns');
    var spawned = false;
    var sList  = _.filter(Game.creeps, (creep) => creep.memory.role == mover.role && creep.memory.gSize == 'S'  && !creep.memory.dying);
    var mList  = _.filter(Game.creeps, (creep) => creep.memory.role == mover.role && creep.memory.gSize == 'M'  && !creep.memory.dying);
    var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == mover.role && creep.memory.gSize == 'XL' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];
    var _Room = _Spawner.room;
    var roster = mover.roster;

    if (_Room.energyAvailable >= mover.costS && sList.length < roster.S && !spawned) {
        var creepName = _Spawner.createCreep(mover.bodyS, undefined, {
            role : mover.roleName,
            gSize : 'S',
            sType : 'specialist'
        });
        console.log('Spawning new S mover ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= mover.costM && mList.length < roster.M && !spawned) {
        var creepName = _Spawner.createCreep(mover.bodyM, undefined, {
            role : mover.roleName,
            gSize : 'M',
            sType : 'specialist'
        });
        console.log('Spawning new M mover ' + creepName);
        spawned = true;
    }

    if (_Room.energyAvailable >= mover.costXL && xlList.length < roster.XL && !spawned) {
        var creepName = _Spawner.createCreep(mover.bodyXL, undefined, {
            role : mover.roleName,
            gSize : 'XL',
            sType : 'specialist'
        });
        console.log('Spawning new XL mover' + creepName);
        spawned = true;
    }

    if (spawned) {
        console.log('mover Creep Spawned');
        return true;
    } else {
        console.log('No mover Creeps needed');
        return false;
    }
}

/**
 * Count mover Creeps
 */
module.exports.count = function() {
    var mover = require('role.mover');
    var gList = _.filter(Game.creeps, (creep) => creep.memory.role == mover.roleName && !creep.memory.dying);
    console.log('Guards[' + gList.length + ']');
    return gList.length;
}
