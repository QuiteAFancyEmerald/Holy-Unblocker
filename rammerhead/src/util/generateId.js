const uuid = require('uuid').v4;

module.exports = () => uuid().replace(/-/g, '');
