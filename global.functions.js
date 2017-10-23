// Global Functions


/**
 * Turn War On or Off
 */
global.ToggleWar = function() {
    // Check current status of global war
    if (!Memory.war) {
        Memory.war = true;
    } else {
        Memory.war = false;
    }
    // Loop through our rooms
    for (let room in Game.rooms) {
        console.log('Setting War to ' + Memory.war + ' in ' + room);
        Game.rooms[room].memory.war = Memory.war;
    }
}