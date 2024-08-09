'use strict'

// from http://en.wikipedia.org/wiki/Reservoir_sampling

function Reservoir(limit) {
  this.limit = limit || 10
  this.seen = 0
  this._data = []
}

Reservoir.prototype.overflow = function overflow() {
  var diff = this.seen - this.limit
  return diff >= 0 ? diff : 0
}

Reservoir.prototype.add = function add(item) {
  if (this.seen < this.limit) {
    this._data.push(item)
  } else {
    // Take a number between 0 and n + 1, drop the element at that index
    // from the array. If the element to drop is the (n + 1)th, the new item is
    // not added, otherwise the new item replaces the item that was
    // dropped.
    // This is effectively the same as adding the new element to the
    // end, swapping the last element (the new one) with a random element in the list,
    // then dropping the last element (the potentially swapped one) in the list.
    var toReplace = Math.floor(Math.random() * (this.seen + 2))
    if (toReplace < this.limit) this._data[toReplace] = item
  }
  this.seen++
}

Reservoir.prototype.toArray = function toArray() {
  return this._data
}

Reservoir.prototype.merge = function merge(items) {
  if (!items || !items.length) return
  if (items === this._data) return
  for (var i = 0; i < items.length; i++) {
    this.add(items[i])
  }
}

Reservoir.prototype.setLimit = function setLimit(newLimit) {
  this.limit = newLimit
  if (this._data.length > newLimit) {
    this._data = this._data.slice(0, newLimit)
  }
}

module.exports = Reservoir
