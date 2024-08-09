'use strict'

/**
 * Given an ordered list of disjoint intervals and a new interval to fold into
 * it, determine if the new interval is a sub-interval (in which case it's
 * redundant), an overlapping interval (in which case, replace the most recent
 * interval on the list with an interval representing the union of the new and
 * last intervals), or otherwise (it's disjoint to what we already
 * have, in which case add it to the list). Meant to be used with
 * Array.reduce().
 *
 * Assumes the list being reduced is sorted by interval start time.
 *
 * @param {Array} accum  The accumulated list of reduced intervals.
 * @param {Array} newest A new pair of range start and end to compare to the
*                        existing intervals.
 *
 * @return {Array} A list of intervals updated to include the new interval.
 */

function sumChildren(pairs, parentEnd) {
  if (!pairs.length) return 0

  pairs.sort(function cb_sort(a, b) {
    return a[0] - b[0]
  })


  var start = pairs[0][0]
  var end = start
  var diff = 0
  var segmentEnd
  var pair

  for (var i = 0, l = pairs.length; i < l; ++i) {
    pair = pairs[i]

    if (pair[0] > parentEnd) break
    segmentEnd = pair[1] > parentEnd ? parentEnd : pair[1]

    if (pair[0] > end) {
      diff += pair[0] - end
      end = segmentEnd
    } else if (segmentEnd > end) {
      end = segmentEnd
    }
  }

  return end - start - diff
}

module.exports = sumChildren
