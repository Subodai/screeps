const THRESHHOLDS = {
    [STRUCTURE_WALL]: 10000,
};

function towerRepairTarget(tower, range) {
    const targets = tower.pos.findInRange(FIND_STRUCTURE, range, {
        filter(structure) {
            return !(structure.structureType in THRESHHOLDS) || structure.hits < THRESHHOLDS[structure.structureType];
        },
    });

    if (targets) {
        return _.first(_.sort(targets, (structure) => structure.hits / (THRESHHOLDS[target.structureType] || structure.hitsMax));
    }
}
