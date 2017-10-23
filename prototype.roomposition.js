RoomPosition.prototype.isRoomEdge = function() {
    if (this.x == 0 || this.x == 49) { return true; }
    if (this.y == 0 || this.y == 49) { return true; }
    return false;
}


RoomPosition.prototype.seedFlags = function() {
    let spawns = [
        [0,0]
    ];

    let roads = [
        // Outer Circle
        [-1,-1],[ 0,-1],[ 1,-1],[-1, 0],[ 1, 0],[-1, 1],[ 0, 1],[ 1, 1],
        // Spoke 1
        [2,-2],[3,-3],
        // Spoke 2
        [-2,-2],[-3,-3],
        // Spoke 3
        [-2,2],[-3,3],
        // Spoke 4
        [2,2],[3,3],
    ];

    let extensions = [
        // Spoke 1
        [2,-1],[3,-1],[3,-2],[4,-2],[4,-3],[1,-2],[1,-3],[2,-3],[2,-4],[3,-4],
        // Spoke 2
        [-2,-1],[-3,-1],[-3,-2],[-4,-2],[-4,-3],[-1,-2],[-1,-3],[-2,-3],[-2,-4],[-3,-4],
        // Spoke 3
        [-2,1],[-3,1],[-3,2],[-4,2],[-4,3],[-1,2],[-1,3],[-2,3],[-2,4],[-3,4],
        // Spoke 4
        [2,1],[3,1],[3,2],[4,2],[4,3],[1,2],[1,3],[2,3],[2,4],[3,4],
    ];

    for (let coords of spawns) {
        let dX = coords[0];
        let dY = coords[1];
        let newPos = new RoomPosition(this.x+dX, this.y+dY,this.roomName);
        newPos.createFlag(null,COLOR_WHITE,COLOR_GREY);
    }

    for (let coords of extensions) {
        let dX = coords[0];
        let dY = coords[1];
        let newPos = new RoomPosition(this.x+dX, this.y+dY,this.roomName);
        newPos.createFlag(null,COLOR_WHITE,COLOR_YELLOW);
    }

    for (let coords of roads) {
        let dX = coords[0];
        let dY = coords[1];
        let newPos = new RoomPosition(this.x+dX, this.y+dY,this.roomName);
        newPos.createFlag(null,COLOR_WHITE,COLOR_WHITE);
    }
}

/**
 * Check a POS for space, if it's a wall or another creep
 * will return false. Otherwise will return true.
 */
RoomPosition.prototype.EmptyOfOtherCreeps = function(Creep) {
    // Get the current terrain at this pos
    let terrain = Game.map.getTerrainAt(this);
    // If the terrain is a wall return false, there's no space
    if (terrain === 'wall') { return false; }
    // Get any creeps here
    let creeps = this.lookFor(LOOK_CREEPS);
    // If there are no creeps, there should be a space
    if (creeps.length === 0) { return true; }
    // Is this the creep we're trying to find space for?
    if (creeps[0] === Creep) { return true; }
    // Nothing has matched, assume false
    return false;
}