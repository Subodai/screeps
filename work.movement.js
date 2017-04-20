/**
 * Creep Movement Handling
 */
module.exports.run = function(debug = false) {
    if (debug) {
        var _cpu = Game.cpu.getUsed();
        console.log('Running Creep Movement ');
    }
    // Loop through all the roles
    for (var i in global.roles) {
        // Get the role name from our global array by index
        var role = global.roles[i];
        // Som Debug
        if (debug) { console.log('Running ' + role + ' Creep Movement'); }
        // Grab the correct role file
        var _role = require('role.' + role);
        // Now for each of the creeps
        for(var name in Game.creeps) {
            // Make a creep
            var creep = Game.creeps[name];
            // If this creep's role is the one we are checking
            if(creep.memory.role == _role.roleName) {
                // Run it
                _role.run(creep);
            }
        }
        if (debug) {
            console.log(role + ' Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        }
    }
}
