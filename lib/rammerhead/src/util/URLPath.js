/**
 * for lazy people who don't want to type out `new URL('http://blah' + req.url).searchParams.get(ugh)` all the time
 */
module.exports = class URLPath extends URL {
    /**
     * @param {string} path - /site/path
     */
    constructor(path) {
        super(path, 'http://foobar');
    }
    /**
     * @param {string} param - ?param=value
     * @returns {string|null}
     */
    get(param) {
        return this.searchParams.get(param);
    }
    /**
     * @returns {{[param: string]: string}}
     */
    getParams() {
        return Object.fromEntries(this.searchParams);
    }
};
