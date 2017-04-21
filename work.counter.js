/*
 * Counter worker for counting things
 */
module.exports.run = function(debug = false) {
    var _cpu = Game.cpu.getUsed();
    var minerSpawner = require('spawn.miner');
    var extractorSpawner = require('spawn.extractor');
    var miners = minerSpawner.count();
    extractorSpawner.count();
    var msg = '';

    // Loop through the rooms
    for(var name in Game.rooms) {
        var theRoom = Game.rooms[name];
        // Are there any hostiles?
        var hostiles = theRoom.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0 && !theRoom.memory.guard) {
            Game.notify(Game.time + ' Room put into guard mode spawning guards');
            theRoom.memory.guard = true;
        }
        if (hostiles.length == 0 && theRoom.memory.guard) {
            Game.notify(Game.time + ' Room no longer in guard mode');
            theRoom.memory.guard = false;
            delete theRoom.memory.guard;
        }
        if (theRoom.memory.guard) {
            var guardSpawner = require('spawn.guard');
            guardSpawner.count();
            console.log('We are still in guard mode');
        }
        var list = _.filter(Game.creeps, (creep) => !creep.memory.dying);
        if ((list.length == 0 || miners == 0) && !theRoom.memory.emergency){
            Game.notify(Game.time + ' Room '+ name + ' In Emergency Mode!!');
            console.log('Emergency Activated');
            theRoom.memory.emergency = true;
            delete theRoom.memory.assignedSources;
            var miner = require('spawn.miner');
            miner.setup();

        }
        if ((list.length >= 5 && miners > 0) && theRoom.memory.emergency) {
            Game.notify(Game.time + ' Room ' + name + ' No Longer in Emergency Mode');
            console.log('Emergency Deactivated');
            theRoom.memory.emergency = false;
            delete theRoom.memory.emergency;
        }
        if (theRoom.memory.emergency) {
            console.log('We have ' + list.length + ' total creeps still in emergency mode');
        }
        // If the room sources need resetting
        if (theRoom.memory.sourceReset) {
            Game.notify(Game.time + ' Room ' + name + ' Resetting mining sources');
            console.log('Resetting Room Sources');
            var miner = require('spawn.miner');
            miner.setup();
            Game.notify(Game.time + ' Room ' + name + ' Sources reset successfully.');
            console.log('Room sources reset successfully');
            delete theRoom.memory.sourceReset;
        }

        msg += ' [' + name + ':' + Game.rooms[name].energyAvailable + ']';
    }
    console.log('Counter used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    return msg;
}
