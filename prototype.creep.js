
// Change to true to enable debugging
const DBG = false;

/*
 * Is a Creep Spawning or fatigued?
 * In other words can it do anything this tick?
 */
Creep.prototype.isTired = function() {
    return this.spawning || this.fatigue > 0;
}
/**
 * Find and collect nearby energy
 *
 * @param useStorage bool
 * @param emergency bool
 */
Creep.prototype.getNearbyEnergy = function(useStorage = false, emergency = false) {
    // First, are we full?
    if (_.sum(this.carry) === this.carryCapacity) {
        DBG && console.log('[' + this.name + '] Creep Full Cannot Get Nearby Energy');
        // Clear our pickup target
        delete this.memory.energyPickup;
        return ERR_FULL;
    }
    // Are we near a link with memory of receiver limit to only upgraders or supergraders, otherwise refillers become.. interesting
    if (!this.memory.energyPickup && (this.memory.role === 'upgrader' || this.memory.role === 'supergrader')) {
        DBG && console.log('[' + this.name + '] Checking for Links');
        // If we're in our own room, with our own controller, above level 5 (should have links)
        if (this.room.controller && this.room.controller.my && this.room.controller.level >= 5) {
            DBG && console.log('[' + this.name + '] Links available');
            // Lets find the nearest link with energy that has the right flag
            var links = this.room.find(FIND_STRUCTURES, {
                filter: (i) => i.structureType === STRUCTURE_LINK && i.memory.linkType === 'receiver' && i.energy > 0 && i.pos.inRangeTo(this,7)
            });
            if (links.length > 0) {
                // Temporary creep object
                let thisCreep = this;
                // get the nearest one
                let link = _.min(links, function(l) { return thisCreep.pos.getRangeTo(l); });
                // Set it to memory
                this.memory.energyPickup = link.id;
            }
        }
    }

    // Storage override
    if (!this.memory.energyPickup) {
        // Only pull from Terminal if we aren't prioritising it
        if (useStorage && this.room.terminal && (!this.room.memory.prioritise || this.room.memory.prioritise !== 'terminal')) {
            if (this.room.terminal.store[RESOURCE_ENERGY] > (this.carryCapacity - _.sum(this.carry))/4) {
                this.memory.energyPickup = this.room.terminal.id;
            }
        }

        if (!this.memory.energyPickup) {
            if (useStorage && this.room.storage && (!this.room.memory.prioritise || this.room.memory.prioritise !== 'storage')) {
                if (this.room.storage.store[RESOURCE_ENERGY] > (this.carryCapacity - _.sum(this.carry))/4) {
                    this.memory.energyPickup = this.room.storage.id;
                }
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
            filter: (i) => i.resourceType === RESOURCE_ENERGY && i.amount > (this.carryCapacity - _.sum(this.carry))/4
        });
        // Get Containers in the room
        var containers = this.room.find(FIND_STRUCTURES, {
            filter: (i) => i.structureType === STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > (this.carryCapacity - _.sum(this.carry))/4
        });
        // False some things
        var resource = container = false;
        const thisCreep = this;
        // If we have resources
        if (resources.length > 0) {
            DBG && console.log('[' + this.name + '] Found ' + resources.length + ' resource piles');
            resource = _.max(resources, (r) => { return r.amount / thisCreep.pos.getRangeTo(r); });
        }
        // if we have containers
        if (containers.length > 0) {
            DBG && console.log('[' + this.name + '] Found ' + containers.length + ' containers');
            container = _.max(containers, (c) => { return c.store[RESOURCE_ENERGY] / thisCreep.pos.getRangeTo(c); })
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
        var pickupSuccess = true;
        // Alright what is it?
        if (target instanceof Resource) { // Resource
            DBG && console.log('[' + this.name + '] Target is a Resource');
            // Is there still enough of it?
            if (target.amount < (this.carryCapacity - _.sum(this.carry))/4) {
                DBG && console.log('[' + this.name + '] Resource no longer viable clearing memory');
                // Target has gone, clear memory
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.pos.inRangeTo(target,1)) {
                DBG && console.log('[' + this.name + '] Target should be in range, attempting pickup');
                // First attempt to pickitup
                if (this.pickup(target) === ERR_NOT_IN_RANGE) {
                    DBG && console.log('[' + this.name + '] Pickup failed');
                    var pickupSuccess = false;
                }
            } else {
                DBG && console.log('[' + this.name + '] Target not in range');
                var pickupSuccess = false;
            }

        } else if (target instanceof StructureContainer || target instanceof StructureStorage || target instanceof StructureTerminal) { // Container, Storage, Terminal
            DBG && console.log('[' + this.name + '] Target is a Container, Storage, or Terminal');
            // Check the container still has the energy
            if (target.store[RESOURCE_ENERGY] < (this.carryCapacity - _.sum(this.carry))/4) {
                DBG && console.log('[' + this.name + '] Target no longer has enough energy clearing memory');
                // Clear memory and return invalid target
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.pos.inRangeTo(target,1)) {
                DBG && console.log('[' + this.name + '] Target should be in range, attempting withdraw');
                // Lets attempt to withdraw
                if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    DBG && console.log('[' + this.name + '] Withdraw failed');
                    var pickupSuccess = false;
                }
            } else {
                DBG && console.log('[' + this.name + '] Target not in range');
                var pickupSuccess = false;
            }
        } else if (target instanceof StructureLink) { // Link
            DBG && console.log('[' + this.name + '] Target is a Link');
            // Check the container still has the energy
            if (target.energy == 0) {
                DBG && console.log('[' + this.name + '] Target no longer has enough energy clearing memory');
                // Clear memory and return invalid target
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.pos.inRangeTo(target,1)) {
                DBG && console.log('[' + this.name + '] Target should be in range, attempting withdraw');
                // Lets attempt to withdraw
                if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
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
            if (this.pos.inRangeTo(target,1)) {
                DBG && console.log('[' + this.name + '] Target should be in range, attempting harvest');
                // Alright lets try harvesting it
                if (this.harvest(target) === ERR_NOT_IN_RANGE) {
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
            if (this.carry.energy === this.carryCapacity) {
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
            this.travelTo(target);
            // Say!
            this.say(global.sayMove);
            return OK;
        }
    }
}

Creep.prototype.getNearbyMinerals = function(storage = false) {
    // First are we full?
    if (this.full()) {
        DBG && console.log('[' + this.name + '] Creep Full Cannot Get Nearby Minerals');
        // Clear the pickup target
        this.invalidateMineralTarget(true);
    }
    if (!this.memory.mineralPickup && storage) { this.findStorageMinerals(); }
    // Start with ground minerals
    if (!this.memory.mineralPickup) { this.findGroundMinerals(); }
    // Next Container Minerals
    if (!this.memory.mineralPickup) { this.findContainerMinerals(); }
    // Do we have a target?
    if (this.memory.mineralPickup) { return this.moveToAndPickupMinerals(); }
    // No target return not found
    return ERR_NOT_FOUND;
}

Creep.prototype.moveToAndPickupMinerals = function() {
    DBG && console.log('[' + this.name + '] Found minerals in memory');
    let target = Game.getObjectById(this.memory.mineralPickup);
    // if the target is invalid, or cannot be found let's clear it
    if (!target) { return this.invalidateMineralTarget(); }
    // Quick validation pass on the target
    if (target instanceof Resource) {
        // If it's going to disapwn before we get there, then there's no point in carrying on
        if (target.amount < (this.pos.getRangeTo(target) / this.moveEfficiency())) {
            return this.invalidateMineralTarget();
        }
        // Can we pick it up yet?
        if (!this.canPickup(target)) {
            this.say(global.sayMove);
            // We can't pick it up yet, let's move to it
            this.travelTo(target);
        }
        // Can we pick it up after our move?
        if (this.canPickup(target)) {
            // Attempt to pick it up
            let pickupResult = this.pickup(target);
            // Check the result
            if (pickupResult === ERR_NOT_IN_RANGE) {
                // something went wrong
            } else if (pickupResult === OK) {
                this.say(global.sayPickup);
                // Invalidate and return full
                return this.invalidateMineralTarget(true);
            }
        }
    } else if (target instanceof StructureContainer || target instanceof StructureStorage) {
        // Check there is still res in the container
        if (_.sum(target.store) - target.store[RESOURCE_ENERGY] === 0) {
            return this.invalidateMineralTarget();
        }
        // Can we pick it up yet?
        if (!this.canPickup(target)) {
            this.say(global.sayMove);
            // Can't pick it up yet, so lets move towards it
            this.travelTo(target);
        }
        // Can we pick it up now?
        if (this.canPickup(target)) {
            // Loop through all the resources in the container
            for (let res in target.store) {
                // If there is more than 0 of this mineral, let's pick it up
                if (target.store[res] > 0 && res !== RESOURCE_ENERGY) {
                    // Attempt to pick it up
                    let pickupResult = this.withdraw(target, res);
                    // check the result
                    if (pickupResult === ERR_NOT_IN_RANGE) {
                        // something probbaly went wrong
                    } else if (pickupResult === OK) {
                        this.say(global.sayWithdraw);
                        // Invalidate and return full
                        if (this.full()) {
                            return this.invalidateMineralTarget(true);
                        } else {
                            return this.invalidateMineralTarget();
                        }
                    }
                }
            }
        }
    }

    // We've probably moved return ok
    return OK;
}

Creep.prototype.invalidateMineralTarget = function(full = false) {
    delete this.memory.mineralPickup;
    if (full) { return ERR_FULL; }
    return ERR_INVALID_TARGET;
}

Creep.prototype.canPickup = function(target, range = 1) {
    if (!target) { return false; }
    // Are we within 1 range?
    return this.pos.inRangeTo(target,range);
}

Creep.prototype.findStorageMinerals = function() {
    // Have an override, call it storeMinerals for now (it'l do)
    if (this.room.memory.storeMinerals) { return; }
    let storage = this.room.storage;
    // Does this room have a storage? (no harm in checking)
    if (storage) {
        // Is there something other than energy in the storage?
        if (_.sum(storage.store) - storage.store[RESOURCE_ENERGY] > 0) {
            // Set the target to be the storage
            this.memory.mineralPickup = storage.id;
        }
    }
}

Creep.prototype.findGroundMinerals = function() {
    var resource = false;
    let thisCreep = this;
    DBG && console.log('[' + this.name + '] Creep has no mineral memory, finding stuff to pickup');
    // First check for nearby dropped resources
    var resources = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: (i) => i.resourceType !== RESOURCE_ENERGY && i.amount > (this.pos.getRangeTo(i) / this.moveEfficiency())
    });
    // Did we find resources?
    if (resources.length > 0) {
        DBG && console.log('[' + this.name + '] Found some minerals picking the closest');
        // get the closest resource
        resource = _.min(resources, function(r) { return thisCreep.pos.getRangeTo(r); });
        // Did we find some resources?
        if (resource) {
            // We did, let's store their id
            this.memory.mineralPickup = resource.id;
        }
    }
}

Creep.prototype.findContainerMinerals = function() {
    var container = false;
    let thisCreep = this;
    DBG && console.log('[' + this.name + '] Creep searching for mineral containers');
    // Check for containers with anything other than energy in them
    var containers = this.room.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType === STRUCTURE_CONTAINER && (_.sum(i.store) - i.store[RESOURCE_ENERGY]) > 0
    });
    // Any containers?
    if (containers.length > 0) {
        DBG && console.log('[' + this.name + '] Found some mineral containers picking the most cost effective');
        container = _.max(containers, function(c) { return (_.sum(c.store) - c.store[RESOURCE_ENERGY]) / thisCreep.pos.getRangeTo(c) ;});
        // Did we find a container
        if (container) {
            // We did it, store the id
            this.memory.mineralPickup = container.id;
        }
    }
}

