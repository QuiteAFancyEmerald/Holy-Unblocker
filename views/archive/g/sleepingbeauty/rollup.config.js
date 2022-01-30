"use strict";

var includePaths = require("rollup-plugin-includepaths");

var includePathsOptions = {
	paths: ["src/js"]
};

module.exports = {
    entry: "src/js/app.js",
    dest: "src/app.rollup.js",
    format: "iife",
    plugins: [ includePaths(includePathsOptions) ]
};
