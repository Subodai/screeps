/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawn.big');
 * mod.thing == 'a thing'; // true
 */

module.exports.run = function(debug = false) {
    if (debug) { console.log('Running Big Spawner'); }
    var desired = require('settings.desired');

    if (debug) { console.log('Checking for viable big Creep Spawns'); }
    var spawned = false;

    var hList = _.filter(Game.creeps, (creep) => creep.memory.role == 'bigharvester' && !creep.memory.dying);
    var uList = _.filter(Game.creeps, (creep) => creep.memory.role == 'bigupgrader' && !creep.memory.dying);
    var bList = _.filter(Game.creeps, (creep) => creep.memory.role == 'bigbuilder' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];

    // We need to know how many construction sites there are so grab a list
    var sites = _Spawner.room.find(FIND_CONSTRUCTION_SITES);

    if(hList.length < desired.BigH && !spawned) {
        var harvester = require('role.bigharvester');
        var newName = _Spawner.createCreep(harvester.parts, undefined, {role: 'bigharvester', sType:'big'});
        if (debug) { console.log('Spawning new big harvester: ' + newName); }
        spawned = true;
    }

    if(uList.length < desired.BigU && !spawned) {
        var upgrader = require('role.bigupgrader');
        var newName = _Spawner.createCreep(upgrader.parts, undefined, {role: 'bigupgrader', sType:'big'});
        if (debug) { console.log('Spawning new big upgrader: ' + newName); }
        spawned = true;
    }

    if(bList.length < desired.BigB && !spawned && sites.length > 0) {
        var builder = require('role.bigbuilder');
        var newName = _Spawner.createCreep(builder.parts, undefined, {role: 'bigbuilder', sType:'big'});
        if (debug) { console.log('Spawning new big builder: ' + newName); }
        spawned = true;
    }

    if (spawned) {
        if (debug) { console.log('Big Creep Spawned'); }
        return true;
    } else {
        if (debug) { console.log('Big Creeps full'); }
        return false;
    }
}

/**
 * Count Big Creeps
 */
module.exports.count = function() {
    var hList = _.filter(Game.creeps, (creep) => creep.memory.role == 'bigharvester' && !creep.memory.dying);
    var uList = _.filter(Game.creeps, (creep) => creep.memory.role == 'bigupgrader' && !creep.memory.dying);
    var bList = _.filter(Game.creeps, (creep) => creep.memory.role == 'bigbuilder' && !creep.memory.dying);
    console.log('BigH[' + hList.length + '] BigU[' + uList.length + '] BigB[' + bList.length + ']');
    return hList.length + uList.length + bList.length;
}
