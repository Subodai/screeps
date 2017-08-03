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

global.seedRemoteRoads = true;

global.cpuDesired = 5000;

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


global.InitRespawn = function (MeanIt = false) {
    if (MeanIt) {
        console.log('Hope you meant it, because nuking everything');
        console.log('--Killing off creeps--');
        for (var name in Game.creeps) {
            let creep = Game.creeps[name];
            console.log('Creep [' + name + '] Committing Suicide: ' + creep.suicide());
        }
        delete Memory.creeps;
        console.log('--Creeps murdered--');

        console.log('--Removing Flags--');
        for (var flag in Game.flags) {
            console.log('Removing flag: ' + flag);
            Game.flags[flag].remove();
        }
        delete Memory.flags;
        console.log('--Flags cleared--');

        console.log('--Removing construction sites--');
        var mySites = _.filter(Game.constructionSites, (site) => my.site);
        for (var site in mySites) {
            site.remove();
        }
        console.log('--Construction Sites removed--');


        console.log('--Clearing Structure Memory--');
        for (var room in Game.rooms) {
            let structures = Game.rooms[room].find(FIND_STRUCTURES);
            for (var s in structures) {
                s.destroy();
            }
        }
        delete Memory.structures;
        console.log('--Structure Memory Cleared--');


        console.log('--Clearing Memory Stats--');
        delete Memory.stats;
        console.log('--Stats Memory Cleared--');


        console.log('--Clearing Queue Memory--');
        delete Memory.queue;
        console.log('--Queue Memory Cleared');


        console.log('--Clearing remaining memory');
        delete Memory.myRoom;
        delete Memory.sources;
        console.log('--Remaining Memory Clear');


        console.log('++Respawn Cleanup Complete++');
        console.log('++Good Luck!!++');

        Game.notify('Performed a Respawn Memory Reset'):
    } else {
        console.log('You clearly did not mean that, ignoring you');
    }
}
