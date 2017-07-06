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


Game.rooms['E37S94'].toggleWar();
Game.rooms['E38S95'].toggleWar();
Game.rooms['E38S96'].toggleWar();
Game.rooms['E39S95'].toggleWar();
