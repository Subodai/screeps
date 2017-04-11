module.exports.run = function (debug = false) {
    var towers = Game.spawns.Sub1.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_TOWER && structure.energy > 0
    });

    if(towers.length > 0) {
        var tower = towers[0];
        if(tower && tower.energy >= 10) {

            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                console.log('running attack');
                Game.notify(Game.time + ' Turret Attacking Hostiles');
                tower.attack(closestHostile);
                return;
            }

            // Keep 200 in reserve for attackers
            if (tower.energy >= 400) {
                // First lets find the closest container
                var closestDamagedContainer = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.hits < structure.hitsMax
                });
                if(closestDamagedContainer) {
                    //console.log('running container repair');
                    tower.repair(closestDamagedContainer);
                    return;
                } else {
                    var closestDamagedRoad = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax
                    });
                    if (closestDamagedRoad) {
                        //console.log('running road repair');
                        tower.repair(closestDamagedRoad);
                        return;
                    }
                }
            }
        }
    }
}
