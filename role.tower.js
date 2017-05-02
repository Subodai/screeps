/*
 * Tower Actions handler
 */
module.exports.run = function (tower, debug = false) {

    // If we have less than 10 energy, just don't bother
    if (tower.energy < 10) {
        return;
    }

    // First let's check for hostiles as they are the priority
    var hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (i) => !(global.napList.indexOf(i.owner.username) > -1)
    });
    if (hostile) {
        console.log('Tower Running Attack');
        Game.notify(Game.time + ' Tower ' + tower.id + ' Attacking Hostiles in room ' + tower.room);
        tower.attack(hostile);
        return;
    }

    // Always ensure that 1 hit ramparts get a quick zap
    if (tower.energy >= 100) {
        // Get the closest rampart with only 1 hit left
        var rampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => (i.structureType == STRUCTURE_RAMPART || i.structureType == STRUCTURE_WALL) && i.hits == 1
        });
        // Did we find one?
        if (rampart) {
            // Repair it
            tower.repair(rampart);
            // STAHP
            return;
        }
    }

    // We don't have loads of spare energy, can we repair some containers?
    if (tower.energy >= 400) {
        // First lets try containers since they decay
        var target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.hits < i.hitsMax
        });

        // Did we get one?
        if (!target) {
            // Nope okay, lets try a road
            var target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits < i.hitsMax
            });
        }

        // So did we find a target?
        if (target) {
            tower.repair(target);
            return;
        }
    }

    // Alright, no hostiles.. lets see what energy we have
    // If we're idling with 800 energy, lets make sure all ramparts have been repaired at least once
    if (tower.energy >= 800) {
        // Get the closest rampart with only 300 hit left
        var rampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => (i.structureType == STRUCTURE_RAMPART || i.structureType == STRUCTURE_WALL) && i.hits <= 300
        });

        // No single hit ramparts, okay, any with less than global.rampartMax/4 hits?
        if (!rampart) {
            // First lets find the closest rampart
            var rampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART || i.structureType == STRUCTURE_WALL) && i.hits < (global.rampartMax/4)
            });
        }

        // Still none? okay find any with less than global.rampartMax
        if (!rampart) {
            // First lets find the closest rampart
            var rampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_RAMPART || i.structureType == STRUCTURE_WALL) && i.hits < global.rampartMax
            });
        }

        // Still none wow our ramparts must be super energised! Lets get any that need reps
        // if (!rampart) {
        //     // First lets find the closest rampart
        //     var rampart = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        //         filter: (i) => i.structureType == STRUCTURE_RAMPART && i.hits < i.hitsMax
        //     });
        // }

        // Did we find one?
        if (rampart) {
            // Repair it
            tower.repair(rampart);
            // STAHP
            return;
        }
    }
}
