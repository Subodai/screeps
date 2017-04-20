/**
 * Creep Movement Handling
 */
module.exports.run = function(debug = false) {

    if (debug) {
        var _cpu = Game.cpu.getUsed();
        console.log('Running Creep Movement ');
    }
    //TODO Wrap these in ifs based on if they exist
    if (global.movement == 'new') {
        for (var i in global.roles) {
            var role = global.roles[i];
            var worker = require('movement.worker');
            worker.run(role,debug);
            if (debug) {
                console.log(role + ' Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
            }
        }

        return;
    }
    

    // Run all harvesters
    var harvester = require('movement.harvester');
    harvester.run(debug);
    if (debug) {
        console.log('Ha Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var MinerMover = require('movement.miner');
    MinerMover.run(debug);
    if (debug) {
        console.log('Mi Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var ExtractorMover = require('movement.extractor');
    ExtractorMover.run(debug);
    if (debug) {
        console.log('Ex Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var GuardMover = require('movement.guard');
    GuardMover.run(debug);
    if (debug) {
        console.log('Ga Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var ScoutMover = require('movement.scout');
    ScoutMover.run(debug);
    if (debug) {
        console.log('Sc Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var Mover = require('movement.mover');
    Mover.run(debug);
    if (debug) {
        console.log('Mo Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var upgrader = require('movement.upgrader');
    upgrader.run(debug);
    if (debug) {
        console.log('Up Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var builder = require('movement.builder');
    builder.run(debug);
    if (debug) {
        console.log('Bu Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }
}