Creep.prototype.deliverEnergy = function() {
    DBG && console.log('[' + this.name + '] Creep attempting to deliver energy');
    // First of all are we empty?
    if (_.sum(creep.carry) === 0) {
        delete this.memory.deliveryTarget;
        return ERR_NOT_ENOUGH_RESOURCES;
    }

    if (creep.carry.energy === 0) {
        return ERR_NOT_ENOUGH_RESOURCES;
    }
}

Creep.prototype.canWork = function() {
    // Has this creep already been flagged as a worker? and at full health (if it's been hit we should check it's parts again)
    if (!this.memory.canWork && this.hits === this.hitsMax) {
        // If we got hit, clear the memory
        if (this.hits != this.hitsMax) { delete this.memory.canWork; }
        // Use the activeBodyparts method.. sigh
        if (this.getActiveBodyparts(WORK) > 0) {
            this.memory.canWork = 'yes';
        }
        // Is it set at this point?
        if (!this.memory.canWork) {
            // Set it to no
            this.memory.canWork = 'no';
        }
    }
    // Can this creep work?
    return this.memory.canWork === 'yes';
}

Creep.prototype.findSpaceAtSource = function(source) {
    if (source.id == '5982fecbb097071b4adc1835') {
        // this.DBG = true;
    }
    if (this.pos.getRangeTo(source) === 1) {
        this.DBG && console.log('We are already at the source');
        return true;
    }
    this.DBG && console.log('Checking for space at source ' + source.id);
    // return true;
    // Make sure to initialise the source's last check memory
    if (!source.memory.lastSpaceCheck) {
        source.memory.lastSpaceCheck = 0;
    }
    // If we checked the space this tick and there's no space left, we don't need to check again we just need to decrement the spaces
    if (source.memory.lastSpaceCheck === Game.time) {
        this.DBG && console.log('Last Check was this tick');
        if (source.memory.spaces === 0) {
            this.DBG && console.log('No more spaces');
            return false
        } else {

            // Decrement the spaces left
            source.memory.spaces = source.memory.spaces -1;
            this.DBG && console.log('Found a space there are ' + source.memory.spaces + ' spaces left');
            return true;
        }
    }

    this.DBG && console.log('First check for space at source');
    var spaces = 1;
    var n  = new RoomPosition(source.pos.x,   source.pos.y-1, source.pos.roomName);
    if (this.checkEmptyAtPos(n,  this)) { spaces++; }
    var ne = new RoomPosition(source.pos.x+1, source.pos.y-1, source.pos.roomName);
    if (this.checkEmptyAtPos(ne, this)) { spaces++; }
    var e  = new RoomPosition(source.pos.x+1, source.pos.y,   source.pos.roomName);
    if (this.checkEmptyAtPos(e,  this)) { spaces++; }
    var se = new RoomPosition(source.pos.x+1, source.pos.y+1, source.pos.roomName);
    if (this.checkEmptyAtPos(se, this)) { spaces++; }
    var s  = new RoomPosition(source.pos.x,   source.pos.y+1, source.pos.roomName);
    if (this.checkEmptyAtPos(s,  this)) { spaces++; }
    var sw = new RoomPosition(source.pos.x-1, source.pos.y+1, source.pos.roomName);
    if (this.checkEmptyAtPos(sw, this)) { spaces++; }
    var w  = new RoomPosition(source.pos.x-1, source.pos.y,   source.pos.roomName);
    if (this.checkEmptyAtPos(w,  this)) { spaces++; }
    var nw = new RoomPosition(source.pos.x-1, source.pos.y-1, source.pos.roomName);
    if (this.checkEmptyAtPos(nw, this)) { spaces++; }
    this.DBG && console.log('We found ' + spaces + ' Spaces at source ' + source.id);
    // Set our memory
    source.memory.lastSpaceCheck = Game.time;
    source.memory.spaces = spaces;
    // If it's 0 there's no space
    if (source.memory.spaces === 0) {
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
    if (terrain === 'wall') {
        this.DBG && console.log('wall found at ' + JSON.stringify(pos));
        return false;
    } else {
        let creeps = pos.lookFor(LOOK_CREEPS);
        if (creeps.length === 0) {
            this.DBG && console.log('Space found at ' + JSON.stringify(pos));
            return true;
        } else {
            // is this, the creep we're trying to find a space for
            if (creeps[0] === this) {
                this.DBG && console.log('We are at ' + JSON.stringify(pos));
                return true;
            } else {
                this.DBG && console.log('Other creep [' + creeps[0].name + '] found at' + JSON.stringify(pos));
                return false;
            }
        }
    }
}

Creep.prototype.roadCheck = function(work = false) {
    var road = false;
    var site = false;
    var flag = false;
    // Don't lay roads no room edges
    if (this.pos.isRoomEdge()) { return ;}
    let obj = this.room.lookForAt(LOOK_STRUCTURES, this.pos);
    if (obj.length > 0) {
        for (let i in obj) {
            if (obj[i].structureType === STRUCTURE_ROAD) {
                this.DBG && console.log(this.name + ' Already road here');
                road = obj[i];
                break;
            }
        }
    }
    if (road && work && this.carry.energy > 0) {
        if (road.hits < road.hitsMax) {
            this.DBG && console.log(this.name + ' Repairing existing road');
            this.repair(road);
            this.say(global.sayRepair);
            return;
        } else {
            this.DBG && console.log(this.name + ' Road good to go');
            return;
        }
    }
    if (road) {
        this.DBG && console.log(this.name + ' Already road no action to perform');
        return
    }
    // No road?
    if (!road) {
        // Are we in one of our OWN rooms
        if (this.room.controller) {
            if (this.room.controller.my) {
                // DO nothing don't want millions of roads!
                return;
            }
        }
        this.DBG && console.log(this.name + ' No road, looking for construction site');
        // Check for construction sites
        let sites = this.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.pos);
        if (sites.length > 0) {
            this.DBG && console.log(this.name + ' Found construction site');
            if (sites[0].structureType === STRUCTURE_ROAD) {
                site = sites[0];
            }
        }
    }
    if (site && work && this.carry.energy > 0) {
        this.DBG && console.log(this.name + ' Building construction site');
        this.build(site);
        this.say(global.sayBuild);
        return;
    }
    // No site?
    if (!site) {
        this.DBG && console.log(this.name + ' No site found look for flags');
        // Check for flag
        let flags = _.filter(Game.flags, (flag) => flag.pos == this.pos);
        // let flags = this.room.lookForAt(LOOK_FLAGS, this.pos);
        if (flags.length > 0) {
            this.DBG && console.log(this.name + ' Found a flag');
            flag = flags[0];
        }
    }
    this.DBG && console.log(this.name + ' No Road, Site, or Flag.. attempting to place one');
    this.DBG && console.log(JSON.stringify(this.pos));
    if (!site && !flag && global.seedRemoteRoads === true) {
        // How many construction flags do we have?
        let roadFlags = _.filter(Game.flags, (flag) => flag.color === global.flagColor['buildsite'] && flag.secondaryColor === COLOR_WHITE);
        // If we have 100 or more road flags, don't make any more!
        if (roadFlags.length >= 100) { this.DBG && console.log(this.name + 'Enough flags not dropping any more'); return; }
        this.DBG && console.log(this.name + 'Dropping a flag');
        // Check for room edge here
        this.pos.createFlag();
        return;
    }
}

