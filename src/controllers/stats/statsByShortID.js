const dbServices = require('../../services/db');

const getStatsByShortID = async (req, res) => {
    const { db } = req.app.locals;
    const shortID = req.params.shortID;

    dbServices.getViewsByShortID(db, shortID)
        .then(results => {
            return res.status(200).json(results);
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({error: err});
        });
}

module.exports = getStatsByShortID;
