/* 
 * Worker Movement
 */
module.exports.run = function(role, debug = false) {
    if (debug) { console.log('Running ' + role + ' Creep Movement'); }
    var _role = require('role.' + role);
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == _role.roleName) {
            _role.run(creep);
        }
    }
}
