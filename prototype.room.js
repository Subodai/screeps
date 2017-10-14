// Debug flag
const DBG = false;

/**
 * Processes the build flags setup in a room
 * Loops through flags in order, creates buildsite based on flag colours
 * Removes flag from flag list
 * Flag colour list defined in global.colours
 */
Room.prototype.processBuildFlags = function () {
    // If we have 100 (or more?) buildsites, ignore this entirely
    if (_.filter(Game.constructionSites, (site) => site.my).length >= 100) { return OK; }

    DBG && console.log('[' + this.name + '] ' + 'Checking for buildsites');
    // Get the buildsites in this room
    const sitecount = this.find(FIND_CONSTRUCTION_SITES);
    // If we have more than 1 site, don't add any more
    if (sitecount.length > 1) {
        DBG && console.log('[' + this.name + '] ' + 'Already too many buildsites in this room');
        return OK;
    }

    // Get the buildsite flags in this room
    const flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['buildsite'] && flag.pos.roomName == this.name);
    // If there's no flags, no point carrying on
    if (flags.length == 0) {
        DBG && console.log('[' + this.name + '] ' + 'No Buildsites found');
        return OK;
    }
    DBG && console.log('[' + this.name + '] ' + 'Found ' + flags.length + ' Build sites');
    // Loop through the flags
    for (var i in flags) {
        var flag = flags[i];
        if (!flag) {
            DBG && console.log('[' + this.name + '] looped too long or flag broke, forced break from buildsite loop');
            // console.log(JSON.stringify(flag));
            // console.log(JSON.stringify(flags));
            break;
        }
        // Get the first flag and check it's secondary colour
        var _pos = flag.pos;
        // Check for existing buildsite here
        var sites = this.lookForAt(LOOK_CONSTRUCTION_SITES, _pos);
        // Already something here... remove the flag
        if (sites.length > 0) {
            DBG && console.log('[' + this.name + '] ' + 'Already a buildsite there');
            flag.remove();
            return OK;
        }

        var structure = global.buildColor[flag.secondaryColor];
        DBG && console.log('[' + this.name + '] ' + 'Attempting to build:' + structure);
        var result = this.createConstructionSite(_pos, structure);
        // If there's an error with this build site, remove it's flag so we don't try again later
        if (result == ERR_INVALID_TARGET || result == ERR_INVALID_ARGS) {
            DBG && console.log('[' + this.name + '] ' + 'Invalid flag, removing');
            // Remove the flag, we'll skip over to the next one instead
            flag.remove();
        }
        // If it workes lets feedback and remove the flag
        if (result === OK) {
            // Clear the flag
            flag.remove()
            // feedback
            DBG && console.log('[' + this.name + '] ' + structure + ' Buildsite created');
            return OK;
        }
        // If we're full, just break the loop by changing the result to OK
        if (result == ERR_FULL) {
            DBG && console.log('Cannot make any more buildsites right now');
            result = OK;
            return OK;
        }
        // Is the room not high enough level yet? (We can try something else in the list instead)
        if (result == ERR_RCL_NOT_ENOUGH) {
            DBG && console.log('[' + this.name + '] Skipped trying to place ' + structure + ' Because RCL');
        }
    }

    return this;
}

/**
 * Clear all buildsites in a room
 */
Room.prototype.clearSites = function () {
    let sites = this.find(FIND_CONSTRUCTION_SITES);
    for (let s in sites) {
        sites[s].remove();
    }
    return this;
}

Room.prototype.clearFlags = function () {
    const flags = _.filter(Game.flags, (flag) => flag.pos.roomName == this.name && flag.color == COLOR_WHITE && flag.secondaryColor == COLOR_WHITE);
    for (let i in flags) {
        flags[i].remove();
    }
    return this;
}

Room.prototype.clearAllFlags = function () {
    const flags = _.filter(Game.flags, (flag) => flag.pos.roomName == this.name && flag.color == COLOR_WHITE);
    for (let i in flags) {
        flags[i].remove();
    }
    return this;
}

/**
 * Fast way to remove all walls in a room
 */
Room.prototype.clearWalls = function () {
    let walls = this.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType == STRUCTURE_WALL
    });
    for (let w in walls) {
        walls[w].destroy();
    }
    return this;
}


Room.prototype.toggleNotifications = function () {
    return (!this.memory.notifications) ? this.enableNotifications() : this.disableNotifications();
}

/**
 * Fast way to turn off damage notifications in a room
 */
Room.prototype.disableNotifications = function () {
    let structures = this.find(FIND_STRUCTURES);
    for (let i in structures) {
        structures[i].notifyWhenAttacked(false);
    }
    console.log('[' + this.name + '] Damage Notifications Disabled');
    this.memory.notifications = false;
    return this;
}

/**
 * Fast way to turn on notifications in a room
 */
Room.prototype.enableNotifications = function () {
    let structures = this.find(FIND_STRUCTURES);
    for (let i in structures) {
        structures[i].notifyWhenAttacked(true);
    }
    console.log('[' + this.name + '] Damage Notifications Enabled');
    this.memory.notifications = true;
    return this;
}

/*
 * Toggle a room into war
 */
