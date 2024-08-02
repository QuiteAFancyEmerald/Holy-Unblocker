// handle the additional errors: ERR_INVALID_PROTOCOL and ETIMEDOUT
// hammerhead handled errors: ECONNRESET, EPIPE (or ECONNABORTED for windows)

const hGuard = require('testcafe-hammerhead/lib/request-pipeline/connection-reset-guard');
const isConnectionResetError = hGuard.isConnectionResetError;
hGuard.isConnectionResetError = function (err) {
    // for some reason, ECONNRESET isn't handled correctly
    if (
        isConnectionResetError(err) ||
        err.code === 'ERR_INVALID_PROTOCOL' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNRESET' ||
        err.code === 'EPIPE'
    ) {
        return true;
    }
    console.error('Unknown crash-inducing error:', err);
    // never return false as to avoid crashing the server
    return true;
};

process.on('uncaughtException', (err) => {
    // for some reason, the above never catches all of the errors. this is a last resort failsafe
    if (
        err.message.includes('ECONN') ||
        err.message.includes('EPIPE') ||
        err.message.includes('ETIMEDOUT') ||
        err.message.includes('ERR_INVALID_')
    ) {
        // crash avoided!
        console.error('Avoided crash:' + err.message);
    } else {
        // probably a TypeError or something important
        console.error('Something broke...', err)
    }
});
