// Tutorial: https://freshman.tech/url-shortener/

require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const statsRouter = require('./routes/statsRouter');
const redirectRouter = require('./routes/redirectRouter');

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

// Handle redirects for shortlinks
app.get('/:shortID', redirectRouter);

// Create new shortlink
app.post('/:userID/new', redirectRouter);

// Get all shortlink info for a user
app.get('/:userID/stats', statsRouter);

// Get all view info for a given shortlink 
app.get('/:userID/stats/:shortID', statsRouter);

// Disable shortlink
app.get('/:userID/remove/:shortID', redirectRouter);
app.delete('/:userID/remove/:shortID', redirectRouter);

// Serve static homepage
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
});

// Start the server
app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), err => {
    if(err) throw err;
    console.log(`Express is running on port ${server.address().port}.`);
});
