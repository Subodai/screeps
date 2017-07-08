
// Change to true to enable debugging
const DBG = false;
/**
 * Find and collect nearby energy
 *
 * @param useStorage bool
 * @param emergency bool
 * @param options object
 */
Creep.prototype.getNearbyEnergy = function(useStorage = false, emergency = false, options = {}) {
    // First, are we full?
    if (_.sum(this.carry) == this.carryCapacity) {
        DBG && console.log('[' + this.name + '] Creep Full Cannot Get Nearby Energy');
        // Clear our pickup target
        delete this.memory.energyPickup;
        return ERR_FULL;
    }
    // Storage override
    if (!this.memory.energyPickup) {
        if (useStorage && this.room.storage) {
            if (this.room.storage.store[RESOURCE_ENERGY] > 1000) {
                this.memory.energyPickup = this.room.storage.id;
            }
        }
    }
    if (!this.memory.energyPickup) {
        DBG && console.log('[' + this.name + '] Creep has no memory, finding stuff to pickup');
        // If this is an emergency we should be going for the terminal, then storage
        if (emergency) {
            // TODO EMPTY TERMINAL AND STORAGE HERE PLEASE
        }
        // Get dropped resources in the room
        var resources = this.room.find(FIND_DROPPED_RESOURCES, {
            filter: (i) => i.resourceType == RESOURCE_ENERGY && i.amount > (this.carryCapacity - _.sum(this.carry))
        });
        // Get Containers in the room
        var containers = this.room.find(FIND_STRUCTURES, {
            filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > (this.carryCapacity - _.sum(this.carry))
        });
        // False some things
        var resource = container = false;
        const thisCreep = this;
        // If we have resources
        if (resources.length > 0) {
            DBG && console.log('[' + this.name + '] Found ' + resources.length + ' resource piles');
            // Sort the resources
            resources.sort(function(a,b) {
                const aPerMove = a.amount / thisCreep.pos.getRangeTo(a);
                const bPerMove = b.amount / thisCreep.pos.getRangeTo(b);
                if (aPerMove > bPerMove) {
                    return -1;
                } else if (bPerMove > aPerMove) {
                    return 1;
                }
                return 0;
                // return (a.amount / thisCreep.pos.getRangeTo(a)) - (b.amoumt / thisCreep.pos.getRangeTo(b));
            });
            // Now get the nearest one
            var resource = resources[0];
        }
        // if we have containers
        if (containers.length > 0) {
            DBG && console.log('[' + this.name + '] Found ' + containers.length + ' containers');
            // Sort the containers
            containers.sort(function(a,b) {
                const aPerMove = a.store[RESOURCE_ENERGY] / thisCreep.pos.getRangeTo(a);
                const bPerMove = b.store[RESOURCE_ENERGY] / thisCreep.pos.getRangeTo(b);
                if (aPerMove > bPerMove) {
                    return -1;
                } else if (bPerMove > aPerMove) {
                    return 1;
                }
                return 0;
                // return thisCreep.pos.getRangeTo(a) - thisCreep.pos.getRangeTo(b);
            });
            var container = containers[0];
        }
        // If we have both we need to pick the closest one
        if (resource && container) {
            // If the resource is closer
            if (this.pos.getRangeTo(resource) < this.pos.getRangeTo(container)) {
                DBG && console.log('[' + this.name + '] Stored resource pile ' + resource.id + ' in creep memory');
                this.memory.energyPickup = resource.id;
            } else {
                DBG && console.log('[' + this.name + '] Stored container ' + container.id + ' in creep memory');
                this.memory.energyPickup = container.id;
            }
        } else if (resource) {
            DBG && console.log('[' + this.name + '] Stored resource pile ' + resource.id + ' in creep memory');
            this.memory.energyPickup = resource.id;
        } else if (container) {
            DBG && console.log('[' + this.name + '] Stored container ' + container.id + ' in creep memory');
            this.memory.energyPickup = container.id;
        }
        // Nothing found? lets try finding available sources
        if (!this.memory.energyPickup) {
            // Can this creep work?
            if (this.canWork()) {
                DBG && console.log('[' + this.name + '] Can work finding sources');
                const source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                    filter: function (i) {
                        if (i.energy > 0 || i.ticksToRegeneration < 10) {
                            const space = thisCreep.findSpaceAtSource(i);
                            return space;
                        } else {
                            return false;
                        }
                    }
                });
                if (source) {
                    DBG && console.log('[' + this.name + '] Stored Source ' + container.id + ' in creep memory');
                    this.memory.energyPickup = source.id;
                }
            }
        }
    }
    // Do we have a target?
    if (this.memory.energyPickup) {
        DBG && console.log('[' + this.name + '] Found Energy source in creeps memory ' + this.memory.energyPickup);
        // We do! let's grab it
        const target = Game.getObjectById(this.memory.energyPickup);
        if (options == {}) {
            var options = {
                visualizePathStyle: {
                    stroke: global.colourPickupRes,
                    opacity: global.pathOpacity
                },
                reusePath:this.pos.getRangeTo(target) // Use the range to the object we're after as the reusePath opt
            };
        }
        var pickupSuccess = true;
        // Alright what is it?
        if (target instanceof Resource) { // Resource
            DBG && console.log('[' + this.name + '] Target is a Resource');
            // Is there still enough of it?
            if (target.amount < (this.carryCapacity - _.sum(this.carry))) {
                DBG && console.log('[' + this.name + '] Resource no longer viable clearing memory');
                // Target has gone, clear memory
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.pos.getRangeTo(target) <= 1) {
                DBG && console.log('[' + this.name + '] Target should be in range, attempting pickup');
                // First attempt to pickitup
                if (this.pickup(target) == ERR_NOT_IN_RANGE) {
                    DBG && console.log('[' + this.name + '] Pickup failed');
                    var pickupSuccess = false;
                }
            } else {
                DBG && console.log('[' + this.name + '] Target not in range');
                var pickupSuccess = false;
            }

        } else if (target instanceof StructureContainer || target instanceof StructureStorage || target instanceof StructureTerminal) { // Container
            DBG && console.log('[' + this.name + '] Target is a Container, Storage, or Terminal');
            // Check the container still has the energy
            if (target.store[RESOURCE_ENERGY] < (this.carryCapacity - _.sum(this.carry))) {
                DBG && console.log('[' + this.name + '] Target no longer has enough energy clearing memory');
                // Clear memory and return invalid target
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.pos.getRangeTo(target) <= 1) {
                DBG && console.log('[' + this.name + '] Target should be in range, attempting withdraw');
                // Lets attempt to withdraw
                if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    DBG && console.log('[' + this.name + '] Withdraw failed');
                    var pickupSuccess = false;
                }
            } else {
                DBG && console.log('[' + this.name + '] Target not in range');
                var pickupSuccess = false;
            }
        } else if (target instanceof Source) { // Source
            // Does it still have energy ?
            if (target.energy == 0) {
                DBG && console.log('[' + this.name + '] Source no longer has energy, clearing memory');
                // no clear the memory
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Check for space
            if (!this.findSpaceAtSource(target)) {
                DBG && console.log('[' + this.name + '] Source no longer has space, clearing memory');
                // no clear the memory
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.pos.getRangeTo(target) <= 1) {
                DBG && console.log('[' + this.name + '] Target should be in range, attempting harvest');
                // Alright lets try harvesting it
                if (this.harvest(target) == ERR_NOT_IN_RANGE) {
                    DBG && console.log('[' + this.name + '] Harvest failed');
                    var pickupSuccess = false;
                }
            } else {
                DBG && console.log('[' + this.name + '] Target not in range');
                var pickupSuccess = false;
            }
        } else {
            // Something went wrong, or what we wanted to pickup has disapeared...
            delete this.memory.energyPickup;
            return ERR_INVALID_TARGET;
        }
        // Did we successfully pick up the thing
        if (pickupSuccess) {
            DBG && console.log('[' + this.name + '] Successfully gathered resources');
            this.say(global.sayWithdraw);
            // Are we now full?
            if (this.carry.energy == this.carryCapacity) {
                DBG && console.log('[' + this.name + '] Creep is now full clearing pickup memory');
                // Alright we're full clear memory and return full
                delete this.memory.energyPickup;
                return ERR_FULL;
            }
            // Just return OK, we're not full yet
            return OK;
        } else {
            DBG && console.log('[' + this.name + '] Moving closer to target');
            // We probably need to move
            this.moveTo(target, options);
            // Say!
            this.say(global.sayMove);
            return OK;
        }
    }
}