Creep.prototype.containerCheck = function() {
    // If we're in our own room, stop right there! no container check here please
    if (this.room.controller && this.room.controller.my) { return; }
    // Check we have energy (and it's higher than 0.. because 0 probably means we got smacked and lost our carry)
    if (this.carry.energy >= this.carryCapacity && this.carry.energy > 0) {
        var container = false;
        // Check for structures at our pos
        let objects = this.pos.lookFor(LOOK_STRUCTURES);
        if (objects.length > 0) {
            for (let i in objects) {
                if (objects[i].structureType === STRUCTURE_CONTAINER) {
                    container = objects[i];
                    break;
                }
            }
        }
        // Is there a container?
        if (container) {
            if (container.hits < container.hitsMax) {
                this.repair(container);
                this.say(global.sayRepair);
                return;
            }
        } else {
            var constructionSite = false;
            // Get sites
            let sites = this.pos.lookFor(LOOK_CONSTRUCTION_SITES);
            // If there are some
            if (sites.length > 0) {
                // loop
                for (let i in sites) {
                    // is this site a container?
                    if (sites[i].structureType === STRUCTURE_CONTAINER) {
                        constructionSite = sites[i];
                        break;
                    }
                }
            }
            // Did we find one?
            if (constructionSite) {
                this.build(constructionSite);
                this.say(global.sayBuild);
                return true;
            } else {
                this.pos.createConstructionSite(STRUCTURE_CONTAINER);
                return;
            }
        }
    }
}

