// Debug flag
const DBG = false;

/**
 * Processes the build flags setup in a room
 * Loops through flags in order, creates buildsite based on flag colours
 * Removes flag from flag list
 * Flag colour list defined in global.colours
 */
Room.prototype.processBuildFlags = function() {
    // Get the buildsites in this room
    const sitecount = this.find(FIND_CONSTRUCTION_SITES);
    // If we have more than 1 site, don't add any more
    if (sitecount > 1) {
        DBG && console.log('Already too many buildsites');
        return OK;
    }
    // Get the buildsite flags in this room
    const flag = _.first(_.filter(Game.flags, (flag) => flag.color = global.flagColor['buildsite'] && flag.pos.roomName == this.name));
    if (!flag) {
        DBG && console.log('No Buildsites found');
        return OK;
    }
    // Get the first flag and check it's secondary colour
    const _pos = flag.pos;
    // Check for existing buildsite here
    var sites = this.lookForAt(LOOK_CONSTRUCTION_SITES, _pos);
    // Already something here... remove the flag
    if (sites.length > 0) {
        DBG && console.log('Already a buildsite there');
        flag.remove();
        return OK;
    }
    var type = 'Unknown';
    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['road']) {
        var type = 'Road';
        if (this.createConstructionSite(_pos, STRUCTURE_ROAD) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['tower']) {
        var type = 'Tower';
        if (this.createConstructionSite(_pos, STRUCTURE_TOWER) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['extension']) {
        var type = 'Extension';
        if (this.createConstructionSite(_pos, STRUCTURE_EXTENSION) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['spawn']) {
        var type = 'Spawn';
        if (this.createConstructionSite(_pos, STRUCTURE_SPAWN) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['wall']) {
        var type = 'Wall';
        if (this.createConstructionSite(_pos, STRUCTURE_WALL) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['rampart']) {
        var type = 'Rampart';
        if (this.createConstructionSite(_pos, STRUCTURE_RAMPART) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['storage']) {
        var type = 'Storage';
        if (this.createConstructionSite(_pos, STRUCTURE_STORAGE) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['terminal']) {
        var type = 'Terminal';
        if (this.createConstructionSite(_pos, STRUCTURE_TERMINAL) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['lab']) {
        var type = 'Lab';
        if (this.createConstructionSite(_pos, STRUCTURE_LAB) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // Okay, we're here, what is it?
    if (flag.secondaryColor == global.buildColor['extractor']) {
        var type = 'Extractor';
        if (this.createConstructionSite(_pos, STRUCTURE_EXTRACTOR) == OK) {
            DBG && console.log(type + ' Buildsite created');
            flag.remove();
            return OK;
        }
    }

    // If we got to here somethign went wrong
    DBG && console.log('Could not place build ' + type + ' At ' + JSON.stringify(_pos));
}

/**
 * Clear all buildsites in a room
 */
Room.prototype.clearSites = function() {
    let sites = this.find(FIND_CONSTRUCTION_SITES);
    for (let s in sites) {
        sites[s].remove();
    }
}

/**
 * Fast way to remove all walls in a room
 */
Room.prototype.clearWalls = function() {
    let walls = this.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType == STRUCTRURE_WALL
    });
    for (let w in walls) {
        walls[w].destroy();
    }
}

Room.prototype.toggleNotifications = function() {
    return (!this.memory.notifications) ? this.enableNotifications() : this.disableNotifications();
}

/**
 * Fast way to turn off damage notifications in a room
 */
Room.prototype.disableNotifications = function() {
    let structures = this.find(FIND_STRUCTURES);
    for (let i in structures) {
        structures[i].notifyWhenAttacked(false);
    }
    console.log('[' + this.name + '] Damage Notifications Disabled');
    this.memory.notifications = false;
}

/**
 * Fast way to turn on notifications in a room
 */
Room.prototype.enableNotifications = function() {
    let structures = this.find(FIND_STRUCTURES);
    for (let i in structures) {
        structures[i].notifyWhenAttacked(true);
    }
    console.log('[' + this.name + '] Damage Notifications Enabled');
    this.memory.notifications = true;
}
