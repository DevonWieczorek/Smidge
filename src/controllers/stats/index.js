const getStatsByUser = require('./statsByUser');
const getStatsByShortID = require('./statsByShortID');

module.exports = {
    byUser: getStatsByUser,
    byShortID: getStatsByShortID
}