Creep.prototype.repairStructures = function (options = {}) {
    // First are we empty?
    if (this.carry.energy === 0) {
        DBG && console.log('[' + this.name + '] Empty Cannot Repair Structures');
        // Clear repair target
        delete this.memory.repairTarget;
        delete this.memory.targetMaxHP;
        return ERR_NOT_ENOUGH_ENERGY;
    }
    // Is their an item in memory, with full health already?
    if (this.memory.repairTarget) {
        let target = Game.getObjectById(this.memory.repairTarget);
        if (target) {
            // Have we already filled the items health to what we want?
            if (target.hits >= this.memory.targetMaxHP) {
                // Clear the target, time for a new one
                delete this.memory.repairTarget;
                delete this.memory.targetMaxHP;
            }
        } else {
            delete this.memory.repairTarget;
            delete this.memory.targetMaxHP;
        }

    }
    // Do we have a repairTarget in memory?
    if (!this.memory.repairTarget) {
        DBG && console.log('[' + this.name + '] Has no repair target, looking for 1 hp ramparts and walls');
        // Check for walls or ramparts with 1 hit first
        var ts = this.room.find(FIND_STRUCTURES, {
            filter: (i) => (i.structureType === STRUCTURE_RAMPART || i.structureType === STRUCTURE_WALL) && i.hits === 1 && i.room === this.room
        });

        if (ts.length > 0) {
            DBG && console.log('[' + this.name + '] Found a 1 hp item, setting target');
            ts.sort(function(a,b) {
                return a.hits - b.hits;
            });
            this.memory.targetMaxHP = 10;
            this.memory.repairTarget = ts[0].id;
        }
    }

    // Next juice up walls and ramparts to 600
    if (!this.memory.repairTarget) {
        DBG && console.log('[' + this.name + '] Has no repair target, looking for < 600hp ramparts and walls');
        if (ts.length == 0) {
            var ts = this.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType === STRUCTURE_RAMPART || i.structureType === STRUCTURE_WALL) && i.hits <= 600 && i.room === this.room
            });
            if (ts.length > 0) {
                ts.sort(function(a,b) {
                    return a.hits - b.hits;
                });
                this.memory.targetMaxHP = 600;
                this.memory.repairTarget = ts[0].id;
            }
        }
    }

    // Next find damaged structures that aren't walls, ramparts or roads
    if (!this.memory.repairTarget) {
        DBG && console.log('[' + this.name + '] Has no repair target, looking for damaged structures');
        this.findDamagedStructures();
    }

    // Next find Damaged Roads
    if (!this.memory.repairTarget) {
        DBG && console.log('[' + this.name + '] Has no repair target, looking for damaged roads');
        this.findDamagedRoads();
    }

    // Next find Damaged defence items (wall, rampart)
    if (!this.memory.repairTarget) {
        DBG && console.log('[' + this.name + '] Has no repair target, looking for damaged defences');
        this.findDamagedDefences();
    }
    // Do we have something to repair?
    if (this.memory.repairTarget) {
        DBG && console.log('[' + this.name + '] Has a repair target, checking close enough to repair');
        let target = Game.getObjectById(this.memory.repairTarget);
        // Make sure target is still valid
        if (target.hits >= this.memory.targetMaxHP) {
            DBG && console.log('[' + this.name + '] Repair target at target XP deleting target from memory');
            delete this.memory.repairTarget;
            delete this.memory.targetMaxHP;
            return ERR_FULL;
        }
        if (this.pos.inRangeTo(target, 3)) {
            DBG && console.log('[' + this.name + '] Target in range, attempting repair');
            // attempt repair
            if (this.repair(target) == ERR_NOT_IN_RANGE) {
                DBG && console.log('[' + this.name + '] Repair Failed#');
            }
        } else {
            this.travelTo(target);
            this.say(global.sayMove);
            return OK;
        }
    } else {
        // Nothing to repair?
        // No targets.. head back to the room spawn
        var spawn = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (i) => i.structureType === STRUCTURE_SPAWN
        });
        if (spawn) {
            if (spawn.recycleCreep(this) === ERR_NOT_IN_RANGE) {
                this.travelTo(spawn);
                this.say(global.sayWhat);
            }
        }
        return ERR_INVALID_TARGET;
    }
}

