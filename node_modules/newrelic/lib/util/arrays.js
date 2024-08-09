'use strict'

exports.find = arrayFind
exports.findLast = arrayFindLast
exports.findIndex = arrayFindIndex
exports.findLastIndex = arrayFindLastIndex

/**
 * Finds the first element in an array that `pred` matches.
 *
 * Remove once Node v0.10, v0.12, v1, v2, and v3 are no longer supported.
 *
 * @deprecated With Node.js v4
 *
 * @param {Array}     arr   - The array to search.
 * @param {Function}  pred  - A predicate function which returns `true` on matches.
 * @param {*}         [ctx] - The `this` arg for `pred`.
 *
 * @return {*?} - The first matching item if found, otherwise `undefined`.
 */
function arrayFind(arr, pred, ctx) {
  var idx = arrayFindIndex(arr, pred, ctx)
  if (idx >= 0) {
    return arr[idx]
  }
}

/**
* Finds the last element in an array that `pred` matches.
 *
 * @param {Array}     arr   - The array to search.
 * @param {Function}  pred  - A predicate function which returns `true` on matches.
 * @param {*}         [ctx] - The `this` arg for `pred`.
 *
 * @return {*?} - The last matching item if found, otherwise `undefined`.
 */
function arrayFindLast(arr, pred, ctx) {
  var idx = arrayFindLastIndex(arr, pred, ctx)
  if (idx >= 0) {
    return arr[idx]
  }
}

/**
 * Finds the first index of a single element in an array matching `pred`.
 *
 * Remove once Node v0.10, v0.12, v1, v2, and v3 are no longer supported.
 *
 * @deprecated With Node.js v4
 *
 * @param {Array}     arr   - The array to search.
 * @param {Function}  pred  - A predicate function which returns `true` on matches.
 * @param {*}         [ctx] - The `this` arg for `pred`.
 *
 * @return {number} - The index of the first matching item if found, otherwise `-1`.
 */
function arrayFindIndex(arr, pred, ctx) {
  for (var i = 0; i < arr.length; ++i) {
    if (pred.call(ctx, arr[i], i, arr)) {
      return i
    }
  }
  return -1
}

/**
 * Finds the last index of a single element in an array matching `pred`.
 *
 * @param {Array}     arr   - The array to search.
 * @param {Function}  pred  - A predicate function which returns `true` on matches.
 * @param {*}         [ctx] - The `this` arg for `pred`.
 *
 * @return {number} - The index of the last matching item if found, otherwise `-1`.
 */
function arrayFindLastIndex(arr, pred, ctx) {
  for (var i = arr.length - 1; i >= 0; --i) {
    if (pred.call(ctx, arr[i], i, arr)) {
      return i
    }
  }
  return -1
}
