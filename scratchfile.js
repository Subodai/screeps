const THRESHHOLDS = {
    [STRUCTURE_WALL]: 10000,
};

function towerRepairTarget(tower, range) {
    const targets = tower.pos.findInRange(FIND_STRUCTURE, range, {
        filter(structure) {
            return !(structure.structureType in THRESHHOLDS) || structure.hits < THRESHHOLDS[structure.structureType];
        },
    });

    if (targets) {
        return _.first(_.sort(targets, (structure) => structure.hits / (THRESHHOLDS[target.structureType] || structure.hitsMax));
    }
}



// bunch of useful commands here

var room = Game.rooms['E39S95'];
var creep = {roomName:'E39S95'};

var cpu = Game.cpu.getUsed();
var filtered = _.filter(Game.spawns, (s) => s.spawning && s.room.name == creep.roomName);
if (filtered.length > 0) {
    console.log(JSON.stringify(filtered[0]));
}
console.log('filtered cpu ' + (Game.cpu.getUsed() - cpu).toFixed(3));

var bpu = Game.cpu.getUsed();
var found = room.find(FIND_STRUCTURES, {
    filter: (i) => i.structureType == STRUCTURE_SPAWN && i.spawning
});
if (found.length > 0) {
    console.log(JSON.stringify(found[0]));
}
console.log('found cpu ' + (Game.cpu.getUsed() - bpu).toFixed(3));

var CPU = Game.cpu.getUsed();
var creep = {
    role:'builder',
    roomName:'E39S95',
    cost:1000
};
console.log(JSON.stringify(global.Queue.remove(creep)));
console.log(Game.cpu.getUsed() - CPU);

var CPU = Game.cpu.getUsed();
console.log(JSON.stringify(global.Queue.process()));
console.log(Game.cpu.getUsed() - CPU);
