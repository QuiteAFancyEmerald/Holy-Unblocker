/* -----------------------------------------------
/* Authors: wearrrrr
/* GNU General Public License v3.0: https://www.gnu.org/licenses/gpl-3.0.en.html
/* Service Worker Middleware Script
/* ----------------------------------------------- */

importScripts('./WWError.js');
const dbg = console.log.bind(console, '[WorkerWare]');
const time = console.time.bind(console, '[WorkerWare]');
const timeEnd = console.timeEnd.bind(console, '[WorkerWare]');

/*
  OPTS:
    debug - Enables debug logging.
    randomNames - Generate random names for middlewares.
    timing - Logs timing for each middleware.
*/

const defaultOpt = {
  debug: false,
  randomNames: false,
  timing: false,
};

const validEvents = [
  'abortpayment',
  'activate',
  'backgroundfetchabort',
  'backgroundfetchclick',
  'backgroundfetchfail',
  'backgroundfetchsuccess',
  'canmakepayment',
  'contentdelete',
  'cookiechange',
  'fetch',
  'install',
  'message',
  'messageerror',
  'notificationclick',
  'notificationclose',
  'paymentrequest',
  'periodicsync',
  'push',
  'pushsubscriptionchange',
  'sync',
];

class WorkerWare {
  constructor(opt) {
    this._opt = Object.assign({}, defaultOpt, opt);
    this._middlewares = [];
  }
  info() {
    return {
      version: '0.1.0',
      middlewares: this._middlewares,
      options: this._opt,
    };
  }
  use(middleware) {
    let validateMW = this.validateMiddleware(middleware);
    if (validateMW.error) throw new WWError(validateMW.error);
    // This means the middleware is an anonymous function, or the user is silly and named their function "function"
    if (middleware.function.name == 'function')
      middleware.name = crypto.randomUUID();
    if (!middleware.name) middleware.name = middleware.function.name;
    if (this._opt.randomNames) middleware.name = crypto.randomUUID();
    if (this._opt.debug) dbg('Adding middleware:', middleware.name);
    this._middlewares.push(middleware);
  }
  // Run all middlewares for the event type passed in.
  run(event) {
    const middlewares = this._middlewares;
    const returnList = [];
    let fn = async () => {
      for (let i = 0; i < middlewares.length; i++) {
        if (middlewares[i].events.includes(event.type)) {
          if (this._opt.timing) console.time(middlewares[i].name);
          // Add the configuration to the event object.
          event.workerware = {
            config: middlewares[i].configuration || {},
          };
          if (!middlewares[i].explicitCall) {
            let res = await middlewares[i].function(event);
            if (this._opt.timing) console.timeEnd(middlewares[i].name);
            returnList.push(res);
          }
        }
      }
      return returnList;
    };
    return fn;
  }
  deleteByName(middlewareID) {
    if (this._opt.debug) dbg('Deleting middleware:', middlewareID);
    this._middlewares = this._middlewares.filter(
      (mw) => mw.name !== middlewareID
    );
  }
  deleteByEvent(middlewareEvent) {
    if (this._opt.debug) dbg('Deleting middleware by event:', middlewareEvent);
    this._middlewares = this._middlewares.filter(
      (mw) => !mw.events.includes(middlewareEvent)
    );
  }
  get() {
    return this._middlewares;
  }
  /*  
    Run a single middleware by ID.
    This assumes that the user knows what they're doing, and is running the middleware on an event that it's supposed to run on.
  */
  runMW(name, event) {
    const middlewares = this._middlewares;
    if (this._opt.debug) dbg('Running middleware:', name);
    // if (middlewares.includes(name)) {
    //   return middlewares[name](event);
    // } else {
    //   throw new WWError("Middleware not found!");
    // }
    let didCall = false;
    for (let i = 0; i < middlewares.length; i++) {
      if (middlewares[i].name == name) {
        didCall = true;
        event.workerware = {
          config: middlewares[i].configuration || {},
        };
        if (this._opt.timing) console.time(middlewares[i].name);
        let call = middlewares[i].function(event);
        if (this._opt.timing) console.timeEnd(middlewares[i].name);
        return call;
      }
    }
    if (!didCall) {
      throw new WWError('Middleware not found!');
    }
  }
  // type middlewareManifest = {
  //     function: Function,
  //     name?: string,
  //     events: string[], // Should be a union of validEvents.
  //     configuration?: Object // Optional configuration for the middleware.
  // }
  validateMiddleware(middleware) {
    if (!middleware.function)
      return {
        error: 'middleware.function is required',
      };
    if (typeof middleware.function !== 'function')
      return {
        error: 'middleware.function must be typeof function',
      };
    if (
      typeof middleware.configuration !== 'object' &&
      middleware.configuration !== undefined
    ) {
      return {
        error: 'middleware.configuration must be typeof object',
      };
    }
    if (!middleware.events)
      return {
        error: 'middleware.events is required',
      };
    if (!Array.isArray(middleware.events))
      return {
        error: 'middleware.events must be an array',
      };
    if (middleware.events.some((ev) => !validEvents.includes(ev)))
      return {
        error:
          'Invalid event type! Must be one of the following: ' +
          validEvents.join(', '),
      };
    if (
      middleware.explicitCall &&
      typeof middleware.explicitCall !== 'boolean'
    ) {
      return {
        error: 'middleware.explicitCall must be typeof boolean',
      };
    }
    return {
      error: undefined,
    };
  }
}