Creep.prototype.findDamagedStructures = function() {
    var ts = [];
    for (let distance in [3,5,10,20]) {
        ts = this.pos.findInRange(FIND_STRUCTURES, distance, {
            filter: (i) => (i.structureType !== STRUCTURE_RAMPART && i.structureType !== STRUCTURE_WALL && i.structureType !== STRUCTURE_ROAD) && i.hits < i.hitsMax && i.room === this.room
        });
        if (ts.length>0) {break;}
    }
    if (ts.length == 0) {
        ts = this.room.find(FIND_STRUCTURES, {
            filter: (i) => (i.structureType !== STRUCTURE_RAMPART && i.structureType !== STRUCTURE_WALL && i.structureType !== STRUCTURE_ROAD) && i.hits < i.hitsMax && i.room === this.room
        });
    }
    if (ts.length > 0) {
        let target = _.min(ts, (t) => { return t.hitsMax - t.hits; })
        this.memory.targetMaxHP = target.hitsMax;
        this.memory.repairTarget = target.id;
    }
}

Creep.prototype.findDamagedRoads = function() {
    var ts = [];
    for (let distance in [3,5,10,20]) {
        ts = this.pos.findInRange(FIND_STRUCTURES, distance, {
            filter: (i) => i.structureType === STRUCTURE_ROAD && i.hits < i.hitsMax && i.room === this.room
        });
        if (ts.length>0){break;}
    }
    if (ts.length == 0) {
        ts = this.room.find(FIND_STRUCTURES, {
            filter: (i) => i.structureType === STRUCTURE_ROAD && i.hits < i.hitsMax && i.room === this.room
        });
    }
    if (ts.length > 0) {
        let target = _.min(ts, (t) => { return t.hitsMax - t.hits; })
        this.memory.targetMaxHP = target.hitsMax;
        this.memory.repairTarget = target.id;
    }
}

