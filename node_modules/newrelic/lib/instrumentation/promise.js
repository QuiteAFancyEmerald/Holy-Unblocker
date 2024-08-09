'use strict'

var logger = require('../logger')
var util = require('util')
var shimmer = require('../shimmer')


/**
 * @namespace Library.Spec
 *
 * @property {string} name
 *  The name of this promise library.
 *
 * @property {?string} constructor
 *  Optional. The name of the property that is the Promise constructor. Default
 *  is to use the library itself as the Promise constructor.
 *
 * @property {?bool} executor
 *  Optional. If true, the Promise constructor itself will be wrapped for the
 *  executor. If false then `_proto`, `_static`, or `_library` must have an
 *  `executor` field whose value is the name of the executor function. Default
 *  is false.
 *
 * @property {Library.Spec.Mapping} $proto
 *  The mapping for Promise instance method concepts (i.e. `then`). These are
 *  mapped on the Promise class' prototype.
 *
 * @property {Library.Spec.Mapping} $static
 *  The mapping for Promise static method concepts (i.e. `all`, `race`). These
 *  are mapped on the Promise class itself.
 *
 * @property {?Library.Spec.Mapping} $library
 *  The mapping for library-level static method concepts (i.e. `fcall`, `when`).
 *  These are mapped on the library containing the Promise class. NOTE: in most
 *  promise implementations, the Promise class is itself the library thus this
 *  property is unnecessary.
 */

/**
 * @namespace Library.Spec.Mapping
 *
 * A mapping of promise concepts (i.e. `then`) to this library's implementation
 * name(s) (i.e. `["then", "chain"]`). Each value can by either a single string
 * or an array of strings if the concept exists under multiple keys. If any
 * given concept doesn't exist in this library, it is simply skipped.
 *
 * @property {array} $copy
 *  An array of properties or methods to just directly copy without wrapping.
 *  This field only matters when `Library.Spec.executor` is `true`.
 *
 * @property {string|array} executor
 *
 *
 * @property {string|array} then
 *
 *
 * @property {string|array} all
 *
 *
 * @property {string|array} race
 *
 *
 * @property {string|array} resolve
 *  Indicates methods to wrap which are resolve factories. This method only
 *  requires wrapping if the library doesn't use an executor internally to
 *  implement it.
 *
 * @property {string|array} reject
 *  Indicates methods to wrap which are reject factories. Like `resolve`, this
 *  method only requires wrapping if the library doesn't use an executor
 *  internally to implement it.
 */

/**
 * Instruments a promise library.
 *
 * @param {Agent}         agent   - The New Relic APM agent.
 * @param {function}      library - The promise library.
 * @param {?Library.Spec} spec    - Spec for this promise library mapping.
 */
