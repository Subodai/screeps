var despawner = require('work.despawner');
var spawner   = require('work.spawner');
var movement  = require('movement.creeps');
var cleaner   = require('work.cleaner');
var turret    = require('work.turret');
var turret2   = require('work.turret2');

module.exports.loop = function () {
    var msg = 'CPU:{' + Game.cpu.tickLimit + '} ' + '{' +  Game.cpu.bucket + '}'
    var debug = false;
    despawner.run(debug);
    cleaner.run(debug);
    countCreeps();
    spawner.run(debug);
    movement.run(debug);
    turret.run(debug);
    turret2.run(debug);
    console.log(msg + ' {' + Game.cpu.getUsed().toFixed(3) + '}');
}

function countCreeps() {
    var n = Game.time.toString().slice(-1);
    if (n == 0 || n == 5) {
        var counter = require('work.counter');
        counter.run();
    }
}
