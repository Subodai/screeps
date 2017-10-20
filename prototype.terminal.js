// Terminal Prototype

Object.defineProperty(StructureTerminal.prototype, "total", {
    get: function () { return _.sum(this.store); }
});
