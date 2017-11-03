// Main imports these should be cached
require('require.globals');                 // Global things
var Traveler = require('Traveler');         // Traveler
require('require.prototypes');              // Prototypes
require('require.roles');                   // Workers and roles
const q = require('prototype.queue');       // Load the new Queue
global.Queue = new q.Queue();               // Make the Queue (@TODO Make like Traveler ?)
var screepsplus = require('screepsplus');   // Screepsplus
global.feedEnabled = false;