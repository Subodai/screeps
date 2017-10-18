// Spawn a tower
Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );
// Safemode
Game.spawns['Spawn1'].room.controller.activateSafeMode();
Game.market.deal('58fe154d320b7ca308d38d42',32,'W84S73');

global.friends = ['sub'];
console.log('test ' + !(global.friends.indexOf('test') > -1));
console.log('sub ' + !(global.friends.indexOf('sub') > -1));

costs = [
    1: 300 + (0  * 50),  // 300
    2: 300 + (5  * 50),  // 550
    3: 300 + (10 * 50),  // 800
    4: 300 + (20 * 50),  // 1300
    5: 300 + (30 * 50),  // 1800
    6: 300 + (40 * 50),  // 2300
    7: 300 + (50 * 100), // 5300
    8: 300 + (60 * 200), // 12300
]

console.log(Game.cpu.getUsed());
let test=require('test'); // include a module of yours of non-trivial size.
console.log(Game.cpu.getUsed());
delete test;

Game.rooms['E36S97'].toggleWar();
Game.rooms['E37S94'].toggleWar();
Game.rooms['E38S95'].toggleWar();
Game.rooms['E38S96'].toggleWar();
Game.rooms['E39S95'].toggleWar();


if (!newCreep) {
    var newCreep = {
       role:'harvester',
       home:'E38S96',
       cost:300,
       level:1,
       body:[WORK,
        CARRY,CARRY,
        MOVE,MOVE],
    };
}

global.Queue.add(newCreep)
.add(newCreep)
.add(newCreep)
.add(newCreep)
.add(newCreep)
.add(newCreep)
.add(newCreep);


Game.market.changeOrderPrice('59a35fe532a2023f8c75b3e0',0.880);
Game.market.extendOrder('59a35fe532a2023f8c75b3e0',278250);

Game.market.changeOrderPrice('59a3614332a2023f8c75cd93',0.880);
Game.market.extendOrder('59a3614332a2023f8c75cd93',139965);

Game.market.changeOrderPrice('59a3625a32a2023f8c75ddc9',0.535);
Game.market.changeOrderPrice('59a5e4271778ce2ad5e7c0f1',0.535);
Game.market.changeOrderPrice('59a5e46f1778ce2ad5e7cd71',0.535);
Game.market.extendOrder('59a3625a32a2023f8c75ddc9',139965);
Game.market.extendOrder('59a5e4271778ce2ad5e7c0f1',139668);
Game.market.extendOrder('59a5e46f1778ce2ad5e7cd71',90784);

Game.market.changeOrderPrice('59b6f17ce7ab133861150e0d',0.470);
Game.market.extendOrder('59b6f17ce7ab133861150e0d',209524);

Game.market.changeOrderPrice('59d13c9fdcfa410611f1f258',0.850);
Game.market.extendOrder('59d13c9fdcfa410611f1f258',140000);

Game.market.changeOrderPrice('59a3603a32a2023f8c75b9a3',0.670);
Game.market.extendOrder('59a3603a32a2023f8c75b9a3',97477);
