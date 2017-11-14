// Global Functions


/**
 * Turn War On or Off
 */
global._ToggleWar = function() {
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

global._HaulerSetup = function () {
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
        let remoteRoom = _.max(remoteRooms, function (c) { return Game.rooms[c].collectableEnergy(); });
        Memory.remoteRoom = remoteRoom;
    } else {
        console.log(Memory.remoteRoom + ':' + target.collectableEnergy());
    }
    // Now reset haulers with this remoteRoom
    let creeps = _.filter(Game.creeps, c => c.memory.role === 'hauler');
    for (let i in creeps) {
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
    let myRoom = _.min(myRooms, function (c) { return Game.rooms[c].storage.store[RESOURCE_ENERGY]; })
    Memory.myRoom = myRoom;
    var After = Game.cpu.getUsed() - Before;
    console.log('Hauler Target setup used ' + After + ' CPU');
}

global._InitDrain = function () {
    for (let room in Game.rooms) {
        Game.rooms[room].drain();
    }
    return 'Drain Initiated';
}

global._CancelDrain = function () {
    for (let room in Game.rooms) {
        Game.rooms[room].stopDrain();
    }
    return 'Drain Stopped';
}

global._Pause = function (lineNo = 0) {
    if (Game.cpu.bucket < CPU_MINIMUM && Game.cpu.getUsed() > Game.cpu.limit - 2) {
        console.log('Stopping At ' + lineNo + ' To relax CPU use');
        console.log(Game.time + ':CPU:[' + Game.cpu.tickLimit + '] ' + '[' + Game.cpu.bucket + '] [' + Game.cpu.getUsed().toFixed(3) + ']');
        return;
    }
}

global._Hex = function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) { hex = "0" + hex; }
    return hex;
}

global._SetupFeedRoom = function () {
    if (Memory.feedRoom) {
        let room = Game.rooms[Memory.feedRoom];
        let total = room.storage.store[Memory.feedResource] + room.terminal.store[Memory.feedResource];
        if (total >= Memory.feedTarget) {
            delete Memory.feedRoom;
            delete Memory.feedResource;
            delete Memory.feedTarget;
            Memory.enableFeed = false;
            $msg = '[FEED] Target Reached. Turning off feed'
            console.log($msg);
            Game.notify($msg);
        } else {
            return;
        }
    }
    // Get the feedlist from memory
    let list = Memory.feedList;
    // Time to check the feed list
    if (list.length > 0) {
        Memory.feedRoom = list[0].feedRoom;
        Memory.feedResource = list[0].feedResource;
        Memory.feedTarget = list[0].feedTarget;
        Memory.enableFeed = true;
        $msg = '[FEED] Room:' + list[0].feedRoom + ' Resource:' + list[0].feedResource + ' Target:' + list[0].feedTarget;
        console.log($msg);
        Game.notify($msg);
    }

    if (!Memory.feedRoom) {
        let myRooms = _.filter(Game.rooms, (room) => room.controller && room.controller.my);
        console.log(JSON.stringify(myRooms));
        let room = _.min(myRooms, function (room) { if (!room || !room.storage) { return 10000000; } else { return room.storage.store[RESOURCE_ENERGY]; } });
        Memory.feedRoom = feedRoom = room.name;
    }
    return Memory.feedRoom;
}