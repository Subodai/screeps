/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('movement.big');
 * mod.thing == 'a thing'; // true
 */
var harvester = require('role.bigharvester');
var upgrader = require('role.bigupgrader');
var builder = require('role.bigbuilder');

module.exports.run = function(debug = false) {
    if (debug) { console.log('Running Big Creep Movement'); }
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'bigharvester') {
            harvester.run(creep);
        }
        if(creep.memory.role == 'bigupgrader') {
            upgrader.run(creep);
        }
        if(creep.memory.role == 'bigbuilder') {
            builder.run(creep);
        }
    }
}
