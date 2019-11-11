// Tutorial: https://freshman.tech/url-shortener/

require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dns = require('dns');
const { MongoClient } = require('mongodb');
const nanoid = require('nanoid');

const dbServices = require('./services/db');

const databaseURL = process.env.DATABASE;

const app = express();

// Parse requests as json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle serving of static assets
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the Mongo database
MongoClient.connect(databaseURL, { useNewUrlParser: true })
    .then(client => {
        app.locals.db = client.db('shortener');
    })
    .catch((err) => console.error(err.MongoNetworkError));

// Serve static homepage
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
});

// Handle redirects for shortlinks
app.get('/:shortID', (req, res) => {
    const { db } = req.app.locals;
    const shortID = req.params.shortID;

    const reqInfo = {
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'],
        clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    }

    console.log('Reqesting shortID: ', shortID);

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
});

// Create new shortlink
app.post('/:userID/new', (req, res) => {
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
});

// Start the server
app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
    console.log(`Express is running on port ${server.address().port}.`);
});