Creep.prototype.findDamagedDefences = function() {
    var ts = [];
    // Loop through the damage multipliers
    for (let multiplier in [0.25,0.5,0.75,1]) {
        // Loop through the distances
        for (let distance in [3,5,10,20]) {
            ts = this.pos.findInRange(FIND_STRUCTURES, distance, {
                filter: (i) => ((i.structureType === STRUCTURE_RAMPART && i.hits < (global.rampartMax*multiplier)) ||
                                (i.structureType === STRUCTURE_WALL && i.hits < (global.wallMax*multiplier))) && i.room === this.room
            });
            if (ts.length>0){break;}
        }
        if (ts.length == 0) {
            ts = this.room.find(FIND_STRUCTURES, {
                filter: (i) => ((i.structureType === STRUCTURE_RAMPART && i.hits < (global.rampartMax*multiplier)) ||
                                (i.structureType === STRUCTURE_WALL && i.hits < (global.wallMax*multiplier))) && i.room === this.room
            });
        }
        if (ts.length>0){
            ts.sort(function(a,b) {
                if (a.structureType === STRUCTURE_WALL)    { var aHitsMax = global.wallMax*multiplier; }
                if (a.structureType === STRUCTURE_RAMPART) { var aHitsMax = global.rampartMax*multiplier; }
                if (b.structureType === STRUCTURE_WALL)    { var bHitsMax = global.wallMax*multiplier; }
                if (b.structureType === STRUCTURE_RAMPART) { var bHitsMax = global.rampartMax*multiplier; }
                let aH = aHitsMax - a.hits;
                let bH = bHitsMax - b.hits;
                if (aH > bH) {
                    return -1;
                } else if (bH > aH) {
                    return 1;
                }
                return 0;
            });
            if (ts[0].structureType === STRUCTURE_WALL) {
                this.memory.targetMaxHP = global.wallMax*multiplier;
            }
            if (ts[0].structureType === STRUCTURE_RAMPART) {
                this.memory.targetMaxHP = global.rampartMax*multiplier;
            }
            this.memory.repairTarget = ts[0].id;
        }
    }
}

