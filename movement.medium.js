/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('movement.medium');
 * mod.thing == 'a thing'; // true
 */
var harvester = require('role.midharvester');
var upgrader = require('role.midupgrader');
var builder = require('role.midbuilder');

module.exports.run = function (debug = false) {
    if (debug) { console.log('Running Medium Creep Movement'); }
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

    }
}
