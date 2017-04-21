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
        var _room  = _spawn.room;
        var _spawned = false;
        // Now lets loop through the roles
        for (var i in global.roles) {
            if (_spawned) { break; }
            var role = global.roles[i];
            var _role = require('role.' + role);
            // Is this role enabled
            if (!global.settings[role]) {
                continue;
            }
            // Does it require a room 'state'
            // If the role requires a flag to be set to spawn
            if (_role.flag) {
                // If the room isn't in the right mode we need to make sure it gets skipped
                if (!_room.memory.mode == _role.flag) {
                    continue;
                }
            }
            // Other requirements
            if (_role.roomRequirement) {
                console.log('role ' + role + ' has requirent: ' + _role.roomRequirement);
                console.log('room ' + _room + ' requires ' + _room.memory[_role.roomRequirement]);
                // if it requires minersNeeded do some things
                if (_room.memory[_role.roomRequirement] && _room.memory[_role.roomRequirement] > 0) {
                    // We need the rooms miner count
                    var list = _.filter(Game.creeps, (creep) => creep.memory.role == _role.roleName && creep.room == _room && !creep.memory.dying);
                    console.log('room ' + _room + ' has ' + list.length);
                    if (list.length >= _room.memory[_role.roomRequirement]) {
                        continue;
                    }
                }
            }
            // If the role has a counter
            if (_role.counter) {
                // Loop through all rooms and look for buildsites
                var items = 0;
                for (var i in Game.rooms) {
                    var count = Game.rooms[i].find(_role.counter);
                    items += count.length;
                }
                // No items? no bueno! NEXT!
                if (items == 0){
                    continue;
                }
            }
            // If we get true back from the spawner then it spawned
            if (spawner.run(spawn, role, debug)) {
                if (debug) { console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU'); }
                _spawned = true;
            }
        }
    }
}
