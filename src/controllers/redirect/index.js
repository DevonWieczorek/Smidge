const handleRedirect = require('./handleRedirect');
const createRedirect = require('./createRedirect');
const disableRedirect = require('./disableRedirect');

module.exports = {
    handle: handleRedirect,
    create: createRedirect,
    disable: disableRedirect
};
