var towerRunner = require('role.tower');
/*
 * Tower Handler
 */
module.exports.run = function (debug = false) {
    // Loop through all spawns
    for (const i in Game.rooms) {
        const _room = Game.rooms[i];
        // Find our towers
        const towers = _room.find(FIND_MY_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_TOWER && i.energy > 0
        });
        // Do we even have any?
        if(towers.length > 0) {
            // Loop through them all
            for (let i in towers) {
                const a = Game.cpu.getUsed();
                const tower = towers[i];
                towerRunner.run(tower, debug);
                const cost = Game.cpu.getUsed() - a;
                this.colour(tower,cost);
            }
        }
    }
}
module.exports.colour = function (tower, cost) {
    tower.room.visual.text(tower.energy + ' : ' + cost.toFixed(2), tower.pos, {
        color:'#ffffff',
        font:0.5,
        align:'center',
        stroke:'rgba(0,0,0,0.5)',
    });
}
