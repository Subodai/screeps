// Storage Prototype

Object.defineProperty(StructureStorage.prototype, "total", {
    get: function () { return _.sum(this.store); }
});
