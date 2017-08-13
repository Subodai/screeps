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
        if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) {
            console.log('Skipping '+ global.roles[i] + ' To relax CPU use');
        } else {
            // Get the role name from our global array by index
            var role = global.roles[i];
            // Som Debug
            if (debug) { console.log('Running ' + role + ' Creep Movement'); }
            // Grab the correct role file
            var _role = require('role.' + role);
            // Now for each of the creeps
            for(var name in Game.creeps) {
                const a = Game.cpu.getUsed();
                // Make a creep
                var creep = Game.creeps[name];
                // If this creep's role is the one we are checking
                if(creep.memory.role == _role.role) {
                    // Run it
                    _role.run(creep);
                    const cost = Game.cpu.getUsed() - a;
                    this.colour(creep, cost);
                }

            }
            if (debug) {
                console.log(role + ' Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
            }
        }
    }
}

module.exports.colour = function (creep, cost) {
    creep.room.visual.circle(creep.pos, {
        fill: global.roleColour[creep.memory.role],
        radius: 0.4,
        opacity: 0.1,
        stroke: global.roleColour[creep.memory.role],
    }).text(/* "<--= [" + creep.memory.level + '] '  + creep.memory.role + ' '*/  + cost.toFixed(2), creep.pos, {
        color:global.roleColour[creep.memory.role],
        font:0.5,
        align:'left',
        stroke:'rgba(0,0,0,0.5)',
    });
    // if (creep.memory._move) {
    //     _room.visual.circle(creep.memory._move.dest.x, creep.memory._move.dest.y, {
    //         fill: 'transparent',
    //         radius: 0.5,
    //         opacity: 0.3,
    //         stroke: global.roleColour[creep.memory.role],
    //     });
    // } else {

    // }
}
