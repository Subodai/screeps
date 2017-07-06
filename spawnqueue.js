var debug = false;
var spawner = require('spawn.creep');
var cpuStart = 0;
// Initiates the SpawnQueue In Memory
function _construct(debug = false) {
    this.debug = debug;
    this.cpuStart = Game.cpu.getUsed();
    // Initiate the SpawnQueue
    if (Memory.spawnQueue == null) {
        Memory.spawnQueue = {
            initiated : Game.time,
            lastrun: Game.time,
            creeps: [],
            lastCPU: 0,
        }
    } else {
        // Make sure last run was now
        Memory.spawnQueue.lastrun = Game.time;
    }
}

// Get the spawn queue
function get() {
    return Memory.spawnQueue;
}

// Clear the spawn queue
function clear() {
    Memory.spawnQueue.creeps = [];
    return OK;
}

// Add a creep to the spawn queue
function add(data) {
    Memory.spawnQueue.creeps.push(data);
    return OK;
}

// Add a creep to the front of the spawn queue
function add_now(data) {
    Memory.spawnQueue.creeps.unshift(data);
    return OK;
}

// Remove an item from the spawn queue
function remove(data) {
    for (let i in Memory.spawnQueue.creeps) {
        const creep = Memory.spawnQueue.creeps[i];
        if (creep.role == data.role) {
            Memory.spawnQueue.creeps.splice(i,1);
            break;
        }
    }
    return OK;
}

// Process the spawn queue
function process() {
    this.debug && console.log('Running Spawn Queue');
    // Is the queue empty?
    if (Memory.spawnQueue.creeps.length == 0) {
        this.debug && console.log('Spawn Queue Empty');
        return;
    }
    // Not empty, lets process it
    for (let i in Memory.spawnQueue.creeps) {
        const creep = Memory.spawnQueue.creeps[i];
        // Okay, lets check the spawns in the desired creeps room
        const _room = Game.rooms[creep.roomName];
        var _spawn = false;
        this.debug && console.log('Room energy ' + _room.energyAvailable + ' Req: ' + creep.cost);
        // Does it's room have enough energy?
        if (_room.energyAvailable >= creep.cost) {
            // It does, pick a spawn in this room then
            const spawns = _room.find(FIND_STRUCTURES,{
                filter: (i) => i.structureType == STRUCTURE_SPAWN && !i.spawning
            });
            if (spawns.length > 0) {
                _spawn = spawns[0];
            }
        }
        // If we don't have a spawn yet, lets try other rooms
        if (!_spawn) {
            // Find another spawn to use instead
            for (let i in Game.spawns) {
                // Grab the spawn
                const spawn = Game.spawns[i];
                this.debug && console.log('Room energy ' + spawn.room.energyAvailable + ' Req: ' + creep.cost);
                // Does this spawn's room have enough energy?
                if (spawn.room.energyAvailable >= creep.cost) {
                    // Yes, assign it
                    _spawn = spawn;
                    break;
                }
            }
        }
        // Alright do we have a spawn?
        if (_spawn) {
            this.debug && console.log('Spawning Creep from Queue');
            if (spawner.spawn(_spawn.name, creep.role)) {
                this.remove(creep);
                return OK;
            }

        }
        this.debug && console.log('Nothing to spawn');
        return false;
    }
}
// Closing stuff for cleanup and stats
function _deconstruct() {
    // Record how long it took
    Memory.spawnQueue.lastCPU = Game.cpu.getUsed() - this.cpuStart;
    this.debug && console.log('Spawn Queue took ' + Memory.spawnQueue.lastCPU + ' CPU to run ');
}

module.exports = {
    _construct,
    get,
    clear,
    add,
    add_now,
    remove,
    process,
    _deconstruct
};
/* TEST COMMANDS
var spawnQueue = require('spawnqueue'); spawnQueue.add({ role:'harvester', roomName:'W85S73'}); this.debug && console.log(JSON.stringify(spawnQueue.get()));
var spawnQueue = require('spawnqueue'); spawnQueue.remove({ role:'test', roomName:'roomname', debug:'somestuff' }); this.debug && console.log(JSON.stringify(spawnQueue.get()));
*/
