global.roles = [
    'guard',
    'miner',
    'refill',       // Always pulls from storage
    'harvester',    // Sources and containers always, fill spawns until 4, then only storage
    'upgrader',     // Sources until 4, storage after
    'builder',      // Sources until 4, storage after
    'janitor',      // Sources until 4, storage after
    'extractor',
    'supergrader',  // Storage always
    'scout',
    'reserve',
    'remoteminer',
    'hauler',
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
global.wallMax = 100000;
global.towerRepair = false;

global.resourceList = [
    // Minerals
    RESOURCE_CATALYST,
    RESOURCE_HYDROGEN,
    RESOURCE_LEMERGIUM,
    RESOURCE_UTRIUM,
    RESOURCE_KEANIUM,
    RESOURCE_OXYGEN,

    // Compounds (from invaders)
    RESOURCE_UTRIUM_HYDRIDE,
    RESOURCE_KEANIUM_OXIDE,
    RESOURCE_ZYNTHIUM_HYDRIDE,
    RESOURCE_GHODIUM_OXIDE,

    // Energy!
    RESOURCE_ENERGY
];

global.seedRemoteRoads = false;


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
