/**
 * Login Class
 */
function Login() {
    // sessionId -> user map
    this.sessionMap = {
        99999: { name: 'HolyUBUser', email: 'HolyUBPass' }
    };
}
/**
 * Say Hello {name} to the user
 */
Login.prototype.hello = function(sessionId) {
    if (this.sessionMap[sessionId] == null) {
        return this.isLoggedIn;
    }
};
/**
 * Get Current Session id user name 
 */
Login.prototype.getName = function(sessionId) {
    return this.sessionMap[sessionId].name;
};

/**
 * Get Current Session id user email 
 */

/**
 * Check whether the given session id is valid (is in sessionMap) or not.
 */
Login.prototype.isLoggedIn = function(sessionId) {
    return sessionId in this.sessionMap;
};

/**
 * Create a new session id for the given user.
 */
Login.prototype.login = function() {
    var sessionId = new Date().getTime();
    return sessionId;
};

/**
 * Remove specific refreshed session from SessionMap
 **/
Login.prototype.RefreshSession = function(_sessionId) {
    // Delete the session id from sessionMap 
    delete this.sessionMap[_sessionId];
    return "done";
};

/**
 * Logout from the server
 */
Login.prototype.logout = function(sessionId) {
    console.log('logout::' + sessionId);
    // Delete the session id from sessionMap 
    delete this.sessionMap[sessionId];

};

// Export the Login class
module.exports = new Login();