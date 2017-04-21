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
            if (global.settings[role]) {

            }
        }
    }
}
