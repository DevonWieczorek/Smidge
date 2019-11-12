const dbServices = require('../../services/db');

const getStatsByUser = async (req, res) => {
    const { db } = req.app.locals;
    const userID = req.params.userID;

    dbServices.getEntriesByUserID(db, userID)
        .then(results => {
            return res.status(200).json(results);
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({error: err});
        });
}

module.exports = getStatsByUser;
