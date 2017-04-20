/*
 * Autotrader
 */
 module.exports.run = function (debug = false) {
    // So we need to run this per room we control
    for (var name in Game.rooms) {
        var _room = Game.rooms[name];
        var terminal = _room.terminal;
        var energyInTerminal = terminal.store[RESOURCE_ENERGY];
        for (var mineral in this.getCurrentMinerals(debug)) {
            var orders = this.fetchAllValidOrders(ORDER_BUY, mineral, energyInTerminal, debug);
            console.log(JSON.stringify(orders));
        }
    }
 }

 module.exports.fetchAllValidOrders = function (roomName = null, type = ORDER_BUY, mineral = null, energy = 0, debug = false) {
    if (!mineral) {
        console.log('no mineral set');
        return [];
    }
    var orders = Game.market.getAllOrders(
        order => order.type == type && order.resourceType == mineral &&
        Game.market.calcTransactionCost(100, order.roomName, roomName) < energy
    );

    return orders;
 }

 module.exports.getCurrentMinerals = function (debug = false) {
    var array = [];
    // First loop through the rooms
    for (var name in Game.rooms) {
        var _room = Game.rooms[name];
        // Just return this
        if (!_room.memory.mineral) {
            // We need to check for this rooms minerals
            var minerals = _room.find(FIND_MINERALS);
            var mineral = Game.getObjectById(minerals[0].id);
            _room.memory.mineral = mineral.mineralType;
        }
        // Put the room's minerals into the array
        array.push(_room.memory.mineral);
    }
    // Send back the list
    return array;
 }
