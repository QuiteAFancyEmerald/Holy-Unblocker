const corrosionProperties = [
    '$corrosion_string', 
    '$corrosion_messagePath', 
    '$corrosion_messageTarget', 
    '$corrosion_messageSrcElement', 
    '$corrosion_messageCurrentTarget', 
    '$corrosion_messageEventPhase',
];

function overrideFunction(obj, prop, wrap) {
    if (!obj || typeof obj[prop] != 'function') return false;
    const wrapped = wrapFunction(obj[prop], wrap);
    return obj[prop] = wrapped;
};

function overrideConstructor(obj, prop, wrap) {
    if (!obj || typeof obj[prop] != 'function') return false;
    const wrapped = wrapConstructor(obj[prop], wrap);
    return obj[prop] = wrapped;
};

function overrideAccessors(obj, prop, handler) {
    if (!obj || !obj.hasOwnProperty(prop)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop) || {};
    if (descriptor.get && handler.getter) overrideFunction(descriptor, 'get', handler.getter);
    if (descriptor.set && handler.setter) overrideFunction(descriptor, 'set', handler.setter);
    Object.defineProperty(obj, prop, descriptor);
    return true;
};

function wrapFunction(fn, wrap) {
    /*const wrapped = new Proxy(fn, {
        apply: wrap,
        get: (target, prop) => target[prop],
        set: (target, prop, val) => target[prop] = val,
    });*/
    const wrapped = 'prototype' in fn ? function attach() {
        return wrap(fn, this, [...arguments]);
    } :  {
        attach() {
            return wrap(fn, this, [...arguments]);
        },
    }['attach'];

    ['name', 'length', 'displayName'].forEach(key => {
        if (key in wrapped) {
            Object.defineProperty(wrapped, key, Object.getOwnPropertyDescriptor(fn, key)); 
        };  
    }); 

    wrapFnString(fn, wrapped);
    return wrapped;
};

function wrapConstructor(fn, wrap) {
    /*
    const wrapped = new Proxy(fn, {
        construct: wrap,
        get: (target, prop) => target[prop],
        set: (target, prop, val) => target[prop] = val,
    });*/
    const wrapped = function () {
        return new.target ? wrap(fn, [...arguments]) : fn(...arguments);
    };
    ['name', 'length'].forEach(key => {
        if (key in wrapped) {
            Object.defineProperty(wrapped, key, Object.getOwnPropertyDescriptor(fn, key)); 
        };  
    }); 
    wrapped.prototype = fn.prototype;
    wrapped.prototype.constructor = wrapped;
    wrapFnString(fn, wrapped)
    return wrapped;
};

function wrapFnString(fn, wrapped) {
    wrapped.$corrosion_string = Function.prototype.toString.call(fn);
    return true;
};

module.exports = { corrosionProperties, overrideFunction, overrideConstructor, overrideAccessors, wrapFunction, wrapConstructor, wrapFnString };