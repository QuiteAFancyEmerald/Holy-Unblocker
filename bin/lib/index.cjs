'use strict';

const { resolve } = require('node:path');

const uvPath = resolve(__dirname, '..', 'dist');

exports.uvPath = uvPath;