Creep.prototype.deliverEnergy = function() {
    DBG && console.log('[' + this.name + '] Creep attempting to deliver energy');
    // First of all are we empty?
    if (_.sum(creep.carry) == 0) {
        delete this.memory.deliveryTarget;
        return ERR_NOT_ENOUGH_RESOURCES;
    }

    if (creep.carry.energy == 0) {

    }
}

/**
 * Check if a creep can work and store it in it's memory
 */
Creep.prototype.canWork = function() {
    // Has this creep already been flagged as a worker? and at full health (if it's been hit we should check it's parts again)
    if (!this.memory.canWork && this.hits == this.hitsMax) {
        // If we got hit, clear the memory
        if (this.hits != this.hitsMax) { delete this.memory.canWork; }
        // Check the body parts
        for (const i in this.body) {
            // Is this a work part?
            if (this.body[i].type == WORK && this.body[i].hits > 0) {
                // YES set flag and break
                this.memory.canWork = 'yes';
                break;
            }
        }
        // Is it set at this point?
        if (!this.memory.canWork) {
            // Set it to no
            this.memory.canWork = 'no';
        }
    }
    // Can this creep work?
    return this.memory.canWork == 'yes';
}


Creep.prototype.findSpaceAtSource = function(source) {
    // Make sure to initialise the source's last check memory
    if (!source.memory.lastSpaceCheck) {
        source.memory.lastSpaceCheck = 0;
    }
    // If we checked the space this tick and there's no space left, we don't need to check again we just need to decrement the spaces
    if (source.memory.lastSpaceCheck == Game.time) {
        if (source.memory.spaces == 0) {
            return false
        } else {
            // Decrement the spaces left
            source.memory.spaces = source.memory.spaces -1;
            return true;
        }
    }
    var spaces = 0;
    const n  = new RoomPosition(source.pos.x,   source.pos.y-1, source.pos.roomName);
    if (this.checkEmptyAtPos(n,  this)) { spaces++; }
    const ne = new RoomPosition(source.pos.x+1, source.pos.y-1, source.pos.roomName);
    if (this.checkEmptyAtPos(ne, this)) { spaces++; }
    const e  = new RoomPosition(source.pos.x+1, source.pos.y,   source.pos.roomName);
    if (this.checkEmptyAtPos(e,  this)) { spaces++; }
    const se = new RoomPosition(source.pos.x+1, source.pos.y+1, source.pos.roomName);
    if (this.checkEmptyAtPos(se, this)) { spaces++; }
    const s  = new RoomPosition(source.pos.x,   source.pos.y+1, source.pos.roomName);
    if (this.checkEmptyAtPos(s,  this)) { spaces++; }
    const sw = new RoomPosition(source.pos.x-1, source.pos.y+1, source.pos.roomName);
    if (this.checkEmptyAtPos(sw, this)) { spaces++; }
    const w  = new RoomPosition(source.pos.x-1, source.pos.y,   source.pos.roomName);
    if (this.checkEmptyAtPos(w,  this)) { spaces++; }
    const nw = new RoomPosition(source.pos.x-1, source.pos.y-1, source.pos.roomName);
    if (this.checkEmptyAtPos(nw, this)) { spaces++; }
    // Set our memory
    source.memory.lastSpaceCheck = Game.time;
    source.memory.spaces = spaces;
    // If it's 0 there's no space
    if (source.memory.spaces == 0) {
        return false;
    } else {
        // If it's not 0, there is a space, lets take one off our count and return true
        // Decrement the spaces left
        source.memory.spaces = source.memory.spaces -1;
        return true;
    }
}

