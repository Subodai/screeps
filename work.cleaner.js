/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('work.cleaner');
 * mod.thing == 'a thing'; // true
 */

module.exports.run = function() {
    var _cpu = Game.cpu.getUsed();
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Memory cleared[', name,']');
        }
    }
    console.log('Cleaner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
}
