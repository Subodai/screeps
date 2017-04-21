/*
 * Counter worker for counting things
 */
module.exports.run = function(debug = false) {
    var _cpu = Game.cpu.getUsed();
    var spawner = require('spawn.creeps');
    var msg = '';

    // Loop through the rooms
    for(var name in Game.rooms) {
        var theRoom = Game.rooms[name];
        var miners = spawner.count('miner', room);
        var extractors = spawner.count('extractor', room);
        // Are there any hostiles?
        var hostiles = theRoom.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0 && theRoom.memory.mode == 'normal') {
            Game.notify(Game.time + ' Room put into guard mode spawning guards');
            theRoom.memory.mode = 'guard';
        }
        if (hostiles.length == 0 && theRoom.memory.mode == 'guard') {
            Game.notify(Game.time + ' Room no longer in guard mode');
            theRoom.memory.mode = 'normal';
        }
        if (theRoom.memory.mode == 'guard') {
            spawner.count('guard',room);
            console.log('We are still in guard mode');
        }
        var list = _.filter(Game.creeps, (creep) => !creep.memory.dying);
        if ((list.length == 0 || miners == 0) && !theRoom.memory.emergency){
            Game.notify(Game.time + ' Room '+ name + ' In Emergency Mode!!');
            console.log('Emergency Activated');
            theRoom.memory.emergency = true;
            var miner = require('role.miner');
            miner.setup();
        }
        if ((list.length >= 5 || miners > 0) && theRoom.memory.emergency) {
            Game.notify(Game.time + ' Room ' + name + ' No Longer in Emergency Mode');
            console.log('Emergency Deactivated');
            theRoom.memory.emergency = false;
            delete theRoom.memory.emergency;
        }
        if (theRoom.memory.emergency) {
            console.log('We have ' + list.length + ' total creeps still in emergency mode');
        }

        msg += ' [' + name + ':' + theRoom.energyAvailable + ']';
    }
    console.log('Counter used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    return msg;
}
