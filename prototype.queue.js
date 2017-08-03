// This is the Spawn Queue, in order to load this you need to add the following to your main.js
// const q = require('prototype.queue');
// global.Queue = new q.Queue();


// To add a creep to the queue  it needs to be structured like the following:

// let creep = {
//    role:'builder',
//    home:'E39S95',
//    cost:1000,
//    level:1,
//    body:[WORK,CARRY,MOVE],
// };

// Add to queue
// global.Queue.add(creep);

// Add to front of queue
// global.Queue.add_now(creep);

// Remove first instance from queue
// global.Queue.remove(creep);

// Remove all instances from queue
// global.Queue.remove_all(creep);

// Clear the Queue
// global.Queue.clear();

// Process the Queue
// global.Queue.process();


// This is my Spawner Include for version 1, adapted to use the current spawner code
var spawner = require('spawn.creep');
/**
 * Spawn Queue Prototype
 */
function Queue() {
    this.initiated = 0;
    this.lastrun   = 0;
    this.creeps    = [];
    this.startCPU  = 0;
    this.lastCPU   = 0;
    this.DBG       = true;
}

// Define the prototypes
Queue.prototype = {
    get: function() {
        if (this.initiated == 0) {
            console.log('Loading Spawn Queue from Memory');
            if (!Memory.queue) {
                console.log('[Memory] Initialising Spawn Queue');
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
            this.DBG       = Memory.queue.DBG;
        }
        this.DBG && console.log('Loading Spawn Queue');
        return this;
    },
    add: function(data) {
        if (this.initiated == 0) { this.get(); }
        this.DBG && console.log('Adding Creep to Queue ' + JSON.stringify(data));
        this.creeps.push(data);
        return this.save();
    },
    add_now: function(data) {
        if (this.initiated == 0) { this.get(); }
        this.DBG && console.log('Adding Creep to Front of Queue ' + JSON.stringify(data));
        this.creeps.unshift(data);
        return this.save();
    },
    remove: function(data) {
        if (this.initiated == 0) { this.get(); }
        this.DBG && console.log('Removing Creep from Queue ' + JSON.stringify(data));
        for (let i in this.creeps) {
            let creep = this.creeps[i];
            if (creep.role == data.role) {
                this.creeps.splice(i,1);
                break
            }
        }
        return this.save();
    },
    remove_all: function(data) {
        if (this.initiated == 0) { this.get(); }
        this.DBG && console.log('Removing all Creeps from Queue ' + JSON.stringify(data));
        this.creeps = this.creeps.filter(
            function(item) {
                if (item !== data) {
                    return item;
                }
            }
        );
        return this.save();
    },
    process: function() {
        if (this.initiated == 0) { this.get(); }
        this.startCPU  = Game.cpu.getUsed();
        console.log('Processing Spawn Queue');
        // If we have nothing in the queue, no need to process it
        if (this.creeps.length == 0) {
            this.DBG && console.log('Spawn Queue Empty, nothing to process');
            this.save();
            return false;
        }
        // Not empty, let's get to it!
        for (let i in this.creeps) {
            let creep = this.creeps[i];
            let room = Game.rooms[creep.home];
            var energyAvailable = 0;
            if (room == null) {
                energyAvailable = 0;
            } else {
                energyAvailable = room.energyAvailable;
            }
            var spawn = false;
            this.DBG && console.log('Room energy [' + energyAvailable + '] Req: [' + creep.cost + ']');
            // Does this room have enough energy
            if (energyAvailable >= creep.cost) {
                this.DBG && console.log('Spawning creep in desired room');
                // It does, pick a spawn in this room
                const spawns = _.filter(Game.spawns, (s) => !s.spawning && s.room.name == creep.home);
                // Do we have any?
                if (spawns.length > 0) {
                    spawn = spawns[0];
                }
            }
            // If we don't have a spawn yet, lets try other rooms
            if (!spawn) {
                this.DBG && console.log('Not enough energy in desired room, attempting remote spawn');
                const otherspawns = _.filter(Game.spawns, (s) => !s.spawning && s.room.name != creep.roomName && s.room.energyAvailable >= creep.cost);
                // @TODO: Sort by distance from wanted room?
                // Use a spawn that's not in this room then
                if (otherspawns.length > 0) {
                    spawn = otherspawns[0];
                }
            }
            // Did we find a spawn to use?
            if (spawn) {
                this.DBG && console.log('Spawning Creep from Queue in ' + spawn.room.name);
                if (spawn.makeCreep(creep.role, creep.body, creep.level, creep.home)) {
                    this.remove(creep);
                    this.save();
                    return true;
                }
            }
            this.DBG && console.log('Could not spawn, no suitable spawns available to fulfill queue');
            this.save();
            return false;
        }
    },
    clear: function() {
        if (this.initiated == 0) { this.get(); }
        this.DBG && console.log('Clearing Spawn Queue');
        this.creeps = [];
        return this.save();
    },
    save: function() {
        this.DBG && console.log('Saving Queue to memory');
        // Save the queue to Memory
        this.lastrun = Game.time;
        this.lastCPU = Game.cpu.getUsed() - this.startCPU;
        this.startCPU = null;
        Memory.queue = this;
        return this;
    },
    spawnCreep: function(spawnName,role) {
        return spawner.run(spawnName,role, this.DBG);
    },
    disableDebug: function () {
        delete Memory.queue.DBG;
        return 'Disabled Queue Debug';
    },
    enableDebug: function() {
        Memory.queue.DBG = true;
        return 'Enabled Queue Debug';
    },
    reset: function() {
        delete Memory.queue;
        return 'Spawn Queue Memory Reset';
    }
}

// Export the Queue!
module.exports = {
    Queue
};