module.exports = function initialize(agent, library, spec) {
  // Wrap library-level methods.
  wrapStaticMethods(library, spec.name, spec.$library)

  // Wrap prototype methods.
  var Promise = library[spec.constructor]
  wrapPrototype(Promise.prototype)
  wrapStaticMethods(Promise, spec.constructor, spec.$static)

  // See if we are wrapping the class itself.
  if (spec.executor) {
    shimmer.wrapMethod(library, spec.name, spec.constructor, wrapPromise)
  }

  /**
   * Wraps the Promise constructor as the executor.
   */
  function wrapPromise() {
    // Copy all unwrapped properties over.
    if (spec.$static && spec.$static.$copy) {
      spec.$static.$copy.forEach(function copyKeys(key) {
        if (!wrappedPromise[key]) {
          wrappedPromise[key] = Promise[key]
        }
      })
    }

    var passThrough = spec.$static && spec.$static.$passThrough
    if (passThrough) {
      passThrough.forEach(function assignProxy(proxyProp) {
        if (!wrappedPromise.hasOwnProperty(proxyProp)) {
          Object.defineProperty(wrappedPromise, proxyProp, {
            enumerable: true,
            configurable: true,
            get: function getOriginal() {
              return Promise[proxyProp]
            },
            set: function setOriginal(newValue) {
              Promise[proxyProp] = newValue
            }
          })
        }
      })
    }

    // Inherit to pass `instanceof` checks.
    util.inherits(wrappedPromise, Promise)

    // Make the wrapper.
    return wrappedPromise
    function wrappedPromise(executor) {
      if (!(this instanceof wrappedPromise)) {
        return Promise(executor) // eslint-disable-line new-cap
      }

      var promise = null
      if (typeof executor !== 'function' || arguments.length !== 1) {
        // we are expecting one function argument for executor, anything else is
        // non-standard, so not attempting to wrap
        var cnstrctArgs = agent.tracer.slice(arguments)
        cnstrctArgs.unshift(Promise) // `unshift` === `push_front`
        promise = new (Promise.bind.apply(Promise, cnstrctArgs))()
      } else {
        var segmentName = 'Promise ' + (executor.name || '<anonymous>')
        var context = {
          promise: null,
          self: null,
          args: null
        }
        promise = new Promise(wrapExecutorContext(context))
        context.promise = promise
        _setInternalProperty(promise, '__NR_segment', _createSegment(segmentName))

        try {
          // Must run after promise is defined so that `__NR_wrapper` can be set.
          executor.apply(context.self, context.args)
        } catch (e) {
          context.args[1](e)
        }
      }

      // The Promise must be created using the "real" Promise constructor (using
      // normal Promise.apply(this) method does not work). But the prototype
      // chain must include the wrappedPromise.prototype, V8's promise
      // implementation uses promise.constructor to create new Promises for
      // calls to `then`, `chain` and `catch` which allows these Promises to
      // also be instrumented.
      promise.__proto__ = wrappedPromise.prototype  // eslint-disable-line no-proto

      return promise
    }
  }

  function wrapPrototype(PromiseProto, name) {
    // Don't wrap the proto if there is no spec for it.
    if (!spec.$proto) {
      return
    }

    name = name || (spec.constructor + '.prototype')

    // Wrap up instance methods.
    _safeWrap(PromiseProto, name, spec.$proto.executor, wrapExecutorCaller)
    _safeWrap(PromiseProto, name, spec.$proto.then, wrapThen)
    _safeWrap(PromiseProto, name, spec.$proto.catch, wrapCatch)
  }

  function wrapStaticMethods(lib, name, staticSpec) {
    // Don't bother with empty specs.
    if (!staticSpec) {
      return
    }

    _safeWrap(lib, name, staticSpec.cast, wrapCast)
  }

  function wrapExecutorCaller(caller) {
    return function wrappedExecutorCaller(executor) {
      if (!(this instanceof Promise)) {
        return caller.apply(this, arguments)
      }

      var context = {
        promise: this,
        self: null,
        args: null
      }
      if (!this.__NR_segment) {
        var segmentName = 'Promise ' + executor.name || '<anonymous>'
        _setInternalProperty(this, '__NR_segment', _createSegment(segmentName))
      }
      var args = [].slice.call(arguments)
      args[0] = wrapExecutorContext(context, this.__NR_segment)
      var ret = caller.apply(this, args)

      // Bluebird catches executor errors and auto-rejects when it catches them,
      // thus we need to do so as well.
      //
      // When adding new libraries, make sure to check that they behave the same
      // way. We may need to enhance the promise spec to handle this variance.
      try {
        executor.apply(context.self, context.args)
      } catch (e) {
        context.args[1](e)
      }
      return ret
    }
  }

  /**
   * Creates a function which will export the context and arguments of its
   * execution.
   *
   * @param {object} context - The object to export the execution context with.
   *
   * @return {function} A function which, when executed, will add its context
   *  and arguments to the `context` parameter.
   */
  function wrapExecutorContext(context, segment) {
    return function contextExporter(resolve, reject) {
      segment = segment || agent.tracer.segment
      context.self = this
      context.args = [].slice.call(arguments)
      context.args[0] = wrappedResolve
      context.args[1] = wrappedReject

      // These wrappers create a function that can be passed a function and an
      // argument to call as a continuation from the resolve or reject.
      function wrappedResolve(val) {
        var promise = context.promise
        if (promise) {
          linkChain(promise, promise.__NR_segment || segment, true)
          if (promise.__NR_segment) {
            promise.__NR_segment.touch()
          }
        }
        return resolve(val)
      }

      function wrappedReject(val) {
        var promise = context.promise
        if (promise) {
          linkChain(promise, promise.__NR_segment || segment, false)
          if (promise.__NR_segment) {
            promise.__NR_segment.touch()
          }
        }
        return reject(val)
      }
    }
  }

  /**
   * Brings the transaction through a promise to `then`ed continuations.
   *
   * @param {Promise}   ctx   The `this` argument for `fn`.
   * @param {Function}  fn    The handler function
   * @param {string}    name  The name function that added this link (i.e. then).
   * @param {Promise}   next  Promise returned from calling `then`
   * @param {Array}     args  Arguments passed into the `then` handler.
   * @return {*} The value returned from the `then`ed function.
   */
  function linkTransaction(ctx, fn, name, next, args) {
    if (!next) {
      return fn.apply(ctx, args)
    }

    // next needs to have a wrapper function even if the callback throws.
    try {
      if (!next.__NR_segment) {
        var segmentName = 'Promise#' + name + ' ' + (fn.name || '<anonymous>')
        _setInternalProperty(next, '__NR_segment', _createSegment(segmentName))
      }
      var segment = next.__NR_segment
      var result = agent.tracer.bindFunction(fn, segment, true).apply(ctx, args)
    } finally {
      if (result instanceof Promise && result !== next) {
        linkChain(next, segment, null, function proxyWrapper() {
          if (segment) {
            segment.touch()
          }
          var link = result.__NR_wrapper
          if (!link) {
            link = agent.tracer.bindFunction(linkTransaction, segment, true)
          }
          return link.apply(this, arguments)
        })
      } else {
        // If we have a result, we know we didn't reject and can bound linking
        // to just the next resolve handler.
        //                                          resolved : unknown
        linkChain(next, segment, result !== undefined ? true : null)
      }
    }
    return result
  }

  /**
   * If the promise isn't already bound, this will bind it to the given segment.
   *
   * @param {Promise}       promise - The promise to link with the segment.
   * @param {TraceSegment}  segment - The segment to link the promise with.
   */
  function bindLink(promise, segment) {
    if (!promise.__NR_wrapper) {
      _setInternalProperty(
        promise,
        '__NR_wrapper',
        agent.tracer.bindFunction(linkTransaction, segment, true)
      )
    }
  }

  /**
   * Walks the promise chain, linking each one to the given segment.
   *
   * @param {Promise} promise
   *  The first promise in the chain to link with the segment.
   *
   * @param {TraceSegment} segment
   *  The segment to link the chain with.
   *
   * @param {?bool} [resolved]
   *  Flag indicating if we only need to wrap down to the next resolve handler.
   *  If true, linking will stop after the first resolve handler is found.
   *
   * @param {Function} [wrapper]
   *  The wrapper to use for the linking. If not provided then `linkTransaction`
   *  will be used as the wrapper.
   */
  function linkChain(promise, segment, resolved, wrapper) {
    if (!wrapper) {
      wrapper = agent.tracer.bindFunction(linkTransaction, segment, true)
    }

    var next = promise
    while (next instanceof Promise) {
      _setInternalProperty(next, '__NR_wrapper', wrapper)

      // If we resolved and this is the resolve handler, stop linking here.
      if (resolved && next.__NR_resolveHandler) {
        break
      }

      // Unfortunately we can't preemptively stop for reject since some Promise
      // libraries support long jumps on rejection according to error class.
      // Thanks bluebird!

      // Break when there is an infinite loop.
      if (next.__NR_nextPromise === next) {
        break
      }
      next = next.__NR_nextPromise
    }
  }

  /**
   * Creates a wrapper for `Promise#then` that extends the transaction context.
   *
   * @return {function} A wrapped version of `Promise#then`.
   */
  function wrapThen(then, name) {
    return _wrapThen(then, name, true)
  }

  /**
   * Creates a wrapper for `Promise#catch` that extends the transaction context.
   *
   * @return {function} A wrapped version of `Promise#catch`.
   */
  function wrapCatch(cach, name) {
    return _wrapThen(cach, name, false)
  }

  /**
   * Creates a wrapper for promise chain extending methods.
   *
   * @param {function} then
   *  The function we are to wrap as a chain extender.
   *
   * @param {bool} useAllParams
   *  When true, all parameters which are functions will be wrapped. Otherwise,
   *  only the last parameter will be wrapped.
   *
   * @return {function} A wrapped version of the function.
   */
  function _wrapThen(then, name, useAllParams) {
    // Don't wrap non-functions.
    if (!(then instanceof Function) || then.name === '__NR_wrappedThen') {
      return then
    }

    return function __NR_wrappedThen() {
      if (!(this instanceof Promise)) {
        return then.apply(this, arguments)
      }

      var thenSegment = agent.tracer.getSegment()
      var promise = this

      // Wrap up the arguments and execute the real then.
      var hasResolve = false
      var args = [].map.call(arguments, wrapHandler)
      var next = then.apply(this, args)

      // Make sure we got a promise and then return it.
      if (next instanceof Promise && next !== promise) {
        _setInternalProperty(promise, '__NR_resolveHandler', hasResolve)
        _setInternalProperty(promise, '__NR_nextPromise', next)
      }
      return next

      // Wrap callbacks (success, error) so that the callbacks will be called as
      // a continuations of the accept or reject call using the __asl__wrapper
      // created above.
      function wrapHandler(fn, i, arr) {
        if (
          !(fn instanceof Function) ||              // Not a function
          fn.name === '__NR_wrappedThenHandler' ||  // Already wrapped
          (!useAllParams && i !== (arr.length - 1)) // Don't want all and not last
        ) {
          return fn
        }

        hasResolve = (hasResolve || (i === 0))

        return function __NR_wrappedThenHandler() {
          // Even though success/error handlers should have just one argument
          // (value or error), internal implementations could be passing in more
          // arguments.
          if (!promise.__NR_wrapper) {
            // The currently running segment is the least likely to be the
            // correct one when working with Bluebird due to the way it queues
            // all promise resolutions and executes them all at once.
            //
            // An option may be to prioritize the current segment, but compare
            // its transaction ID to the transaction ID of the `thenSegment`. If
            // they are the same, use the current segment, otherwise use the
            // `thenSegment`. I'd prefer to wait for the simpler method to be
            // proven invalid.
            var segment =
              promise.__NR_segment || thenSegment || agent.tracer.getSegment()
            if (segment) {
              bindLink(promise, segment)
            } else {
              return fn.apply(this, arguments)
            }
          }

          // invoke linkTransaction()
          return promise.__NR_wrapper(this, fn, name, next, arguments, promise)
        }
      }
    }
  }

  /**
   * Creates a wrapper around the static `Promise` factory method.
   */
  function wrapCast(cast, name) {
    if (!(cast instanceof Function) || cast.name === '__NR_wrappedCast') {
      return cast
    }

    var CAST_SEGMENT_NAME = 'Promise.' + name
    return function __NR_wrappedCast() {
      var segment = _createSegment(CAST_SEGMENT_NAME)
      var prom = cast.apply(this, arguments)
      if (segment) {
        bindLink(prom, segment)
      }
      return prom
    }
  }

  function _createSegment(name, parent) {
    return agent.config.feature_flag.promise_segments === true
      ? agent.tracer.createSegment(name, null, parent)
      : (parent || agent.tracer.getSegment())
  }
}

/**
 * Performs a `wrapMethod` if and only if `methods` is truthy and has a length
 * greater than zero.
 *
 * @param {object}        obj     - The source of the methods to wrap.
 * @param {string}        name    - The name of this source.
 * @param {string|array}  methods - The names of the methods to wrap.
 * @param {function}      wrapper - The function which wraps the methods.
 */
function _safeWrap(obj, name, methods, wrapper) {
  if (methods && methods.length) {
    shimmer.wrapMethod(obj, name, methods, wrapper)
  }
}

function _setInternalProperty(obj, name, val) {
  if (!obj || !name) {
    logger.debug('Not setting property; object or name is missing.')
    return obj
  }

  try {
    if (!obj.hasOwnProperty(name)) {
      Object.defineProperty(obj, name, {
        enumerable: false,
        writable: true,
        value: val
      })
    } else {
      obj[name] = val
    }
  } catch (err) {
    logger.debug({err: err}, 'Failed to set property "%s" to %j', name, val)
  }
  return obj
}
