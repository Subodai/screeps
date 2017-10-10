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
        // Only enable the links when they are enabled in the room (i.e above 400k)
        if (_room.memory.links) {
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
                        // reset nearby upgraders and supergraders pickup target so they don't wander off forever
                        // Get our creeps
                        let workers = _room.find(FIND_MY_CREEPS, {
                            filter: (c) => c.memory && (c.memory.role === 'upgrader' || c.memory.role === 'supergrader') && (!(Game.getObjectById(c.memory.energyPickup) instanceof StructureLink))
                        });
                        if (workers.length > 0) {
                            // loop through them
                            for (let i in workers) {
                                // delete their energyPickup target
                                delete workers[i].memory.energyPickup;
                            }
                        }
                    }
                    const cost = Game.cpu.getUsed() - a;
                    this.colour(link,cost);
                }
            }
        }
    }
}
module.exports.colour = function (tower, cost) {

    let percent = (tower.energy / tower.energyCapacity)*100;

    let r = Math.round(255 - ((255/100)*(percent/100)*100));
        let g = Math.round((255/100)*(percent/100)*100);
        let b = 0;
        let _color = "#" + hex(r) + hex(g) + hex(b);
        // _room.visual.circle(item.pos, {
        //     fill: _color,
        //     radius:0.35,
        //     opacity:0.05,
        //     stroke:_color
        // }).text(percent.toFixed(2) + "%", item.pos, {
        //     color:_color,
        //     font:0.5,
        //     align:"left",
        //     stroke:"rgba(0,0,0,0.5)",
        //     opacity:0.6,
        // });

    tower.room.visual.text(tower.energy, tower.pos, {
        color:_color,
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
