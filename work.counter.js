/*
 * Counter worker for counting things
 */
module.exports.run = function(debug = false) {
    var _cpu = Game.cpu.getUsed();
    var spawner = require('spawn.creep');
    var msg = '';
    var notify = false;

    // Loop through the rooms
    for(var room in Game.rooms) {
        var theRoom = Game.rooms[room];
        if (theRoom == undefined) { continue; }
        var miners = spawner.count('miner', room);
        var extractors = spawner.count('extractor', room);
        // Are there any hostiles?
        var hostiles = theRoom.find(FIND_HOSTILE_CREEPS, {
            filter: (i) => !(global.friends.indexOf(i.owner.username) > -1)
        });
        if (hostiles.length > 0 && theRoom.memory.mode == 'normal') {
            notify = true;
            msg += "\n" + Game.time + ' Room ' + room + ' put into guard mode spawning guards' + "\n";
            theRoom.memory.mode = 'guard';
        }
        if (hostiles.length == 0 && theRoom.memory.mode == 'guard') {
            notify = true;
            msg += "\n" + Game.time + ' Room ' + room + ' no longer in guard mode' + "\n";
            theRoom.memory.mode = 'normal';
        }
        if (theRoom.memory.mode == 'guard') {
            spawner.count('guard',room);
            console.log('We are still in guard mode');
        }
        if(theRoom.controller && theRoom.controller.my) {
            var list = _.filter(Game.creeps, (creep) => !creep.memory.dying && creep.memory.roomName == room);
            if ((list.length <= 2 && miners == 0) && !theRoom.memory.emergency){
                notify = true;
                msg += "\n" + Game.time + ' Room '+ room + ' In Emergency Mode!!' + "\n";
                console.log('Emergency Activated');
                theRoom.memory.emergency = true;
            }
            if ((list.length >= 10 || miners > 0) && theRoom.memory.emergency) {
                notify = true;
                msg += "\n" + Game.time + ' Room ' + room + ' No Longer in Emergency Mode' + "\n";
                console.log('Emergency Deactivated');
                theRoom.memory.emergency = false;
                delete theRoom.memory.emergency;
            }
            if (theRoom.memory.emergency) {
                console.log(room + ' has ' + list.length + ' total creeps still in emergency mode');
            }
        } else {
            delete theRoom.memory.emergency;
        }


        msg += ' [' + room + ':' + theRoom.energyAvailable + ']';
    }
    console.log('Counter used ' + (Game.cpu.getUsed() - _cpu).toFixed(3) + ' CPU');
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
        if (!_room.memory.roles) { console.log('creating room role object'); _room.memory.roles = {}; }
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