Creep.prototype.checkEmptyAtPos = function(pos) {
    const terrain = Game.map.getTerrainAt(pos);
    if (terrain == 'wall') {
        return false;
    } else {
        let creeps = pos.lookFor(LOOK_CREEPS);
        if (creeps.length == 0) {
            return true;
        } else {
            // is this, the creep we're trying to find a space for
            if (creeps[0] == this) {
                return true;
            }
        }
    }
}

Creep.prototype.roadCheck = function(work = false) {
    var road = site = flag = false;
    let obj = this.room.lookForAt(LOOK_STRUCTURES, this.pos);
    if (obj.length > 0) {
        for (let i in obj) {
            if (obj[i].structureType == STRUCTURE_ROAD) {
                road = obj[i];
                break;
            }
        }
    }
    if (road && work && this.carry.energy > 0) {
        if (road.hits < road.hitsMax) {
            this.repair(road);
            this.say(global.sayRepair);
            return;
        }
    }
    // No road?
    if (!road) {
        // Check for construction sites
        let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.pos);
        if (sites.length > 0) {
            if (sites[0].structureType == STRUCTURE_ROAD) {
                site = sites[0];
            }
        }
    }
    if (site && work && this.carry.energy > 0) {
        this.build(site);
        this.say(global.sayBuild);
        return;
    }
    // No site?
    if (!site) {
        // Check for flag
        let flags = creep.room.lookForAt(LOOK_FLAGS, this.pos);
        if (flags.legnth > 0) {
            flag = flags[0];
        }
    }
    if (!flag && global.seedRemoteRoads === true) { this.pos.createFlag();}
}

Creep.prototype.containerCheck = function() {

}
