
/**
 * Spawn prototype extensions
 */

/*
 * MakeCreep
 */
StructureSpawn.prototype.makeCreep = function(role, body, level, home) {
    // Make sure we have a string, not a room
    if (home instanceof Room) { home = Room.name; }
    // Make a creep name
    let creepName = this.generateCreepName(role, home);
    // Attempt to spawn it
    let spawned = this.spawnCreep(body, creepName, {
        memory : {
            role: role,
            level: level,
            roomName: home
        }
    });
    // Did we spawn?
    if (spawned) { return true; } else { return false; }
}

// Name generator
StructureSpawn.prototype.generateCreepName = function(role, roomName) {
    return roomName + ':' + role  + '-' + Game.time();
}
