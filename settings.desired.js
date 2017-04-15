/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('settings.desired');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    SpawnMiners: true,
    SpawnMovers: false,
    SpawnScouts: false,
    SpawnBig: true,
    SpawnMid: true,
    SpawnSml: true,
    DeSpawn: false,
    emptyContainers: false,
    // Desired Small sized creeps
    SmlH: 1,
    SmlU: 1,
    SmlB: 4,
    SmlR: 0,
    // Desired Mid sized creeps
    MidH: 0,
    MidU: 0,
    MidB: 0,
    // Desired BIG sized creeps
    BigH: 4,
    BigU: 2,
    BigB: 0
}
