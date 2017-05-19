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
        var miners = spawner.count('miner', room);
        var extractors = spawner.count('extractor', room);
        // Are there any hostiles?
        var hostiles = theRoom.find(FIND_HOSTILE_CREEPS, {
            filter: (i) => !(global.friends.indexOf(i.owner.username) > -1)
        });
        if (hostiles.length > 0 && theRoom.memory.mode == 'normal') {
            notify = true;
            msg += "\n" + Game.time + ' Room put into guard mode spawning guards' + "\n";
            theRoom.memory.mode = 'guard';
        }
        if (hostiles.length == 0 && theRoom.memory.mode == 'guard') {
            notify = true;
            msg += "\n" + Game.time + ' Room no longer in guard mode' + "\n";
            theRoom.memory.mode = 'normal';
        }
        if (theRoom.memory.mode == 'guard') {
            spawner.count('guard',room);
            console.log('We are still in guard mode');
        }
        var list = _.filter(Game.creeps, (creep) => !creep.memory.dying);
        if ((list.length == 0 && miners == 0) && !theRoom.memory.emergency){
            notify = true;
            msg += "\n" + Game.time + ' Room '+ room + ' In Emergency Mode!!' + "\n";
            console.log('Emergency Activated');
            theRoom.memory.emergency = true;
        }
        if ((list.length >= 5 || miners > 0) && theRoom.memory.emergency) {
            notify = true;
            msg += "\n" + Game.time + ' Room ' + room + ' No Longer in Emergency Mode' + "\n";
            console.log('Emergency Deactivated');
            theRoom.memory.emergency = false;
            delete theRoom.memory.emergency;
        }
        if (theRoom.memory.emergency) {
            console.log('We have ' + list.length + ' total creeps still in emergency mode');
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
        // Loop through the roles we have
        for (var i in global.roles) {
            // Get the role name
            var role = global.roles[i];
            var _role = require('role.' + role);
            if (_role.enabled(room,debug)) {
                _room.memory.roles[role] = true;
            } else {
                _room.memory.roles[role] = false;
            }
        }
    }
}