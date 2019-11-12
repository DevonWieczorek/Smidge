const dbServices = require('../../services/db');

const handleRedirect = (req, res) => {
    const { db } = req.app.locals;
    const shortID = req.params.shortID;

    const reqInfo = {
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'],
        clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    }

    dbServices.checkIfShortIdExists(db, shortID)
        .then(doc => {
            // Check the redirect exists and is active
            if(doc !== null && doc.status === 'active'){
                // Count the view
                dbServices.countView(db, doc, reqInfo);

                // Complete the redirect
                return res.redirect(doc.originalUrl);
            }
            return res.status(404).send('Oops! Page not found.');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}

module.exports = handleRedirect;
