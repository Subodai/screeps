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
            var role = global.roles[i];
            var _role = require('role.' + role);
            // Is this role enabled
            if (!global.settings[role]) {
                continue;
            }
            // Does it require a room 'state'
            // @TODO change the room state into a flag, so state = guard, emergency, normal etc...
            if (_role.roomRequirement) {
                // If the room isn't in guard mode, we need to make sure it gets skipped
                if (_role.roomRequirement == 'guard' && !_room.memory.guard) {
                    continue;
                }
                // if it require buildsites we'll need to make sure we check them
                if (_role.roomRequirement == 'buildsites') {
                    // Loop through all rooms and look for buildsites
                    var sites = 0;
                    for (var i in Game.rooms) {
                        var count = Game.rooms[i].find(FIND_CONSTRUCTION_SITES);
                        sites += count.length;
                    }
                    // No sites? no bueno! NEXT!
                    if (sites == 0){
                        continue;
                    }
                }
            }
            // Got this far? time to get the spawner
            if (debug) { console.log('Running ' + role + ' Spawner'); }
            // If we get true back from the spawner then it spawned
            if (spawner.run(role, debug)) {
                if (debug) { console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU'); }
                return;
            }
        }
    }
}
