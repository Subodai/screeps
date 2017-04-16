var towerRunner = require('role.tower');
/*
 * Tower Handler
 */
module.exports.run = function (debug = false) {
    // Find our towers
    var towers = Game.spawns.Sub1.room.find(FIND_MY_STRUCTURES, {
        filter: (i) => i.structureType == STRUCTURE_TOWER && i.energy > 0
    });
    // Do we even have any?
    if(towers.length > 0) {
        // Loop
        for (var i=0;i<=towers.length-1;i++) {
            var tower = towers[i];
            towerRunner.run(tower, debug);
        }
    }
}
