/**
 * This runs the creep spawner
 */
module.exports.run = function(spawn, role, debug = false) {
    var _role = require('role.' + role);
    var _spawn = Game.spawns[spawn];
    var _room = _spawn.room;
    // If we're in emergency mode, we need to change the level to 1 to force-spawn lower level creeps
    if (_room.memory.emergency) {
        var _level = 1;
    } else {
        var _level = _room.controller.level;
    }

    var body  = _role.body;
    // If links are on
    if (_room.memory.links) {
        // If this role has a links based body
        if (_role.bodylinks) {
            var body = _role.bodylinks;
        }
    }

    // If we don't have enough energy for this level of creep, we've likely recently levelled up the controller, so try to spawn the previous level
    while (_room.energyCapacityAvailable < global.getPartsCost(body[_level])) {
        // reduce the level
        _level--;
        debug && console.log('Reducing creep ' + role + ' level to ' + _level + ' as not enough capacity in ' + _room.name);
    }

    if (_level == 0) {
        _level = 1;
    }

    // CONTINUE FROM HERE
    if (debug) { console.log('Running ' + role + ' spawner'); }
    if (debug) { console.log('Checking for viable ' + role + ' Creep Spawns in ' + _spawn.room); }
    var spawned = false;

    var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.role && creep.memory.roomName == _room.name && creep.memory.level == _level && !creep.memory.dying);

    if (debug) {
        console.log(role + ':' + list.length);
    }

    var roster = _role.roster;

    // If links are on
    if (_room.memory.links) {
        // If this role has a links based body
        if (_role.rosterlinks) {
            var roster = _role.rosterlinks;
        }
    }

    if (_room.energyAvailable >= global.getPartsCost(body[_level]) && list.length < roster[_level] && !spawned) {
        // Make a new name
        let creepName = _spawn.generateCreepName(_role.role, _room.name);
        // did we spawn?
        let success = _spawn.spawnCreep(body[_level], creepName, {
            memory: {
                role : _role.role,
                level : _level,
                sType : _role.sType,
                roomName : _room.name
            }
        });
        console.log('Spawning new level ' + _level + ' ' + role + ' : ' + creepName + ' in room '+ _room.name + ' [' + (list.length+1) + '/' + roster[_level] + ']');
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
