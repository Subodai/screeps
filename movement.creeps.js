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
    var _cpu = Game.cpu.getUsed();
    if (debug) { console.log('Running Creep Movement '); }
    //TODO Wrap these in ifs based on if they exist

    var SmlMover = require('movement.small');
    SmlMover.run(debug);
    console.log('S Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    _cpu = Game.cpu.getUsed();

    var MedMover = require('movement.medium');
    MedMover.run(debug);
    console.log('M Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    _cpu = Game.cpu.getUsed();

    var BigMover = require('movement.big');
    BigMover.run(debug);
    console.log('B Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    _cpu = Game.cpu.getUsed();

    var MinerMover = require('movement.miner');
    MinerMover.run(debug);
    console.log('Mi Move used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    _cpu = Game.cpu.getUsed();

    var GuardMover = require('movement.guard');
    GuardMover.run(debug);
    console.log('G Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    _cpu = Game.cpu.getUsed();

    var Mover = require('movement.mover');
    Mover.run(debug);
    console.log('Mo Move  used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
}
