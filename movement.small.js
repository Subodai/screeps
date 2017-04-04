/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('movement.small');
 * mod.thing == 'a thing'; // true
 */
var harvester = require('role.smallharvester');
var upgrader = require('role.smallupgrader');
var builder = require('role.smallbuilder');
var refiller = require('role.smallrefiller');

module.exports.run = function(debug = false) {
    if (debug) { console.log('Running Small Creep Movement'); }
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'smallharvester') {
            harvester.run(creep);
        }
        if(creep.memory.role == 'smallupgrader') {
            upgrader.run(creep);
        }
        if(creep.memory.role == 'smallbuilder') {
            builder.run(creep);
        }
        if(creep.memory.role == 'smallrefiller') {
            refiller.run(creep, debug);
        }
    }
}
