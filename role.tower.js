/*
 * Tower Actions handler
 */
module.exports.run = function (tower, debug = false) {

    // If we have less than 10 energy, just don't bother
    if (tower.energy < 10) { return; }

    // First let's check for hostiles as they are the priority
    var hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (i) => !(global.friends.indexOf(i.owner.username) > -1)
    });

    // Did we find a valid hostile?
    if (hostile) {
        console.log('Tower Running Attack');
        // We only really need an alert when the tower is attacking something that's not an invader
        if (hostile.owner.username !== 'Invader') {
            Game.notify(Game.time + ' Tower ' + tower.id + ' Attacking ' + hostile.owner.username + 's creep in ' + tower.room);
        }
        // Run the attack
        tower.attack(hostile);
        // Don't do anything else
        return;
    }

    // Check for any injured creeps
    const injured = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: (i) => i.hits < i.hitsMax
    });

    if (injured) {
        tower.heal(injured);
        return;
    }

    if (TOWER_REPAIR === true) {
        // Always ensure that 1 hit ramparts get a quick zap
        if (tower.energy >= 100) {
            var rampart = false;
            // Get the closest rampart with only 1 hit left
            rampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => (i.structureType === STRUCTURE_RAMPART || i.structureType === STRUCTURE_WALL) && i.hits == 1
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
            var target = false;
            // First lets try containers since they decay
            target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => i.structureType === STRUCTURE_CONTAINER && i.hits < i.hitsMax
            });

            // Did we get one? // Lets not do roads just now
            if (!target) {
                // Nope okay, lets try a road
                target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (i) => i.structureType === STRUCTURE_ROAD && i.hits < i.hitsMax
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
        if (tower.energy >= 600) {
            var targets = [];
            // Get the closest rampart with only 300 hit left
            targets = tower.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType === STRUCTURE_RAMPART || i.structureType == STRUCTURE_WALL) && i.hits <= 300
            });

            // No single hit ramparts, okay, any with less than RAMPART_MAX/4 hits?
            if (targets.length === 0) {
                // First lets find the closest rampart
                targets = tower.room.find(FIND_STRUCTURES, {
                    filter: (i) => (i.structureType === STRUCTURE_RAMPART && i.hits < RAMPART_MAX/4) || (i.structureType == STRUCTURE_WALL && i.hits < WALL_MAX/4)
                });
            }

            // Still none? okay find any with less than RAMPART_MAX
            if (targets.length === 0) {
                // First lets find the closest rampart
                targets = tower.room.find(FIND_STRUCTURES, {
                    filter: (i) => (i.structureType === STRUCTURE_RAMPART && i.hits < RAMPART_MAX) || (i.structureType == STRUCTURE_WALL && i.hits < WALL_MAX)
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
            if (targets) {
                let target = _.min(targets, (t) => { return t.hits; });
                // Repair it
                tower.repair(target);
                // STAHP
                return;
            }
        }
    } else {
        if (tower.energy >= 400) {
            var targets = {};
            // Nope okay, lets try a road
            targets = tower.room.find(FIND_STRUCTURES, {
                filter: (i) => i.structureType === STRUCTURE_ROAD && i.hits < i.hitsMax/4
            });

            // So did we find a target?
            if (targets.length > 0) {
                this.visuals(targets, tower.room.name, debug);
                // Sort by hits (may need to check this)
                targets.sort((a,b) => a.hits - b.hits);
                var target = targets[0];
                tower.repair(target);
                return;
            }
        }
    }
}


module.exports.visuals = function (items, room, debug = false) {
    const _room = Game.rooms[room];
    // _room.visual.clear();
    for (let i in items) {
        let item = items[i];
        var percent = 0;
        if(item.structureType == STRUCTURE_RAMPART) {
            percent = (item.hits/RAMPART_MAX)*100;
        } else if (item.structureType == STRUCTURE_WALL) {
            percent = (item.hits/WALL_MAX)*100;
        } else {
            percent = (item.hits/item.hitsMax)*100;
        }

        let r = Math.round(255 - ((255/100)*(percent/100)*100));
        let g = Math.round((255/100)*(percent/100)*100);
        let b = 0;
        let _color = '#' + hex(r) + hex(g) + hex(b);
        _room.visual.circle(item.pos, {
            fill: _color,
            radius:0.35,
            opacity:0.05,
            stroke:_color
        }).text(percent + '%', item.pos, {
            color:_color,
            font:0.5,
            align:'left',
            stroke:'rgba(0,0,0,0.5)',
            opacity:0.6,
        });
    }
}
