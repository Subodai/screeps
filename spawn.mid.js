/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawn.mid');
 * mod.thing == 'a thing'; // true
 */

module.exports.run = function(debug = false) {
    if (debug) { console.log('Running Mid Spawner'); }
    var desired = require('settings.desired');

    if (debug) { console.log('Checking for viable mid Creep Spawns'); }
    var spawned = false;

    var hList = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && !creep.memory.dying);
    var uList = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && !creep.memory.dying);
    var bList = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];

    // We need to know how many construction sites there are so grab a list
    var sites = _Spawner.room.find(FIND_CONSTRUCTION_SITES);

    if(hList.length < desired.MidH && !spawned) {
        var harvester = require('role.midharvester');
        var newName = _Spawner.createCreep(harvester.parts, undefined, {role: 'harvester', sType: 'mid'});
        if (debug) { console.log('Spawning new mid harvester: ' + newName); }
        spawned = true;
    }

    if(uList.length < desired.MidU && !spawned) {
        var upgrader = require('role.midupgrader');
        var newName = _Spawner.createCreep(upgrader.parts, undefined, {role: 'upgrader', sType: 'mid'});
        if (debug) { console.log('Spawning new mid upgrader: ' + newName); }
        spawned = true;
    }

    if(bList.length < desired.MidB && !spawned && sites.length > 0) {
        var builder = require('role.midbuilder');
        var newName = _Spawner.createCreep(builder.parts, undefined, {role: 'builder', sType: 'mid'});
        if (debug) { console.log('Spawning new mid builder: ' + newName); }
        spawned = true;
    }

    if (spawned) {
        if (debug) { console.log('Mid Creep Spawned'); }
        return true;
    } else {
        if (debug) { console.log('Mid Creeps full'); }
        return false;
    }
}

/**
 * Count Mid Creeps
 */
module.exports.count = function() {
    var hList = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && !creep.memory.dying);
    var uList = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && !creep.memory.dying);
    var bList = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && !creep.memory.dying);
    console.log('MidH[' + hList.length + '] MidU[' + uList.length + '] MidB[' + bList.length + ']');
    return hList.length + uList.length + bList.length;
}
