
/**
 * Bunch of Handy Creep Functions
 */
Creep.prototype.getNearbyEnergy = function(useStorage = false, emergency = false) {
    // First, are we full?
    if (this.carry.energy == this.carryCapacity) {
        // Clear our pickup target
        delete this.memory.energyPickup;
        return ERR_FULL; 
    }
    // Do we have a target?
    if (this.memory.energyPickup) {
        // We do! let's grab it
        const target = Game.getObjectById(this.memory.energyPickup);
        // Alright what is it?
        if (target instanceof Resource) { // Resource

        } else if (target instanceof StructureContainer) { // Container

        } else if (target instanceof StructureStorage) { // Storage

        } else if (target instanceof Source) { // Source

        }
    }
    // If this is an emergency we should be going for the terminal, then storage
    if (emergency) {
        // TODO EMPTY TERMINAL AND STORAGE HERE PLEASE
    }
    // Get dropped resources in the room
    var resources = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: (i) => i.resourceType == RESOURCE_ENERGY && i.amount > this.carryCapacity
    });
    // Get Containers in the room
    var containers = this.room.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > this.carryCapacity
    });
    // Sort the resources
    resources.sort(function(a,b) {
        return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
    });
    // Sort the containers
    containers.sort(function(a,b) {
        return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
    });
    // Now get the nearest one
    let resource = resources[i];
    let container = containers[i];
    // If the resource is closer
    if (this.pos.getRangeTo(resource) < this.pos.getRangeTo(container)) {

    }
}