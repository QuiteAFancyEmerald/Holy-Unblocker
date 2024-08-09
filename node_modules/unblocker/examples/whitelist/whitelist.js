'use strict';

const URL = require('url');

module.exports = function({ allowedDomains, message }) {

  function isRequestAllowed(data) {
    const { hostname } = URL.parse(data.url);
    return allowedDomains.some(allowedDomain => hostname === allowedDomain || hostname.endsWith(`.${allowedDomain}`));
  }

  function checkWhitelist(data) {
    if (!isRequestAllowed(data)) {
      data.clientResponse.status(400).send(message)
    }
  }

  return checkWhitelist;
};
