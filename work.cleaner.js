/*
 * Memory Cleaner
 */
module.exports.run = function(debug = false) {
    var _cpu = Game.cpu.getUsed();
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('[MEMORY] cleared [' + name +']');
        }
    }
    for(var room in Memory.rooms) {
        if (!Game.rooms[room]) {
            delete Memory.rooms[room];
            console.log('[MEMORY] cleared [' + name + ']');
        }
    }
    if (debug) { console.log('Cleaner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU'); }
}
