// Container Prototype

Object.defineProperty(StructureContainer.prototype, "total", {
    get: function () { return _.sum(this.store); }
});