Room.prototype.toggleWar = function () {
    if (!this.memory.war) {
        this.memory.war = true;
    } else {
        this.memory.war = false;
    }
    return this;
}

/*
 * Initiate a room's basic memory setup
 */
Room.prototype.init = function () {
    if (!this.memory.init) {
        this.memory.init = true;
        if (this.controller && this.controller.my) {
            if (!this.memory.mode) { this.memory.mode = 'normal'; }
            if (!this.memory.war) { this.memory.war = false; }
            if (!this.memory.charging) { this.memory.charging = true; }
            if (!this.memory.roles) { this.memory.roles = {}; }
            if (!this.memory.links) { this.memory.links = false; }
        } else {
            if (!this.memory.mode) { this.memory.mode = 'safe'; }
        }
        if (!this.memory.sources) { this.memory.sources = {}; }
        if (!this.memory.assignedSources) { this.memory.assignedSources = {}; }
        if (!this.memory.assignedExtractors) { this.memory.assignedExtractors = {}; }
        return 'Successfully initiated room';
    }
    return this;
}

/*
 * Get a room's harvestable energy and cache it
 */
Room.prototype.collectableEnergy = function () {
    if (!this.memory.lastEnergyCheck || this.memory.lastEnergyCheck != Game.time) {
        var energy = 0;
        let containers = this.find(FIND_STRUCTURES, {
            filter: (c) => c.structureType == STRUCTURE_CONTAINER && c.store[RESOURCE_ENERGY] > 0
        });
        let resources = this.find(FIND_DROPPED_RESOURCES, {
            filter: (r) => r.resourceType == RESOURCE_ENERGY
        });
        if (containers.length > 0) {
            energy += _.sum(containers, c => c.store[RESOURCE_ENERGY]);
        }
        if (resources.length > 0) {
            energy += _.sum(resources, r => r.amount);
        }
        this.memory.energy = energy;
        this.memory.lastEnergyCheck = Game.time;
    }
    return this.memory.energy;
}

/*
 * Get the hostiles in a room
 */
Room.prototype.hostiles = function() {
    if (!this.memory.lastHostileCheck || this.memory.lastHostileCheck != Game.time) {
        var hostiles = this.find(FIND_HOSTILE_CREEPS, {
            filter: (i) => !(global.friends.indexOf(i.owner.username) > -1)
        });
        this.memory.hostiles = hostiles.length;
        this.memory.lastHostileCheck = Game.time;
    }
    return this.memory.hostiles;
}

/*
 * Initiate Storage Drain of a room into GCL
 */
Room.prototype.drain = function() {
    console.log('[ADMIN] Initiating drain in ' + this.name);
    this.memory.charging = false;
    this.memory.links = true;
    return this;
}

/*
 * Feed Energy Routine
 */
Room.prototype.feedEnergy = function() {
    // If we don't have a feedRoom, just return
    if (!Memory.feedRoom) { console.log('[EMPIRE]['+this.name+'] No feedRoom Set'); return; }
    // Do we have a terminal?
    if (!this.terminal) { console.log('[EMPIRE]['+this.name+'] No Terminal'); return; }
    // Is the terminal on cooldown
    if (this.terminal.cooldown > 0) { console.log('[EMPIRE]['+this.name+'] Terminal on cooldown' + JSON.stringify(this.terminal)) ;return; }
    // Is this the feedroom?
    if (this.name === Memory.feedRoom) { console.log('[EMPIRE]['+this.name+'] This is the feedroom');
        // Make sure we're feeding the storage, not the terminal
        if (this.memory.prioritise !== 'none') {
            this.memory.prioritise = 'none';
        }
        return;
    }
    // Do we have memory of the target (save processing)
    if (!this.memory.feedTarget || this.memory.feedTarget.room !== Memory.feedRoom){
        console.log('[EMPIRE]['+this.name+'] Needs a Target');
        // Run some setup
        this.setupFeedTarget();
    }
    // Does the terminal have enough energy?
    if (this.terminal.store[RESOURCE_ENERGY] < this.memory.feedTarget.chunk) {
        this.memory.prioritise = 'terminal';
        console.log('[EMPIRE]['+this.name+'] Charging Terminal');return;
    }
    // Get the multiplier
    let multiplier = this.terminal.store[RESOURCE_ENERGY] / this.memory.feedTarget.chunk;
    // now get the total we want to send
    let total = multiplier.toFixed()*1000;
    // Alright, send it
    this.terminal.send(RESOURCE_ENERGY, total, this.memory.feedTarget.room, 'Feeding [' + this.memory.feedTarget.room + ']');
    console.log('[EMPIRE]['+this.name+'] Feeding Target');
}

/*
 * Setup a room's feed target
 */
Room.prototype.setupFeedTarget = function() {
    let cost = Game.market.calcTransactionCost(1000, this.name, Memory.feedRoom);
    let chunk = cost + 1000;
    let feedTarget = {};
    feedTarget.room = Memory.feedRoom;
    feedTarget.chunk = chunk;
    this.memory.feedTarget = feedTarget;
    console.log('[EMPIRE]['+this.name+'] Feed Target Set: ' + JSON.stringify(this.memory.feedTarget));
}
