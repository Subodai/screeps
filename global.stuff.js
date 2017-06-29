global.roles = [
    'guard',
    'miner',
    'harvester',
    'upgrader',
    'builder',
    // 'mover',
    'extractor',
    'supergrader',
    'scout',
    'reserve',
    'remoteminer',
    'hauler',
    'janitor',
];

global.settings = {
    DeSpawn: false,
    upgrader  : true,
    miner     : true,
    extractor : false,
    harvester : true,
    builder   : true,
    mover     : false,
    scout     : false,
    reserve   : false,
    guard     : true,
    supergrader : true,

    emptyContainers: false,
}

global.rampartMax = 10000;
global.wallMax = 10000000;
global.towerRepair = false;

global.resourceList = [
    // Minerals
    RESOURCE_CATALYST,
    RESOURCE_HYDROGEN,
    RESOURCE_LEMERGIUM,

    // Compounds (from invaders)
    RESOURCE_UTRIUM_HYDRIDE,
    RESOURCE_KEANIUM_OXIDE,
    RESOURCE_ZYNTHIUM_HYDRIDE,
    RESOURCE_GHODIUM_OXIDE,

    // Energy!
    RESOURCE_ENERGY
];

global.seedRemoteRoads = false;

global.clearSites = function () {
    for (let i in Game.rooms) {
        let _room = Game.rooms[i];
        let sites = _room.find(FIND_CONSTRUCTION_SITES);
        for (let s in sites) {
            let site = sites[s];
            site.remove();
        }
    }
}

global.clearWalls = function (roomName) {

    let _room = Game.rooms[roomName];
    let walls = _room.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType == STRUCTURE_WALL
    });
    for (let w in walls) {
        let wall = walls[w];
        wall.destroy();
    }

}

global.clearNotifications = function (roomName) {

    let _room = Game.rooms[roomName];
    let structures = _room.find(FIND_STRUCTURES);
    for (let i in structures) {
        let item = structures[i];
        console.log(item.id + ':' + item.notifyWhenAttacked(false));
    }

}

global.getSpaceAtSource = function (source, creep) {
    const n  = new RoomPosition(source.pos.x,   source.pos.y-1, source.pos.roomName);
    if (global.checkEmptyCoord(n, creep)) { return true; }
    const ne = new RoomPosition(source.pos.x+1, source.pos.y-1, source.pos.roomName);
    if (global.checkEmptyCoord(ne, creep)) { return true; }
    const e  = new RoomPosition(source.pos.x+1, source.pos.y,   source.pos.roomName);
    if (global.checkEmptyCoord(e, creep)) { return true; }
    const se = new RoomPosition(source.pos.x+1, source.pos.y+1, source.pos.roomName);
    if (global.checkEmptyCoord(se, creep)) { return true; }
    const s  = new RoomPosition(source.pos.x,   source.pos.y+1, source.pos.roomName);
    if (global.checkEmptyCoord(s, creep)) { return true; }
    const sw = new RoomPosition(source.pos.x-1, source.pos.y+1, source.pos.roomName);
    if (global.checkEmptyCoord(sw, creep)) { return true; }
    const w  = new RoomPosition(source.pos.x-1, source.pos.y,   source.pos.roomName);
    if (global.checkEmptyCoord(w, creep)) { return true; }
    const nw = new RoomPosition(source.pos.x-1, source.pos.y-1, source.pos.roomName);
    if (global.checkEmptyCoord(nw, creep)) { return true; }
    return false;
}

global.checkEmptyCoord = function (pos, creep) {
    const terrain = Game.map.getTerrainAt(pos);
    if (terrain == 'wall') {
        return false;
    } else {
        let creeps = pos.lookFor(LOOK_CREEPS);
        if (creeps.length == 0) {
            return true;
        } else {
            // is this, the creep we're trying to find a space for
            if (creeps[0] == creep) {
                return true;
            }
        }
    }
}
