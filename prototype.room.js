// Debug flag
const DBG = true;

/**
 * Processes the build flags setup in a room
 * Loops through flags in order, creates buildsite based on flag colours
 * Removes flag from flag list
 * Flag colour list defined in global.colours
 */
Room.prototype.processBuildFlags = function () {
    // Get the buildsites in this room
    const sitecount = this.find(FIND_CONSTRUCTION_SITES);
    // If we have more than 1 site, don't add any more
    if (sitecount.length > 1) {
        DBG && console.log('[' + this.name + '] ' + 'Already too many buildsites');
        return OK;
    }
    // Get the buildsite flags in this room
    const flags = _.filter(Game.flags, (flag) => flag.color == global.flagColor['buildsite'] && flag.pos.roomName == this.name);
    if (!flags.length == 0) {
        DBG && console.log('[' + this.name + '] ' + 'No Buildsites found');
        return OK;
    }
    var i = 0;
    // lets start tring to make a buildsite
    do {
        var flag = flags[i];
        if (!flag) {
            console.log('[' + this.name + '] looped too long or flag broke, forced break from buildsite loop');
            console.log(JSON.stringify(flags));
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
        var result = this.createConstructionSite(_pos, structure);
        // If there's an error with this build site, remove it's flag so we don't try again later
        if (result == ERR_INVALID_TARGET || result == ERR_INVALID_ARGS) {
            // Remove the flag, we'll skip over to the next one instead
            flag.remove();
        }
        // If it workes lets feedback and remove the flag
        if (result == OK) {
            // Clear the flag
            flag.remove()
            // feedback
            DBG && console.log('[' + this.name + '] ' + structure + ' Buildsite created');
        }
        // If we're full, just break the loop by changing the result to OK
        if (result == ERR_FULL) {
            result = OK;
        }
        // Is the room not high enough level yet? (We can try something else in the list instead)
        if (result == ERR_RCL_NOT_ENOUGH) {
            DBG && console.log('[' + this.name + '] Skipped trying to place ' + structure + ' Because RCL');
        }
        // increment
        i++;
    } while (result != OK);

    return OK;
}

/**
 * Clear all buildsites in a room
 */
Room.prototype.clearSites = function () {
    let sites = this.find(FIND_CONSTRUCTION_SITES);
    for (let s in sites) {
        sites[s].remove();
    }
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
}
