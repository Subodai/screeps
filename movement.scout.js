/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('movement.small');
 * mod.thing == 'a thing'; // true
 */
var scout = require('role.scout');

module.exports.run = function(debug = false) {
    if (debug) { console.log('Running scout Creep Movement'); }
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == scout.roleName) {
            scout.run(creep);
        }
    }
}
