/**
 * This runs the creep spawner
 */
module.exports.run = function(spawn, role, debug = false) {
    var _role = require('role.' + role);
    var _spawn = Game.spawns[spawn];
    var _room = _spawn.room;
    // CONTINUE FROM HERE
    if (debug) { console.log('Running ' + role + ' spawner'); }
    if (debug) { console.log('Checking for viable ' + role + ' Creep Spawns in ' + _spawn.room); }
    var spawned = false;

    if (_role.limit == 'global') {
        if (debug) { console.log('Checking global counts') };
        var sList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.gSize == 'S'  && !creep.memory.dying);
        var mList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.gSize == 'M'  && !creep.memory.dying);
        var lList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.gSize == 'L'  && !creep.memory.dying);
        var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.gSize == 'XL' && !creep.memory.dying);
    } else {
        if (debug) { console.log('Checking spawner room counts') };
        var sList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.roomName == _room.name && creep.memory.gSize == 'S'  && !creep.memory.dying);
        var mList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.roomName == _room.name && creep.memory.gSize == 'M'  && !creep.memory.dying);
        var lList  = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.roomName == _room.name && creep.memory.gSize == 'L'  && !creep.memory.dying);
        var xlList = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.roomName == _room.name && creep.memory.gSize == 'XL' && !creep.memory.dying);
    }

    if (debug) {
        console.log('s:'+sList.length+ ' m:' + mList.length+ ' l:' + lList.length + ' xl:' + xlList.length);
    }

    var roster = _role.roster;

    if (_room.energyAvailable >= _role.costS && sList.length < roster.S && !spawned) {
        var creepName = _spawn.createCreep(_role.bodyS, undefined, {
            role : _role.roleName,
            gSize : 'S',
            sType : _role.sType,
            roomName : _room.name
        });
        console.log('Spawning new S ' + role + ':' + creepName);
        spawned = true;
    }

    if (_room.energyAvailable >= _role.costM && mList.length < roster.M && !spawned) {
        var creepName = _spawn.createCreep(_role.bodyM, undefined, {
            role : _role.roleName,
            gSize : 'M',
            sType : _role.sType,
            roomName : _room.name
        });
        console.log('Spawning new M ' + role + ':' + creepName);
        spawned = true;
    }

    if (_room.energyAvailable >= _role.costL && lList.length < roster.L && !spawned) {
        var creepName = _spawn.createCreep(_role.bodyL, undefined, {
            role : _role.roleName,
            gSize : 'L',
            sType : _role.sType,
            roomName : _room.name
        });
        console.log('Spawning new L ' + role + ':' + creepName);
        spawned = true;
    }

    if (_room.energyAvailable >= _role.costXL && xlList.length < roster.XL && !spawned) {
        var creepName = _spawn.createCreep(_role.bodyXL, undefined, {
            role : _role.roleName,
            gSize : 'XL',
            sType : _role.sType,
            roomName : _room.name
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
module.exports.count = function(role, room = null, debug) {
    var _role = require('role.' + role);
    if (room != null) {
        var _room = Game.rooms[room];
        var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.memory.roomName == _room.name && !creep.memory.dying);
    } else {
        var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && !creep.memory.dying);
    }
    if (room != null) {
        console.log('[' + _room.name + ']:[' + role + '] = ' + list.length);
    } else {
        console.log('[global][' + role + '] = ' + list.length);
    }

    return list.length;
}
