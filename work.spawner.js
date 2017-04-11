/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('work.spawner');
 * mod.thing == 'a thing'; // true
 */
var smallCost = 300;
var midCost = 450;
var bigCost = 650;

var miner = require('role.miner');

var spawner = {
    run: function(debug = false) {
        var _cpu = Game.cpu.getUsed();
        if (Game.time % 5 == 0) {
            if (debug) { console.log('Running Spawner'); }
            var desired = require('settings.desired');

            // Can we spawn miners?
            for (var name in Game.rooms) {
                if (Game.rooms[name].memory.guard) {
                    if (debug) { console.log('Room in Guard mode halting all other spawns'); }
                    var guardSpawn = require('spawn.guard');
                    guardSpawn.run(debug);
                    console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                    return;
                }
                var minerSpawn = require('spawn.miner');
                if (desired.SpawnMiners && Game.rooms[name].energyAvailable >= miner.energyCost) {
                    if (debug) { console.log('Enough Energy for Miner Spawn'); }
                    if (minerSpawn.run(debug)) {
                        console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                        return;
                    }
                }
                var needed = Game.rooms[name].memory.minersNeeded;
                var got = minerSpawn.count();

                if ((needed > got) && !Game.rooms[name].memory.emergency) {
                    if (debug) {  console.log('Halting other spawns because miners needed'); }
                    console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                    return;
                }
            }
            // Run the loops
            for (var name in Game.rooms) {
                if (desired.SpawnMovers) {
                    var moverSpawn = require('spawn.mover');
                    if (moverSpawn.run(debug)) {
                        console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                        return;
                    }
                }
                if (desired.SpawnBig && Game.rooms[name].energyAvailable >= bigCost) {
                    if (debug) { console.log('Enough Energy for Big Spawn'); }
                    var bigSpawner = require('spawn.big');
                    if (bigSpawner.run(debug)) {
                        console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                        return;
                    }
                }
                if (desired.SpawnMid && Game.rooms[name].energyAvailable >= midCost) {
                    if (debug) { console.log('Enough Energy for Mid Spawn'); }
                    var midSpawner = require('spawn.mid');
                    if (midSpawner.run(debug)) {
                        console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                        return;
                    }
                }
                if (desired.SpawnSml && Game.rooms[name].energyAvailable >= smallCost) {
                    if (debug) { console.log('Enough Energy for Small Spawn'); }
                    var smallspawner = require('spawn.small');
                    smallspawner.run(debug);
                    console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                    return;
                }
                if (debug) { console.log('Not Enough Energy for Active Spawns'); }
            }
        }
        console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    }
}
module.exports = spawner;
