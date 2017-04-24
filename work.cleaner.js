/*
 * Memory Cleaner
 */
module.exports.run = function(debug = false) {
    var _cpu = Game.cpu.getUsed();
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Memory cleared [' + name +']');
        }
    }
    if (debug) { console.log('Cleaner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU'); }
}
