// Spawn a tower
Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );
// Safemode
Game.spawns['Spawn1'].room.controller.activateSafeMode();
Game.market.deal('58fe154d320b7ca308d38d42',32,'W84S73');

global.friends = ['sub'];
console.log('test ' + !(global.friends.indexOf('test') > -1));
console.log('sub ' + !(global.friends.indexOf('sub') > -1));
