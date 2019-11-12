const dbServices = require('../../services/db');

const disableRedirect = (req, res) => {
    const { db } = req.app.locals;
    const shortID = req.params.shortID;

    dbServices.disableRedirectByShortID(db, shortID)
        .then(() => {
            return res.status(200).send({message: 'ShortUrl disabled.'});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}

module.exports = disableRedirect;
