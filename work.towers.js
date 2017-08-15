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
        const links = _room.find(FIND_MY_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_LINK && i.memory.linkType == 'receiver' && i.energy <= i.energyCapacity*0.25
        });
        if (links.length > 0) {
            for (let l in links) {
                const a = Game.cpu.getUsed();
                const link = links[l];
                // Find the storage link
                const sourceLinks = link.room.find(FIND_MY_STRUCTURES, {
                    filter: (i) => i.structureType == STRUCTURE_LINK && i.memory.linkType == 'storage' && i.energy >= i.energyCapacity*0.5 && i.cooldown == 0
                });
                // Any available?
                if (sourceLinks.length > 0) {
                    let fromLink = sourceLinks[0];
                    fromLink.transferEnergy(link,fromLink.energy);
                }
                const cost = Game.cpu.getUsed() - a;
                this.colour(link,cost);
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
    /* Remove comment to show tower coverage
    .rect(tower.pos.x - 20, tower.pos.y - 20, 40, 40, {
        stroke: 'white',
        lineStyle: 'dashed',
        opacity: 0.01,
        fill: color,
        strokeWidth: 0.2
    }).rect(tower.pos.x - 15, tower.pos.y - 15, 30, 30, {
        stroke: 'white',
        lineStyle: 'dashed',
        opacity: 0.01,
        fill: color,
        strokeWidth: 0.2
    }).rect(tower.pos.x - 10, tower.pos.y - 10, 20, 20, {
        stroke: 'white',
        lineStyle: 'dashed',
        opacity: 0.01,
        fill: color,
        strokeWidth: 0.2
    }).rect(tower.pos.x - 5, tower.pos.y - 5, 10, 10, {
        stroke: 'white',
        strokeWidth: 0.2,
        lineStyle: 'dashed',
        opacity: 0.01,
        fill: color
    });*/
}
