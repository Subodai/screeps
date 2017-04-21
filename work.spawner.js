/*
 * The almighty Spawner!
 */

var miner = require('role.miner');
var minerSpawn = require('spawn.miner');
var extractor = require('role.extractor');
var extractorSpawn = require('spawn.extractor');

var spawner = {
    run: function(debug = false) {
        var _cpu = Game.cpu.getUsed();
        if (debug) { console.log('Running Spawner'); }
        var desired = require('settings.desired');

        if (Game.flags.scout && desired.SpawnScouts) {
            console.log('We have a flag, run scout spawner');
            var scoutSpawn = require('spawn.scout');
            if (scoutSpawn.run(debug)) {
                console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                return;
            }
        }

        // Can we spawn miners?
        for (var name in Game.rooms) {
            if (Game.rooms[name].memory.guard) {
                if (debug) { console.log('Room in Guard mode halting all other spawns'); }
                var guardSpawn = require('spawn.guard');
                guardSpawn.run(debug);
                console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                return;
            }

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

            if (desired.SpawnExtractors && Game.rooms[name].energyAvailable >= extractor.energyCost) {
                if (debug) { console.log('Enough Energy for Extractor Spawn'); }
                if (extractorSpawn.run(debug)) {
                    console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                    return;
                }
            }

            if (desired.SpawnHarvesters) {
                var spawner = require('spawn.harvester');
                if (spawner.run(debug)) {
                    console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                    return;
                }
            }

            if (desired.SpawnUpgraders) {
                var spawner = require('spawn.upgrader');
                if (spawner.run(debug)) {
                    console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                    return;
                }
            }

            var _Spawner = Game.spawns['Sub1'];
            var sites = Game.rooms[name].find(FIND_CONSTRUCTION_SITES);

            if (desired.SpawnBuilders && sites.length > 0) {
                var spawner = require('spawn.builder');
                if (spawner.run(debug)) {
                    console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                    return;
                }
            }

            if (desired.SpawnMovers) {
                var moverSpawn = require('spawn.mover');
                if (moverSpawn.run(debug)) {
                    console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
                    return;
                }
            }

            if (debug) { console.log('Not Enough Energy for Active Spawns'); }
        }

        console.log('Spawner used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    }
}
module.exports = spawner;
