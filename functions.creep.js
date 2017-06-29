
/**
 * Bunch of Handy Creep Functions
 */
Creep.prototype.getNearbyEnergy = function(useStorage = false, emergency = false, options = {}) {
    // First, are we full?
    if (_.sum(this.carry) == this.carryCapacity) {
        // Clear our pickup target
        delete this.memory.energyPickup;
        return ERR_FULL;
    }
    if (!this.memory.energyPickup) {
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
        var thisCreep = this;
        // If we have resources
        if (resources.length > 0) {
            // Sort the resources
            resources.sort(function(a,b) {
                return thisCreep.pos.getRangeTo(a) - thisCreep.pos.getRangeTo(b);
            });
            // Now get the nearest one
            var resource = resources[0];
        }
        // if we have containers
        if (containers.length > 0) {
            // Sort the containers
            containers.sort(function(a,b) {
                return thisCreep.pos.getRangeTo(a) - thisCreep.pos.getRangeTo(b);
            });
            var container = containers[0];
        }
        // If we have both we need to pick the closest one
        if (resource && container) {
            // If the resource is closer
            if (this.pos.getRangeTo(resource) < this.pos.getRangeTo(container)) {
                this.memory.energyPickup = resource.id;
            } else {
                this.memory.energyPickup = container.id;
            }
        } else if (resource) {
            this.memory.energyPickup = resource.id;
        } else if (container) {
            this.memory.energyPickup = container.id;
        }
    }
    // Do we have a target?
    if (this.memory.energyPickup) {
        // We do! let's grab it
        const target = Game.getObjectById(this.memory.energyPickup);
        if (options == {}) {
            var options = {
                visualizePathStyle: {
                    stroke: global.colourPickupRes,
                    opacity: global.pathOpacity
                },
                reusePath:this.getRangeTo(target) // Use the range to the object we're after as the reusePath opt
            };
        }
        var pickupSuccess = true;
        // Alright what is it?
        if (target instanceof Resource) { // Resource
            // Is there still enough of it?
            if (target.amount < this.carryCapacity) {
                // Target has gone, clear memory
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // First attempt to pickitup
            if (this.pickup(target) == ERR_NOT_IN_RANGE) {
                var pickupSuccess = false;
            }
        } else if (target instanceof StructureContainer || target instanceof StructureStorage) { // Container
            // Check the container still has the energy
            if (target.store[RESOURCE_ENERGY] < this.carryCapacity) {
                // Clear memory and return invalid target
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Lets attempt to withdraw
            if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                var pickupSuccess = false;
            }
        } else if (target instanceof Source) { // Source
            // Does it still have energy ?
            if (target.energy == 0) {
                // no clear the memory
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Alright lets try harvesting it
            if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                var pickupSuccess = false;
            }
        }
        // Did we successfully pick up the thing
        if (pickupSuccess) {
            this.say(global.sayWithdraw);
            // Are we now full?
            if (this.carry.energy == this.carryCapacity) {
                // Alright we're full clear memory and return full
                delete this.memory.energyPickup;
                return ERR_FULL;
            }
            // Just return OK, we're not full yet
            return OK;
        } else {
            // We probably need to move
            this.moveTo(target, options);
            // Say!
            this.say(global.sayMove);
        }
    }
}


Creep.prototype.deliverEnergy = function () {
    // First of all are we empty?
    if (_.sum(creep.carry) == 0) {
        delete this.memory.deliveryTarget;
        return ERR_NOT_ENOUGH_RESOURCES;
    }

    if (creep.carry.energy == 0) {

    }
}
