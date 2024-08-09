'use strict';

module.exports = function( userAgent ) {

  function setUserAgent(data) {
    data.headers['user-agent'] = userAgent;
  }

  return setUserAgent;
};
