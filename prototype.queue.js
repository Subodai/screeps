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

