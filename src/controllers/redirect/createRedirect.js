const dns = require('dns');
const dbServices = require('../../services/db');

const createRedirect = (req, res) => {
    let fullURL;
    const userID = req.params.userID || null;

    // Only let registered users create links
    if(!userID) return res.status(403).json({error: 'Missing credential "userID".'});

    // Check if this is a valid URL structure
    try {
        fullURL = new URL(req.body.url);
    } catch (err){
        return res.status(400).json({error: 'Invalid URL.'});
    }

    // Check if the hostname is a live domain
    dns.lookup(fullURL.hostname, (err) => {
        if(err){
            return res.status(404).json({error: 'Address not found.'});
        }

        const { db } = req.app.locals;

        dbServices.shortenUrl(db, fullURL.href, userID)
            .then(result => {
                const doc = result.value;
                let payload = {
                    _id: doc._id,
                    userID: doc.userID,
                    originalUrl: doc.originalUrl,
                    shortID: doc.shortID,
                    shortUrl: doc.shortUrl,
                    dateCreated: doc.dateCreated,
                    dateModified: doc.dateModified,
                    views: doc.views,
                    status: doc.status,
                    expires: doc.expires
                };

                console.log('Entry created:', payload)
                res.status(200).json(payload);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({error: err});
            });
    });
}

module.exports = createRedirect;
