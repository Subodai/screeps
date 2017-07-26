RoomPosition.prototype.isRoomEdge = function() {
    if (this.x == 0 || this.x == 49) { return true; }
    if (this.y == 0 || this.y == 49) { return true; }
    return false;
}
