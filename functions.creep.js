
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
        DGB && console.log('Creep Full Cannot Get Nearby Energy');
        // Clear our pickup target
        delete this.memory.energyPickup;
        return ERR_FULL;
    }
    if (!this.memory.energyPickup) {
        DGB && console.log('Creep has no memory, finding stuff to pickup');
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
            DGB && console.log('Found ' + resources.length + ' resource piles');
            // Sort the resources
            resources.sort(function(a,b) {
                return thisCreep.pos.getRangeTo(a) - thisCreep.pos.getRangeTo(b);
            });
            // Now get the nearest one
            var resource = resources[0];
        }
        // if we have containers
        if (containers.length > 0) {
            DGB && console.log('Found ' + containers.length + ' containers');
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
                DGB && console.log('Stored resource pile ' + resource.id + ' in creep memory');
                this.memory.energyPickup = resource.id;
            } else {
                DGB && console.log('Stored container ' + container.id + ' in creep memory');
                this.memory.energyPickup = container.id;
            }
        } else if (resource) {
            DGB && console.log('Stored resource pile ' + resource.id + ' in creep memory');
            this.memory.energyPickup = resource.id;
        } else if (container) {
            DGB && console.log('Stored container ' + container.id + ' in creep memory');
            this.memory.energyPickup = container.id;
        }
    }
    // Do we have a target?
    if (this.memory.energyPickup) {
        DGB && console.log('Found Energy source in creeps memeory ' + this.memory.energyPickup);
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
            DGB && console.log('Target is a Resource');
            // Is there still enough of it?
            if (target.amount < (this.carryCapacity - _.sum(this.carry))) {
                DGB && console.log('Resource no longer viable clearing memory');
                // Target has gone, clear memory
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.getRangeTo(target) <= 1) {
                DGB && console.log('Target should be in range, attempting pickup');
                // First attempt to pickitup
                if (this.pickup(target) == ERR_NOT_IN_RANGE) {
                    DGB && console.log('Pickup failed');
                    var pickupSuccess = false;
                }
            } else {
                DGB && console.log('Target not in range');
                var pickupSuccess = false;
            }

        } else if (target instanceof StructureContainer || target instanceof StructureStorage || target instanceof StructureTerminal) { // Container
            DGB && console.log('Target is a Container, Storage, or Terminal');
            // Check the container still has the energy
            if (target.store[RESOURCE_ENERGY] < (this.carryCapacity - _.sum(this.carry))) {
                DGB && console.log('Target no longer has enough energy clearing memory');
                // Clear memory and return invalid target
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.getRangeTo(target) <= 1) {
                DGB && console.log('Target should be in range, attempting withdraw');
                // Lets attempt to withdraw
                if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    DGB && console.log('Withdraw failed');
                    var pickupSuccess = false;
                }
            } else {
                DGB && console.log('Target not in range');
                var pickupSuccess = false;
            }
        } else if (target instanceof Source) { // Source
            // Does it still have energy ?
            if (target.energy == 0) {
                DGB && console.log('Source no longer has energy, clearing memory');
                // no clear the memory
                delete this.memory.energyPickup;
                return ERR_INVALID_TARGET;
            }
            // Only bother trying to pick up if we're within 1 range
            if (this.getRangeTo(target) <= 1) {
                DGB && console.log('Target should be in range, attempting harvest');
                // Alright lets try harvesting it
                if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                    DGB && console.log('Harvest failed');
                    var pickupSuccess = false;
                }
            } else {
                DGB && console.log('Target not in range');
                var pickupSuccess = false;
            }
        }
        // Did we successfully pick up the thing
        if (pickupSuccess) {
            DGB && console.log('Successfully gathered resources');
            this.say(global.sayWithdraw);
            // Are we now full?
            if (this.carry.energy == this.carryCapacity) {
                DGB && console.log('Creep is now full clearing pickup memory');
                // Alright we're full clear memory and return full
                delete this.memory.energyPickup;
                return ERR_FULL;
            }
            // Just return OK, we're not full yet
            return OK;
        } else {
            DGB && console.log('Moving closer to target');
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
