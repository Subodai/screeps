/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('movement.creeps');
 * mod.thing == 'a thing'; // true
 */
/**
 * Creep Movement Handling
 */
module.exports.run = function(debug = false) {

    if (debug) {
        var _cpu = Game.cpu.getUsed();
        console.log('Running Creep Movement ');
    }
    //TODO Wrap these in ifs based on if they exist

    var SmlMover = require('movement.small');
    SmlMover.run(debug);
    if (debug) {
        console.log('S Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var MedMover = require('movement.medium');
    MedMover.run(debug);
    if (debug) {
        console.log('M Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
        _cpu = Game.cpu.getUsed();
    }

    var BigMover = require('movement.big');
    BigMover.run(debug);
    if (debug) {
        console.log('B Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
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
        console.log('G Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
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
        console.log('Mo Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    }
}
