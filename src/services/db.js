require('dotenv').config();
const nanoid = require('nanoid');

// Create the shortcode document
const shortenUrl = (db, url, userID, expTimeStamp) => {

    // Create shortID for new entries
    const shortID = nanoid(4);

    // Retrieve all documents in shortenedURLs collection
    // A collection in MongoDB is basically a table
    // Gets created if it doesn't exist yet
    const links = db.collection('links');

    // findOneAndUpdate modifies the entry if it exists and creates one if it doesn't
    return links.findOneAndUpdate({ originalUrl: url, userID: userID },
        {
            // $setOnInsert creates the document if it doesn't exist
            // Documents are basically entries in MongoDB
            $setOnInsert: {
                _id: nanoid(12),
                userID: userID,
                originalUrl: url,
                shortID: `${userID}${shortID}`,
                shortUrl: `${process.env.BASE_URL}/${userID}${shortID}`,
                dateCreated: new Date(),
                dateModified: new Date(),
                views: 0,
                status: 'active',
                expires: expTimeStamp || null
            }
        },
        {
            returnOriginal: false, // Set to false to return the new document if created
            upsert: true // Ensures the document is created if it doesn't exist
        }
    );
}

// Check for the shortcode, return the document if it exists
const checkIfShortIdExists = (db, shortID) => db.collection('links').findOne({shortID: shortID});

// Increment view count and create a view document
const countView = (db, doc, reqInfo) => {
    const links = db.collection('links');
    const views = db.collection('views');

    views.insertOne({
        shortID: doc.shortID,
        shortUrl: doc.shortUrl,
        redirectUrl: doc.originalUrl,
        userID: doc.userID,
        dateTime: new Date(),
        clientIP: reqInfo.clientIP || null,
        userAgent: reqInfo.userAgent || null,
        referer: reqInfo.referer || null
    });

    links.update({shortID: doc.shortID}, {$set: {'views': (doc.views + 1)}});
}

// Disable redirect, mark shortUrl as inactive
const disableRedirectByShortID = (db, shortID) => {
    db.collection('links').update({shortID: shortID}, {$set: {'status': 'inactive'}});
}

// Remove document by given shortcode ID
const removeEntryByShortID = (db, shortID) => db.collection('views').remove({shortID: shortID});

// Allow user to look up info on all of their created shortUrls
const getEntriesByUserID = (db, userID) => db.collection('links').find({userID: userID});

// Get view records for a given shortID
const getViewsByShortID = (db, shortID) => db.collection('views').find({shortID: shortID});

module.exports = {
    shortenUrl,
    checkIfShortIdExists,
    countView,
    disableRedirectByShortID,
    removeEntryByShortID,
    getEntriesByUserID,
    getViewsByShortID
};
