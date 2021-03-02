module.exports = class {
  
    constructor(config) {
  
      // If parts of the config are messing. The parts are filled with placeholders.

      if (!config) config = {};
  
      if (!config.prefix) config.prefix = '/get/';
  
      if (!config.prefix.startsWith('/')) config.prefix = '/' + config.prefix;
  
      if (!config.prefix.endsWith('/')) config.prefix = config.prefix + '/';

      if (!config.blocklist) config.blocklist = [];

      if (!config.request) config.request = [];

      if (!config.response) config.response = [];
  
      this.config = config;

      // Main proxy.

      this.app = require('./libs/proxy.js')(config);
  
      // WebSocket Proxy.

      this.ws = (server) => require('./libs/websocket.js')(server, config);
  
    }
  
  }