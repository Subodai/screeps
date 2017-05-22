var spawner = require('spawn.creep');
/*
 * New Spawner
 */
module.exports.run = function(debug = false) {
    // Get and store the cpu
    var _cpu = Game.cpu.getUsed();
    // First loop through our spawns
    for (var spawn in Game.spawns) {
        // Set spawn, room and spawned
        var _spawn = Game.spawns[spawn];
        // Is this spawner already occupied?
        if (_spawn.spawning) {
            if (debug) { console.log('Spawner already spawning'); }
            continue
        }
        var _room  = _spawn.room;
        var _spawned = false;
        // Now lets loop through the roles
        for (var i in global.roles) {
            if (_spawned) { break; }
            var role = global.roles[i];
            var _role = require('role.' + role);
            // Is this role enabled in this room?
            if (!_room.memory.roles[role]) {
                continue;
            }
            // If we get true back from the spawner then it spawned
            if (spawner.run(spawn, role, debug)) {
                if (debug) { console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU'); }
                _spawned = true;
            }
        }
    }
}
