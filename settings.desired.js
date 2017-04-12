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
    SpawnBig: true,
    SpawnMid: true,
    SpawnSml: true,
    DeSpawn: false,
    emptyContainers: false,
    // Desired Small sized creeps
    SmlH: 2,
    SmlU: 2,
    SmlB: 5,
    SmlR: 5,
    // Desired Mid sized creeps
    MidH: 0,
    MidU: 0,
    MidB: 0,
    // Desired BIG sized creeps
    BigH: 3,
    BigU: 6,
    BigB: 0
}
