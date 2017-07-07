var spawner = require('spawn.creep');
/**
 * Spawn Queue Prototype
 */
function Queue() {
    this.initiated = 0;
    this.lastrun   = 0;
    this.creeps    = [];
    this.lastCPU   = 0;
    this.DBG       = false;
}

// Define the prototypes
Queue.prototype = {
    get: function() {
        if (this.initiated == 0) {
            if (!Memory.queue) {
                Memory.queue = {
                    initiated:Game.time,
                    lastrun:Game.time,
                    creeps:[],
                    lastCPU:0,
                };
            }
            this.initiated = Memory.queue.initiated;
            this.lastrun   = Memory.queue.lastrun;
            this.creeps    = Memory.queue.creeps;
            this.lastCPU   = Memory.queue.lastCPU;
        }
        return this;
    },
    add: function(data) {
        this.creeps.push(data);
        return OK;
    },
    add_now: function(data) {
        this.creeps.unshift(data);
        return OK;
    },
    remove: function(data) {
        for (let i in this.creeps) {
            let creep = this.creeps[i];
            if (creep.role == data.role) {
                this.creeps.splice(i,1);
                break
            }
        }
        return OK;
    },
    remove_all: function(data) {
        this.creeps = this.creeps.filter(
            function(item) {
                if (item !== data) {
                    return item;
                }
            }
        );
    },
    process: function() {
        this.DBG && console.log('Processing Spawn Queue');
        // If we have nothing in the queue, no need to process it
        if (this.creeps.length == 0) {
            this.DBG && console.log('Spawn Queue Empty, nothing to process');
            return OK;
        }
        // Not empty, let's get to it!
        for (let i in this.creeps) {
            let creep = this.creeps[i];
            let room = Game.rooms[creep.roomName];
            var energyAvailable = 0;
            if (room == null) {
                energyAvailable 0;
            } else {
                energyAvailable = room.energyAvailable;
            }
            var spawn = false;
            this.DBG && console.log('Room energy [' + energyAvailable + '] Req: [' + creep.cost + ']');
            // Does this room have enough energy
            if (energyAvailable >= creep.cost) {
                // It does, pick a spawn in this room
                const spawns = _.filter(Game.spawns, (s) => !s.spawning && s.room.name == creep.roomName);
                // Do we have any?
                if (spawns.length > 0) {
                    spawn = spawns[0];
                }
            }
            // If we don't have a spawn yet, lets try other rooms
            if (!spawn) {
                const otherspawns = _.filter(Game.spawns, (s) => !s.spawning && s.room.name != creep.roomName && s.room.energyAvailable >= creep.cost);
                // @TODO: Sort ?
                // Use a spawn that's not in this room then
                if (otherspawns.length > 0) {
                    spawn = otherspawns[0];
                }
            }
            // Did we find a spawn to use?
            if (spawn) {
                this.DBG && console.log('Spawning Creep from Queue');
                if (this.spawnCreep(spawn.name, creep.role)) {
                    this.remove(creep);
                    return OK;
                }
            }
            this.DBG && console.log('Could not spawn');
            return ERR_NOT_ENOUGH_ENERGY;
        }
    },
    clear: function() {
        this.creeps = [];
        return OK;
    },
    save: function() {
        // Save the queue to Memory
        Memory.queue = this;
    },
    spawnCreep: function(spawnName,role) {
        return spawner.spawn(spawnName,role);
    }
}

module.exports = {
    Queue
};



























/*
// Called during global reset
if (!Memory.queue) {
    console.log('[Memory] Initialising spawnqueue memory');
    Memory.queue = {
        initiated:Game.time,
        lastrun:Game.time,
        creeps:[],
        lastCPU:0,
    };
}

function spawnQueue() {
    this.memory = {};
}

var Queue = new spawnQueue();

// Adds a "Queue" to memory to store a spawn queue in
Object.defineProperty(spawnQueue, "memory", {
    get: function () {
        if (!Memory.queue)
            Memory.queue = {};
        return Memory.queue;
    },
    set: function(v) {
        return _.set(Memory,'queue',v);
    },
    configurable: true,
    enumerable: false
});

global.ClearSpawnQueue = function() {
    delete Memory.queue;
}
*/
