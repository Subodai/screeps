/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawn.small');
 * mod.thing == 'a thing'; // true
 */

module.exports.run = function(debug = false) {
    if (debug) { console.log('Running small spawner'); }
    var desired = require('settings.desired');

    if (debug) { console.log('Checking for viable small Creep Spawns'); }
    var spawned = false;

    var hList = _.filter(Game.creeps, (creep) => creep.memory.role == 'smallharvester' && !creep.memory.dying);
    var uList = _.filter(Game.creeps, (creep) => creep.memory.role == 'smallupgrader' && !creep.memory.dying);
    var bList = _.filter(Game.creeps, (creep) => creep.memory.role == 'smallbuilder' && !creep.memory.dying);
    var rList = _.filter(Game.creeps, (creep) => creep.memory.role == 'smallrefiller' && !creep.memory.dying);
    var _Spawner = Game.spawns['Sub1'];

    // We need to know how many construction sites there are so grab a list
    var sites = _Spawner.room.find(FIND_CONSTRUCTION_SITES);

    if (debug) {
        console.log('We have ' + hList.length + ' Small Harvesters');
        console.log('We have ' + uList.length + ' Small Upgraders');
        console.log('We have ' + bList.length + ' Small Builders');
    }

    if(hList.length < desired.SmlH && !spawned) {
        var harvester = require('role.smallharvester');
        var newName = _Spawner.createCreep(harvester.parts, undefined, {role: 'smallharvester', sType: 'small'});
        if (debug) { console.log('Spawning new small harvester: ' + newName); }
        spawned = true;
    }

    if(uList.length < desired.SmlU && !spawned) {
        var upgrader = require('role.smallupgrader');
        var newName = _Spawner.createCreep(upgrader.parts, undefined, {role: 'smallupgrader', sType: 'small'});
        if (debug) { console.log('Spawning new small upgrader: ' + newName); }
        spawned = true;
    }

    if(bList.length < desired.SmlB && !spawned && sites.length > 0) {
        var builder = require('role.smallbuilder');
        var newName = _Spawner.createCreep(builder.parts, undefined, {role: 'smallbuilder', sType: 'small'});
        if (debug) { console.log('Spawning new small builder: ' + newName); }
        spawned = true;
    }

    if(rList.length < desired.SmlR && !spawned) {
        var refiller = require('role.smallrefiller');
        var newName = _Spawner.createCreep(refiller.parts, undefined, {role: 'smallrefiller', sType: 'small'});
        if (debug) { console.log('Spawning new small refiller: ' + newName); }
        spawned = true;
    }

    if (spawned) {
        if (debug) { console.log('Small Creep Spawned'); }
    } else {
        if (debug) { console.log('Small Creeps full'); }
    }
}

/**
 * Count Small Creeps
 */
module.exports.count = function() {
    var hList = _.filter(Game.creeps, (creep) => creep.memory.role == 'smallharvester' && !creep.memory.dying);
    var uList = _.filter(Game.creeps, (creep) => creep.memory.role == 'smallupgrader' && !creep.memory.dying);
    var bList = _.filter(Game.creeps, (creep) => creep.memory.role == 'smallbuilder' && !creep.memory.dying);
    var rList = _.filter(Game.creeps, (creep) => creep.memory.role == 'smallrefiller' && !creep.memory.dying);
    console.log('SmlH[' + hList.length + '] SmlU[' + uList.length + '] SmlB[' + bList.length + '] SmlR[' + rList.length + ']');
    return hList.length + uList.length + bList.length + rList.length;
}
