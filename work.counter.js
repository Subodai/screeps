/*
 * Counter worker for counting things
 */
module.exports.run = function(debug = false) {
    var msg = '';
    var notify = false;
    // Loop through the rooms
    for(var room in Game.rooms) {
        // chuck it into a var
        var theRoom = Game.rooms[room];
        var owned = false;
        // Do we have vision into this room?
        if (theRoom === undefined) { continue; }
        // Does it have a controller?
        if (theRoom.controller && theRoom.controller.my) {
            var owned = true;
            // Make sure we initiate the room
            theRoom.init();
            // TODO some other stuff
            // If we're below level 3 we probably don't want to activate emergency so readily
            if (theRoom.controller.level < 3) {
                // only activate emergency if we're less than 2 creeps, and turn it off again above 5
                var minCreeps = 1;
                var desiredCreeps = 5;
                var minMiners = 0;
            } else {
                var minCreeps = 3;
                var desiredCreeps = 5;
                var minMiners = 1;
            }
            var list   = _.filter(Game.creeps, (i) => i.pos.roomName === room && !i.memory.dying && i.memory.role !== 'hauler' && i.memory.role !== 'guard');
            var miners = _.filter(Game.creeps, (i) => i.pos.roomName === room && !i.memory.dying && (i.memory.role === 'miner' || i.memory.role === 'linkminer'));
            var hostiles = theRoom.find(FIND_HOSTILE_CREEPS, { filter: (i) => !(global.friends.indexOf(i.owner.username) > -1) });

            var storage = theRoom.storage;
            if (!storage) {
                theRoom.memory.links = false;
            } else {
                // Turn off room charging if we're above 800k
                if (storage.store[RESOURCE_ENERGY] >= 800000 && theRoom.memory.charging === true) {
                    theRoom.memory.charging = false;
                }
                // If the room is below 10000 turn charging back on
                if (storage.store[RESOURCE_ENERGY] <= 10000 && theRoom.memory.charging === false) {
                    theRoom.memory.charging = true;
                }
                // Turn on links when above 400k and they're off
                if (storage.store[RESOURCE_ENERGY] >= 400000 && theRoom.memory.links === false) {
                    theRoom.memory.links = true;
                }
                // Turn off links when below 100k and they're on
                if (storage.store[RESOURCE_ENERGY] <= 100000 && theRoom.memory.links === true) {
                    theRoom.memory.links = false;
                }
            }

        } else {
            theRoom.init();
            // Handle remote room
            var list = {};
            var miners = {};
            var hostiles = theRoom.find(FIND_HOSTILE_CREEPS, { filter: (i) => !(global.friends.indexOf(i.owner.username) > -1) });
        }

        // If this is an owned room, we should check the creep counts
        if (owned) {
            // If we're not in emergency mode
            if (!theRoom.memory.emergency) {
                if (list.length <= minCreeps || miners.length < minMiners) {
                    // activate emergency mode
                    theRoom.memory.emergency = true;
                    console.log(room + ' Emergency Activated');
                }
            } else {
                // Are we above the desired levels?
                if (list.length >= desiredCreeps && miners.length >= minMiners) {
                    // Deactivate emergency mode
                    delete theRoom.memory.emergency;
                    console.log(room + ' Emergency Deactivated');
                }
            }

            if (theRoom.memory.emergency) {
                console.log(room + ' Still in emergency with ' + list.length + ' creeps and ' + miners.length + ' miners');
            }

            if (hostiles.length > 0 && theRoom.memory.mode === 'normal') {
                theRoom.memory.mode = 'guard';
                console.log(room + ' Put into guard mode');
            }

            if (hostiles.length === 0 && theRoom.memory.mode === 'guard') {
                theRoom.memory.mode = 'normal';
                console.log(room + ' No longer in guard mode');
            }

            if (theRoom.memory.mode === 'guard') {
                console.log(room + ' Still in guard mode');
            }
            msg += ' [' + room + ':' + theRoom.energyAvailable + ']';
        } else {
            // non owned rooms can never be in emergency
            delete theRoom.memory.emergency;


            // TODO We should add a tick counter to remove this hostile flag based on the life time of the hostile creeps in it
            if (hostiles.length > 0 && theRoom.memory.mode === 'safe') {
                theRoom.memory.mode = 'hostile';
                console.log(room + ' Remote Room has gone Hostile');
            }

            if (hostiles.length === 0 && theRoom.memory.mode === 'hostile') {
                theRoom.memory.mode = 'safe';
                console.log(room + ' Remote Room is now Safe');
            }

            if (theRoom.memory.mode === 'hostile') {
                console.log(room + ' Remote Room is still Hostile');
            }
        }

        // And finally, process the build flags
        theRoom.processBuildFlags();
    }
    // console.log('Counter used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
    if (notify) { Game.notify(msg); }
    return msg;
}

/* Setup all our rooms and their relevant roles */
module.exports.setupRoomRoles = function (debug = false) {
    // Loop through our rooms
    for (var room in Game.rooms) {
        // Get the room object, because we'll need it later
        var _room = Game.rooms[room];
        // Make sure we initialise the room memory
        if (!_room.memory.roles) { console.log('[COUNTER] Creating room role object [' + room + ']'); _room.memory.roles = {}; }
        // Loop through the roles we have
        for (var i in global.roles) {
            // Get the role name
            var role = global.roles[i];
            // Get it's role file
            var _role = require('role.' + role);
            // Run the code to check if this role should be enabled
            if (_role.enabled(room,debug)) {
                _room.memory.roles[role] = true;
            } else {
                _room.memory.roles[role] = false;
            }
        }
    }
}
