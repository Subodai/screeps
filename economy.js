"use strict";

/**
 * Get the current market state
 */
function get_economy() {
    console.log('fetching economy');
    // Get now
    const now = Game.time;
    const start = Game.cpu.getUsed();
    // Make an economy object
    var economy = {};
    // Start by looping through a list
    let resources = [
        RESOURCE_ENERGY,
        RESOURCE_POWER,
        RESOURCE_HYDROGEN,
        RESOURCE_OXYGEN,
        RESOURCE_UTRIUM,
        RESOURCE_LEMERGIUM,
        RESOURCE_KEANIUM,
        RESOURCE_ZYNTHIUM,
        RESOURCE_CATALYST,
        RESOURCE_GHODIUM,
    ];

    // Loop through our resources
    for (let i in resources) {
        let resource = resources[i];
        let buyOrders = Game.market.getAllOrders({
            resourceType: resource,
            type: ORDER_BUY
        });
        let bOrder = _.max(buyOrders, (b) => { return b.price; });
        let maxBuy = bOrder.price;
        let avgBuy = _.reduce(buyOrders, function (memo, num) {
            return memo + num.price;
        }, 0) / buyOrders.length || 1;
        let sellOrders = Game.market.getAllOrders({
            resourceType: resource,
            type: ORDER_SELL
        });
        let sOrder = _.min(sellOrders, (s) => { return s.price; });
        let minSell = sOrder.price;
        let avgSell = _.reduce(sellOrders, function (memo, num) {
            return memo + num.price;
        }, 0) / sellOrders.length || 1;
        let ret = {
            maxBuy,
            avgBuy,
            minSell,
            avgSell,
        };
        economy[resource] = ret;
    }
    let last_run = now;
    let stats = economy;
    let cpu = Game.cpu.getUsed() - start;
    var save = {
        stats, last_run, cpu,
    }

    // When done store the tick
    global.economy = save;
    return global.economy;
}

module.exports = {
    get_economy,
};