global.roles = [
    'guard',
    'miner',
    'refill',       // Always pulls from storage
    'harvester',    // Sources and containers always, fill spawns until 4, then only storage
    'upgrader',     // Sources until 4, storage after
    'builder',      // Sources until 4, storage after
    // 'janitor',      // Sources until 4, storage after
    'extractor',
    'mharvester',
    'supergrader',  // Storage always
    'scout',
    'reserve',
    'remoteminer',
    'hauler',
];

global.rampartMax = 100000;
global.wallMax = 700000;
global.towerRepair = true;
global.linkLimit = 900000;
global.chargeLimit = 900000;

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

global.getPartsCost = function(parts) {
    var bodyCost = 0
    // If it's a creep we just want it's body
    if (parts instanceof Creep) {
        parts = parts.body;
        for (var part of parts) {
            bodyCost += BODYPART_COST[part.type];
        }
    } else if (parts == undefined) {
        bodyCost += 0;
    } else if (parts.length > 1) {
        for (var part of parts) {
            bodyCost += BODYPART_COST[part];
        }
    }
    return bodyCost;
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

global.toggleWar = function() {
    if (!Memory.war) {
        Memory.war = true;
    } else {
        Memory.war = false;
    }
    for (var room in Game.rooms) {
        console.log('Setting War to ' + Memory.war + ' in ' + room);
        Game.rooms[room].memory.war = Memory.war;
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

        Game.notify('Performed a Respawn Memory Reset');
    } else {
        console.log('You clearly did not mean that, ignoring you');
    }
}

global.haulerSetup = function () {
    console.log('Running Hauler Target setup');
    var Before = Game.cpu.getUsed();

    // Check the level of the energy in the current target
    let target = Game.rooms[Memory.remoteRoom];
    // if the room has less than 500 energy, lets pick a different one
    if (!target || target.collectableEnergy() <= 500 || target.hostiles() > 0) {
        console.log('picking new room');
        let remoteRooms = [];
        for (let room in Game.rooms) {
            let _room = Game.rooms[room];
            if (_room != null) {
                if (!_room.controller || (_room.controller && !_room.controller.my)) {
                    // If there are no hostiles, send the haulers!
                    if (_room.hostiles() <= 0) {
                        remoteRooms.push(_room.name);
                    }
                }
            }
        }
        let remoteRoom = _.max(remoteRooms, function(c) { return Game.rooms[c].collectableEnergy(); });
        Memory.remoteRoom = remoteRoom;
    } else {
        console.log(Memory.remoteRoom + ':' + target.collectableEnergy());
    }
    // Now reset haulers with this remoteRoom
    let creeps = _.filter(Game.creeps, c => c.memory.role === 'hauler');
    for(let i in creeps) {
        let c = creeps[i];
        if (_.sum(c.carry) < c.carryCapacity && c.carryCapacity > 0) {
            if (c.memory.remoteRoom !== Memory.remoteRoom) {
                console.log('[MEMORY] Clearing hauler [' + c.name + '] target because room empty');
                c.memory.remoteRoom = Memory.remoteRoom;
                delete c.memory.arrived;
                delete c.memory.energyPickup;
            }
        }
    }

    // Get a list of our rooms
    let myRooms = [];
    for (let room in Game.rooms) {
        if (Game.rooms[room].controller) {
            if (Game.rooms[room].controller.my) {
                if (Game.rooms[room].memory.charging && Game.rooms[room].storage) {
                    myRooms.push(room);
                }
            }
        }
    }
    if (myRooms.length == 0) {
        myRooms.push('E12N6');
    }
    let myRoom = _.min(myRooms, function(c) { return Game.rooms[c].storage.store[RESOURCE_ENERGY]; })
    Memory.myRoom = myRoom;
    var After = Game.cpu.getUsed() - Before;
    console.log('Hauler Target setup used ' + After + ' CPU');
}

global.initDrain = function () {
    for (let room in Game.rooms) {
        Game.rooms[room].drain();
    }
    return 'Drain Initiated';
}

global.pause = function (lineNo = 0) {
    if (Game.cpu.bucket < global.cpuDesired && Game.cpu.getUsed() > Game.cpu.limit - 2) {
        console.log('Stopping At ' + lineNo + ' To relax CPU use');
        console.log(Game.time + ':CPU:[' + Game.cpu.tickLimit + '] ' + '[' +  Game.cpu.bucket + '] [' + Game.cpu.getUsed().toFixed(3) + ']');
        return;
    }
}

global.hex = function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) { hex = "0" + hex; }
    return hex;
}

global.setupFeedRoom = function () {
    if (Memory.feedRoom) {
        let energy = Game.rooms[Memory.feedRoom].storage.store[RESOURCE_ENERGY];
        if (energy >= global.chargeLimit) {
            delete Memory.feedRoom;
        }
    }
    if (!Memory.feedRoom) {
        let myRooms = _.filter(Game.rooms, (room) => room.controller && room.controller.my);
        console.log(JSON.stringify(myRooms));
        let room = _.min(myRooms, function(room) { if(!room || !room.storage) { return 10000000; } else { return room.storage.store[RESOURCE_ENERGY]; } });
        Memory.feedRoom = feedRoom = room.name;
    }
    return Memory.feedRoom;
}
