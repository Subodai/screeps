// Role Name
module.exports.role = 'energyMiner';
// Roster
module.exports.roster = {
    1:2, 2:2, 3:2, 4:2, 5:2, 6:2, 7:2, 8:2,
};
// Body parts
module.exports.body = {
    1 : [ WORK,WORK,WORK,MOVE ],
    2 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    3 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    4 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    5 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    6 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    7 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
    8 : [ WORK,WORK,WORK,WORK,WORK,MOVE ],
};
// Is this role enabled?
module.exports.enabled = function (room, debug=false) {
    // If the room is not a room, make it a room
    if (!room instanceof Room) { room = Game.rooms[room]; }
    // If the controller is above level 1 and required miners
    if (room.controller && room.controller.level > 1 && room.memory.minersNeeded && room.memory.minersNeeded > 0) {
        // Get a list of creeps with this role in this room
        let list = _.filter(Game.creeps, c => c.memory.role === this.role && c.memory.roomName === room.name && !c.memory.dying);
        // If the list is less than what we need
        if (list.length < room.memory.minersNeeded) {
            // Return true
            return true;
        }
    }
    // Return false
    return false;
}
// Run it
module.exports.run = function (creep, debug=false) {
    // If Creep has no state, set to spawning
    if (!creep.state) { creep.state = STATE_SPAWNING; }
    // Switch based on state
    switch(creep.state) {
        // Spawning
        case STATE_SPAWNING:
            // Run the spawnRoutine
            creep.spawnRoutine(this.role);
        case STATE_MOVING:
            // Move to target
        case STATE_HARVESTING:
            // Harvest target source
    }
}