/*
 * Does a creep have any active BodyParts of type sent?
 * @param BodyPart Creep.body.part
 */
Creep.prototype.canDo = function(BodyPart) {
    // If this creep needs a bodypart it doesn't have to function properly, it needs to go home to repair or self repair
    if (!this.getActiveBodyparts(BodyPart) > 0 || this.memory.repair) {
        // Creep is damaged, say so!
        this.say('DMGD');
        // Do we have our own heal parts?
        if (this.getActiveBodyparts(HEAL) > 0) {
            // Heal ourselves
            this.heal(this);
        } else {
            // Get position in centre of home room
            if (this.memory.roomName) {
                let pos = new RoomPosition(25,25,this.memory.roomName);
                // Move the creep
                this.travelTo(pos);
            }
        }
        // Are we at max health?
        if (this.hits >= this.hitsMax) {
            delete this.memory.repair;
            return true;
        } else {
            this.memory.repair = true;
            return false;
        }
    }
    return true;
}

Creep.prototype.QueueReplacement = function(now = false) {
    if (this.room.controller) {
        if (this.room.controller.level >= this.memory.level) {
            return;
        }
    }
    // We don't need level 1 creeps putting themselves in the spawn queue
    if (this.memory.level == 1) { return; }
    var bodyParts = [];
    for (var part of this.body) {
        bodyParts.push(part.type);
    }
    var newCreep = {
        role: this.memory.role,
        home: this.memory.roomName,
        level: this.memory.level,
        body: bodyParts,
    }
    if (now) {
        global.Queue.add_now(newCreep);
    } else {
        global.Queue.add(newCreep);
    }
}

Creep.prototype.moveEfficiency = function () {
    // TODO Add a calculation for our move efficiency here
    return 1;
}

Creep.prototype.full = function () {
    return _.sum(this.carry) >= this.carryCapacity
}
