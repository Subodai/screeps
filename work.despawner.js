/*
 * Despawner (not currently in use)
 */
var despawner = {
    run: function(debug = false) {
        return false;
        var _cpu = Game.cpu.getUsed();
        if (debug) { console.log('Running Despawner'); }
        var desired = require('settings.desired');
        if (desired.DeSpawn) {
            var cH = cU = cB = cR = cBH = cBU = cBB = cBR = cSH = cSU = cSB = cSR = 0;
            for(var name in Game.creeps) {
                var creep = Game.creeps[name];
                // Normal Size
                if(creep.memory.role == 'harvester') {
                    if (cH >= desired.MidH) {
                        console.log('Too many mid harvesters [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cH++;
                    }
                }
                if(creep.memory.role == 'upgrader') {
                    if (cU >= desired.MidU) {
                        console.log('Too many mid upgraders [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cU++;
                    }
                }
                if(creep.memory.role == 'builder') {
                    if (cB >= desired.MidB) {
                        console.log('Too many mid builders [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cB++;
                    }
                }
                // Big Size
                if(creep.memory.role == 'bigharvester') {
                    if (cBH >= desired.BigH) {
                        console.log('Too many big harvesters [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cBH++;
                    }
                }
                if(creep.memory.role == 'bigupgrader') {
                    if (cBU >= desired.BigU) {
                        console.log('Too many big upgraders [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cBU++;
                    }
                }
                if(creep.memory.role == 'bigbuilder') {
                    if (cBB >= desired.BigB) {
                        console.log('Too many big builders [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cBB++;
                    }
                }
                // Small Size
                if(creep.memory.role == 'smallharvester') {
                    if (cSH >= desired.SmlH) {
                        console.log('Too many small harvesters [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cSH++;
                    }
                }
                if(creep.memory.role == 'smallupgrader') {
                    if (cSU >= desired.SmlU) {
                        console.log('Too many small upgraders [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cSU++;
                    }
                }
                if(creep.memory.role == 'smallbuilder') {
                    if (cSB >= desired.SmlB) {
                        console.log('Too many small builders [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cSB++;
                    }
                }
                if(creep.memory.role == 'smallrefiller') {
                    if (cSR >= desired.SmlR) {
                        console.log('Too many small refillers [' + name + '] Suiciding');
                        creep.suicide();
                    } else {
                        cSR++;
                    }
                }
            }
        }
        console.log('Killer  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    }
};
module.exports = despawner;
