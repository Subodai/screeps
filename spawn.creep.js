/**
 * This runs the creep spawner
 */
module.exports.run = function(spawn, role, debug = false) {
    var _role = require('role.' + role);
    var _spawn = Game.spawns[spawn];
    var _room = _spawn.room;
    // CONTINUE FROM HERE
    if (debug) { console.log('Running ' + role + ' spawner'); }
    console.log('Checking for viable ' + role + ' Creep Spawns');
    var spawned = false;
    var sList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.room == _room && creep.memory.gSize == 'S'  && !creep.memory.dying);
    var mList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.room == _room && creep.memory.gSize == 'M'  && !creep.memory.dying);
    var lList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.room == _room && creep.memory.gSize == 'L'  && !creep.memory.dying);
    var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.room == _room && creep.memory.gSize == 'XL' && !creep.memory.dying);
    var roster = _role.roster;

    if (_room.energyAvailable >= _role.costS && sList.length < roster.S && !spawned) {
        var creepName = _Spawner.createCreep(_role.bodyS, undefined, {
            role : _role.roleName,
            gSize : 'S',
            sType : _role.sType
        });
        console.log('Spawning new S ' + role + ':' + creepName);
        spawned = true;
    }

    if (_room.energyAvailable >= _role.costM && mList.length < roster.M && !spawned) {
        var creepName = _Spawner.createCreep(_role.bodyM, undefined, {
            role : _role.roleName,
            gSize : 'M',
            sType : _role.sType
        });
        console.log('Spawning new M ' + role + ':' + creepName);
        spawned = true;
    }

    if (_room.energyAvailable >= _role.costL && lList.length < roster.L && !spawned) {
        var creepName = _Spawner.createCreep(_role.bodyL, undefined, {
            role : _role.roleName,
            gSize : 'L',
            sType : _role.sType
        });
        console.log('Spawning new L ' + role + ':' + creepName);
        spawned = true;
    }

    if (_room.energyAvailable >= _role.costXL && xlList.length < roster.XL && !spawned) {
        var creepName = _Spawner.createCreep(_role.bodyXL, undefined, {
            role : _role.roleName,
            gSize : 'XL',
            sType : _role.sType
        });
        console.log('Spawning new XL ' + role + ':' + creepName);
        spawned = true;
    }

    if (spawned) {
        console.log(role + ' Creep Spawned');
        return true;
    } else {
        if (debug) { console.log('No ' + role + ' Creeps needed'); }
        return false;
    }
}

/**
 * Count Creeps
 */
module.exports.count = function(role, room = null) {
    var _role = require('role.' + role);
    if (room != null) {
        var _room = Game.rooms[room];
        var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.room == _room && !creep.memory.dying);
    } else {
        var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && !creep.memory.dying);
    }
    
    console.log(role + '[' + list.length + ']');
    return list.length;
}
