
/**
 * Spawn prototype extensions
 */

/*
 * MakeCreep
 */
StructureSpawn.prototype.makeCreep = function(role, body, level, home) {
    if (home instanceof Room) { home = Room.name; }
    let creepName = this.createCreep(body,undefined,{
        role: role,
        level: level,
        roomName: home
    });
    if (creepName) ? return true : return false;
}
