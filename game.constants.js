// States
global.STATE_SPAWNING = 'SPAWNING';
global.STATE_MOVING = 'MOVING';
global.STATE_HARVESTING = 'HARVESTING';
global.STATE_DEPOSITING = 'DEPOSITING';
global.STATE_BUILDING = 'BUILDING';
global.STATE_UPGRADING = 'UPGRADING';
global.STATE_MINING_ENERGY = 'MINING_ENERGY';
global.STATE_MINING_MINERAL = 'MINING_MINERAL';

// Roles
global.ROLES = [
    'guard',
    'miner',        // Switch to energyMiner at some point
    'refill',       // Always pulls from storage
    'harvester',    // Sources and containers always, fill spawns until 4, then only storage
    'upgrader',     // Sources until 4, storage after
    'builder',      // Sources until 4, storage after
    // 'janitor',      // Sources until 4, storage after
    'extractor',
    'mharvester',
    'supergrader',  // Storage always
    'scout',
    'reserve',
    'remoteminer',
    'hauler',
];

// Various other constants
global.RAMPART_MAX = 100000;
global.WALL_MAX = 700000;
global.TOWER_REPAIR = true;
global.LINK_LIMIT = 900000;
global.CHARGE_LIMIT = 900000;
global.SEED_ROADS = true;

// Operations based constants
global.CPU_MINIMUM = 5000;
