/**
 * This runs the creep spawner
 */
module.exports.run = function(spawn, role, debug = false) {
    var _role = require('role.' + role);
    var _spawn = Game.spawns[spawn];
    var _room = _spawn.room;
    var _level = _room.controller.level;
    // CONTINUE FROM HERE
    if (debug) { console.log('Running ' + role + ' spawner'); }
    if (debug) { console.log('Checking for viable ' + role + ' Creep Spawns in ' + _spawn.room); }
    var spawned = false;

    var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.role && creep.memory.roomName == _room.name && creep.memory.level == _level && !creep.memory.dying);

    if (debug) {
        console.log(role + ':' + list.length);
    }

    var roster = _role.roster;

    if (_room.energyAvailable >= _role.cost[_level] && list.length < roster[_level] && !spawned) {
        var creepName = _spawn.createCreep(_role.body[_level], undefined, {
            role : _role.role,
            level : _level,
            sType : _role.sType,
            roomName : _room.name
        });
        console.log('Spawning new level ' + _level + ' ' + role + ' : ' + creepName + ' in room '+ _room.name);
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
        var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.role && creep.memory.roomName == _room.name && !creep.memory.dying);
    } else {
        var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.role && !creep.memory.dying);
    }
    if (room != null) {
        if (debug) { console.log('[' + _room.name + ']:[' + role + '] = ' + list.length); }
    } else {
        if (debug) { console.log('[global][' + role + '] = ' + list.length); }
    }

    return list.length;
}
